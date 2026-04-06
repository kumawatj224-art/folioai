import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { chatPortfolioRepository } from "@/infrastructure/repositories/portfolio-repository";
import { userRepository } from "@/infrastructure/repositories/user-repository";
import type { ChatMessage, PortfolioStatus } from "@/domain/entities/chat";

type CreatePortfolioBody = {
  title: string;
  htmlContent: string;
  chatHistory: ChatMessage[];
  status?: PortfolioStatus;
  customSubdomain?: string;
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
  
  if (!session?.user?.id || !session?.user?.email) {
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

    // Ensure user exists in database before creating portfolio
    const dbUser = await userRepository.ensureUser({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
    }

    const portfolio = await chatPortfolioRepository.create({
      userId: dbUser.id,
      title: body.title,
      htmlContent: body.htmlContent,
      chatHistory: body.chatHistory || [],
    });

    // If status is "deployed", update the portfolio status and set live URL
    if (body.status === "deployed") {
      let slug: string;
      
      if (body.customSubdomain) {
        // Use user-provided subdomain
        slug = body.customSubdomain
          .toLowerCase()
          .replace(/[^a-z0-9-]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 30);
      } else {
        // Generate from title
        const name = body.title.replace(/'s Portfolio$/i, "").trim();
        slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 30);
      }
      
      if (!slug || slug === "my-portfolio") {
        slug = `portfolio-${Date.now().toString(36)}`;
      }
      
      const liveUrl = `https://${slug}.getfolioai.in`;
      await chatPortfolioRepository.update(portfolio.id, {
        status: "deployed",
        liveUrl,
      });
      portfolio.status = "deployed";
      portfolio.liveUrl = liveUrl;
    }

    return NextResponse.json({ data: portfolio }, { status: 201 });
  } catch (error) {
    console.error("Create portfolio error:", error);
    return NextResponse.json({ error: "Failed to create portfolio" }, { status: 500 });
  }
}
