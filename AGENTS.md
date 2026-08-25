# Project Instructions

## Stack

- Next.js (16, App Router)
- TypeScript
- PostgreSQL
- postgres.js
- Better Auth
- Tailwind CSS (v4)
- shadcn/ui & Base UI

## Project Structure

- `app/` — routes, pages, and REST API endpoints
- `components/` — reusable UI components
- `lib/` — database client, auth configuration, and shared utilities
- `migrations/` — SQL database migration scripts
- `better-auth_migrations/` — Better Auth database migrations
- `docs/` — project documentation suite (`database.md`, `architecture.md`, `decisions.md`, `ERD.svg`)
- `scripts/` — database seeding and utility scripts
- `CHANGELOG.md` — project release notes and feature history

## Rules

- Use TypeScript; don't introduce JavaScript.
- Prefer Server Components by default.
- Use Client Components only when interactivity requires them.
- Validate external/user input with Zod.
- Never access the database directly from UI components.
- Keep database queries in the appropriate server-side layer.
- Don't duplicate existing utilities (e.g. use `cn` from `lib/utils.ts`).
- Follow existing naming conventions (`snake_case` in database, `camelCase` in TypeScript).
- Don't introduce new dependencies without justification.
- Follow Conventional Commits format for commit messages and prefer using lowercase (e.g., `feat: add solo registration validation`, `fix: correct event deadline timezone check`).
- Maintain `CHANGELOG.md` by logging notable additions, fixes, and architectural changes under `[Unreleased]`.
- Only implement features in accordance with the existing project documentation in `docs/`.
- If any new feature or architectural change is needed, consult with the prompter to inform them that a change in the architecture is required.
- If the prompter approves the architectural/feature change, ensure all changes are fully reflected in the respective documentation files in `docs/`.
- The `main` branch is protected; all code changes must be made via topic/feature branches and submitted via Pull Requests accordingly.

## Database

- PostgreSQL is the source of truth.
- `postgres.js` is the primary database driver (with automatic `camelCase` key transformation).
- IDs remain primary keys (UUID).
- Slugs are used for public URLs.
- Never modify migrations that have already been applied.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
