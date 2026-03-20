# MVP1 Low Level Design

## Route-Level Plan

### `src/app/(public)`
- landing page
- waitlist or sign-in entry point

### `src/app/(dashboard)/dashboard`
- protected dashboard page
- calls portfolio listing service through server helpers

### `src/app/api/auth/[...nextauth]`
- auth transport layer only
- contains provider wiring and callback configuration

### `src/app/api/portfolios`
- GET only for MVP1
- reads current session
- invokes portfolio service to return dashboard data

## Internal Flow

### Sign-In Flow
1. User clicks Google sign-in
2. NextAuth handles OAuth exchange
3. Auth feature ensures a matching user exists in Supabase
4. User is redirected to dashboard

### Dashboard Flow
1. Dashboard page checks session
2. Portfolio API resolves current user id
3. Portfolio service asks repository for summaries
4. API returns a lean DTO for dashboard rendering

## Suggested Internal Contracts

### Auth
- `getServerSessionOrRedirect()`
- `ensureUserRecord()`

### Portfolios
- `listPortfolioSummaries(userId)`
- `PortfolioRepository.listByUserId(userId)`

## DTOs for MVP1

### DashboardPortfolioSummary
- `id`
- `title`
- `status`
- `liveUrl`
- `updatedAt`

### CurrentUser
- `id`
- `email`
- `name`
- `image`

## Extension Path

Phase 1 can add `features/chat` and keep the same route-to-service-to-repository contract style. Phase 2 can add deployment services under `features/portfolios/server` or `server/services` without moving existing code.
