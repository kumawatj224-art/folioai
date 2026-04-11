/**
 * API Route: Serve raw portfolio HTML
 * 
 * GET /api/p/[slug] - Returns raw HTML for deployed portfolios
 */

import { NextResponse } from "next/server";
import { chatPortfolioRepository } from "@/infrastructure/repositories/portfolio-repository";

type RouteParams = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  
  console.log("[api/p] Request for slug:", slug);
  
  if (!slug) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const portfolio = await chatPortfolioRepository.findBySlug(slug);
  
  console.log("[api/p] Portfolio found:", !!portfolio, "status:", portfolio?.status, "hasHtml:", !!portfolio?.htmlContent);

  if (!portfolio || portfolio.status !== "deployed" || !portfolio.htmlContent) {
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head>
  <title>Portfolio Not Found | FolioAI</title>
  <style>
    body { font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #1a1a2e; color: #fff; }
    .container { text-align: center; padding: 2rem; }
    h1 { font-size: 8rem; margin: 0; color: #6366f1; }
    p { font-size: 1.25rem; color: #888; margin: 1rem 0; }
    a { color: #6366f1; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <p>This portfolio doesn't exist or hasn't been published yet.</p>
    <a href="https://getfolioai.in">Create your portfolio with FolioAI</a>
  </div>
</body>
</html>`,
      { 
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      }
    );
  }

  // Return raw HTML with proper headers
  return new NextResponse(portfolio.htmlContent, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
    },
  });
}
