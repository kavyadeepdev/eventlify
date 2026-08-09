# Event App

A modern web application built for managing campus events, student clubs, participant registrations, and attendance tracking.

---

## Overview

Event App is a central platform that enables campus clubs to publish events, manage club memberships, and coordinate student registrations. It supports both individual and team-based event registrations, enforces event constraints (such as team size and registration deadlines), and tracks participant check-ins and attendance.

---

## Key Features

* **Club Management**: Manage club profiles, logos, descriptions, custom URL slugs, and member roles (`ADMIN`, `MEMBER`).
* **Event Discovery & Publishing**: Host and browse campus workshops, hackathons, and competitions with detailed timelines and cover art.
* **Flexible Event Registrations**: Register as an individual or form a team while enforcing min/max team size requirements and registration deadlines.
* **Attendance Tracking**: Verify and log participant check-ins for events.
* **Authentication**: Multi-provider user authentication (Email/Password and Google OAuth) powered by Better-Auth.
* **Contacts & Links**: Polymorphic resource sharing for social links, rulebooks, and contact channels attached to clubs or events.

---

## Tech Stack

* **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Database**: [PostgreSQL](https://www.postgresql.org/)
* **Database Driver**: [`postgres.js`](https://github.com/porsager/postgres) (with automatic `snake_case` <-> `camelCase` transformation)
* **Authentication**: [Better Auth](https://www.better-auth.com/)
* **Styling & Components**: [Tailwind CSS v4](https://tailwindcss.com/), Base UI, [shadcn/ui](https://ui.shadcn.com/), Lucide Icons

---

## Project Structure

```
event-app/
├── app/                        # Next.js App Router routes, pages, and API endpoints
│   ├── api/                    # REST API routes (auth, clubs, events, users)
│   ├── events/                 # Event details and discovery pages
│   ├── login/                  # User login page
│   └── signup/                 # User registration page
├── components/                 # Reusable UI components & shadcn primitives
├── lib/                        # Core database client, auth config, and helper utilities
│   ├── auth.ts                 # Server-side Better Auth setup
│   ├── auth-client.ts          # Client-side auth hooks
│   ├── db.ts                   # postgres.js client initialization
│   └── utils.ts                # Class merge helpers (cn)
├── migrations/                 # PostgreSQL domain migration scripts
├── better-auth_migrations/     # Better Auth database migration scripts
├── docs/                       # Comprehensive documentation suite
│   ├── architecture.md         # System architecture document
│   ├── database.md             # Entity Relationship Diagram & table explanations
│   ├── decisions.md            # Architecture Decision Records (ADRs)
│   └── ERD.svg                 # Visual ERD diagram graphic
└── scripts/                    # Database utility and seeding scripts
```

---

## Getting Started

### 1. Prerequisites
Ensure you have the following installed locally:
* [Node.js](https://nodejs.org/) (v18+) or [Bun](https://bun.sh/)
* [PostgreSQL](https://www.postgresql.org/) database server

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in your database credentials and secret keys:

```bash
cp .env.example .env
```

Define the required variables in `.env`:
```env
DATABASE_URI="postgres://postgres:postgres@localhost:5432/event_app"
BETTER_AUTH_SECRET="your-better-auth-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Install Dependencies
```bash
npm install
# or
bun install
```

### 4. Database Seeding (Optional)
Seed the database with sample data:
```bash
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Contributing

We welcome contributions! Please follow these guidelines when submitting pull requests:

1. **Review Guidelines**: Refer to [AGENTS.md](AGENTS.md) and the project documentation in the [`docs/`](docs/) folder before making architectural changes.
2. **TypeScript**: Use strict TypeScript; do not introduce plain JavaScript or explicit `any` types.
3. **Server Components**: Prefer React Server Components by default; use Client Components (`"use client"`) only when interactivity requires it.
4. **Database Safety**: Never access the database directly from UI components. Keep database queries in the appropriate server-side layer (`lib/` or API routes).
5. **Naming Conventions**: Follow `snake_case` for database entities and `camelCase` for TypeScript variables/properties.
