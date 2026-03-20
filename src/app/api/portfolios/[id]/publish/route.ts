import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { createRepositories } from "@/infrastructure/repositories/file-repository";

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/portfolios/[id]/publish
 * Publishes a portfolio, making it visible to the public
 */
export async function POST(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await getCurrentSession();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { portfolios } = createRepositories();
  const portfolio = await portfolios.findById(id);

  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  if (portfolio.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (portfolio.status === "published") {
    return NextResponse.json({ error: "Portfolio is already published" }, { status: 400 });
  }

  // Validate portfolio has minimum required content
  if (!portfolio.displayName) {
    return NextResponse.json({ error: "Portfolio needs a display name before publishing" }, { status: 400 });
  }

  const result = await portfolios.publish(id);

  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ data: result.data });
}
