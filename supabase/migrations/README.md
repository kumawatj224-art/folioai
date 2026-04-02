# Supabase Migrations

Database schema changes are tracked here. Files are numbered sequentially.

## Applied Migrations

### `000_create_auth_tables.sql`
- **Tables:** `users`, `otp_verifications`
- **Purpose:** User registration, authentication, and email verification
- **Status:** ✅ Applied to production Supabase

### `001_create_portfolios_table.sql`
- **Table:** `portfolios`
- **Purpose:** Store AI-generated portfolios with chat history and deployment tracking
- **Status:** ✅ Applied to production Supabase

## Schema Overview

```
users (id, email, name, password_hash, password_salt, created_at)
  ↓
  └── portfolios (id, user_id, title, html_content, live_url, status, chat_history, created_at, updated_at)

otp_verifications (id, email, otp_code, expires_at, verified, attempts_remaining, created_at)
  → Temporary table for signup email verification
```

## How to Run Migrations

1. Open Supabase dashboard for your project
2. Go to **SQL Editor**
3. Create new query and copy migration file contents
4. Execute the migration
