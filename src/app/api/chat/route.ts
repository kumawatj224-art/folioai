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
import type { ChatMessage, StudentInfo, PortfolioTemplate } from "@/domain/entities/chat";

type ChatRequestBody = {
  messages: ChatMessage[];
  studentInfo: Partial<StudentInfo>;
  action?: "chat" | "generate";
  template?: PortfolioTemplate;
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
    const { messages, studentInfo, action = "chat", template = "minimal-dark" } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    // Generate final HTML portfolio
    if (action === "generate") {
      if (!isReadyToGenerate(studentInfo)) {
        return NextResponse.json(
          { error: "Not enough information to generate portfolio" },
          { status: 400 }
        );
      }

      const html = await generatePortfolioHtml(studentInfo as StudentInfo, template);
      return NextResponse.json({ html });
    }

    // Continue conversation
    const aiResponse = await generateChatResponse(messages, studentInfo);
    const updatedInfo = await extractStudentInfo(messages);
    const readyToGenerate = isReadyToGenerate(updatedInfo);

    return NextResponse.json({
      response: aiResponse,
      studentInfo: updatedInfo,
      readyToGenerate,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process chat" },
      { status: 500 }
    );
  }
}
