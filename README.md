# FolioAI MVP1 Scaffold

This repository contains a runnable Next.js scaffold for MVP1 of FolioAI.

Current scope:

- landing page shell
- dashboard shell
- placeholder auth route
- placeholder portfolio API route
- clear boundaries for later auth, Supabase, AI chat, and deployment work

## Design Goals

- Keep the app as a single Next.js codebase for low operational overhead
- Separate UI, feature logic, and infrastructure concerns early
- Avoid over-engineering: only two core business areas exist in MVP1, `auth` and `portfolios`
- Prevent secrets from ever being committed by default

## Start Here

- Product context: [docs/FolioAI_Product_Document.md](docs/FolioAI_Product_Document.md)
- High-level design: [docs/architecture/mvp1-hld.md](docs/architecture/mvp1-hld.md)
- Low-level design: [docs/architecture/mvp1-lld.md](docs/architecture/mvp1-lld.md)
- Intern onboarding: [docs/intern-onboarding.md](docs/intern-onboarding.md)
- Contribution rules: [CONTRIBUTING.md](CONTRIBUTING.md)

## Proposed Tree

```text
.
├── Demo/
├── docs/
│   ├── FolioAI_Product_Document.md
│   └── architecture/
│       ├── mvp1-hld.md
│       └── mvp1-lld.md
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   └── dashboard/
│   │   ├── (public)/
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       └── portfolios/
│   ├── components/
│   │   ├── layout/
│   │   └── ui/
│   ├── config/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   └── server/
│   │   └── portfolios/
│   │       ├── components/
│   │       └── server/
│   ├── lib/
│   │   ├── auth/
│   │   ├── env/
│   │   ├── supabase/
│   │   └── utils/
│   ├── server/
│   │   ├── repositories/
│   │   ├── services/
│   │   └── validators/
│   └── types/
├── supabase/
│   └── migrations/
├── tests/
│   ├── integration/
│   └── unit/
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
└── vercel.json
```

## Responsibility Split

- `src/app`: routes, layouts, route handlers, and page composition only
- `src/components`: shared presentational UI not tied to a single feature
- `src/features/auth`: auth-specific UI and server-side auth orchestration
- `src/features/portfolios`: portfolio-specific UI and server-side use cases
- `src/lib`: framework/infrastructure adapters such as env parsing, Supabase clients, auth helpers
- `src/server`: generic server-only primitives reused by multiple features
- `supabase/migrations`: schema evolution kept outside app code
- `tests`: unit and integration coverage kept separate from production files

## Secret Safety

- Real secrets go only in local `.env.local` or deployed platform environment variables
- `.env.example` documents required variables without storing credentials
- `.gitignore` blocks all runtime `.env` variants from Git
- local email/password test accounts are stored in `.data/auth-users.json`, which is also ignored by Git

## Release Flag

- `ENABLE_NEW_APP=false` keeps the live site on the static demo file served at `/index.html`
- `ENABLE_NEW_APP=true` exposes the new Next.js app shell
- local development should use `.env.local` with `ENABLE_NEW_APP=true`
- when enabled, the scaffold entry route is `/mvp1-preview`
- the public demo entry file is `Demo/index.html`
- `public/index.html` is the served copy used by Next.js for the default-off experience
- `Demo/folioai-landing.html` remains intact as the current demo source snapshot

## Vercel Deploy

- A deploy from `main` will show the demo by default because `ENABLE_NEW_APP` falls back to `false` when unset.
- For now, keep `ENABLE_NEW_APP=false` in Vercel Production so the demo is always served there.
- Use `.env.local` with `ENABLE_NEW_APP=true` for local development and testing.
- Only set `ENABLE_NEW_APP=true` when you are ready to expose the new Next.js app.

## Local Commands

- `npm install`
- `npm run dev`
- `npm run typecheck`
- `npm run build`

## Dependency Rules

- Pages and API routes may depend on `features`, `lib`, `server`, and `types`
- `features` may depend on `lib`, `server`, `config`, and `types`
- `lib` must not depend on route handlers or feature UI
- `server/repositories` should only talk to external persistence layers
- `server/services` should contain reusable business workflows, not transport logic

## What Is Still Intentionally Not Implemented

- real NextAuth configuration
- real Supabase client wiring
- database schema SQL
- route protection
- portfolio data fetching
- AI chat and deployment workflows

Those can be added next without changing the folder contract.

## Working Agreement

- Keep route files thin.
- Add business logic to `features/` or `server/`, not directly in `app/`.
- Do not commit secrets, tokens, keys, or copied `.env.local` files.
- When adding a file, choose the folder based on responsibility, not convenience.
- If a change adds new architecture or rules, update the docs in the same PR.

This README should remain the shortest entry point to the repo. Put deeper process and onboarding detail in the linked docs.

