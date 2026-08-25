# Eventlify - System Workflows & Operations Specification

This document details the operational sequences and step-by-step processes across all user personas in **Eventlify**.

---

## 1. Student User (`eventlify.in`)

### 1.1 Authentication & Profile Setup
1. **Sign In Trigger:** Student clicks "Sign In" on the main portal.
2. **Google OAuth:** Redirected to Better Auth Google login restricted to campus email domain (`bmsce.ac.in`).
3. **Session Creation:** Upon successful authentication, user record is upserted in PostgreSQL database and a session cookie is issued.
4. **Onboarding Choice Screen:** Right after signing up / initial authentication, the student is presented with an Onboarding Choice interface:
   - **Option A (ID Card OCR Scan):** Upload a photo of their physical student ID card. Python AI service processes the image via OpenCV boundary cropping and OCR text extraction to auto-populate **USN**, **Name**, **Department**, and cropped profile image (**PFP**).
   - **Option B (Manual Entry):** Manually type in their **USN** and upload a custom profile image (**PFP**) directly via form fields.
5. **Profile Persistence:** Whichever option is chosen, the verified profile details (USN and PFP) are saved to PostgreSQL for all future event registrations.

### 1.2 Event Discovery
1. **Browse (`/events`):** Student views upcoming campus events sorted by start date.
2. **Filter & Search:** Filter events by category (Technical, Cultural, Sports, Hackathon), hosting club, date range, or registration status (Open, Closing Soon, Closed).
3. **Event Details (`/events/[slug]`):** Inspect banner art, schedule, team size constraints, rules, countdown timer, host club profile, and organizer contact details.

### 1.3 Event Registration & Payment (Solo & Team)
1. **Click "Register":**
   - If not signed in: Prompted to log in via Google OAuth, return URL is preserved, and redirected back directly to the registration step.
   - If signed in: Profile information (Name, Email, USN, Phone) is auto-filled.
2. **Profile Completion (If Fields Missing):** If any required profile field (e.g. USN or Phone) is missing, the student inputs it right inside the registration modal. It is automatically saved to their user profile for future use.
3. **Select Mode:** Choose **Solo** registration or **Team** registration (specify team name and invite teammates by USN/Name).
4. **Payment Processing:**
   - **Free Event:** Registration is instantly confirmed. System generates an entry ticket with a unique check-in QR code.
   - **Paid Event:** Displays the organizer's UPI QR Code, fee amount, and UPI ID. Student pays via GPay / PhonePe / Paytm / BHIM, uploads a screenshot of the payment proof, inputs their transaction ID / UTR number, and submits. Status becomes `PENDING_VERIFICATION`.

### 1.4 Club Discovery
1. **Directory (`/clubs`):** Browse active campus clubs with logos, taglines, and categories.
2. **Club Profile (`/clubs/[slug]`):** View club description, social links, contact info, active/past events, and officer roster with custom role badges.

---

## 2. Club Organiser (`club.eventlify.in`)

### 2.1 Club Onboarding Application
1. **Application Submission (`/clubs/apply`):** Prospective club lead fills out application form (Name, Proposed Slug, Category, Description, Logo URL, Lead Contact Email).
2. **Pending Queue:** Application is saved with `PENDING` status. Lead receives a tracking URL (`/clubs/apply/status`).
3. **Super Admin Review:** Platform admin reviews the application in `admin.eventlify.in/applications`.
4. **Approval / Rejection:**
   - **If Approved:** Club entry is created with status `ACTIVE`, applicant is added as `ADMIN` in `club_members`, and lead gains access to `club.eventlify.in`.
   - **If Rejected:** Application status updates to `REJECTED` with a feedback note explaining the decision.

### 2.2 Club Management & Branding
- Access `club.eventlify.in/settings` to update Club Name, Description, Logo URL, Cover Banner, WhatsApp/Email contacts, and social links (Instagram, LinkedIn, GitHub).

### 2.3 Custom Roles Management
1. **Create Role (`club.eventlify.in/roles`):** Specify Role Name (e.g. *"Tech Lead"*), assign custom HEX color, set rank hierarchy, and toggle granular permissions (`MANAGE_CLUB`, `MANAGE_ROLES`, `MANAGE_MEMBERS`, `MANAGE_EVENTS`, `MANAGE_ATTENDANCE`, `MANAGE_API_KEYS`).
2. **Assign Role (`club.eventlify.in/members`):** Search student by USN or email and assign one or more custom roles. Roles display publicly on profiles with custom color badges.

### 2.4 Event Creation & Editing
1. **Create Event (`club.eventlify.in/events/new`):** Input title, schedule, min/max team size, free vs paid status, fee amount, UPI ID, and QR code image URL.
2. **Edit Event (`club.eventlify.in/events/[slug]/edit`):** Update details, extend registration deadlines, modify cover art, or cancel an event.

### 2.5 Payment Proof Verification Queue
1. **Review Pending Registrations (`club.eventlify.in/events/[slug]/payments`):** Officers inspect student details, submitted UTR number, and high-resolution payment proof screenshot.
2. **Approve Payment:** Status updates to `APPROVED`. Ticket pass with check-in QR code is issued to the student.
3. **Reject Payment:** Status updates to `REJECTED` with a feedback reason (e.g. *"Transaction ID mismatch"*).

### 2.6 Door Check-In & Attendance
1. **QR Camera Scanner:** Scan student entry pass QR code using device camera for instant check-in.
2. **Manual Check-In:** Search student by USN or Name to log check-in manually.
3. **Turnout Stats & CSV:** Track real-time turnout percentage and export complete attendee list to CSV.

### 2.7 BaaS API Key & CORS
- Access `club.eventlify.in/settings/api` to generate secret external API keys (`ev_live_...`) and configure allowed domain origins (e.g. `["https://acm-bmsce.in"]`).

---

## 3. Platform Admin (`admin.eventlify.in`)

### 3.1 Platform Dashboard
- View executive KPIs: Total Registered Students, Total Active Clubs, Pending Applications, Total Events, Total Registrations, and Turnout Rate.

### 3.2 Onboarding Application Review
- Access `admin.eventlify.in/applications` to inspect pending club applications. 1-click Approve (creates active club and assigns admin) or Reject with feedback.

### 3.3 Global Club & Event Moderation
- Access `admin.eventlify.in/clubs` and `/events` to search all clubs/events. Suspend/reactivate clubs, feature events on the homepage, or emergency delete violating events.

### 3.4 User System Role Control
- Access `admin.eventlify.in/users` to search platform users by USN/Email and promote/demote `SUPER_ADMIN` system roles.

---

## 4. AI Microservice (`eventlify-ai-service`)

### 4.1 Student ID Card OCR Scanner
- Upload ID photo $\rightarrow$ Python OpenCV crops boundary and enhances contrast $\rightarrow$ EasyOCR / Tesseract extracts Name, USN, Department, and PFP photo $\rightarrow$ Next.js updates user profile record.

### 4.2 Automated Certificate Generator
- Completed event $\rightarrow$ Officer triggers certificate generation $\rightarrow$ Python ReportLab/Pillow renders vector PDF and PNG certificates with student name, award tier, and cryptographic verification QR code $\rightarrow$ Download link issued to student dashboard.

### 4.3 Conversational LLM Data Ingestion Agent
- User pastes raw unstructured text (WhatsApp flyer, event text, officer list) into chat modal $\rightarrow$ Python LLM agent parses text into validated Event JSON or Role Array $\rightarrow$ 1-click batch insertion into database.
