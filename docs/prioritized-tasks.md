# FolioAI - Prioritized Tasks

**Last Updated:** April 6, 2026

This document outlines pending tasks in priority order based on business impact, user value, and technical dependencies.

---

## Priority Legend

| Priority | Description | Timeline |
|----------|-------------|----------|
| 🔴 P0 | Critical blockers, must fix immediately | This week |
| 🟠 P1 | High priority, core monetization | 1-2 weeks |
| 🟡 P2 | Medium priority, feature enhancements | 2-4 weeks |
| 🟢 P3 | Nice to have, future improvements | Backlog |

---

## 🔴 P0 - Critical / Immediate

### 1. Add `slug` Column to Database
**Status:** Pending user action  
**Effort:** 5 mins  
**Impact:** Fixes slug-based routing properly

```sql
-- Run in Supabase SQL Editor
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON portfolios(slug);
NOTIFY pgrst, 'reload schema';
```

### 2. DNS Propagation Verification
**Status:** Waiting for DNS changes  
**Effort:** N/A (external)  
**Impact:** Subdomain hosting goes live

- Nameservers: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`
- Verify wildcard `*.getfolioai.in` resolves

### 3. Vercel Environment Variables
**Status:** Needs verification  
**Effort:** 5 mins  
**Impact:** Ensures middleware works in production

Required variables:
- `ENABLE_NEW_APP=true`
- `NEXT_PUBLIC_PRODUCTION_DOMAIN=getfolioai.in`

---

## 🟠 P1 - High Priority (Monetization)

### 4. Razorpay Integration
**Status:** Not started  
**Effort:** 3-5 days  
**Impact:** Enables revenue generation

**Tasks:**
- [ ] Install Razorpay SDK (`razorpay` npm package)
- [ ] Create Razorpay account and get API keys
- [ ] Set up Razorpay Plans (Starter: ₹99, Pro: ₹199, Lifetime: ₹4999)
- [ ] Create `/api/subscription/create` endpoint
- [ ] Create `/api/subscription/webhook` for payment events
- [ ] Handle subscription renewals and cancellations
- [ ] Add payment success/failure UI flows

**Dependencies:** Subscription schema (already exists in DB)

### 5. Pricing Page UI
**Status:** Not started  
**Effort:** 1-2 days  
**Impact:** Converts free users to paid

**Tasks:**
- [ ] Create `/pricing` page with plan comparison
- [ ] Add upgrade CTAs in dashboard
- [ ] "Upgrade" button in usage banner
- [ ] Plan selection modal
- [ ] Payment success confirmation page

### 6. Usage Enforcement
**Status:** Partial (limits tracked, not enforced everywhere)  
**Effort:** 1 day  
**Impact:** Prevents abuse, drives upgrades

**Tasks:**
- [ ] Block generation when limit reached (show upgrade modal)
- [ ] Block deployment for free users after 1 deploy
- [ ] Lock premium templates for free users
- [ ] Auto-reset daily/monthly limits (cron job or Supabase function)

### 7. Limit Reset Automation
**Status:** Not started  
**Effort:** 0.5 day  
**Impact:** Accurate usage tracking

**Tasks:**
- [ ] Create Supabase Edge Function for daily/monthly resets
- [ ] Or use Vercel cron (`/api/cron/reset-limits`)
- [ ] Reset `regenerations_used_today` at midnight IST
- [ ] Reset `generations_this_period` on billing cycle

---

## 🟡 P2 - Medium Priority (Feature Enhancements)

### 8. Custom Domain Support (BYOD)
**Status:** Not started  
**Effort:** 3-4 days  
**Impact:** Premium feature for Pro users

**Tasks:**
- [ ] Create `custom_domains` table (schema exists in docs)
- [ ] Domain verification flow (TXT record check)
- [ ] SSL provisioning via Vercel API
- [ ] Update middleware to handle custom domains
- [ ] Domain management UI in dashboard

### 9. Analytics Dashboard
**Status:** Not started  
**Effort:** 4-5 days  
**Impact:** Key differentiator, Pro feature

**Tasks:**
- [ ] Create `portfolio_analytics` table
- [ ] Add tracking script to deployed portfolios
- [ ] Event tracking API (`/api/analytics/track`)
- [ ] Analytics dashboard page (`/analytics/[portfolioId]`)
- [ ] Charts: views over time, referrers, geography, devices

### 10. Portfolio Preview Improvements
**Status:** Partial  
**Effort:** 1 day  
**Impact:** Better UX

**Tasks:**
- [ ] Add tablet/mobile preview toggle (marked done but verify)
- [ ] Save preview preference
- [ ] Add full-screen preview mode

### 11. Email Notifications
**Status:** Not started  
**Effort:** 1-2 days  
**Impact:** User engagement

**Tasks:**
- [ ] Welcome email on signup
- [ ] Deployment success notification
- [ ] Usage limit warning (80% reached)
- [ ] Subscription renewal reminder

### 12. FolioAI Branding Badge
**Status:** Not started  
**Effort:** 0.5 day  
**Impact:** Free advertising, conversion tool

**Tasks:**
- [ ] Add "Made with FolioAI" badge to free portfolios
- [ ] Make badge removal a paid feature
- [ ] Inject badge into generated HTML

---

## 🟢 P3 - Backlog (Future)

### 13. GitHub Stats Widget
**Effort:** 2 days  
Auto-fetch and display GitHub contribution stats

### 14. LinkedIn Import
**Effort:** 3 days  
Parse LinkedIn profile URL and extract data

### 15. Portfolio Analytics - Recruiter Alerts
**Effort:** 2 days  
Notify user when same visitor views 3+ times

### 16. Export to PDF
**Effort:** 1 day  
Generate PDF version of portfolio

### 17. Team/Agency Plan
**Effort:** 1 week  
Mass portfolio creation for colleges/bootcamps

### 18. A/B Testing for Templates
**Effort:** 2 days  
Show different template to different visitors

### 19. Student Discount Verification
**Effort:** 2 days  
`.edu.in` email or student ID verification

### 20. PWA Support
**Effort:** 1 day  
Make portfolios installable on mobile

---

## Technical Debt

### High Priority
- [ ] Add comprehensive error handling in API routes
- [ ] Implement rate limiting for API endpoints
- [ ] Add request validation with Zod
- [ ] Set up logging (Axiom/LogTail integration)

### Medium Priority
- [ ] Add loading skeletons instead of spinners
- [ ] Implement optimistic updates
- [ ] Add Sentry for error tracking
- [ ] Cache template data

### Low Priority
- [ ] Add dark/light mode toggle
- [ ] Internationalization (i18n)
- [ ] Accessibility audit (WCAG 2.1)

---

## Sprint Recommendation

### Week 1 (Monetization Foundation)
**Focus:** Get payment working

| Day | Tasks |
|-----|-------|
| 1 | P0 items (slug column, environment variables, DNS verification) |
| 2-3 | Razorpay integration (basic checkout) |
| 4 | Pricing page UI |
| 5 | Webhook handling, subscription status sync |

### Week 2 (Monetization Complete)
**Focus:** Enforce limits, polish payment flow

| Day | Tasks |
|-----|-------|
| 1 | Usage enforcement (block on limit) |
| 2 | Limit reset automation |
| 3 | Payment success/failure pages |
| 4 | Email notifications (welcome, payment) |
| 5 | Testing + bug fixes |

### Week 3-4 (Premium Features)
**Focus:** Pro-only features

| Day | Tasks |
|-----|-------|
| Week 3 | Custom domain support |
| Week 4 | Analytics dashboard |

---

## Dependencies Map

```
Razorpay Integration
    └── Pricing Page
    └── Usage Enforcement
    └── Limit Reset Automation
    
Custom Domains
    └── SSL Provisioning
    └── Middleware Update
    
Analytics
    └── Tracking Script
    └── Dashboard UI
```

---

## Definition of Done

For each task to be considered complete:
- [ ] Feature implemented and working
- [ ] Unit tests written (where applicable)
- [ ] Manual QA passed
- [ ] Works on mobile
- [ ] No console errors
- [ ] Deployed to production
- [ ] Documentation updated

---

**Next Action:** Start with P0 items, then prioritize Razorpay integration.
