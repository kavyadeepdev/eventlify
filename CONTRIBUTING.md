# Contributing to Event App

Thank you for your interest in contributing to Event App! We welcome contributions, bug fixes, feature enhancements, and documentation improvements.

Please take a moment to review this guide before submitting your pull requests.

---

## 1. Development Workflow

### Prerequisites
* **Node.js**: v18 or higher (or [Bun](https://bun.sh/))
* **PostgreSQL**: Local or remote database instance

### Local Setup
1. **Fork & Clone**:
   ```bash
   git clone https://github.com/your-username/event-app.git
   cd event-app
   ```

2. **Branch Naming**: Create a topic branch using a descriptive prefix:
   * `feature/short-description` (for new features)
   * `fix/short-description` (for bug fixes)
   * `docs/short-description` (for documentation changes)
   * `refactor/short-description` (for code refactoring)

3. **Configure Environment**:
   ```bash
   cp .env.example .env
   ```
   Set your local PostgreSQL connection string in `.env`:
   ```env
   DATABASE_URI="postgres://postgres:postgres@localhost:5432/event_app"
   BETTER_AUTH_SECRET="your-better-auth-secret"
   ```

4. **Install Dependencies**:
   ```bash
   npm install
   # or
   bun install
   ```

5. **Start Dev Server**:
   ```bash
   npm run dev
   # or
   bun dev
   ```

---

## 2. Coding Guidelines & Standards

### TypeScript & React
* **Strict TypeScript**: Do not write plain JavaScript or use explicit `any` types. Ensure all function inputs and return values are explicitly typed.
* **Server Components First**: Prefer React Server Components by default. Use Client Components (`"use client"`) only when interactivity (state, event handlers, client hooks) is required.
* **Input Validation**: Use [Zod](https://zod.dev/) schemas to validate all user input, request bodies, and API parameters before processing.

### Database & Data Access
* **Layer Isolation**: **Never** execute database queries directly within UI components (`app/` pages or `components/`). All database queries must reside in the appropriate server-side layer (`lib/` or API routes).
* **Database Driver**: Use `postgres.js` (`sql` from `lib/db.ts`) with template strings for parameterized SQL queries.
* **Casing Conventions**: Use `snake_case` for PostgreSQL table names and columns, and `camelCase` in TypeScript code (automatically transformed by `postgres.js`).
* **Migrations**: Never modify existing SQL migrations in `migrations/` or `better-auth_migrations/` that have already been applied. Append new migration files for schema changes.

### Styling & UI
* Use Tailwind CSS v4, Base UI, and shadcn/ui primitives.
* Use the `cn(...)` utility function from `lib/utils.ts` for dynamic class concatenation. Avoid inline duplicate styling logic.

---

## 3. Submitting Pull Requests

1. **Lint & Verify**: Run linting and build checks to ensure code quality before pushing:
   ```bash
   npm run lint
   npm run build
   ```
2. **Commit Messages**: Write clear, descriptive commit messages following conventional commits format:
   * `feat: add solo registration validation`
   * `fix: correct event deadline timezone check`
   * `docs: update database schema reference`
3. **Open PR**: Push your branch and open a Pull Request against the `main` branch. Include a detailed description of the changes made and link to relevant documentation or issues.
4. **Update Docs**: If your changes introduce new database tables, routes, or architectural patterns, please update the respective files in the [`docs/`](docs/) directory (`docs/database.md`, `docs/architecture.md`, `AGENTS.md`).
