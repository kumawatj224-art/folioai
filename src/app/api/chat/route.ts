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
import { renderTemplate } from "@/infrastructure/services/template-service";
import { 
  getSubscription,
  recordGeneration,
  recordRegeneration,
} from "@/infrastructure/repositories/subscription-repository";
import { getUsageDisplay, isTemplateAllowed } from "@/domain/entities/subscription";
import type { ChatMessage, StudentInfo, PortfolioTemplate } from "@/domain/entities/chat";

type TemplateContext = {
  name: string;
  slug: string;
  htmlTemplate?: string;
};

type ChatRequestBody = {
  messages: ChatMessage[];
  studentInfo: Partial<StudentInfo>;
  action?: "chat" | "generate";
  template?: PortfolioTemplate;
  existingHtml?: string | null;
  isEditMode?: boolean;
  templateContext?: TemplateContext | null;
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
    const { messages, studentInfo, action = "chat", template = "minimal-warm", existingHtml, templateContext } = body;

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
      const subscription = await getSubscription(session.user.id);
      
      // Check template access
      if (!isTemplateAllowed(subscription.plan, template)) {
        return NextResponse.json(
          { 
            error: "Template not available on your plan",
            upgradeRequired: true,
            limitType: "template",
          },
          { status: 403 }
        );
      }
      
      if (isEditMode) {
        // Regeneration - check daily limit
        const result = await recordRegeneration(session.user.id);
        if (!result.allowed) {
          return NextResponse.json(
            { 
              error: result.reason,
              upgradeRequired: true,
              limitType: "regeneration",
              resetIn: result.resetIn,
              usage: getUsageDisplay(result.subscription),
            },
            { status: 429 }
          );
        }
      } else {
        // New generation - check monthly/lifetime limit
        const result = await recordGeneration(session.user.id);
        if (!result.allowed) {
          return NextResponse.json(
            { 
              error: result.reason,
              upgradeRequired: true,
              limitType: "generation",
              usage: getUsageDisplay(result.subscription),
            },
            { status: 429 }
          );
        }
      }

      let html: string;
      
      // If templateContext with htmlTemplate is provided, use the template system
      if (templateContext?.htmlTemplate) {
        // Convert studentInfo to template data format with sensible defaults
        const templateData = {
          name: studentInfo.name || "Your Name",
          tagline: studentInfo.bio || `${studentInfo.branch || "Engineering"} Student at ${studentInfo.college || "University"}`,
          email: studentInfo.socialLinks?.email || "",
          about: studentInfo.bio || studentInfo.achievements?.join(" ") || `Passionate ${studentInfo.branch || "tech"} enthusiast looking to make an impact.`,
          college: studentInfo.college || "",
          branch: studentInfo.branch || "",
          graduationYear: studentInfo.graduationYear || "",
          skills: studentInfo.skills || [],
          projects: (studentInfo.projects || []).map(p => ({
            title: p.title,
            description: p.description,
            techStack: p.techStack || [],
            liveUrl: p.link,
            githubUrl: undefined,
          })),
          experience: (studentInfo.internships || []).map(i => ({
            company: i.company,
            role: i.role,
            duration: i.duration,
            description: i.description || "",
          })),
          socialLinks: {
            github: studentInfo.socialLinks?.github || studentInfo.githubUsername ? `https://github.com/${studentInfo.githubUsername}` : "",
            linkedin: studentInfo.socialLinks?.linkedin || "",
            leetcode: studentInfo.leetcodeProfile || "",
          },
        };
        
        html = renderTemplate(templateContext.htmlTemplate, templateContext.slug, templateData);
      } else {
        // Use AI-based generation for built-in templates
        html = await generatePortfolioHtml(
          studentInfo as StudentInfo, 
          template, 
          existingHtml,
          existingHtml ? messages : undefined // Only pass messages in edit mode
        );
      }
      
      // Get updated usage after generation
      const updatedSubscription = await getSubscription(session.user.id);
      const usage = getUsageDisplay(updatedSubscription);
      
      return NextResponse.json({ html, usage });
    }

    // Continue conversation - pass template context for better AI responses
    const aiResponse = await generateChatResponse(messages, studentInfo, existingHtml, templateContext?.name);
    const updatedInfo = await extractStudentInfo(messages);
    const readyToGenerate = isReadyToGenerate(updatedInfo);
    
    // Get current usage for UI
    const subscription = await getSubscription(session.user.id);
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
