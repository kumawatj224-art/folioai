/**
 * Supabase Database Types
 * 
 * Type definitions matching the database schema from Product Document.
 * See: docs/FolioAI_Product_Document.md
 */

export type PortfolioStatus = "draft" | "deployed" | "archived";

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          created_at?: string;
        };
      };
      portfolios: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          html_content: string | null;
          live_url: string | null;
          status: PortfolioStatus;
          chat_history: Record<string, unknown>[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          html_content?: string | null;
          live_url?: string | null;
          status?: PortfolioStatus;
          chat_history?: Record<string, unknown>[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          html_content?: string | null;
          live_url?: string | null;
          status?: PortfolioStatus;
          chat_history?: Record<string, unknown>[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
