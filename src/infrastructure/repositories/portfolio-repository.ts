/**
 * INFRASTRUCTURE LAYER - Portfolio Repository
 * 
 * Supabase-backed repository matching the Product Document schema.
 * See: docs/FolioAI_Product_Document.md
 */

import { supabase } from "@/lib/supabase/client";

import type { 
  Portfolio, 
  DashboardPortfolioSummary, 
  ChatMessage,
  PortfolioStatus 
} from "@/domain/entities/chat";

export type CreatePortfolioInput = {
  userId: string;
  title: string;
  htmlContent: string;
  chatHistory: ChatMessage[];
};

export type UpdatePortfolioInput = {
  title?: string;
  htmlContent?: string;
  liveUrl?: string;
  status?: PortfolioStatus;
  chatHistory?: ChatMessage[];
};

/**
 * Maps Supabase row to Portfolio entity
 */
function mapRowToPortfolio(row: any): Portfolio {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    htmlContent: row.html_content,
    liveUrl: row.live_url,
    status: row.status as PortfolioStatus,
    chatHistory: row.chat_history as ChatMessage[],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export const chatPortfolioRepository = {
  /**
   * Find a single portfolio by ID
   */
  async findById(id: string): Promise<Portfolio | null> {
    try {
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("❌ Error finding portfolio by ID:", error);
        return null;
      }

      if (!data) return null;

      return mapRowToPortfolio(data);
    } catch (error) {
      console.error("❌ Exception in findById:", error);
      return null;
    }
  },

  /**
   * Find all portfolios for a user (exclude archived)
   */
  async findByUserId(userId: string): Promise<Portfolio[]> {
    try {
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", userId)
        .neq("status", "archived")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("❌ Error finding portfolios by user ID:", error);
        return [];
      }

      if (!data) return [];

      return data.map(mapRowToPortfolio);
    } catch (error) {
      console.error("❌ Exception in findByUserId:", error);
      return [];
    }
  },

  /**
   * Get lean summary for dashboard listing
   */
  async listSummaries(userId: string): Promise<DashboardPortfolioSummary[]> {
    try {
      const { data, error } = await supabase
        .from("portfolios")
        .select("id, title, status, live_url, updated_at")
        .eq("user_id", userId)
        .neq("status", "archived")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("❌ Error listing portfolio summaries:", error);
        return [];
      }

      if (!data) return [];

      return data.map((row) => ({
        id: row.id,
        title: row.title,
        status: row.status as PortfolioStatus,
        liveUrl: row.live_url,
        updatedAt: new Date(row.updated_at),
      }));
    } catch (error) {
      console.error("❌ Exception in listSummaries:", error);
      return [];
    }
  },

  /**
   * Create a new portfolio
   */
  async create(input: CreatePortfolioInput): Promise<Portfolio> {
    try {
      const { data, error } = await supabase
        .from("portfolios")
        .insert([
          {
            user_id: input.userId,
            title: input.title,
            html_content: input.htmlContent,
            chat_history: input.chatHistory,
            status: "draft",
            live_url: null,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("❌ Error creating portfolio:", error);
        throw new Error(`Failed to create portfolio: ${error.message}`);
      }

      if (!data) {
        throw new Error("Portfolio creation returned no data");
      }

      return mapRowToPortfolio(data);
    } catch (error) {
      console.error("❌ Exception in create:", error);
      throw error;
    }
  },

  /**
   * Update an existing portfolio
   */
  async update(id: string, input: UpdatePortfolioInput): Promise<Portfolio | null> {
    try {
      const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (input.title !== undefined) updatePayload.title = input.title;
      if (input.htmlContent !== undefined) updatePayload.html_content = input.htmlContent;
      if (input.liveUrl !== undefined) updatePayload.live_url = input.liveUrl;
      if (input.status !== undefined) updatePayload.status = input.status;
      if (input.chatHistory !== undefined) updatePayload.chat_history = input.chatHistory;

      const { data, error } = await supabase
        .from("portfolios")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("❌ Error updating portfolio:", error);
        return null;
      }

      if (!data) return null;

      return mapRowToPortfolio(data);
    } catch (error) {
      console.error("❌ Exception in update:", error);
      return null;
    }
  },

  /**
   * Soft delete - mark portfolio as archived
   */
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("portfolios")
        .update({
          status: "archived",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("❌ Error deleting portfolio:", error);
        return false;
      }

      console.log(`✅ Portfolio ${id} archived successfully`);
      return true;
    } catch (error) {
      console.error("❌ Exception in delete:", error);
      return false;
    }
  },

  /**
   * Deploy portfolio - set live URL and update status
   */
  async setLiveUrl(id: string, liveUrl: string): Promise<Portfolio | null> {
    return this.update(id, { liveUrl, status: "deployed" });
  },
};
