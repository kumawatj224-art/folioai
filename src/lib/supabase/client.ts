import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          password_hash: string;
          password_salt: string;
          created_at: string;
        };
        Insert: {
          name: string;
          email: string;
          password_hash: string;
          password_salt: string;
        };
      };
    };
  };
};