# MVP1 High Level Design

## Scope

MVP1 covers the Phase 0 foundation from the product document:
- landing page
- Google sign-in
- protected dashboard
- fetch current user's portfolios

## System Boundary

```text
Browser
  -> Next.js App Router
     -> Auth route handler
     -> Portfolio API route
     -> Feature services
     -> Repositories
        -> Supabase
```

## Core Modules

### Public Web
- landing page
- sign-in CTA
- session-aware redirect logic

### Auth Module
- NextAuth configuration
- Google provider setup
- session retrieval helper
- user bootstrap on first login

### Portfolio Module
- dashboard page model
- list portfolios use case
- portfolio repository for reads

### Shared Infrastructure
- environment validation
- Supabase server/client factories
- shared error and response helpers

## Scaling Principle

The structure stays single-app for speed, but separates concerns so later phases can add chat streaming and deployment without rewriting the auth/dashboard foundation.

## Why This Is Not Over-Engineered

- only two feature modules exist now
- no microservices
- no CQRS split
- no extra packages or internal SDK layers until there is a real need

---

## Current Architecture (Updated)

### Extended System Boundary

```text
Browser (*.getfolioai.in)
  -> Vercel Edge (middleware.ts)
     -> Subdomain detection
        -> /api/p/[slug] for portfolio serving
        -> Next.js App Router for main app
  
Main App Flow:
  -> Next.js App Router
     -> Auth (NextAuth + Google OAuth)
     -> AI Chat (/api/chat)
        -> Azure OpenAI GPT-4
     -> Portfolio CRUD (/api/portfolios)
     -> Deploy (/api/deploy)
     -> Templates (/api/templates)
     -> Repositories
        -> Supabase PostgreSQL
```

### Added Modules

#### AI Chat Module
- Real-time streaming chat interface
- Context-aware conversation (portfolio, skills, projects)
- Resume upload and parsing
- Portfolio generation from chat context

#### Template Module
- 11 creative portfolio templates
- Template preview and selection
- Custom styling per template

#### Deployment Module
- One-click deploy to subdomain
- Custom subdomain naming
- HTML storage in database
- Middleware-based subdomain routing

#### Resume Module
- PDF upload and parsing
- AI-powered data extraction
- Auto-populate portfolio fields

### Subdomain Hosting Architecture

```text
User deploys portfolio
  -> API generates slug from title
  -> Stores live_url: https://{slug}.getfolioai.in
  -> Stores rendered HTML in generated_html column

Visitor accesses {slug}.getfolioai.in
  -> Vercel DNS resolves to app
  -> middleware.ts extracts subdomain
  -> Rewrites to /api/p/{slug}
  -> API returns stored HTML
```

### Database Schema (Portfolios)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to users |
| title | text | Portfolio title |
| status | enum | draft, generated, deployed |
| live_url | text | Deployed URL (e.g., https://john.getfolioai.in) |
| generated_html | text | Complete rendered HTML |
| template_id | text | Selected template identifier |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update |

### Environment-Aware Components

The app includes environment-aware UI components that handle localhost vs production:
- `LiveUrlLink` - Displays clickable live URL with local routing
- `VisitButton` - Visit button that works on localhost and production

### DNS Configuration

- Domain: `getfolioai.in`
- Wildcard: `*.getfolioai.in`
- Nameservers: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`
