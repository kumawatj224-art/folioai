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
