import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { chatPortfolioRepository } from "@/infrastructure/repositories/portfolio-repository";
import type { ChatMessage } from "@/domain/entities/chat";

type CreatePortfolioBody = {
  title: string;
  htmlContent: string;
  chatHistory: ChatMessage[];
};

/**
 * GET /api/portfolios
 * Returns the current user's portfolios (dashboard summaries)
 */
export async function GET() {
  const session = await getCurrentSession();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const portfolios = await chatPortfolioRepository.listSummaries(session.user.id);
  return NextResponse.json({ data: portfolios });
}

/**
 * POST /api/portfolios
 * Creates a new portfolio from AI chat
 */
export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as CreatePortfolioBody;
    
    if (!body.title || !body.htmlContent) {
      return NextResponse.json(
        { error: "Title and HTML content are required" }, 
        { status: 400 }
      );
    }

    const portfolio = await chatPortfolioRepository.create({
      userId: session.user.id,
      title: body.title,
      htmlContent: body.htmlContent,
      chatHistory: body.chatHistory || [],
    });

    return NextResponse.json({ data: portfolio }, { status: 201 });
  } catch (error) {
    console.error("Create portfolio error:", error);
    return NextResponse.json({ error: "Failed to create portfolio" }, { status: 500 });
  }
}
