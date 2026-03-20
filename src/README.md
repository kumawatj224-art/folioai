# Source Layout Notes

This folder is structured for a lean feature-oriented Next.js application.

## Rules

- Keep route files thin.
- Put feature-specific logic under `features/<feature>`.
- Put shared infrastructure adapters under `lib`.
- Put cross-feature server primitives under `server`.
- Prefer composition over inheritance.
- Keep interfaces close to where they are consumed.

## MVP1 Feature Boundaries

- `auth`: sign-in, session guards, user bootstrap
- `portfolios`: list portfolio summaries for dashboard

## Simple SOLID Mapping

- Single Responsibility: each folder has one reason to change
- Open/Closed: new features can be added under `features/` without reshaping the app
- Liskov: avoid deep class hierarchies; prefer plain functions and typed contracts
- Interface Segregation: keep repository and service contracts narrow
- Dependency Inversion: route handlers depend on service interfaces/helpers, not raw SDK calls
