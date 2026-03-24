import { NextResponse } from "next/server";

import { templateRepository } from "@/infrastructure/repositories/template-repository";
import { SAMPLE_TEMPLATES } from "@/data/sample-templates";
import { isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * POST /api/templates/seed
 * Seeds the sample templates into the database
 * 
 * This endpoint is used to initialize the templates table with sample data.
 * In production, this should be protected or removed.
 */
export async function POST() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase not configured. Cannot seed templates." },
        { status: 503 }
      );
    }

    const seededCount = await templateRepository.seedTemplates(SAMPLE_TEMPLATES);

    return NextResponse.json({
      message: seededCount > 0 
        ? `Successfully seeded ${seededCount} templates` 
        : "All templates already exist",
      seeded: seededCount,
      total: SAMPLE_TEMPLATES.length,
    });
  } catch (error) {
    console.error("Seed templates error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to seed templates" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/templates/seed
 * Returns info about available templates to seed
 */
export async function GET() {
  return NextResponse.json({
    available: SAMPLE_TEMPLATES.map(t => ({
      name: t.name,
      slug: t.slug,
      category: t.category,
      isFree: t.isFree,
      priceInr: t.priceInr,
    })),
    total: SAMPLE_TEMPLATES.length,
    supabaseConfigured: isSupabaseConfigured(),
  });
}
