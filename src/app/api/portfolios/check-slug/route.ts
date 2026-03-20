import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { createRepositories } from "@/infrastructure/repositories/file-repository";
import { validateSlug } from "@/domain/entities/portfolio";

/**
 * GET /api/portfolios/check-slug?slug=xxx
 * Checks if a slug is available for use
 */
export async function GET(request: NextRequest) {
  const session = await getCurrentSession();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Slug parameter is required" }, { status: 400 });
  }

  // Validate slug format
  const validation = validateSlug(slug);
  if (!validation.valid) {
    return NextResponse.json({ 
      available: false, 
      error: validation.error 
    });
  }

  const { portfolios } = createRepositories();
  const available = await portfolios.isSlugAvailable(slug);

  return NextResponse.json({ available });
}
