import { NextResponse } from "next/server";

import { templateRepository } from "@/infrastructure/repositories/template-repository";
import { SAMPLE_TEMPLATES } from "@/data/sample-templates";
import { isSupabaseConfigured } from "@/lib/supabase/client";

// Track if we've synced templates this server instance
let hasAutoSynced = false;

/**
 * Auto-sync templates from code to database (runs once per server instance)
 * This ensures templates are always up-to-date without manual seeding
 */
async function ensureTemplatesSynced() {
  if (hasAutoSynced || !isSupabaseConfigured()) return;
  
  try {
    console.log("[Templates] Starting auto-sync of", SAMPLE_TEMPLATES.length, "templates...");
    const count = await templateRepository.seedTemplates(SAMPLE_TEMPLATES);
    hasAutoSynced = true;
    console.log("[Templates] Auto-synced", count, "templates to database");
  } catch (error) {
    console.error("[Templates] Auto-sync failed:", error);
    // Mark as synced to avoid retrying on every request
    hasAutoSynced = true;
  }
}

/**
 * GET /api/templates
 * Returns all active templates (free and paid)
 * Auto-syncs templates from code on first request
 */
export async function GET(request: Request) {
  try {
    // Auto-sync templates on first request
    await ensureTemplatesSynced();
    
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
