# FolioAI Pricing Plans

## Target Audience
Indian engineering students (budget-conscious, value-driven)

---

## Plan Structure

### 🆓 FREE PLAN
**Price:** ₹0

| Feature | Limit |
|---------|-------|
| Portfolio generations | 3 total (lifetime) |
| Regenerations | 2/day |
| Templates | 3 basic templates |
| Subdomain | ❌ No |
| Custom domain | ❌ No |
| Portfolio URL | `folioai.in/p/{random-id}` |
| Analytics | ❌ No |
| Resume parsing | 1 upload |
| FolioAI branding | ✅ "Made with FolioAI" footer |
| Export HTML | ✅ Yes |

**Best for:** Try before you buy, one-time portfolio creation

---

### ⭐ STARTER PLAN
**Price:** ₹99/month OR ₹799/year (33% off)

| Feature | Limit |
|---------|-------|
| Portfolio generations | 5/month |
| Regenerations | 10/day |
| Templates | All 7 templates |
| Subdomain | ✅ `username.folioai.in` |
| Custom domain | ❌ No |
| Analytics | Basic (views, clicks) |
| Resume parsing | Unlimited |
| FolioAI branding | Smaller footer |
| Export HTML | ✅ Yes |
| Priority support | ❌ No |

**Best for:** Students actively job hunting

---

### 🚀 PRO PLAN (Most Popular)
**Price:** ₹199/month OR ₹1,499/year (37% off)

| Feature | Limit |
|---------|-------|
| Portfolio generations | 15/month |
| Regenerations | Unlimited |
| Templates | All templates + Premium |
| Subdomain | ✅ `username.folioai.in` |
| Custom domain | ✅ 1 domain (BYOD - Bring Your Own) |
| Analytics | Full (views, clicks, geography, referrers) |
| Resume parsing | Unlimited |
| FolioAI branding | ❌ Removed |
| Export HTML | ✅ Yes |
| Priority support | ✅ Yes |
| GitHub auto-sync | ✅ Yes |
| Multiple portfolios | Up to 3 |

**Best for:** Serious job seekers, freelancers

**Note on Custom Domains:** User purchases their own domain from any registrar (GoDaddy, Namecheap, etc.). We handle DNS verification and SSL (free via Let's Encrypt). Our cost: ₹0.

---

### 💎 LIFETIME DEAL (Limited - First 100 Users)
**Price:** ₹4,999 one-time

| Feature | Limit |
|---------|-------|
| Everything in PRO | ✅ Forever |
| Portfolio generations | 10/month (120/year) |
| Custom domain | ✅ 1 domain (BYOD) |
| Multiple portfolios | Up to 3 |
| Early access to new features | ✅ Yes |
| Founder badge | ✅ "Early Supporter" |

**Best for:** Early adopters, long-term users

**Why capped at 10/month?** Sustainability. At ₹7/generation AI cost:
- 10 gen/month × 12 months = 120 generations/year
- 120 × ₹7 = ₹840 AI cost/year
- Break-even in ~6 years, profitable after that

---

## Feature Breakdown

### Subdomain System
- Free: `folioai.in/p/abc123xyz`
- Starter+: `arjun-sharma.folioai.in`
- Pro/Lifetime: `arjunsharma.com` (BYOD - user buys domain, we configure)

### Custom Domain (BYOD) Flow
1. User purchases domain from any registrar (~₹500-800/year)
2. User adds domain in FolioAI dashboard
3. We provide DNS records (CNAME/A record)
4. User configures DNS at their registrar
5. We auto-provision SSL via Let's Encrypt
6. Portfolio live at custom domain!

**Our cost per custom domain: ₹0** (SSL is free, DNS verification is automated)

### Templates by Plan

| Template | Free | Starter | Pro |
|----------|------|---------|-----|
| minimal-dark | ✅ | ✅ | ✅ |
| minimal-warm | ✅ | ✅ | ✅ |
| terminal-dark | ✅ | ✅ | ✅ |
| enterprise-dark | ❌ | ✅ | ✅ |
| gradient-dark | ❌ | ✅ | ✅ |
| editorial-light | ❌ | ✅ | ✅ |
| brutalist | ❌ | ✅ | ✅ |
| Premium themes (future) | ❌ | ❌ | ✅ |

### Analytics Dashboard (Starter+)
- Total views
- Unique visitors
- Click-through on links
- Top referrers
- Geographic distribution
- Device breakdown

### Analytics Dashboard (Pro)
- Everything above +
- Daily/weekly/monthly trends
- Heatmap of clicks
- Download PDF reports
- Recruiter alerts (when someone views 3+ times)

---

## Technical Implementation

### Database Schema Addition

```sql
-- User plan tracking
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free', -- free, starter, pro, lifetime
  status TEXT NOT NULL DEFAULT 'active', -- active, cancelled, expired
  
  -- Limits
  generations_used_this_month INT DEFAULT 0,
  generations_reset_date TIMESTAMPTZ,
  regenerations_used_today INT DEFAULT 0,
  regenerations_reset_date DATE,
  
  -- Billing
  razorpay_subscription_id TEXT,
  razorpay_customer_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Custom domains
CREATE TABLE custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  domain TEXT UNIQUE NOT NULL,
  subdomain TEXT UNIQUE, -- username.folioai.in
  verification_status TEXT DEFAULT 'pending', -- pending, verified, failed
  ssl_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Analytics events
CREATE TABLE portfolio_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- view, click, download
  visitor_id TEXT, -- anonymous fingerprint
  referrer TEXT,
  country TEXT,
  city TEXT,
  device TEXT,
  browser TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Plan Limits Type

```typescript
type PlanLimits = {
  plan: 'free' | 'starter' | 'pro' | 'lifetime';
  
  // Generation limits
  generationsPerMonth: number;
  generationsUsed: number;
  regenerationsPerDay: number;
  regenerationsUsed: number;
  
  // Features
  templates: string[];
  hasSubdomain: boolean;
  customDomains: number;
  maxPortfolios: number;
  hasAnalytics: boolean;
  hasAdvancedAnalytics: boolean;
  hasBranding: boolean;
  hasPrioritySupport: boolean;
  hasGithubSync: boolean;
};

const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    plan: 'free',
    generationsPerMonth: 3, // lifetime for free
    generationsUsed: 0,
    regenerationsPerDay: 2,
    regenerationsUsed: 0,
    templates: ['minimal-dark', 'minimal-warm', 'terminal-dark'],
    hasSubdomain: false,
    customDomains: 0,
    maxPortfolios: 1,
    hasAnalytics: false,
    hasAdvancedAnalytics: false,
    hasBranding: true, // shows branding
    hasPrioritySupport: false,
    hasGithubSync: false,
  },
  starter: {
    plan: 'starter',
    generationsPerMonth: 5,
    generationsUsed: 0,
    regenerationsPerDay: 10,
    regenerationsUsed: 0,
    templates: ['minimal-dark', 'minimal-warm', 'terminal-dark', 'enterprise-dark', 'gradient-dark', 'editorial-light', 'brutalist'],
    hasSubdomain: true,
    customDomains: 0,
    maxPortfolios: 1,
    hasAnalytics: true,
    hasAdvancedAnalytics: false,
    hasBranding: true, // smaller branding
    hasPrioritySupport: false,
    hasGithubSync: false,
  },
  pro: {
    plan: 'pro',
    generationsPerMonth: 15,
    generationsUsed: 0,
    regenerationsPerDay: 999, // unlimited
    regenerationsUsed: 0,
    templates: ['all'],
    hasSubdomain: true,
    customDomains: 1,
    maxPortfolios: 3,
    hasAnalytics: true,
    hasAdvancedAnalytics: true,
    hasBranding: false, // no branding
    hasPrioritySupport: true,
    hasGithubSync: true,
  },
  lifetime: {
    plan: 'lifetime',
    generationsPerMonth: 50,
    generationsUsed: 0,
    regenerationsPerDay: 999,
    regenerationsUsed: 0,
    templates: ['all'],
    hasSubdomain: true,
    customDomains: 3,
    maxPortfolios: 5,
    hasAnalytics: true,
    hasAdvancedAnalytics: true,
    hasBranding: false,
    hasPrioritySupport: true,
    hasGithubSync: true,
  },
};
```

---

## Payment Integration (Razorpay)

### Why Razorpay?
- Indian payment gateway (UPI, cards, wallets)
- Easy subscription management
- Student-friendly (low MDR)
- No international payment issues

### Razorpay Plans to Create
1. `plan_starter_monthly` - ₹99/month
2. `plan_starter_yearly` - ₹799/year
3. `plan_pro_monthly` - ₹199/month
4. `plan_pro_yearly` - ₹1,499/year
5. `plan_lifetime` - ₹2,999 one-time

---

## UI Components Needed

### 1. Usage Banner (Top of Dashboard)
```
┌─────────────────────────────────────────────────────────────┐
│ ⚡ Free Plan: 2/3 generations left • 1/2 regenerations today │
│                                        [Upgrade to Pro →]   │
└─────────────────────────────────────────────────────────────┘
```

### 2. Pricing Page
- Modern card layout
- Toggle: Monthly / Yearly
- Highlight "Most Popular" on Pro
- Student discount code field

### 3. Upgrade Modal
```
┌─────────────────────────────────────────────────────────────┐
│                    🚀 Upgrade to Pro                         │
│                                                              │
│  ✅ Unlimited regenerations                                  │
│  ✅ Custom subdomain (you.folioai.in)                       │
│  ✅ Remove FolioAI branding                                  │
│  ✅ Full analytics dashboard                                 │
│                                                              │
│  ₹199/month  or  ₹1,499/year (save 37%)                     │
│                                                              │
│  [Pay with UPI]  [Pay with Card]                            │
└─────────────────────────────────────────────────────────────┘
```

### 4. Limit Reached Modal
```
┌─────────────────────────────────────────────────────────────┐
│                    ⏰ Daily Limit Reached                    │
│                                                              │
│  You've used all 2 regenerations for today.                 │
│  Resets in 14 hours 23 minutes                              │
│                                                              │
│  [Upgrade for unlimited →]  or  [Wait until tomorrow]       │
└─────────────────────────────────────────────────────────────┘
```

---

## Revenue Projections

### Assumptions (Conservative)
- 1,000 users in 3 months
- 5% convert to Starter (50 users)
- 2% convert to Pro (20 users)  
- 1% buy Lifetime (10 users)

### Monthly Revenue
| Plan | Users | MRR |
|------|-------|-----|
| Starter | 50 | ₹4,950 |
| Pro | 20 | ₹3,980 |
| Lifetime | 10 | ₹49,990 (one-time) |
| **Total Month 1** | | **₹58,920** |

### AI Costs (Month 1)
- Free users: 1,000 × 3 gen = 3,000 × ₹7 = ₹21,000
- Starter: 50 × 5 gen = 250 × ₹7 = ₹1,750
- Pro: 20 × 15 gen = 300 × ₹7 = ₹2,100
- Lifetime: 10 × 10 gen = 100 × ₹7 = ₹700
- **Total AI cost:** ₹25,550

### Net Profit Month 1
₹58,920 - ₹25,550 = **₹33,370**

### Lifetime Plan Sustainability
- Price: ₹4,999
- AI cost/year: 10 × 12 × ₹7 = ₹840
- Break-even: ~6 years
- After break-even: Pure profit

---

## Implementation Priority

### Phase 1 (MVP) ✅
1. [x] Basic generation limits (in-memory)
2. [ ] Usage banner component
3. [ ] Limit reached modal

### Phase 2 (Monetization)
1. [ ] Database schema for subscriptions
2. [ ] Razorpay integration
3. [ ] Pricing page
4. [ ] Plan upgrade flow

### Phase 3 (Domains)
1. [ ] Subdomain system (username.folioai.in)
2. [ ] Custom domain verification
3. [ ] SSL provisioning (Let's Encrypt)

### Phase 4 (Analytics)
1. [ ] Event tracking
2. [ ] Analytics dashboard
3. [ ] Recruiter alerts

---

## Student Discounts

### Verification Methods
1. `.edu.in` email verification
2. Student ID upload
3. GitHub Student Pack verification

### Student Pricing
- Starter: ₹49/month (50% off)
- Pro: ₹99/month (50% off)
- Lifetime: ₹1,999

---

## Referral Program (Future)

- Refer a friend → Get 1 month free
- Friend gets 50% off first month
- Lifetime users get ₹500 per referral
