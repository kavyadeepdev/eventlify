# Eventlify - Frontend Pages Specification (`pages.md`)

This document lists every frontend page route across all subdomains (**Public Student Portal**, **Club Management Portal**, and **Platform Super Admin Panel**).

---

## 1. Public Student Portal (`eventlify.in`)

Routes accessible to general campus students and visitors.

| Path / Route | File Location | Purpose & Functionality |
| :--- | :--- | :--- |
| `/` | `app/page.tsx` | Main landing page featuring Kinetic Hero, endless marquee ticker rails, active event grid, and featured club cards. |
| `/events` | `app/events/page.tsx` | Public event discovery directory with debounced search and category filters (Technical, Cultural, Sports, Hackathon). |
| `/events/[slug]` | `app/events/[slug]/page.tsx` | Detailed event page displaying schedules, team size constraints, host club profile, rule links, countdown timer, and solo/team registration modal. |
| `/clubs` | `app/clubs/page.tsx` | Campus club directory listing active clubs with category badges and search. |
| `/clubs/[slug]` | `app/clubs/[slug]/page.tsx` | Public club profile displaying description, contact details, social links, active/past events, and officer roster with custom role badges. |
| `/clubs/apply` | `app/clubs/apply/page.tsx` | Step-by-step onboarding proposal form for prospective club leads to apply for official campus recognition. |
| `/clubs/apply/status` | `app/clubs/apply/status/page.tsx` | Live status tracking dashboard for submitted club onboarding applications (Pending Review, Approved, or Rejected with feedback). |
| `/dashboard` | `app/dashboard/page.tsx` | Signed-in student's dashboard: Student Ticket Wallet (QR check-in passes), registration history, attendance logs, and profile editor. |
| `/onboard` | `app/onboard/page.tsx` | Post-signup onboarding interface offering students a choice between Option A (AI ID Card OCR scan) and Option B (manual USN & PFP entry). |
| `/login` | `app/login/page.tsx` | Student login page powered by Better Auth Google OAuth (`bmsce.ac.in` domain). |
| `/signup` | `app/signup/page.tsx` | Student sign-up page powered by Better Auth Google OAuth. |

---

## 2. Club Management Portal (`club.eventlify.in`)

Dedicated workspace for club officers and administrators to manage their club operations.

| Path / Subdomain Route | File Location | Purpose & Functionality |
| :--- | :--- | :--- |
| `club.eventlify.in` | `app/club/page.tsx` | Club executive dashboard overview showing total hosted events, total registrants, active officers, and turnout statistics. |
| `club.eventlify.in/settings` | `app/club/settings/page.tsx` | Club profile & branding editor (Logo URL, Cover Banner, Description, Email/Phone contacts, and social links). |
| `club.eventlify.in/roles` | `app/club/roles/page.tsx` | Discord-style custom role creator (Role Name, HEX color picker, rank hierarchy ordering, and granular permission flag toggles). |
| `club.eventlify.in/members` | `app/club/members/page.tsx` | Club member roster manager (invite members by USN/email, assign/transfer custom roles, remove members). |
| `club.eventlify.in/events/new` | `app/events/new/page.tsx` | Event publishing wizard (Title, Schedule, Min/Max Team Size, Free vs Paid, Fee Amount, UPI ID, UPI QR code). |
| `club.eventlify.in/events/[slug]/edit` | `app/events/[slug]/edit/page.tsx` | Event detail editor (update timelines, rules, cover art, team constraints, or cancel event). |
| `club.eventlify.in/events/[slug]/payments` | `app/events/[slug]/payments/page.tsx` | Payment proof verification queue (inspect student USNs, transaction UTR numbers, and high-res payment proof screenshots to approve or reject). |
| `club.eventlify.in/events/[slug]/manage` | `app/events/[slug]/manage/page.tsx` | Door check-in tool featuring device camera QR code scanner, manual USN search, live turnout progress, and CSV export. |
| `club.eventlify.in/settings/api` | `app/club/settings/api/page.tsx` | Headless BaaS settings: generate secret API keys (`ev_live_...`) and configure CORS allowed origin domains for custom club websites. |

---

## 3. Platform Super Admin Panel (`admin.eventlify.in`)

Master control center for site owners to oversee platform operations.

| Path / Subdomain Route | File Location | Purpose & Functionality |
| :--- | :--- | :--- |
| `admin.eventlify.in` | `app/admin/page.tsx` | System dashboard showing platform executive KPIs (total users, active clubs, pending applications, overall turnout rate). |
| `admin.eventlify.in/applications` | `app/admin/applications/page.tsx` | Onboarding application review queue: inspect proposed clubs, 1-click Approve (auto-provisions club & sets admin role) or Reject with feedback. |
| `admin.eventlify.in/clubs` | `app/admin/clubs/page.tsx` | Master club directory manager: search clubs, view active/suspended status, suspend or reactivate clubs. |
| `admin.eventlify.in/events` | `app/admin/events/page.tsx` | Global event moderation: list events across all campus clubs, feature events on the main homepage, or emergency delete violating events. |
| `admin.eventlify.in/users` | `app/admin/users/page.tsx` | Master user registry: search students by USN, Name, or Email, view activity history, and manage `SUPER_ADMIN` system roles. |
