# Eventlify - Architecture & Design Decisions Log (`decisions.md`)

This document records all architectural, technical, design, flow, API endpoint, database schema, security, and project governance decisions established in **Eventlify**.

---

## 1. System Architecture & Routing Decisions

### 1.1 Next.js 16 App Router & Subdomain Routing (`middleware.ts`)
- **Decision:** Utilize a single monorepo structured under Next.js 16 App Router and dynamically route incoming HTTP requests based on the `Host` header via `middleware.ts`.
- **Domain Mapping:**
  - `eventlify.in` $\rightarrow$ `/` (Public Student Portal)
  - `club.eventlify.in` $\rightarrow$ `/club/*` (Club Officer & Management Workspace)
  - `admin.eventlify.in` $\rightarrow$ `/admin/*` (Platform Super Admin Panel)
- **Rationale:** Prevents code duplication across separate deployments, shares a single PostgreSQL database connection pool and TypeScript models, while providing clean persona isolation for users, officers, and admins.

### 1.2 REST API Architecture over GraphQL and Protobufs
- **Decision:** Use standard REST API endpoints (`/api/*` and `/api/v1/public/*`) instead of GraphQL or Protocol Buffers (gRPC/Protobufs).
- **Rationale:**
  - **Well-defined Data Fields:** Domain resources (events, clubs, registrations, users) have stable schemas that map directly to REST endpoints.
  - **Native Browser Compatibility:** Standard JSON over HTTP fetch works seamlessly in browser environments without runtime client libraries, GraphQL query parsers, or Protobuf binary decoders.
  - **Headless BaaS Readiness:** REST endpoints can easily be exposed for external club websites (`/api/v1/public/*`) to consume via standard `fetch()`.
  - **Developer Experience & Contribution:** Lower barrier to entry for open-source and campus contributors compared to complex GraphQL schemas or Protobuf compilation pipelines.

### 1.3 Headless Backend-as-a-Service (BaaS) Architecture (`/api/v1/public/*`)
- **Decision:** Expose authenticated and CORS-restricted public API endpoints (`/api/v1/public/club`, `/api/v1/public/events`) allowing campus clubs to use Eventlify as a headless backend for their custom external websites (e.g., `https://acm-bmsce.in`).
- **Security:** Requires scoped API keys (`ev_live_...`) with SHA-256 key hashing (`key_hash`) and validates incoming request `Origin` headers against configurable `allowed_origins` stored in `club_api_keys`.

### 1.4 Python AI Microservice Isolation (`eventlify-ai-service`)
- **Decision:** Deploy AI features (ID Card OCR extraction, PDF/PNG vector certificate rendering, LLM event data parser) as an independent Python FastAPI microservice rather than embedding C++ image processing binaries inside Node.js.
- **Rationale:** Python provides native bindings for OpenCV, EasyOCR, Tesseract, and ReportLab. Communicates with Next.js App Router via internal HTTP webhooks and signed API keys.

---

## 2. Authentication & User Onboarding Decisions

### 2.1 Better Auth with Google OAuth (`bmsce.ac.in`)
- **Decision:** Use Better Auth for authentication, restricting Google OAuth sign-in to the campus domain (`bmsce.ac.in`).
- **Session Management:** Database-backed sessions stored in `sessions` and `accounts` tables using UUID primary keys.

### 2.2 Dual Onboarding Flow (AI OCR vs Manual Entry)
- **Decision:** Provide students with a choice during post-signup onboarding (`/onboard`):
  - **Option A (AI OCR Scan):** Upload physical student ID card photo $\rightarrow$ Python OpenCV & EasyOCR automatically extract **USN**, **Name**, **Department**, and cropped **PFP**.
  - **Option B (Manual Entry):** Manually type USN and upload custom avatar image.
- **Rationale:** Maximizes user convenience and data accuracy while maintaining a smooth fallback for damaged or unreadable physical cards.

---

## 3. Database Schema & Data Access Decisions

### 3.1 PostgreSQL & `postgres.js` Driver Selection
- **Decision:** Use PostgreSQL as the single source of truth and `postgres.js` as the primary database driver.
- **Rationale for `postgres.js`:**
  - **Non-Trivial Syntax Efficiency:** Allows using ES6 tagged template literals (`sql\`SELECT * FROM events WHERE id = ${id}\``) instead of manually indexing `$1, $2` parameters or managing positional variable arrays.
  - **Automatic Case Transformation:** Built-in automatic transformation handling from PostgreSQL `snake_case` column names to TypeScript `camelCase` object properties across the codebase.

### 3.2 Data Type Selection: UUID for Primary Keys (`id`)
- **Decision:** Use `UUID` (`gen_random_uuid()`) as the data type for primary key `id` columns across all database tables.
- **Rationale:**
  - **Storage Efficiency:** Takes up significantly less disk and memory space than raw text strings (16-byte fixed binary representation in PostgreSQL vs variable-length text).
  - **Internal References & Security:** Works exceptionally well for secure internal references, foreign key joins, and prevents predictable sequential ID enumeration attacks.
  - **Slugs for Public URLs:** Public-facing URLs use human-readable unique `slug` strings (e.g. `/events/hacknight-2026`), keeping UUIDs internal.

### 3.3 Dynamic Discord-Style Club Roles (`club_roles` & `club_member_roles`)
- **Decision:** Replace static role enums with dynamic, rank-ordered club roles configured with custom HEX colors and togglable permission flags (`MANAGE_CLUB`, `MANAGE_ROLES`, `MANAGE_MEMBERS`, `MANAGE_EVENTS`, `MANAGE_ATTENDANCE`, `MANAGE_API_KEYS`).
- **Rationale:** Supports diverse club organizational structures across campus without requiring database schema changes for new title designations.

### 3.4 Manual UPI Payment Proof Verification Queue
- **Decision:** Implement a UPI QR code + payment proof screenshot + UTR transaction ID upload flow for paid events instead of integrating third-party payment gateways.
- **Rationale:** Student clubs lack registered merchant payment gateway credentials. Club officers verify transaction screenshots directly in a dedicated review queue (`club.eventlify.in/events/[slug]/payments`).

### 3.5 Polymorphic Contact & Link Models
- **Decision:** Attach social links (`links`) and contact channels (`contacts`) polymorphically to either a club or an event using PostgreSQL `CHECK` constraints ensuring `(event_id IS NOT NULL AND club_id IS NULL) OR (event_id IS NULL AND club_id IS NOT NULL)`.

### 3.6 Database Migration Immutability
- **Decision:** Applied SQL migrations in `migrations/` and `better-auth_migrations/` are strictly immutable. All database modifications must be made via incremental appended SQL migration files.

---

## 4. Frontend Design & Component Decisions

### 4.1 "Campus Poster" Brutalist Aesthetic System
- **Decision:** Adopt a physical "Campus Poster" visual style inspired by brutalist zine prints and high-contrast campus flyers.
- **Design Tokens (`app/globals.css`):** Warm paper canvas backdrop (`#f7f5ef`), 2px thick ink borders (`#111116`), saturated color blocks (`limepop`, `zest`, `punch`, `grape`, `flame`, `aqua`), and sharp 4px offset box shadows (`shadow-[4px_4px_0_var(--color-ink)]`).
- **Typography:** Anton (`--font-display`) for display poster titles; Space Grotesk (`--font-sans`) for body text and interactive UI elements.
- **Animations:** 3D perspective hover tilt, letter-rise text reveals, infinite marquee rails, spring count-up counters, and celebratory confetti.

### 4.2 Server Components by Default
- **Decision:** Render pages using React Server Components by default for optimal performance, zero client bundle overhead, and direct server-side data fetching.
- **Client Components (`"use client"`):** Strictly reserved for interactive elements requiring browser event listeners, Framer Motion, state hooks, or camera hardware access.

### 4.3 Input Validation via Zod
- **Decision:** Enforce strict schema validation on all user input, API request payloads, and route parameters using Zod schemas. Provides automatic TypeScript type inference and clean validation error messages.

---

## 5. Security & Governance Decisions

### 5.1 Conventional Commits & Lowercase Convention
- **Decision:** Require Conventional Commits format for git messages, preferring lowercase descriptions (e.g., `feat: add solo registration validation`, `fix: correct event deadline timezone check`).

### 5.2 Documentation-Driven Feature Lifecycle
- **Decision:** All features must be implemented in accordance with the project documentation suite (`docs/`).
- **Architectural Changes:** Any new feature or architectural modification requires prior prompter/user approval. Upon approval, all changes must be immediately updated across the documentation suite.

### 5.3 Protected Main Branch & PR Workflow
- **Decision:** The `main` branch is protected. Direct commits to `main` are disallowed; all work must be submitted via topic/feature branches and reviewed via Pull Requests.
