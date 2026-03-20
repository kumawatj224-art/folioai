import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { chatPortfolioRepository, type UpdatePortfolioInput } from "@/infrastructure/repositories/portfolio-repository";

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
    const { title, htmlContent, liveUrl, status, chatHistory } = body;

    // Handle liveUrl update separately (also sets status to deployed)
    if (liveUrl !== undefined) {
      const result = await chatPortfolioRepository.setLiveUrl(id, liveUrl);
      return NextResponse.json({ data: result });
    }

    // Update fields if provided
    const updates: UpdatePortfolioInput = {};
    if (title !== undefined) updates.title = title;
    if (htmlContent !== undefined) updates.htmlContent = htmlContent;
    if (status !== undefined) updates.status = status;
    if (chatHistory !== undefined) updates.chatHistory = chatHistory;

    const result = await chatPortfolioRepository.update(id, updates);

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
