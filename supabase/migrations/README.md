# Supabase Migrations

Database schema changes are tracked here. Files are numbered sequentially.

## Applied Migrations
 
### `000_create_auth_tables.sql`
- **Tables:** `users`, `otp_verifications`
- **Purpose:** User registration with password auth and OTP email verification
- **Features:** Safe IF NOT EXISTS, ALTER TABLE for password columns

### `001_initial_schema.sql`
- **Tables:** `users` (if not exists), `portfolios`
- **Purpose:** Core schema with portfolios and RLS policies
- **Features:** Updated_at trigger, Row Level Security

### `002_templates.sql`
- **Table:** `templates`
- **Purpose:** Portfolio starter templates

### `003_fix_user_id_type.sql`
- **Purpose:** Fix user_id column type for TEXT compatibility (Google OAuth)

### `004_subscriptions.sql`
- **Table:** `subscriptions`
- **Purpose:** User subscription plans and usage tracking

## Schema Overview

```
users (id, email, name, password_hash?, password_salt?, created_at)
  ↓
  ├── portfolios (id, user_id, title, html_content, live_url, status, chat_history, timestamps)
  └── subscriptions (id, user_id, plan, portfolios_used, generations_used, timestamps)

otp_verifications (id, email, otp_code, expires_at, verified, attempts_remaining, created_at)
  → Temporary table for signup email verification

templates (id, name, content, category, created_at)
```

## How to Run Migrations

1. Open Supabase dashboard for your project
2. Go to **SQL Editor**
3. Create new query and copy migration file contents
4. Execute migrations **in numeric order** (000 → 001 → 002 → ...)
