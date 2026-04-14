import { NextResponse } from "next/server";

import { templateRepository } from "@/infrastructure/repositories/template-repository";
import { isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * GET /api/templates
 * Returns all active templates (free and paid)
 * Templates should already exist in the database
 */
export async function GET(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const freeOnly = searchParams.get("free") === "true";
    const category = searchParams.get("category");

    let templates;

    if (freeOnly) {
      templates = await templateRepository.listFree();
    } else if (category) {
      templates = await templateRepository.listByCategory(category as "minimal" | "professional" | "creative" | "developer" | "general");
    } else {
      templates = await templateRepository.listAll();
    }

    return NextResponse.json({ 
      data: templates,
      count: templates.length 
    });
  } catch (error) {
    console.error("Templates API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
