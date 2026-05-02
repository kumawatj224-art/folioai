import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { 
  generateChatResponse, 
  extractStudentInfo, 
  isReadyToGenerate,
  generatePortfolioHtml,
  isAIConfigured 
} from "@/infrastructure/services/ai-service";
import { 
  getSubscription,
} from "@/infrastructure/repositories/subscription-repository";
import { getUsageDisplay, canGenerate, canRegenerate } from "@/domain/entities/subscription";
import type { ChatMessage, StudentInfo, PortfolioTemplate } from "@/domain/entities/chat";

type ChatRequestBody = {
  messages: ChatMessage[];
  studentInfo: Partial<StudentInfo>;
  action?: "chat" | "generate";
  template?: PortfolioTemplate;
  existingHtml?: string | null;
  isEditMode?: boolean;
};

/**
 * POST /api/chat
 * Handles AI conversation for portfolio building
 * 
 * Actions:
 * - "chat": Continue conversation, extract info
 * - "generate": Generate final HTML portfolio
 */
export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configured = await isAIConfigured();
  if (!configured) {
    return NextResponse.json(
      { error: "AI service not configured. Please add Azure OpenAI credentials to .env.local" },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as ChatRequestBody;
    const { messages, studentInfo, action = "chat", template = "minimal-warm", existingHtml } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    // Generate final HTML portfolio
    if (action === "generate") {
      // In edit mode (existingHtml present), allow regeneration without full requirements
      // For new portfolios, require minimum info
      if (!existingHtml && !isReadyToGenerate(studentInfo)) {
        return NextResponse.json(
          { error: "Not enough information to generate portfolio" },
          { status: 400 }
        );
      }

      // Check usage limits
      const isEditMode = !!existingHtml;
      const subscription = await getSubscription(session.user.id, session.user.email);
      
      if (isEditMode) {
        // Regeneration - check daily limit WITHOUT updating
        const result = canRegenerate(subscription);
        if (!result.allowed) {
          return NextResponse.json(
            { 
              error: result.reason,
              upgradeRequired: true,
              limitType: "regeneration",
              resetIn: result.resetIn,
              usage: getUsageDisplay(subscription),
            },
            { status: 429 }
          );
        }
      } else {
        // New generation - check monthly/lifetime limit WITHOUT updating
        const result = canGenerate(subscription);
        if (!result.allowed) {
          return NextResponse.json(
            { 
              error: result.reason,
              upgradeRequired: true,
              limitType: "generation",
              usage: getUsageDisplay(subscription),
            },
            { status: 429 }
          );
        }
      }

      // Generate portfolio HTML using AI
      const html = await generatePortfolioHtml(
        studentInfo as StudentInfo, 
        template, 
        existingHtml,
        existingHtml ? messages : undefined // Only pass messages in edit mode
      );
      
      // Get updated usage after generation
      const updatedSubscription = await getSubscription(session.user.id, session.user.email);
      const usage = getUsageDisplay(updatedSubscription);
      
      return NextResponse.json({ html, usage });
    }

    // Continue conversation
    const aiResponse = await generateChatResponse(messages, studentInfo, existingHtml);
    const updatedInfo = await extractStudentInfo(messages);
    const readyToGenerate = isReadyToGenerate(updatedInfo);
    
    // Get current usage for UI
    const subscription = await getSubscription(session.user.id, session.user.email);
    const usage = getUsageDisplay(subscription);

    return NextResponse.json({
      response: aiResponse,
      studentInfo: updatedInfo,
      readyToGenerate,
      usage,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process chat" },
      { status: 500 }
    );
  }
}
