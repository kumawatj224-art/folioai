/**
 * INFRASTRUCTURE LAYER - Portfolio Repository
 * 
 * Supabase-backed repository with file-based fallback for local development.
 * See: docs/FolioAI_Product_Document.md
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

import type { 
  Portfolio, 
  DashboardPortfolioSummary, 
  ChatMessage,
  PortfolioStatus 
} from "@/domain/entities/chat";
import { getSupabaseServer, isSupabaseConfigured } from "@/lib/supabase/client";

// ============================================
// File-based fallback (local development)
// ============================================

const DATA_DIR = join(process.cwd(), ".data");
const PORTFOLIOS_FILE = join(DATA_DIR, "chat-portfolios.json");

async function ensureDataDir(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function readPortfolios(): Promise<Portfolio[]> {
  try {
    await ensureDataDir();
    if (!existsSync(PORTFOLIOS_FILE)) {
      return [];
    }
    const data = await readFile(PORTFOLIOS_FILE, "utf-8");
    return JSON.parse(data) as Portfolio[];
  } catch {
    return [];
  }
}

async function writePortfolios(portfolios: Portfolio[]): Promise<void> {
  await ensureDataDir();
  await writeFile(PORTFOLIOS_FILE, JSON.stringify(portfolios, null, 2), "utf-8");
}

export type CreatePortfolioInput = {
  userId: string;
  title: string;
  htmlContent: string;
  chatHistory: ChatMessage[];
  slug?: string; // Optional - will be auto-generated if not provided
};

export type UpdatePortfolioInput = {
  title?: string;
  slug?: string;
  htmlContent?: string;
  liveUrl?: string;
  status?: PortfolioStatus;
  chatHistory?: ChatMessage[];
};

/**
 * Generate a URL-safe slug from a title
 */
function generateSlug(title: string, existingSlugs: string[] = []): string {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  if (!slug) slug = 'portfolio';
  
  const baseSlug = slug;
  let counter = 0;
  
  while (existingSlugs.includes(slug)) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
  
  return slug;
}

const filePortfolioRepository = {
  async findById(id: string): Promise<Portfolio | null> {
    const portfolios = await readPortfolios();
    return portfolios.find((p) => p.id === id) ?? null;
  },

  async findBySlug(slug: string): Promise<Portfolio | null> {
    const portfolios = await readPortfolios();
    return portfolios.find((p) => p.slug === slug && p.status === "deployed") ?? null;
  },

  async findByUserId(userId: string): Promise<Portfolio[]> {
    const portfolios = await readPortfolios();
    return portfolios.filter((p) => p.userId === userId && p.status !== "archived");
  },

  async listSummaries(userId: string): Promise<DashboardPortfolioSummary[]> {
    const portfolios = await this.findByUserId(userId);
    return portfolios.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      liveUrl: p.liveUrl,
      updatedAt: p.updatedAt,
    }));
  },

  async create(input: CreatePortfolioInput): Promise<Portfolio> {
    const portfolios = await readPortfolios();
    
    // Generate unique slug
    const existingSlugs = portfolios.map(p => p.slug).filter(Boolean) as string[];
    const slug = input.slug || generateSlug(input.title, existingSlugs);
    
    const portfolio: Portfolio = {
      id: randomUUID(),
      userId: input.userId,
      title: input.title,
      slug,
      htmlContent: input.htmlContent,
      liveUrl: null,
      status: "draft",
      chatHistory: input.chatHistory,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    portfolios.push(portfolio);
    await writePortfolios(portfolios);

    return portfolio;
  },

  async update(id: string, input: UpdatePortfolioInput): Promise<Portfolio | null> {
    const portfolios = await readPortfolios();
    const index = portfolios.findIndex((p) => p.id === id);
    
    if (index === -1) return null;

    const updated: Portfolio = {
      ...portfolios[index],
      ...input,
      updatedAt: new Date(),
    };

    portfolios[index] = updated;
    await writePortfolios(portfolios);

    return updated;
  },

  async delete(id: string): Promise<boolean> {
    const portfolios = await readPortfolios();
    const index = portfolios.findIndex((p) => p.id === id);
    
    if (index === -1) return false;

    // Soft delete - change status to archived
    portfolios[index] = {
      ...portfolios[index],
      status: "archived",
      updatedAt: new Date(),
    };
    
    await writePortfolios(portfolios);
    return true;
  },

  async setLiveUrl(id: string, liveUrl: string): Promise<Portfolio | null> {
    return this.update(id, { liveUrl, status: "deployed" });
  },
};

// ============================================
// Supabase-backed repository (production)
// ============================================

type PortfolioRow = {
  id: string;
  user_id: string;
  title: string;
  slug?: string | null;  // Optional - column may not exist
  html_content: string | null;
  live_url: string | null;
  status: string;
  chat_history: unknown[] | null;
  created_at: string;
  updated_at: string;
};

type PortfolioSummaryRow = {
  id: string;
  title: string;
  slug?: string | null;  // Optional - column may not exist
  status: string;
  live_url: string | null;
  updated_at: string;
};

function mapDbToPortfolio(row: PortfolioRow): Portfolio {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    slug: row.slug ?? null,
    htmlContent: row.html_content ?? "",
    liveUrl: row.live_url,
    status: row.status as PortfolioStatus,
    chatHistory: (row.chat_history ?? []) as ChatMessage[],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

const supabasePortfolioRepository = {
  async findById(id: string): Promise<Portfolio | null> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("portfolios")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return mapDbToPortfolio(data as PortfolioRow);
  },

  async findBySlug(slug: string): Promise<Portfolio | null> {
    const supabase = getSupabaseServer();
    
    // Since slug column may not exist, search by live_url pattern
    // live_url format: https://{slug}.getfolioai.in
    const liveUrlPattern = `https://${slug}.getfolioai.in`;
    
    console.log("[findBySlug] Looking for slug:", slug, "with live_url:", liveUrlPattern);
    
    // Use limit(1) with order to get the most recently updated portfolio
    // (handles duplicate live_url edge cases)
    const { data, error } = await supabase
      .from("portfolios")
      .select("*")
      .eq("live_url", liveUrlPattern)
      .eq("status", "deployed")
      .order("updated_at", { ascending: false })
      .limit(1);

    const portfolio = data?.[0];
    console.log("[findBySlug] Result:", { found: !!portfolio, count: data?.length, error: error?.message });
    
    if (error || !portfolio) return null;
    return mapDbToPortfolio(portfolio as PortfolioRow);
  },

  async findByUserId(userId: string): Promise<Portfolio[]> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("portfolios")
      .select("*")
      .eq("user_id", userId)
      .neq("status", "archived")
      .order("updated_at", { ascending: false });

    if (error || !data) return [];
    return (data as PortfolioRow[]).map(mapDbToPortfolio);
  },

  async listSummaries(userId: string): Promise<DashboardPortfolioSummary[]> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("portfolios")
      .select("id, title, status, live_url, updated_at")
      .eq("user_id", userId)
      .neq("status", "archived")
      .order("updated_at", { ascending: false });

    if (error || !data) return [];
    return (data as PortfolioSummaryRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status as PortfolioStatus,
      liveUrl: row.live_url,
      updatedAt: new Date(row.updated_at),
    }));
  },

  async create(input: CreatePortfolioInput): Promise<Portfolio> {
    const supabase = getSupabaseServer();
    
    const { data, error } = await supabase
      .from("portfolios")
      .insert({
        user_id: input.userId,
        title: input.title,
        html_content: input.htmlContent,
        chat_history: input.chatHistory as unknown as Record<string, unknown>[],
        status: "draft",
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create portfolio: ${error?.message}`);
    }

    return mapDbToPortfolio(data as PortfolioRow);
  },

  async update(id: string, input: UpdatePortfolioInput): Promise<Portfolio | null> {
    const supabase = getSupabaseServer();
    
    const updateData: Record<string, unknown> = {};
    if (input.title !== undefined) updateData.title = input.title;
    // Skip slug - column may not exist in database yet
    if (input.htmlContent !== undefined) updateData.html_content = input.htmlContent;
    if (input.liveUrl !== undefined) updateData.live_url = input.liveUrl;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.chatHistory !== undefined) updateData.chat_history = input.chatHistory;

    console.log("[portfolio-repository] Updating portfolio:", id, "with:", Object.keys(updateData));

    const { data, error } = await supabase
      .from("portfolios")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[portfolio-repository] Update error:", error.message, error.details, error.hint);
      return null;
    }
    if (!data) {
      console.error("[portfolio-repository] No data returned after update");
      return null;
    }
    return mapDbToPortfolio(data as PortfolioRow);
  },

  async delete(id: string): Promise<boolean> {
    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from("portfolios")
      .update({ status: "archived" })
      .eq("id", id);

    return !error;
  },

  async setLiveUrl(id: string, liveUrl: string): Promise<Portfolio | null> {
    return this.update(id, { liveUrl, status: "deployed" });
  },
};

// ============================================
// Export the appropriate repository
// ============================================

export const chatPortfolioRepository = isSupabaseConfigured()
  ? supabasePortfolioRepository
  : filePortfolioRepository;
