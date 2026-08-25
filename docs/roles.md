# Eventlify - Roles, Permissions & Capability Matrix

This document provides a comprehensive, exhaustive reference of all actions every user persona can perform and all information they can view across **Eventlify**.

---

## 1. Persona 1: Student User (`eventlify.in`)

A regular authenticated or anonymous campus student accessing the public website.

### 1.1 Actions the Student Can Perform:
- **Authentication & Profile:**
  - Sign in / sign up using Google OAuth (`bmsce.ac.in` domain).
  - Access post-signup Onboarding Interface to set up profile via choice of:
    - **Option A (AI OCR Scan):** Upload student ID card photo to automatically extract USN, Name, Department, and cropped PFP.
    - **Option B (Manual Entry):** Manually enter USN text and upload custom PFP image.
  - Edit personal profile details (Name, USN, Phone Number) at any time.
- **Event Discovery & Registration:**
  - Search upcoming and past events using keywords, categories, hosting clubs, and date filters.
  - View detailed event pages, schedules, cover art, rules, and host club information.
  - Register for events in **Solo** mode or **Team** mode.
  - Create a new team, name the team, and invite teammates by USN or name.
  - Submit single-field profile details during registration if missing from their profile (auto-synced).
  - View organizer's UPI QR Code and fee amount for paid events.
  - Upload payment proof screenshot and enter transaction ID / UTR reference number.
  - Cancel a pending or solo registration before the registration deadline.
  - Access their personal **Student Ticket Wallet** (`/dashboard`) to view entry passes and QR check-in codes.
  - Download verified PDF / PNG certificates of participation or achievement for completed events.
- **Club Discovery & Applications:**
  - Browse the campus club directory and search clubs by domain/category.
  - View public club profiles, officer rosters, contact details, and social links.
  - Submit a **Club Onboarding Application** (`/clubs/apply`) to propose forming a new campus club.
  - Track the real-time review status of their submitted club application (`/clubs/apply/status`).

### 1.2 Information the Student Can View:
- Public event list, event banner art, event schedule (start time, end time, registration deadline).
- Event constraints (minimum team size, maximum team size, entry fee amount, free vs paid indicator).
- Organiser contact channels (email, phone, WhatsApp) and external links (rulebooks, slides).
- Public club details (logo, tagline, description, category, social links).
- Public club officer roster with custom role badges and custom role colors.
- Personal dashboard: registered events, registration status (`CONFIRMED`, `PENDING_VERIFICATION`, `APPROVED`, `REJECTED`), payment rejection feedback notes, ticket QR code passes, and check-in history.
- Personal certificate download links.
- Status of their submitted club onboarding application (Pending Review, Approved, or Rejected with feedback).

---

## 2. Persona 2: Club Roles (`club.eventlify.in`)

Clubs use a dynamic, Discord-style role hierarchy. Actions and visible data depend on granted permission flags.

### 2.1 Role Level 1: Club Manager / Owner Role
Granted all permission flags: `MANAGE_CLUB`, `MANAGE_ROLES`, `MANAGE_MEMBERS`, `MANAGE_EVENTS`, `MANAGE_ATTENDANCE`, `MANAGE_API_KEYS`.

#### Actions the Club Manager Can Perform:
- **Club Branding & Profile (`MANAGE_CLUB`):**
  - Update Club Name, Description, Category, Logo URL, and Cover Banner.
  - Edit club contact information (Official Email, Phone, WhatsApp group links).
  - Add, edit, or delete external social links (Instagram, LinkedIn, GitHub, Website).
- **Custom Role Management (`MANAGE_ROLES`):**
  - Create new custom club roles (e.g. *"Vice President"*, *"Tech Lead"*, *"Design Head"*).
  - Assign custom HEX colors to roles.
  - Set hierarchy rank ordering (reorder roles).
  - Grant or revoke specific permission flags per role.
  - Delete custom roles.
- **Member Management (`MANAGE_MEMBERS`):**
  - Search students by USN or email to invite them as club members.
  - Assign one or multiple custom roles to club members.
  - Change or transfer member roles.
  - Remove members from the club roster.
- **Event Management (`MANAGE_EVENTS`):**
  - Create new events (Title, Slug, Description, Cover Art, Dates, Constraints, Free/Paid, Fee Amount, UPI ID, UPI QR image).
  - Edit existing event details, change timelines, update cover art, or extend registration deadlines.
  - Cancel or delete club events.
- **Payment Verification & Attendance (`MANAGE_ATTENDANCE`):**
  - View the **Payment Verification Queue** for paid events.
  - Open payment review drawer to inspect student USN, submitted UTR number, and high-res payment proof screenshot.
  - Approve pending payments (issues QR ticket pass).
  - Reject pending payments with a custom feedback note (e.g. *"Transaction ID unreadable"*).
  - Access door check-in tools: scan student QR passes with device camera or search USN to mark attendance.
  - Export full event registration and attendance lists to CSV.
- **Headless BaaS & API Settings (`MANAGE_API_KEYS`):**
  - Generate scoped external API keys (`ev_live_...`) for custom club websites.
  - Revoke or regenerate API keys.
  - Configure CORS allowed domain origins (e.g. `["https://acm-bmsce.in"]`).

#### Information the Club Manager Can View:
- Club dashboard analytics: Total hosted events, total registrants across all events, overall turnout rate, total active club officers.
- Complete member roster with assigned roles, join dates, and profile pictures.
- Full registration list for all club events (solo and team registrations, member rosters).
- **Payment Proof Screenshots & UTR Numbers** submitted by students for paid events.
- Live door check-in progress, turnout counters, and check-in timestamps.
- Active BaaS API keys, key prefix, last used timestamp, and configured CORS domain origins.

---

### 2.2 Role Level 2: Event Organiser / Manager Role
Granted event & attendance permission flags: `MANAGE_EVENTS`, `MANAGE_ATTENDANCE`. Restricted from higher-level club settings and role management.

#### Actions the Event Organiser Can Perform:
- Create new events for the club.
- Edit details, dates, team sizes, cover art, and payment details of events they manage.
- Inspect student payment proof screenshots and UTR numbers in the payment verification queue.
- Approve or reject pending event payment submissions.
- Conduct door check-in using QR camera scanner or manual USN search.
- Export registration and attendance lists to CSV.

#### Information the Event Organiser Can View:
- List of club events and event analytics.
- Registrations for club events (solo and team details).
- Payment proof screenshots, UTR numbers, and payment verification status.
- Real-time door check-in logs and turnout statistics.

#### Actions & Data Restricted from Event Organiser:
- Cannot edit club branding, logo, contacts, or social links (`MANAGE_CLUB`).
- Cannot create, edit, reorder, or delete custom roles (`MANAGE_ROLES`).
- Cannot add/remove club members or change member roles (`MANAGE_MEMBERS`).
- Cannot view or manage BaaS API keys or CORS domain origins (`MANAGE_API_KEYS`).

---

### 2.3 Role Level 3: Custom Officer Role (e.g. "Volunteer", "Tech Lead")
Granted specific toggled permission flags (e.g., only `MANAGE_ATTENDANCE` for door duty).

#### Capabilities:
- Actions and visible information are dynamically restricted to the exact permission flags assigned to that custom role by the Club Manager.

---

## 3. Persona 3: Platform Super Admin (`admin.eventlify.in`)

Master system administrator controlling the platform.

### 3.1 Actions the Super Admin Can Perform:
- **Club Onboarding Approvals (`/admin/applications`):**
  - Review pending club onboarding proposals.
  - 1-Click Approve application: Automatically creates an active club entry in database, sets status to `ACTIVE`, and provisions applicant as Club Admin.
  - Reject application with a custom rejection feedback reason.
- **Site-Wide Club & Event Moderation (`/admin/clubs` & `/admin/events`):**
  - Search and audit all campus clubs.
  - Suspend an active club or Reactivate a suspended club (`ACTIVE` <-> `SUSPENDED`).
  - Feature selected events on the main homepage banner.
  - Emergency Delete violating or inappropriate events.
- **User System Role Management (`/admin/users`):**
  - Search platform user database by USN, Name, or Email.
  - Promote regular users to `SUPER_ADMIN` system role.
  - Revoke `SUPER_ADMIN` system privileges.
- **Platform Operations & AI Maintenance:**
  - View platform health, system logs, and AI service status.

### 3.2 Information the Super Admin Can View:
- Site-wide executive KPIs: Total Registered Students, Total Active Clubs, Pending Onboarding Applications, Total Published Events, Total Ticket Registrations, Platform-wide Turnout Rate.
- Complete audit queue of pending, approved, and rejected club onboarding applications.
- Master directory of all campus clubs (including suspended clubs and contact emails).
- Master registry of all events published across all clubs on the platform.
- Master directory of all registered platform users, USNs, email addresses, registration history, attendance records, and assigned system roles.
