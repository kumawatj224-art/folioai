import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { chatPortfolioRepository } from "@/infrastructure/repositories/portfolio-repository";
import { getSubscription } from "@/infrastructure/repositories/subscription-repository";

type DeployRequestBody = {
  portfolioId: string;
};

/**
 * Sanitize a string into a valid DNS subdomain label.
 * - Lowercase, alphanumeric + hyphens only
 * - No leading/trailing hyphens
 * - Max 63 characters (DNS label limit)
 */
function toDnsLabel(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
}

/**
 * POST /api/deploy
 * Deploys a portfolio by updating its status to "deployed"
 *
 * The portfolio is served from our database via subdomain routing.
 * No external Vercel API needed.
 *
 * DOMAIN LOGIC (Task 3):
 *   - Active subscribers (paid plans): may use a custom slug (from portfolio title).
 *   - Free-tier users: domain is ALWAYS forced to <uid>.getfolioai.in
 *     (hyphens stripped from UUID for DNS compliance).
 *     Any custom slug input is ignored.
 */
export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as DeployRequestBody;
    const { portfolioId } = body;

    if (!portfolioId) {
      return NextResponse.json({ error: "Portfolio ID required" }, { status: 400 });
    }

    // Fetch portfolio
    const portfolio = await chatPortfolioRepository.findById(portfolioId);
    
    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    // Verify ownership
    if (portfolio.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── Domain Naming Logic ──────────────────────────────────────────
    const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "getfolioai.in";
    const subscription = await getSubscription(session.user.id);
    const isPaidUser = subscription.plan !== "free";

    let slug: string;

    if (isPaidUser) {
      // Paid users: derive slug from portfolio title (custom / human-readable)
      const name = portfolio.title.replace(/'s Portfolio$/i, "").trim();
      slug = toDnsLabel(name) || toDnsLabel(`portfolio-${Date.now().toString(36)}`);
      // Ensure we have a valid slug fallback
      if (!slug) slug = `portfolio-${Date.now().toString(36)}`;
    } else {
      /**
       * Free users: force portfolio-based subdomain.
       * Format: ai[first 8 chars of portfolio_id].[domain]
       */
      const portfolioIdPrefix = portfolioId.replace(/-/g, "").slice(0, 8);
      slug = `ai${portfolioIdPrefix}`;
    }

    const liveUrl = `https://${slug}.${ROOT_DOMAIN}`;
    // ──────────────────────────────────────────────────────────────────────────

    const updated = await chatPortfolioRepository.update(portfolioId, {
      status: "deployed",
      slug,
      liveUrl,
    });

    return NextResponse.json({ 
      data: updated,
      message: "Portfolio deployed successfully",
    });
  } catch (error) {
    console.error("Deploy error:", error);
    return NextResponse.json({ error: "Deployment failed" }, { status: 500 });
  }
}
