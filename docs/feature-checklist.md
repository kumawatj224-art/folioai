# FolioAI Feature Checklist

Use this checklist when making UI changes to ensure no features are removed or broken.

**Last Updated:** April 6, 2026

---

## Core Pages & Navigation

### Landing Page (`/`)
- [x] Logo + brand name
- [x] Sign in / Sign up buttons (unauthenticated)
- [x] User avatar + name (authenticated)
- [x] "Go to Dashboard" button (authenticated)
- [x] Portfolio count display (authenticated)
- [x] Sign out option (authenticated)
- [x] Hero section with value proposition
- [x] Feature highlights

### Dashboard Layout (header across all dashboard pages)
- [x] Logo links to home (`/`)
- [x] **Portfolios** nav link -> `/dashboard`
- [x] **Templates** nav link -> `/templates`
- [x] User email display
- [x] Sign out button
- [x] Usage banner showing generations/deployments left

### Dashboard Page (`/dashboard`)
- [x] Welcome message with user's first name
- [x] "New Portfolio" button -> `/chat/new`
- [x] Portfolio cards grid showing:
  - [x] Portfolio title initial/icon
  - [x] Title
  - [x] Status badge (Draft/Live)
  - [x] Last updated date
  - [x] Live URL (if deployed)
  - [x] "Edit" button -> `/chat/[id]`
  - [x] "View" button -> `/portfolio/[id]`
  - [x] "Visit" button -> opens live subdomain URL
- [x] Empty state with "Get Started" when no portfolios
- [x] "Create with AI" card

### Portfolio Detail (`/portfolio/[id]`)
- [x] Back to dashboard button
- [x] Portfolio title
- [x] Status badge
- [x] Live URL link (if deployed)
- [x] "Edit" button -> chat
- [x] "Copy URL" button
- [x] "Visit Site" button -> opens live subdomain
- [x] "Deploy/Redeploy" button
- [x] **Preview with responsive toggle: Desktop / Tablet / Mobile**
- [x] Error state handling

### Chat/Edit Page (`/chat/[id]` and `/chat/new`)
- [x] Back to dashboard
- [x] Portfolio title + edit capability
- [x] AI chat interface with streaming responses
- [x] Message input (textarea)
- [x] Send button
- [x] Loading states with pulse animation
- [x] Preview panel (when HTML exists)
- [x] Existing context passed to AI for edits
- [x] Template selector dropdown (11 templates)
- [x] Resume upload button (PDF parsing)
- [x] Generate button
- [x] Regenerate button (edit mode)
- [x] Save Draft button
- [x] Deploy button with subdomain prompt
- [x] Live URL display after deploy
- [x] Code view toggle
- [x] Download HTML button
- [x] Copy HTML button
- [x] Expand/collapse preview

### Templates Page (`/templates`)
- [x] Back to dashboard link
- [x] User email display
- [x] "Pick Your Perfect Template" header
- [x] Free templates section with badge
- [x] Premium templates section with badge
- [x] Template cards with:
  - [x] Thumbnail
  - [x] Name
  - [x] Description
  - [x] Category badge
  - [x] Price (for premium)
  - [x] Preview & Use buttons
- [x] Empty state with "Seed Sample Templates" button

### Template Preview (`/templates/[slug]/preview`)
- [x] Back to templates
- [x] Template name
- [x] "Use This Template" button
- [x] Full-page preview iframe

### Public Portfolio Page (`/[slug]` and subdomain)
- [x] Raw HTML portfolio serving
- [x] Subdomain routing (`*.getfolioai.in`)
- [x] 404 page for non-existent portfolios
- [x] SEO-friendly URLs

---

## UI Components

### Button (`components/ui/button.tsx`)
| Variant | Use Case |
|---------|----------|
| `primary` | Main actions (default) |
| `secondary` | Secondary actions |
| `ghost` | Subtle actions |
| `danger` | Destructive actions |

Sizes: `sm`, `md`, `lg`

### Badge (`components/ui/badge.tsx`)
| Variant | Use Case |
|---------|----------|
| `default` | Neutral/draft status |
| `success` | Live/deployed status |
| `warning` | Pending states |
| `error` | Error states |

### Card (`components/ui/card.tsx`)
- Rounded-xl corners
- Neutral-200 border
- Shadow on hover

### Form Input (`components/ui/form-input.tsx`)
- Label
- Input with neutral-50 background
- Error message display

### Empty State (`components/ui/empty-state.tsx`)
- Icon slot
- Title
- Description
- Action button slot

### Live URL Link (`components/ui/live-url-link.tsx`)
- Environment-aware (localhost vs production)
- Green pulsing indicator
- Opens in new tab

### Visit Button (`components/ui/visit-button.tsx`)
- Environment-aware URL routing
- Orange primary style
- Opens in new tab

### Usage Banner (`components/usage/usage-banner.tsx`)
- Shows generations remaining
- Shows deployments remaining
- Reset timer display
- Upgrade CTA for free users

---

## Auth Flow
- [x] Google OAuth sign in
- [x] Email OTP authentication
- [x] Session includes: `id`, `name`, `email`, `image`
- [x] User synced to database on first login
- [x] Redirect to `/dashboard` after login
- [x] Redirect to `/` if not authenticated on protected pages

---

## API Endpoints

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth handlers |
| `/api/auth/email/send-code` | POST | Send OTP code |
| `/api/auth/email/verify` | POST | Verify OTP code |
| `/api/portfolios` | GET, POST | List/create portfolios |
| `/api/portfolios/[id]` | GET, PATCH, DELETE | Single portfolio CRUD |
| `/api/chat` | POST | AI chat for portfolio generation |
| `/api/deploy` | POST | Deploy portfolio to live URL |
| `/api/resume` | POST | Parse resume PDF |
| `/api/p/[slug]` | GET | Serve raw portfolio HTML |
| `/api/templates` | GET | List all templates |
| `/api/templates/[slug]` | GET | Single template |
| `/api/templates/seed` | POST | Seed sample templates |
| `/api/subscription` | GET | Get user subscription status |

---

## Database Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | User accounts | id (TEXT), email, name, image |
| `portfolios` | User portfolios | id, user_id, title, html_content, status, live_url, slug |
| `templates` | Pre-designed templates | id, name, slug, html_template, is_free, price_inr |
| `subscriptions` | User subscription data | id, user_id, plan, generations_used, deployments_used |

---

## Portfolio Templates (11 Total)

### Creative Templates
- [x] **Game HUD** - Video game UI, XP bars, achievements
- [x] **iOS App** - iPhone home screen, app icons
- [x] **Space Galaxy** - Planets, constellations, orbit animations
- [x] **Retro VHS** - 80s neon, scanlines, glitch effects
- [x] **Spotify Player** - Music player interface, playlists
- [x] **Dashboard Analytics** - Charts, metrics, data viz
- [x] **Newspaper** - Headlines, columns, editorial layout
- [x] **Bento Grid** - Modern card-based layout

### Classic Templates
- [x] **Terminal Dark** - Hacker aesthetic, green on black
- [x] **Gradient Dark** - Purple/blue gradients, glassmorphism
- [x] **Brutalist** - Bold black/white/orange, raw typography

---

## Deployment Features

### Subdomain Hosting
- [x] Custom subdomain support (`username.getfolioai.in`)
- [x] User-provided subdomain name on deploy
- [x] Middleware for subdomain detection
- [x] API route for serving portfolio HTML
- [x] Environment-aware URLs (localhost vs production)

### Deployment Flow
1. User clicks Deploy button
2. Prompt asks for subdomain name
3. Portfolio saved with status `deployed`
4. Live URL generated: `https://{subdomain}.getfolioai.in`
5. Visit button becomes available

---

## Design System (Tailwind)

### Colors
- Background: `#0a0a0a` (dark theme)
- Surface: `#111111`
- Borders: `white/[0.08]`
- Text primary: `#f0ece4`
- Text secondary: `#a0a0a0`
- Text muted: `#606060`
- Accent: `#ff6b35` (orange)
- Success: `green-400/500`
- Error: `red-500/600`

### Spacing
- Page padding: `px-6 py-8`
- Card padding: `p-5` or `p-6`
- Component gaps: `gap-2`, `gap-4`

### Border Radius
- Cards: `rounded-2xl`
- Buttons: `rounded-lg`
- Inputs: `rounded-lg`
- Avatars: `rounded-full`

---

## Feature Status Summary

| Phase | Feature | Status |
|-------|---------|--------|
| Phase 0 | Auth + Dashboard |  Complete |
| Phase 1 | AI Chat Generation |  Complete |
| Phase 2 | One-Click Deploy |  Complete |
| Phase 3 | Portfolio Manager |  Complete |
| Phase 4 | Resume Import |  Complete |
| Phase 5 | Template Selection |  Complete |
| Phase 6 | Subscriptions |  In Progress |
| Phase 7 | Analytics |  Not Started |

---

**Last updated:** April 6, 2026
