# FolioAI Feature Checklist

Use this checklist when making UI changes to ensure no features are removed or broken.

---

## Core Pages & Navigation

### Landing Page (`/`)
- [ ] Logo + brand name
- [ ] Sign in / Sign up buttons (unauthenticated)
- [ ] User avatar + name (authenticated)
- [ ] "Go to Dashboard" button (authenticated)
- [ ] Portfolio count display (authenticated)
- [ ] Sign out option (authenticated)
- [ ] Hero section with value proposition
- [ ] Feature highlights

### Dashboard Layout (header across all dashboard pages)
- [ ] Logo links to home (`/`)
- [ ] **Portfolios** nav link → `/dashboard`
- [ ] **Templates** nav link → `/templates`
- [ ] User email display
- [ ] Sign out button

### Dashboard Page (`/dashboard`)
- [ ] Welcome message with user's first name
- [ ] "New Portfolio" button → `/chat/new`
- [ ] Portfolio cards grid showing:
  - [ ] Portfolio title initial/icon
  - [ ] Title
  - [ ] Status badge (Draft/Live)
  - [ ] Last updated date
  - [ ] Live URL (if deployed)
  - [ ] "Edit" button → `/chat/[id]`
  - [ ] "View" button → `/portfolio/[id]`
- [ ] Empty state with "Get Started" when no portfolios
- [ ] "Create with AI" card

### Portfolio Detail (`/portfolio/[id]`)
- [ ] Back to dashboard button
- [ ] Portfolio title
- [ ] Status badge
- [ ] Live URL link (if deployed)
- [ ] "Edit" button → chat
- [ ] "Copy URL" button
- [ ] "Deploy/Redeploy" button
- [ ] **Preview with responsive toggle: Desktop / Tablet / Mobile**
- [ ] Error state handling

### Chat/Edit Page (`/chat/[id]` and `/chat/new`)
- [ ] Back to dashboard
- [ ] Portfolio title + edit capability
- [ ] AI chat interface
- [ ] Message input
- [ ] Send button
- [ ] Loading states with pulse animation
- [ ] Preview panel (when HTML exists)
- [ ] Existing context passed to AI for edits

### Templates Page (`/templates`)
- [ ] Back to dashboard link
- [ ] User email display
- [ ] "Pick Your Perfect Template" header
- [ ] Free templates section with badge
- [ ] Premium templates section with badge
- [ ] Template cards with:
  - [ ] Thumbnail
  - [ ] Name
  - [ ] Description
  - [ ] Category badge
  - [ ] Price (for premium)
  - [ ] Preview & Use buttons
- [ ] Empty state with "Seed Sample Templates" button

### Template Preview (`/templates/[slug]/preview`)
- [ ] Back to templates
- [ ] Template name
- [ ] "Use This Template" button
- [ ] Full-page preview iframe

### Template Create (`/templates/[slug]/create`)
- [ ] Form to fill template placeholders
- [ ] Preview
- [ ] Create portfolio button

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

---

## Auth Flow
- [ ] Google OAuth sign in
- [ ] Session includes: `id`, `name`, `email`, `image`
- [ ] User synced to database on first login
- [ ] Redirect to `/dashboard` after login
- [ ] Redirect to `/` if not authenticated on protected pages

---

## API Endpoints

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth handlers |
| `/api/portfolios` | GET, POST | List/create portfolios |
| `/api/portfolios/[id]` | GET, PATCH, DELETE | Single portfolio CRUD |
| `/api/portfolios/check-slug` | GET | Check slug availability |
| `/api/chat` | POST | AI chat for portfolio generation |
| `/api/deploy` | POST | Deploy portfolio to live URL |
| `/api/templates` | GET | List all templates |
| `/api/templates/[slug]` | GET | Single template |
| `/api/templates/seed` | POST | Seed sample templates |

---

## Database Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | User accounts | id (TEXT), email, name, image |
| `portfolios` | User portfolios | id, user_id, title, html_content, status, live_url |
| `templates` | Pre-designed templates | id, name, slug, html_template, is_free, price_inr |

---

## Design System (Tailwind)

### Colors
- Background: `neutral-50`
- Surface: `white`
- Borders: `neutral-200`
- Text primary: `neutral-900`
- Text secondary: `neutral-600`
- Text muted: `neutral-500`
- Accent: `neutral-900` (buttons)
- Success: `green-500/600`
- Error: `red-500/600`

### Spacing
- Page padding: `px-6 py-8`
- Card padding: `p-5`
- Component gaps: `gap-2`, `gap-4`

### Border Radius
- Cards: `rounded-xl`
- Buttons: `rounded-lg`
- Inputs: `rounded-lg`
- Avatars: `rounded-full`

---

**Last updated:** March 25, 2026
