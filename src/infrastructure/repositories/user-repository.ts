/**
 * User Repository - Supabase
 * 
 * Syncs NextAuth users to Supabase users table.
 */

import { getSupabaseServer, isSupabaseConfigured } from "@/lib/supabase/client";

export type User = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
};

export type CreateUserInput = {
  id: string;
  email: string;
  name?: string | null;
};

export const userRepository = {
  /**
   * Ensure a user exists in Supabase (called after OAuth login)
   */
  async ensureUser(input: CreateUserInput): Promise<User | null> {
    if (!isSupabaseConfigured()) {
      // File-based doesn't need user sync
      return {
        id: input.id,
        email: input.email,
        name: input.name ?? null,
        createdAt: new Date(),
      };
    }

    const supabase = getSupabaseServer();

    // First check if user exists by ID (same OAuth provider ID)
    const { data: existingById } = await supabase
      .from("users")
      .select("*")
      .eq("id", input.id)
      .single();

    if (existingById) {
      return {
        id: existingById.id,
        email: existingById.email,
        name: existingById.name,
        createdAt: new Date(existingById.created_at),
      };
    }

    // Check if user exists by email (legacy user with UUID)
    const { data: existingByEmail } = await supabase
      .from("users")
      .select("*")
      .eq("email", input.email)
      .single();

    if (existingByEmail) {
      // User exists with different ID (legacy UUID user)
      // Just return existing user - don't change their ID
      // This ensures existing portfolios keep working
      return {
        id: existingByEmail.id,
        email: existingByEmail.email,
        name: existingByEmail.name,
        createdAt: new Date(existingByEmail.created_at),
      };
    }

    // Create new user
    const { data, error } = await supabase
      .from("users")
      .insert({
        id: input.id,
        email: input.email,
        name: input.name,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create user:", error);
      console.error("Input was:", { id: input.id, email: input.email, name: input.name });
      
      // If insert fails due to unique constraint, try to fetch existing user
      if (error.code === "23505") {
        const { data: existing } = await supabase
          .from("users")
          .select("*")
          .eq("email", input.email)
          .single();
        if (existing) {
          return {
            id: existing.id,
            email: existing.email,
            name: existing.name,
            createdAt: new Date(existing.created_at),
          };
        }
      }
      return null;
    }

    if (!data) {
      console.error("No data returned after user insert");
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      createdAt: new Date(data.created_at),
    };
  },

  async findByEmail(email: string): Promise<User | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      createdAt: new Date(data.created_at),
    };
  },
};
