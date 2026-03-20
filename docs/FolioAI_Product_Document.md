# FolioAI

**Product Requirements Document & MVP Build Plan**

| Version | Date |
|---|---|
| 1.0 — MVP | March 2026 |

> *Built for Indian Engineering Students · Placement Season 2026*

---

## 1. Product Overview

### What is FolioAI?

FolioAI is an AI-powered portfolio website builder designed specifically for Indian engineering students during placement season. Students chat with an AI assistant, describe their projects, skills, and experience, and the AI generates a professional portfolio website in under 60 seconds — which can then be deployed live with a single click and linked directly from their resume.

### The Problem

- Less than 3% of engineering students in India have a portfolio website
- Recruiters increasingly look beyond resumes — a portfolio link stands out
- Existing tools (Wix, Webflow, Framer) are built for US/EU markets — no INR pricing, no placement-season templates, no Indian-context UX
- Students waste hours figuring out design tools instead of focusing on interviews

### The Solution

- **AI chat interface** — student describes themselves, AI builds the portfolio
- **One-click deploy** — portfolio goes live on a shareable URL instantly
- **Placement-ready templates** — designed for TCS, Infosys, startups, and product companies
- **Dashboard** — manage, edit, and redeploy multiple portfolios

### Target Users

| Segment | Description |
|---|---|
| **Primary** | Final year B.Tech / B.E. students across Indian engineering colleges during placement season (Oct–Jan, Apr–Jun) |
| **Secondary** | Recent graduates, diploma students, and students applying for internships |
| **Geography** | India-first — tier 1, tier 2, and tier 3 engineering colleges |

### Success Metrics — MVP

- 50 waitlist signups before building starts (current goal)
- 10 active users in the first 2 weeks post-launch
- At least 3 users willing to pay ₹99–₹299/month
- Average portfolio generation time under 90 seconds

---

## 2. High Level Design

### System Architecture

FolioAI is built as a full-stack Next.js application with server-side API routes handling all AI, database, and deployment logic. The frontend and backend live in a single codebase deployed on Vercel, keeping operational complexity minimal for a solo developer MVP.

### Architecture Diagram

```
USER BROWSER
     │
     │ HTTPS
     ▼
NEXT.JS APP (Vercel)
├── /app      → React pages (Auth, Dashboard, Chat, Portfolio Preview)
└── /api      → Server routes (auth, ai-chat, deploy, portfolios)
     │
     ├──────────────────────┬──────────────────────┐
     ▼                      ▼                      ▼
NextAuth               Azure OpenAI            Vercel API
Google OAuth           GPT-4o                  Deploy portfolio HTML
     │
     ▼
Supabase (Postgres)
users | portfolios | sessions
```

### Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Frontend** | Next.js 14 + Tailwind CSS | App Router, React Server Components |
| **Backend** | Next.js API Routes | No separate server needed |
| **Authentication** | NextAuth.js | Google OAuth — zero friction login |
| **AI Engine** | Azure OpenAI GPT-4o | $150 credit — ~2,000 generations free |
| **Database** | Supabase (Postgres) | Free tier — users + portfolios |
| **File Storage** | Supabase Storage | Store generated HTML files |
| **Portfolio Deploy** | Vercel API | Programmatic deploy per user |
| **App Hosting** | Vercel Free Plan | Hobby plan covers MVP volume |

### Database Schema

#### `users` table

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key (from NextAuth / Supabase Auth) |
| `email` | VARCHAR | User email from Google |
| `name` | VARCHAR | Display name |
| `created_at` | TIMESTAMP | Account creation date |

#### `portfolios` table

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key → users.id |
| `title` | VARCHAR | Portfolio name set by user |
| `html_content` | TEXT | AI-generated portfolio HTML |
| `live_url` | VARCHAR | Vercel deployed URL (nullable) |
| `status` | ENUM | `draft` \| `deployed` \| `archived` |
| `chat_history` | JSONB | Full conversation stored for re-editing |
| `created_at` | TIMESTAMP | — |
| `updated_at` | TIMESTAMP | — |

### Monthly Cost Breakdown

| Service | Cost | Source |
|---|---|---|
| Next.js App Hosting (Vercel) | Free | Hobby plan |
| Azure OpenAI GPT-4o | Free | $150 Azure credit |
| Supabase Database + Storage | Free | Free tier (500MB DB, 1GB storage) |
| NextAuth.js (Google OAuth) | Free | Open source |
| Vercel API (portfolio deploy) | Free | Hobby plan |
| Domain (optional) | ₹800/year | GoDaddy / Namecheap |
| **Total Monthly** | **₹0 / month** | Until Azure credit runs out |

---

## 3. Build Phases

### Phase 0 — Foundation: Auth + Dashboard
**Day 1–2** · *Users can sign in with Google and see their portfolios*

#### Goal

Set up the entire project skeleton — Next.js app, Supabase database, Google authentication, and a basic dashboard where logged-in users can see their portfolios (empty for now). This is the foundation everything else sits on.

#### Features

- Next.js 14 project with Tailwind CSS configured
- Google login via NextAuth.js — one-click sign in
- Supabase Postgres database set up with `users` and `portfolios` tables
- Protected routes — only logged-in users can access the dashboard
- Dashboard page showing a list of user's portfolios (empty state UI)
- Navigation bar with user avatar, name, and sign out

#### Pages & Routes

| Route | Description |
|---|---|
| `/` | Landing page with login button |
| `/api/auth/[...nextauth]` | NextAuth handler — Google OAuth |
| `/dashboard` | Protected — shows user's portfolio list |
| `/api/portfolios` | GET — fetch user's portfolios from Supabase |

#### Completion Criteria

- User can click 'Sign in with Google', authenticate, and land on `/dashboard`
- Supabase shows the user record created in the `users` table
- Dashboard displays empty state: 'No portfolios yet — create your first one'
- Unauthenticated users are redirected to home if they try to access `/dashboard`

---

### Phase 1 — AI Chat: Generate Portfolio
**Day 3–5** · *Chat with AI and watch your portfolio build in real time*

#### Goal

The core product experience. A user opens the chat, describes themselves — their college, branch, projects, skills, and internships — and the AI generates a complete, styled portfolio website as HTML. The user sees a live preview as the AI responds.

#### Features

- Full-screen chat UI — clean, WhatsApp-style message bubbles
- AI asks guided questions: name, college, branch, projects, skills, internships
- Streaming responses — portfolio HTML streams in real time (like ChatGPT)
- Live preview pane — portfolio renders on the right side as AI generates it
- AI generates complete, styled HTML in one of 3 templates: minimal dark, professional light, colorful
- Save to Supabase — portfolio saved automatically when generation is complete
- Portfolio title auto-generated from the student's name

#### AI Prompt Design

The system prompt instructs Azure OpenAI GPT-4o to act as a portfolio builder. It collects information through conversation, then generates a single self-contained HTML file with embedded CSS and no external dependencies — so it can be deployed anywhere without a build step.

#### Pages & Routes

| Route | Description |
|---|---|
| `/chat/new` | New portfolio chat session |
| `/chat/[id]` | Continue editing an existing portfolio via chat |
| `/api/chat` | POST — streams Azure OpenAI response to client |
| `/api/portfolios` | POST — save generated portfolio to Supabase |

#### Completion Criteria

- User can start a new chat and describe themselves
- AI generates a complete portfolio HTML in under 90 seconds
- Portfolio preview renders correctly in the preview pane
- Portfolio is saved to Supabase and appears in the dashboard
- Streaming works — text appears token by token, not all at once

---

### Phase 2 — One-Click Deploy
**Day 6–7** · *Portfolio goes live on a shareable URL instantly*

#### Goal

After generating a portfolio, the user clicks one button and it goes live on a public URL they can share — add to their resume, send to recruiters, post on LinkedIn. Deployment uses the Vercel API to programmatically create a new Vercel project per user portfolio.

#### Features

- 'Deploy Live' button on portfolio preview page
- Vercel API called server-side — creates a new deployment from the HTML file
- User gets a live URL: `username-portfolioname.vercel.app`
- URL saved to Supabase `portfolios` table (`live_url` field)
- Portfolio status updated to `deployed` in the dashboard
- One-click copy URL button — ready to paste into resume
- Re-deploy button — if user edits via chat, they can redeploy with one click

#### Pages & Routes

| Route | Description |
|---|---|
| `/portfolio/[id]` | Portfolio detail page with preview + deploy button |
| `/api/deploy` | POST — calls Vercel API, returns live URL |
| `/api/portfolios/[id]` | PATCH — update `live_url` and `status` in Supabase |

#### Completion Criteria

- User clicks 'Deploy Live' and portfolio is accessible on a public URL within 30 seconds
- Live URL is stored in Supabase and shown in the dashboard
- Deployed portfolio loads correctly on mobile and desktop
- User can copy the URL with one click
- Re-deploying after edits updates the live site correctly

---

### Phase 3 — Portfolio Manager
**Day 8–10** · *Edit, delete, and manage multiple portfolios from a dashboard*

#### Goal

Give users full control over their portfolios after generation. They should be able to create multiple portfolios (for different job types), edit any portfolio by continuing the chat, delete old ones, and see the status of each at a glance.

#### Features

- Dashboard shows all portfolios as cards — title, status badge, live URL, last edited
- 'Edit' button on each portfolio — opens chat with previous conversation loaded
- 'Delete' button — soft delete with confirmation dialog
- 'Copy URL' button — one click to copy live URL
- 'View Live' button — opens deployed portfolio in a new tab
- 'Create New' button — starts a fresh chat session
- Portfolio status badges — `Draft` / `Deployed` / `Archived`
- Empty state UI — friendly message when no portfolios exist yet

#### Pages & Routes

| Route | Description |
|---|---|
| `/dashboard` | Updated — portfolio cards with all actions |
| `/api/portfolios/[id]` | DELETE — soft delete portfolio |
| `/api/portfolios/[id]` | GET — fetch single portfolio with chat history |

#### Completion Criteria

- User can see all portfolios on the dashboard with correct status
- Clicking 'Edit' on a deployed portfolio opens the chat with history loaded
- Deleting a portfolio removes it from the dashboard and updates Supabase
- User can create multiple portfolios independently
- All portfolio URLs are accessible and correct

---

## 4. Post-MVP Roadmap

### Phase 4 — Resume Import *(Week 3)*

- User uploads a PDF resume — AI extracts name, skills, projects, experience
- Portfolio pre-filled from resume — user only needs to confirm and adjust
- LinkedIn URL import as an alternative to resume upload

### Phase 5 — Template Selection *(Week 4)*

- 8+ placement-ready templates — minimal dark, professional light, colorful, corporate
- User can switch templates without losing their data
- Template preview before applying

### Phase 6 — Monetisation *(Week 5–6)*

- **Free plan:** 1 portfolio, `folio.ai` subdomain, 3 templates
- **Pro plan ₹299/month:** unlimited portfolios, custom domain, all templates, analytics
- Payment via Razorpay — INR native, UPI supported
- Early access pricing for first 500 users

### Phase 7 — Analytics & Custom Domain *(Week 7–8)*

- Portfolio view count — how many recruiters opened your portfolio
- Custom domain — student can connect their own domain (e.g. `arjun.dev`)
- GitHub stats widget — auto-fetch commit count, top languages

---

## 5. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Azure credit runs out | **High** | Cap tokens per generation; add OpenAI fallback |
| Vercel API limits on free plan | **Medium** | Batch deploys; upgrade to Pro at 100 users |
| Low signup conversion | **High** | Pivot messaging; add resume import earlier |
| AI generates bad HTML | **Medium** | Validate HTML before saving; fallback templates |
| Competitors add India pricing | **Low** | Move fast; build community loyalty early |

---

## 6. Summary

FolioAI is being built lean and fast. The goal of the first 10 days is a working product with 4 core features: Google login, AI chat portfolio generation, one-click deploy, and a portfolio dashboard. The entire MVP runs at ₹0/month using Azure credit, Supabase free tier, and Vercel hobby plan.

Validation target: 50 waitlist signups before Phase 0 begins. Once 50 sign up, build starts immediately. The first paying users are expected by Phase 6 (Week 5–6) when Razorpay billing is live.

> **Current Status:** Exploration phase. Landing page live at [folioai-fawn.vercel.app](https://folioai-fawn.vercel.app). Collecting first 50 waitlist signups. Build starts when validation target is hit.
