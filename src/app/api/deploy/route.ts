import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { chatPortfolioRepository } from "@/infrastructure/repositories/portfolio-repository";

type DeployRequestBody = {
  portfolioId: string;
};

/**
 * POST /api/deploy
 * Deploys a portfolio by updating its status to "deployed"
 * 
 * The portfolio is served from our database via subdomain routing.
 * No external Vercel API needed.
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

    // Generate slug if not present
    let slug = portfolio.slug;
    if (!slug) {
      // Generate from title: "Jai Kumar's Portfolio" -> "jai-kumar"
      const name = portfolio.title.replace(/'s Portfolio$/i, "").trim();
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 30);
      
      // Ensure uniqueness by appending random suffix if needed
      if (!slug) {
        slug = `portfolio-${Date.now().toString(36)}`;
      }
    }

    // Update to deployed status with live URL
    const liveUrl = `https://${slug}.getfolioai.in`;

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
