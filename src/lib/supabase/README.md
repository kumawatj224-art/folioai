# Supabase Integration

FolioAI uses Supabase as the production database for users and portfolios.

## Setup

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the database to be provisioned

### 2. Run Database Migration
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Run the SQL to create the tables

### 3. Get Your Credentials
Go to **Project Settings > API** and copy:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Add to `.env.local`
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Architecture

- **Server client** (`getSupabaseServer`) - Uses service role key for backend operations
- **Client client** (`getSupabaseClient`) - Uses anon key with RLS for client-side

## Fallback

When Supabase is not configured, the app automatically falls back to file-based storage in `.data/` directory. This is useful for local development without a database.
