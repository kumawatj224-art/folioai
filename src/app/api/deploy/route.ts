import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { chatPortfolioRepository } from "@/infrastructure/repositories/portfolio-repository";

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

type DeployRequestBody = {
  portfolioId: string;
};

/**
 * POST /api/deploy
 * Deploys a portfolio to Vercel
 * 
 * Per Product Document Phase 2:
 * - Calls Vercel API to create a new deployment
 * - Returns a live URL like username-portfolioname.vercel.app
 */
export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!VERCEL_API_TOKEN || VERCEL_API_TOKEN === "replace-me") {
    return NextResponse.json(
      { error: "Vercel API not configured. Add VERCEL_API_TOKEN to .env.local" },
      { status: 503 }
    );
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

    if (portfolio.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!portfolio.htmlContent) {
      return NextResponse.json({ error: "Portfolio has no content to deploy" }, { status: 400 });
    }

    // Generate project name from portfolio title
    const projectName = generateProjectName(portfolio.title, session.user.id);

    // Deploy to Vercel
    const deploymentUrl = await deployToVercel(projectName, portfolio.htmlContent);

    // Update portfolio with live URL
    await chatPortfolioRepository.setLiveUrl(portfolioId, deploymentUrl);

    return NextResponse.json({ 
      url: deploymentUrl,
      message: "Portfolio deployed successfully!" 
    });
  } catch (error) {
    console.error("Deploy error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Deployment failed" },
      { status: 500 }
    );
  }
}

function generateProjectName(title: string, userId: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 30);
  
  const shortId = userId.substring(0, 8);
  return `${slug}-${shortId}`;
}

async function deployToVercel(projectName: string, htmlContent: string): Promise<string> {
  const teamQuery = VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : "";
  
  // Create a deployment using Vercel's deployments API
  // This creates a simple static deployment with just an index.html
  const response = await fetch(`https://api.vercel.com/v13/deployments${teamQuery}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${VERCEL_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: projectName,
      files: [
        {
          file: "index.html",
          data: Buffer.from(htmlContent).toString("base64"),
          encoding: "base64",
        },
      ],
      projectSettings: {
        framework: null,
      },
      target: "production",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Vercel API error:", error);
    throw new Error(`Vercel deployment failed: ${response.status}`);
  }

  const data = await response.json();
  
  // Return the deployment URL
  // Vercel returns the URL in the format: xxx.vercel.app
  return `https://${data.url}`;
}
