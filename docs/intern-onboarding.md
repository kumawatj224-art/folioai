# Intern Onboarding Guide

This guide is for an intern joining FolioAI and contributing without Copilot. The goal is that you can understand the structure quickly and make safe changes independently.

## What This Repository Is Right Now

This is a runnable Next.js MVP1 scaffold.

It already has:

- a public landing page shell
- a dashboard shell
- a placeholder auth API route
- a placeholder portfolios API route
- a documented folder structure
- a feature flag that keeps the current demo live by default

It does not yet have:

- real authentication
- real database integration
- real portfolio data
- AI generation logic
- deployment logic

## Why The Structure Looks Like This

The project is intentionally split by responsibility so that growth stays manageable.

### `src/app`

This is the transport and composition layer.

Use it for:

- pages
- layouts
- route handlers
- page-level composition

Do not use it for:

- direct database logic everywhere
- large business workflows
- reusable cross-feature helpers

### `src/components`

This contains shared UI that is not owned by one feature.

Use it for:

- cards
- empty states
- layout shells
- buttons if they become shared

### `src/features`

This is where business areas live.

Current features:

- `auth`
- `portfolios`

Each feature can have:

- `components`
- `server`

That means UI and server orchestration can stay close to the feature they belong to.

### `src/lib`

This is for infrastructure-level helpers.

Use it for:

- env parsing
- auth helper setup
- Supabase client factories
- low-level utility helpers

### `src/server`

This is server-only shared logic.

Use it for:

- repositories
- services
- validators

This helps keep route handlers small and readable.

### `src/types`

This is for shared app-wide types and DTOs.

### `supabase/migrations`

This is where schema changes should go once database work starts.

## How A Typical Request Should Flow

For MVP1, a typical backend flow should look like this:

```text
Page or API route
  -> feature-level server logic
     -> shared service or repository
        -> Supabase or external service
```

Why this matters:

- the route stays simple
- business logic is testable
- data access is centralized

## Concrete Example

Suppose you are asked to show portfolio cards on the dashboard.

You should think like this:

1. The dashboard page belongs in `src/app/(dashboard)/dashboard/page.tsx`
2. The card UI belongs in `src/features/portfolios/components`
3. The portfolio listing logic belongs in `src/features/portfolios/server`
4. The actual Supabase query belongs in `src/server/repositories`

That separation is the main rule of the codebase.

## What Not To Do

Avoid these habits:

- putting long fetch or database logic directly in a page file
- creating utility files in random folders
- mixing UI rendering with data-access code
- reading raw `process.env` in many different places
- creating new top-level folders because a file feels out of place

If a file feels out of place, it usually means the ownership is unclear. Resolve ownership first.

## Recommended First Reading Order

1. [README.md](../README.md)
2. [docs/FolioAI_Product_Document.md](FolioAI_Product_Document.md)
3. [docs/architecture/mvp1-hld.md](architecture/mvp1-hld.md)
4. [docs/architecture/mvp1-lld.md](architecture/mvp1-lld.md)
5. [CONTRIBUTING.md](../CONTRIBUTING.md)

## Recommended First Tasks For An Intern

Good first tasks:

- improve copy on the scaffold pages
- add or refine shared UI components
- add typed DTOs in `src/types`
- add env helper structure in `src/lib/env`
- add placeholder interfaces for auth and portfolio services

Not good first tasks:

- refactoring the whole structure
- inventing new architecture layers
- adding Phase 1 chat code before Phase 0 is finished
- changing route ownership without a clear reason

## Local Workflow

1. Run `npm install` once.
2. Run `npm run dev` for local development.
3. Run `npm run typecheck` before finishing work.
4. Run `npm run build` for route or config changes.

## Feature Flag Behavior

- `ENABLE_NEW_APP=false` means visitors see the existing HTML demo
- `ENABLE_NEW_APP=true` means visitors see the new Next.js app routes
- the scaffold preview route is `/mvp1-preview`
- `Demo/index.html` is the public entry file until the flag is flipped
- `public/index.html` is the static file currently served by Next.js while the flag is off
- `Demo/folioai-landing.html` is preserved as the current demo snapshot

## How To Know You Chose The Right Folder

Ask one question:

What is the main reason this code would change?

If the answer is:

- page structure, it belongs in `app`
- feature behavior, it belongs in `features`
- infrastructure setup, it belongs in `lib`
- shared server behavior, it belongs in `server`
- presentational reuse, it belongs in `components`

That is the simplest way to navigate the repo without any AI help.
