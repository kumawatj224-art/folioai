## Admin Allowlist

You can grant internal/admin users full access to all premium capabilities and unlimited usage by setting either of these environment variables:

```env
ADMIN_USER_IDS=user-id-1,user-id-2
ADMIN_EMAILS=admin@example.com,owner@example.com
```

Notes:
- Users matched by either ID or email are treated as admins.
- Admin users bypass portfolio generation and regeneration limits.
- Admin users get premium feature access, including custom FolioAI subdomain permissions and unrestricted portfolio access.
- This is intended for internal/admin accounts only.

# Environment Setup Guide

FolioAI uses separate databases and configurations for each environment to isolate testing data from production.

## Environment Overview

| Environment | Branch | Domain | Database |
|-------------|--------|--------|----------|
| **Production** | `main` | `getfolioai.in` | Supabase (folioai-prod) |
| **PPE** | `ppe` | `ppe.getfolioai.in` | Supabase (folioai-ppe) |
| **Local** | any | `localhost:3000` | File-based or local Supabase |

---

## Setting Up PPE Database (Separate Supabase Project)

### Step 1: Create PPE Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Configure:
   - **Name**: `folioai-ppe`
   - **Database Password**: Generate a strong password
   - **Region**: Same as production (for consistency)
4. Wait for provisioning (~2 minutes)

### Step 2: Run Migrations on PPE Database

1. Open **SQL Editor** in your PPE Supabase project
2. Run each migration file in order:
   ```
   supabase/migrations/000_create_auth_tables.sql
   supabase/migrations/001_initial_schema.sql
   supabase/migrations/003_fix_user_id_type.sql
   supabase/migrations/004_subscriptions.sql
   supabase/migrations/005_portfolio_slug.sql
   ```

### Step 3: Get PPE Credentials

Go to **Project Settings > API** and copy:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Vercel Environment Configuration

Configure different environment variables for each deployment environment in Vercel.

### Navigate to Environment Variables
1. Go to [vercel.com](https://vercel.com) → Your Project → **Settings** → **Environment Variables**

### Production Variables (main branch)
Set these with **Environment: Production**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<production-service-role-key>
NEXT_PUBLIC_PORTFOLIO_DOMAIN=getfolioai.in
```

### PPE Variables (ppe branch)
Set these with **Environment: Preview** and **Git Branch: ppe**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-ppe-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ppe-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<ppe-service-role-key>
NEXT_PUBLIC_PORTFOLIO_DOMAIN=ppe.getfolioai.in
```

### How to Set Branch-Specific Variables in Vercel

1. Click **Add New** in Environment Variables
2. Enter the variable name and value
3. Under **Environment**, select **Preview**
4. Enable **"Scope to specific Git branches"**
5. Enter `ppe` as the branch name
6. Click **Save**

![Vercel Branch Variables](https://vercel.com/docs/_next/image?url=/docs/concepts/projects/environment-variables/branch-variables.png)

---

## Local Development

For local development, create `.env.local`:

```bash
# Local Development - Points to PPE database for safe testing
NEXT_PUBLIC_SUPABASE_URL=https://your-ppe-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ppe-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<ppe-service-role-key>

# Local domain (no subdomain routing)
NEXT_PUBLIC_PORTFOLIO_DOMAIN=localhost:3000
```

**Note**: Never commit `.env.local` to git. It's already in `.gitignore`.

---

## DNS Configuration

### Production
- `*.getfolioai.in` → CNAME to `cname.vercel-dns.com`

### PPE
- `*.ppe.getfolioai.in` → CNAME to `cname.vercel-dns.com`

---

## Quick Reference: Environment Variables Per Environment

| Variable | Production | PPE | Local |
|----------|------------|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | prod Supabase | ppe Supabase | ppe Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | prod key | ppe key | ppe key |
| `NEXT_PUBLIC_PORTFOLIO_DOMAIN` | `getfolioai.in` | `ppe.getfolioai.in` | `localhost:3000` |
| `NEXTAUTH_URL` | `https://getfolioai.in` | `https://ppe.getfolioai.in` | `http://localhost:3000` |

---

## Testing Environment Isolation

After setup, verify isolation:

1. **Create a test portfolio in PPE**:
   - Go to `https://ppe.getfolioai.in`
   - Create and deploy a portfolio

2. **Verify it doesn't appear in production**:
   - Go to `https://getfolioai.in`
   - Login with same account - PPE portfolio should NOT appear

3. **Check the database directly**:
   - Open PPE Supabase → Table Editor → portfolios
   - Verify the test portfolio exists only in PPE
