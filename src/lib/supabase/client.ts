/**
 * Supabase Client Configuration
 * 
 * Server-side client for Supabase database operations.
 * Uses service role key for backend operations.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl && 
    supabaseServiceKey &&
    !supabaseUrl.includes("your-project") &&
    !supabaseServiceKey.includes("replace")
  );
}

let serverClient: SupabaseClient | null = null;

/**
 * Server-side Supabase client with service role (full access)
 * Use this for backend operations like creating/updating records
 */
export function getSupabaseServer(): SupabaseClient {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase server credentials not configured");
  }

  if (!serverClient) {
    serverClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return serverClient;
}

/**
 * Client-side Supabase client with anon key (restricted access)
 * Use this for client-side operations with RLS
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase client credentials not configured");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}
