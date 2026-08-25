# Changelog

All notable changes to the **AfterClass** campus event management platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Commit messages across this repository follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

---

## [Unreleased]

### Planned / Upcoming
- Real-time notification channel for event check-ins and team invitations.
- Advanced analytics exporter for club event attendance statistics.

---

## [0.4.0-beta.2] - 2026-08-25

### Added
- **Multi-Tenant Subdomain Routing**: Added host rewrite middleware (`middleware.ts`) directing traffic dynamically to `admin.afterclass.in` and `club.afterclass.in` subdomains with automated auth route bypass.
- **Super Admin Operations Panel**: Introduced super admin operations dashboard, global club directory registry, pending club onboarding approval queue, and system user roles manager (`SUPER_ADMIN`, `CLUB_ADMIN`, `STUDENT`).
- **Club Admin Portal**: Added club management dashboard featuring event statistics, custom granular role permissions manager, and BaaS CORS settings.
- **Student Onboarding Flow**: Implemented post-signup student onboarding choice page offering OCR student ID card auto-scanning and manual USN registration.
- **Manual UPI Payment Integration**: Built manual payment workflow during event registration featuring dynamic UPI QR code rendering, UTR input, proof screenshot upload, and admin review status tracking.
- **Prospective Club Onboarding**: Created prospective club application form and status tracking page.
- **Headless BaaS REST API**: Added public REST API endpoints with origin validation and CORS security.
- **Database Schema Migration 004**: Added migration `004_admin_and_onboarding.sql` providing SQL schema updates for system roles, prospective club applications, UPI payment verifications, custom club roles, and admin analytics.
- **Documentation Suite Expansion**: Added Architecture Decision Records ([`docs/decisions.md`](file:///home/kadenstack/projects/event-app/docs/decisions.md)), full database ERD documentation ([`docs/database.md`](file:///home/kadenstack/projects/event-app/docs/database.md)), and agent coding guidelines ([`AGENTS.md`](file:///home/kadenstack/projects/event-app/AGENTS.md)).

### Fixed & Refactored
- **Type Definitions Consolidation**: Fixed deployment errors by removing duplicate type definitions in [`lib/types.ts`](file:///home/kadenstack/projects/event-app/lib/types.ts) and adding missing `status` and `payment` fields to `EventApiData` and `HistoryRegistrationApiData`.
- **Server Actions for Updates**: Refactored club application, payment verification, user role, and club status updates to use dedicated Server Actions (`lib/actions.ts`).

---

## [0.3.0-beta.1] - 2026-08-24

### Added
- **Branded Route Loader HUD**: Introduced a viewport-filling route loader animation and progress HUD to improve perceived page load performance during route transitions.
- **Automatic User Slug Generation**: Added utility to derive unique, URL-safe user slugs automatically from user names and emails (`lib/format.ts`).
- **Domain-Restricted Authentication**: Added domain validation restricting Google OAuth authentication exclusively to the `@bmsce.ac.in` domain (`lib/auth.ts`).

### Fixed
- **Navigation Scroll & Outgoing Page Flash**: Resolved issue where navigation scroll position would reset abruptly or flash outgoing content during page transitions.
- **Header & Footer Layout Glitches**: Prevented footer elements from flashing beneath the header container while lazy-loading page routes.
- **User Dashboard Fetch Loop**: Fixed an infinite fetch loop bug on the student dashboard and corrected avatar image fallback rendering.
- **USN & Profile Server Actions**: Migrated student USN and user profile updates from API calls to server-side Server Actions.

---

## [0.2.0-alpha.2] - 2026-08-20

### Added
- **Branding Refresh**: Updated application name and branding across UI and documentation to **AfterClass**.
- **Frontend App UI Mockups**: Created comprehensive UI mockups for event management, club profile views, and registration cards.
- **Polymorphic Contacts & Links API**: Added CRUD REST API endpoints (`/api/contacts`, `/api/links`) supporting polymorphic attachments to both clubs and events.
- **User Profiles & Teams API**: Added REST API endpoints (`/api/users`, `/api/teams`) supporting team creation, team membership rosters, and user event participation histories.
- **Club Management API**: Added REST API endpoints (`/api/clubs`) for managing club details, club members, and club-hosted events.

### Security
- **Email Auth Deprecation**: Removed standalone email/password registration and login flows in favor of secure Google OAuth single sign-on.

---

## [0.1.0-alpha.1] - 2026-08-17

### Added
- **Event REST API**: Implemented primary CRUD REST API endpoints for event discovery, creation, updates, and deletion (`/api/events`).
- **Registration & Attendance Endpoints**: Added backend REST API endpoints (`/api/events/[id]/register`, `/api/events/[id]/attendance`) for participant registration and check-in verification.
- **Initial Documentation Suite**: Created initial architecture and specification documents under [`docs/`](file:///home/kadenstack/projects/event-app/docs/) (`architecture.md`, `flows.md`, `roles.md`, `pages.md`, `routes.md`, `design.md`, `database.md`, `ERD.svg`).

---

## [0.0.1-alpha.0] - 2026-07-29

### Added
- **Project Initialisation**: Created Next.js 16 (App Router) project structure using TypeScript and React 19.
- **Design System Foundation**: Installed and configured Tailwind CSS v4, Base UI, and shadcn/ui component primitives.
- **Database Layer Setup**: Initialized `postgres.js` database driver with automatic `snake_case` <-> `camelCase` key conversion and initial PostgreSQL migrations.
- **Better Auth Integration**: Integrated Better Auth for user authentication and session management.
- **Database Seeding & Constraints**: Created database seed script (`scripts/seed.ts`) and added unique URL slug constraints for users, clubs, and events.
