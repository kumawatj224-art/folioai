/**
 * Template Repository
 * 
 * Manages portfolio templates in Supabase.
 */

import { getSupabaseServer, getSupabaseServerFresh, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Template, TemplateSummary, TemplateCategory } from "@/domain/entities/template";

type TemplateRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  thumbnail_url: string | null;
  html_template: string;
  css_variables: Record<string, string> | null;
  is_free: boolean;
  price_inr: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

function mapRowToTemplate(row: TemplateRow): Template {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    category: row.category as TemplateCategory,
    thumbnailUrl: row.thumbnail_url,
    htmlTemplate: row.html_template,
    cssVariables: row.css_variables ?? {},
    isFree: row.is_free,
    priceInr: row.price_inr,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapRowToSummary(row: TemplateRow): TemplateSummary {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    category: row.category as TemplateCategory,
    thumbnailUrl: row.thumbnail_url,
    isFree: row.is_free,
    priceInr: row.price_inr,
  };
}

export type CreateTemplateInput = {
  name: string;
  slug: string;
  description?: string;
  category?: TemplateCategory;
  thumbnailUrl?: string;
  htmlTemplate: string;
  cssVariables?: Record<string, string>;
  isFree?: boolean;
  priceInr?: number;
  sortOrder?: number;
};

export const templateRepository = {
  async findById(id: string): Promise<Template | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error || !data) return null;
    return mapRowToTemplate(data as TemplateRow);
  },

  async findBySlug(slug: string): Promise<Template | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !data) return null;
    return mapRowToTemplate(data as TemplateRow);
  },

  async listAll(): Promise<TemplateSummary[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("templates")
      .select("id, name, slug, description, category, thumbnail_url, is_free, price_inr")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data) return [];
    return (data as TemplateRow[]).map(mapRowToSummary);
  },

  async listFree(): Promise<TemplateSummary[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("templates")
      .select("id, name, slug, description, category, thumbnail_url, is_free, price_inr")
      .eq("is_active", true)
      .eq("is_free", true)
      .order("sort_order", { ascending: true });

    if (error || !data) return [];
    return (data as TemplateRow[]).map(mapRowToSummary);
  },

  async listByCategory(category: TemplateCategory): Promise<TemplateSummary[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("templates")
      .select("id, name, slug, description, category, thumbnail_url, is_free, price_inr")
      .eq("is_active", true)
      .eq("category", category)
      .order("sort_order", { ascending: true });

    if (error || !data) return [];
    return (data as TemplateRow[]).map(mapRowToSummary);
  },

  async create(input: CreateTemplateInput): Promise<Template> {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase not configured");
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("templates")
      .insert({
        name: input.name,
        slug: input.slug,
        description: input.description,
        category: input.category ?? "general",
        thumbnail_url: input.thumbnailUrl,
        html_template: input.htmlTemplate,
        css_variables: input.cssVariables ?? {},
        is_free: input.isFree ?? true,
        price_inr: input.priceInr ?? 0,
        sort_order: input.sortOrder ?? 0,
        is_active: true,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create template: ${error?.message}`);
    }

    return mapRowToTemplate(data as TemplateRow);
  },

  /**
   * Upsert templates - insert new ones or update existing ones by slug.
   * This ensures template changes in code are reflected in the database.
   */
  async seedTemplates(templates: CreateTemplateInput[]): Promise<number> {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase not configured");
    }

    // Use fresh client to avoid schema cache issues
    const supabase = getSupabaseServerFresh();
    
    // Upsert all templates - update if slug exists, insert if not
    const { data, error } = await supabase
      .from("templates")
      .upsert(
        templates.map(t => ({
          name: t.name,
          slug: t.slug,
          description: t.description,
          category: t.category ?? "general",
          thumbnail_url: t.thumbnailUrl,
          html_template: t.htmlTemplate,
          css_variables: t.cssVariables ?? {},
          is_free: t.isFree ?? true,
          price_inr: t.priceInr ?? 0,
          sort_order: t.sortOrder ?? 0,
          is_active: true,
        })),
        { onConflict: "slug" } // Update existing templates by slug
      )
      .select();

    if (error) {
      throw new Error(`Failed to seed templates: ${error.message}`);
    }

    return data?.length ?? 0;
  },
};
