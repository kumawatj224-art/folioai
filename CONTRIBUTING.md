# Contributing To FolioAI

This document is written for a developer joining the project without AI assistance. It explains how to work in the repo safely and where code should go.

## First Principle

Do not start by writing code in the nearest page file. Start by deciding which layer owns the change.

## Project Shape

- `src/app`: routes, layouts, and API transport only
- `src/components`: shared presentational UI used by multiple features
- `src/features`: feature-specific code grouped by business area
- `src/lib`: infrastructure helpers and adapters
- `src/server`: server-only reusable logic across features
- `src/types`: shared DTOs and app-wide types
- `supabase/migrations`: schema changes only
- `docs`: product and architecture documentation

## Folder Selection Rules

If you are adding a page or route handler:

- put it in `src/app`

If you are adding a reusable UI primitive:

- put it in `src/components/ui`

If you are adding auth-specific UI or server orchestration:

- put it in `src/features/auth`

If you are adding portfolio-specific UI or server orchestration:

- put it in `src/features/portfolios`

If you are adding a helper for env parsing, auth clients, Supabase clients, or generic utilities:

- put it in `src/lib`

If you are adding persistence access or reusable business workflows:

- put it in `src/server`

## Dependency Rules

- `src/app` can depend on `features`, `lib`, `server`, `config`, and `types`
- `features` can depend on `lib`, `server`, `config`, and `types`
- `lib` should not import from `app`
- `server/repositories` should not contain UI logic
- `components` should stay mostly presentational

## Current MVP1 Boundaries

The only active MVP1 business areas are:

- `auth`
- `portfolios`

Do not create new top-level feature folders unless there is a real product requirement. For example, `chat` should only be added when Phase 1 implementation starts.

## How To Start Any Task

1. Read [docs/FolioAI_Product_Document.md](docs/FolioAI_Product_Document.md).
2. Read [docs/architecture/mvp1-hld.md](docs/architecture/mvp1-hld.md).
3. Read [docs/architecture/mvp1-lld.md](docs/architecture/mvp1-lld.md).
4. Identify the layer that owns the change.
5. Make the smallest change that fits that layer.
6. Run `npm run typecheck`.
7. Run `npm run build` if the change affects routing, config, or shared app structure.

## Example Decisions

If you need to add a dashboard empty-state card:

- component in `src/features/portfolios/components`
- page composition in `src/app/(dashboard)/dashboard/page.tsx`

If you need to add portfolio list fetching:

- route transport in `src/app/api/portfolios/route.ts`
- feature orchestration in `src/features/portfolios/server`
- repository access in `src/server/repositories`

If you need to read environment variables:

- helper in `src/lib/env`
- never read raw `process.env` everywhere in random files

## Secret Safety Rules

- Never commit `.env.local`
- Never paste real secrets into source files
- Keep only placeholders in `.env.example`
- If you need a new variable, add its placeholder to `.env.example`

## Release Safety Rule

- Do not remove or overwrite `Demo/index.html` while `ENABLE_NEW_APP` is `false`
- Keep `public/index.html` in sync with `Demo/index.html` while the flag remains off
- Keep `Demo/folioai-landing.html` intact unless you are intentionally updating the demo snapshot itself
- New app work should remain behind the feature flag until explicitly turned on

## Definition Of A Good Change

- clear ownership
- minimal surface area
- no duplicated logic across layers
- no secrets committed
- docs updated if architecture assumptions changed
- typecheck passes

## Definition Of A Bad Change

- business logic added directly in page files without reason
- SDK calls scattered across multiple components
- helper functions dropped into random folders
- environment variables read ad hoc in many places
- introducing a new abstraction that solves no current problem
