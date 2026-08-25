# Eventlify - Backend API Endpoints Specification (`routes.md`)

This document lists every backend REST API endpoint across authentication, events, clubs, teams, users, platform administration, headless BaaS services, and the Python AI microservice.

---

## 1. Authentication Endpoints

Powered by Better Auth (`lib/auth.ts` & `app/api/auth/[...all]/route.ts`).

| Endpoint Route | HTTP Method | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/sign-in/social` | `POST` | Public | Initiates Google OAuth authentication flow (`bmsce.ac.in` domain). |
| `/api/auth/callback/google` | `GET` | Public | Handles Google OAuth callback and session cookie issuance. |
| `/api/auth/get-session` | `GET` | Public | Retrieves active session and user profile data. |
| `/api/auth/sign-out` | `POST` | Authenticated | Invalidates active user session. |

---

## 2. Event Management Endpoints

File location: `app/api/events/*`

| Endpoint Route | HTTP Method | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `/api/events` | `GET` | Public | Fetch all published events (supports `search`, `category`, `status` filters). |
| `/api/events` | `POST` | Club Organiser (`MANAGE_EVENTS`) | Create a new event (validates team size constraints, deadlines, free/paid status). |
| `/api/events/[slug]` | `GET` | Public | Fetch detailed event data, hosting club details, contacts, and links. |
| `/api/events/[slug]` | `PUT` | Club Organiser (`MANAGE_EVENTS`) | Update event details, schedule, team size limits, art URL, or payment config. |
| `/api/events/[slug]` | `DELETE` | Club Organiser (`MANAGE_EVENTS`) | Delete event and associated attendance, registration, contact, and link records. |
| `/api/events/[slug]/register` | `POST` | Authenticated Student | Register for event in Solo or Team mode. Accepts payment proof URL & transaction ID for paid events. |
| `/api/events/[slug]/attendance` | `POST` | Club Organiser (`MANAGE_ATTENDANCE`) | Record check-in attendance for a user or team via QR scanner or user ID. |

---

## 3. Club Management Endpoints

File location: `app/api/clubs/*`

| Endpoint Route | HTTP Method | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `/api/clubs` | `GET` | Public | Fetch all active campus clubs (supports `search` query filter). |
| `/api/clubs` | `POST` | Super Admin | Create a new active club record. |
| `/api/clubs/[slug]` | `GET` | Public | Fetch club profile, officer roster with custom roles, contacts, and links. |
| `/api/clubs/[slug]` | `PUT` | Club Manager (`MANAGE_CLUB`) | Update club profile (Name, Description, Logo URL, Cover Banner). |
| `/api/clubs/[slug]` | `DELETE` | Super Admin | Delete club profile (requires no active events). |
| `/api/clubs/[slug]/events` | `GET` | Public | Fetch all events hosted by a specific club. |
| `/api/clubs/[slug]/members` | `GET` | Public / Club Members | Fetch club member roster with assigned custom roles and join dates. |
| `/api/clubs/[slug]/members` | `POST` | Club Manager (`MANAGE_MEMBERS`) | Add a member to the club roster and assign custom roles. |
| `/api/clubs/[slug]/members` | `DELETE` | Club Manager (`MANAGE_MEMBERS`) | Remove a member from the club roster. |

---

## 4. Team Management Endpoints

File location: `app/api/teams/*`

| Endpoint Route | HTTP Method | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `/api/teams` | `POST` | Authenticated Student | Create a new team for team-based event registration. |
| `/api/teams/[id]` | `GET` | Authenticated Student | Fetch team details and member roster. |
| `/api/teams/[id]/members` | `POST` | Team Captain | Add a teammate to the team roster. |

---

## 5. User Profile & History Endpoints

File location: `app/api/users/*`

| Endpoint Route | HTTP Method | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `/api/users` | `GET` | Public / Super Admin | Search users by Name, Email, or USN. |
| `/api/users/[slug]` | `GET` | Public | Fetch public user profile details. |
| `/api/users/[slug]/history` | `GET` | Authenticated Owner | Fetch user's registered events, registration status, and attendance check-in history. |

---

## 6. Contacts & Links Polymorphic Endpoints

File location: `app/api/contacts/*` & `app/api/links/*`

| Endpoint Route | HTTP Method | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `/api/contacts` | `POST` | Organiser / Manager | Create polymorphic contact record attached to a club or event (Email, Phone, WhatsApp). |
| `/api/contacts/[id]` | `DELETE` | Organiser / Manager | Delete a contact record. |
| `/api/links` | `POST` | Organiser / Manager | Create polymorphic link record attached to a club or event (Website, Rules, Discord). |
| `/api/links/[id]` | `DELETE` | Organiser / Manager | Delete a link record. |

---

## 7. Platform Admin Endpoints

File location: `app/api/admin/*`

| Endpoint Route | HTTP Method | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `/api/admin/stats` | `GET` | Super Admin | Fetch platform executive KPIs (total users, active clubs, registrations, turnout rate). |
| `/api/admin/applications` | `GET` | Super Admin | Fetch club onboarding proposals (filter by `PENDING`, `APPROVED`, `REJECTED`). |
| `/api/admin/applications` | `POST` | Authenticated Student | Submit a new club onboarding proposal. |
| `/api/admin/applications/[id]` | `PATCH` | Super Admin | Approve or reject a club onboarding proposal (sets feedback reason on rejection). |
| `/api/admin/clubs/[id]/status` | `PATCH` | Super Admin | Toggle club operational status (`ACTIVE` <-> `SUSPENDED`). |
| `/api/admin/users/[id]/role` | `PATCH` | Super Admin | Promote user to `SUPER_ADMIN` system role or revoke privileges. |

---

## 8. Headless BaaS Public API Endpoints

File location: `app/api/v1/public/*`

| Endpoint Route | HTTP Method | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/public/club` | `GET` | Public Key & CORS Verified | Fetch club profile, public officer roster, and links for external club websites. Validates `x-api-key` and Origin header against allowed origins. |
| `/api/v1/public/events` | `GET` | Public Key & CORS Verified | Fetch active and upcoming events hosted by the club for external websites. |

---

## 9. Python AI Microservice Endpoints (`eventlify-ai-service`)

FastAPI microservice endpoints accessed via signed internal API calls.

| Endpoint Route | HTTP Method | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `/ai/ocr/scan-id` | `POST` | Next.js Server | Process student ID card photo via OpenCV boundary cropping & OCR text extraction. Returns `{ name, usn, department, pfpUrl }`. |
| `/ai/certificates/generate` | `POST` | Next.js Server | Render vector PDF & PNG certificates with participant name, award tier, and verification QR code. |
| `/ai/ingest/parse` | `POST` | Next.js Server | LLM structured data parser converting unstructured text (flyers, WhatsApp copy) into validated Event JSON or Role Arrays. |
