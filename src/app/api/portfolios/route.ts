import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { chatPortfolioRepository } from "@/infrastructure/repositories/portfolio-repository";
import { userRepository } from "@/infrastructure/repositories/user-repository";
import {
  getSubscription,
  recordGeneration,
  isAdminEmail,
} from "@/infrastructure/repositories/subscription-repository";
import { PLAN_LIMITS } from "@/domain/entities/subscription";
import type { ChatMessage, PortfolioStatus } from "@/domain/entities/chat";

/**
 * Sanitize a string into a valid DNS subdomain label.
 * - Lowercase, alphanumeric + hyphens only
 * - No leading/trailing hyphens
 * - Max 63 chars (DNS label limit)
 */
function toDnsLabel(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
}

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

    // Record the usage AFTER verifying user/payload to consume 1 generation limit
    // ONLY when they save the draft or deploy, NOT during initial chat generation.
    const usageResult = await recordGeneration(session.user.id, session.user.email);
    if (!usageResult.allowed) {
      return NextResponse.json({ error: usageResult.reason }, { status: 429 });
    }

    const portfolio = await chatPortfolioRepository.create({
      userId: dbUser.id,
      title: body.title,
      htmlContent: body.htmlContent,
      chatHistory: body.chatHistory || [],
    });

    // If status is "deployed", determine the slug based on subscription tier
    if (body.status === "deployed") {
      const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "getfolioai.in";
      const subscription = await getSubscription(session.user.id);
      const isPaidUser = subscription.plan !== "free";

      let slug: string;

      if (isPaidUser) {
        // Paid users: allow custom subdomain input or derive from title
        if (body.customSubdomain) {
          slug = toDnsLabel(body.customSubdomain);
        } else {
          const name = body.title.replace(/'s Portfolio$/i, "").trim();
          slug = toDnsLabel(name);
        }
        if (!slug || slug === "my-portfolio") {
          slug = `portfolio-${Date.now().toString(36)}`;
        }
      } else {
        /**
         * FREE TIER DOMAIN ENFORCEMENT
         * Format: ai[first 8 chars of portfolio_id].[domain]
         */
        const portfolioIdPrefix = portfolio.id.replace(/-/g, "").slice(0, 8);
        slug = `ai${portfolioIdPrefix}`;
      }
      
      const liveUrl = `https://${slug}.${ROOT_DOMAIN}`;
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
