import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { chatPortfolioRepository, type UpdatePortfolioInput } from "@/infrastructure/repositories/portfolio-repository";
import { getSubscription, recordRegeneration } from "@/infrastructure/repositories/subscription-repository";
import { supportsCustomSubdomainForSubscription } from "@/domain/entities/subscription";
import { validatePortfolioHtml } from "@/lib/utils/portfolio-html";

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

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/portfolios/[id]
 * Returns a specific portfolio by ID
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await getCurrentSession();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const portfolio = await chatPortfolioRepository.findById(id);

  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  // Users can only view their own portfolios via this endpoint
  if (portfolio.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ data: portfolio });
}

/**
 * PATCH /api/portfolios/[id]
 * Updates a portfolio
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await getCurrentSession();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const portfolio = await chatPortfolioRepository.findById(id);

  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  if (portfolio.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, htmlContent, liveUrl, status, chatHistory, customSubdomain } = body;

    const htmlValidation = htmlContent !== undefined
      ? validatePortfolioHtml(String(htmlContent))
      : null;

    if (htmlValidation && htmlValidation.violations.length > 0) {
      return NextResponse.json(
        {
          error: "Generated portfolio HTML contains product/editor UI and must be regenerated.",
          details: htmlValidation.violations,
        },
        { status: 400 }
      );
    }

    // Record the usage AFTER verifying user/payload to consume 1 regeneration limit
    // We only deduct if they actually changed content/deployed, not just normal viewing
    if (htmlContent || chatHistory) {
      const usageResult = await recordRegeneration(session.user.id, session.user.email);
      if (!usageResult.allowed) {
        return NextResponse.json({ error: usageResult.reason }, { status: 429 });
      }
    }

    // Handle liveUrl update separately (also sets status to deployed)
    if (liveUrl !== undefined) {
      const result = await chatPortfolioRepository.setLiveUrl(id, liveUrl);
      return NextResponse.json({ data: result });
    }

    // Update fields if provided
    const updates: UpdatePortfolioInput = {};
    if (title !== undefined) updates.title = title;
    if (htmlValidation) updates.htmlContent = htmlValidation.sanitizedHtml;
    if (status !== undefined) updates.status = status;
    if (chatHistory !== undefined) updates.chatHistory = chatHistory;

    // If deploying, resolve the slug based on subscription tier
    if (status === "deployed") {
      // ── Domain Naming Logic ───────────────────────────────────────
      const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "getfolioai.in";
      const subscription = await getSubscription(session.user.id, session.user.email);
      const canUseCustomSubdomain = supportsCustomSubdomainForSubscription(subscription);

      let slug: string;

      if (canUseCustomSubdomain) {
        // Paid users: allow custom subdomain input or derive from portfolio title
        if (customSubdomain) {
          slug = toDnsLabel(customSubdomain);
        } else {
          const name = portfolio.title.replace(/'s Portfolio$/i, "").trim();
          slug = toDnsLabel(name);
        }
        if (!slug || slug === "my-portfolio") {
          slug = `portfolio-${Date.now().toString(36)}`;
        }
      } else {
        /**
         * FREE TIER DOMAIN ENFORCEMENT
         * Format: ai[first 6 chars of portfolio_id].[domain]
         */
        const portfolioIdPrefix = id.replace(/-/g, "").slice(0, 6);
        slug = `ai${portfolioIdPrefix}`;
      }
      // ───────────────────────────────────────────────────────────────────────

      updates.liveUrl = `https://${slug}.${ROOT_DOMAIN}`;
    }

    const result = await chatPortfolioRepository.update(id, updates);

    if (!result) {
      return NextResponse.json({ error: "Failed to update portfolio" }, { status: 500 });
    }

    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

/**
 * DELETE /api/portfolios/[id]
 * Deletes a portfolio
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await getCurrentSession();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const portfolio = await chatPortfolioRepository.findById(id);

  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  if (portfolio.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const deleted = await chatPortfolioRepository.delete(id);

  if (!deleted) {
    return NextResponse.json({ error: "Failed to delete portfolio" }, { status: 500 });
  }

  return NextResponse.json({ message: "Portfolio deleted" });
}
