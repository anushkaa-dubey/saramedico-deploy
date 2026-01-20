# Sara Medical Website Comprehensive Analysis

This document provides a detailed breakdown of the Sara Medical frontend application structure, workflows, and role-based functionalities, designed to guide an AI agent in development and maintenance tasks.

## 1. Projects Structure & Technology Stack

**Technology Stack:**
- **Framework:** Next.js 16+ (App Router)
- **Styling:** CSS Modules (global styles in `app/globals.css`, component-specific in `*.module.css`)
- **Language:** JavaScript/TypeScript (mixed)
- **Authentication:** Custom 2FA flow (role-based)

**Directory Structure:**
```
app/
├── layout.jsx            # Root layout
├── page.tsx              # Landing page (Role selection)
├── globals.css           # Global theme & base styles
├── auth/                 # Authentication System
│   ├── login/            # Login page (Dynamic role detection)
│   ├── signup/           # Signup page
│   ├── 2fa/              # Two-Factor Authentication
│   │   ├── login/        # 2FA for Login
│   │   └── signup/       # 2FA for Signup
│   └── onboarding/       # Role-specific onboarding
│       └── doctor/       # 3-Step Doctor workflow
└── dashboard/            # Protected Role Dashboards
    ├── admin/            # Hospital Admin Interface
    ├── doctor/           # Doctor Clinical Workspace
    └── patient/          # Patient Health Portal
```

---

## 2. Core Workflows & Navigation

### 2.1 Authentication Flow
The application uses a role-based authentication system driven by URL query parameters (`?role=...`) and session storage.

1.  **Landing Page (`/app/page.tsx`)**
    *   **Purpose:** Entry point for users to select their role.
    *   **Roles Supported:** Patient, Doctor, Admin, Hospital.
    *   **Actions:**
        *   "Login": Redirects to `/auth/login?role=[role_id]`
        *   "Sign Up": Redirects to `/auth/signup?role=[role_id]`

2.  **Login (`/app/auth/login/page.jsx`)**
    *   **Logic:** Accepts email/password. Detected role drives redirection.
    *   **Redirection:** Successfully logging in redirects to `/auth/2fa/login`.

3.  **Signup (`/app/auth/signup/page.tsx`)**
    *   **Logic:** Creates new account (stubbed).
    *   **Redirection:** Redirects to `/auth/2fa/signup`.

4.  **2FA Verification (`/app/auth/2fa/...`)**
    *   **Login Flow:** Verifies code -> Redirects strictly to `/dashboard/[role]`.
    *   **Signup Flow:**
        *   **Doctor:** Redirects to `/auth/signup/onboarding/doctor/step-1` (Special Onboarding).
        *   **Others:** Redirects directly to `/dashboard/[role]`.

### 2.2 Doctor Onboarding Workflow
A unique 3-step process found in `/app/auth/signup/onboarding/doctor/`:
*   **Step 1:** Specialty Selection (Grid of medical icons).
*   **Step 2:** Document Upload (Proof of practice/license).
*   **Step 3:** Audio Calibration (Microphone check for voice features).
*   **Completion:** Redirects to `/dashboard/doctor`.

---

## 3. Role-Based Dashboards

### 3.1 Hospital Admin (`/dashboard/admin`)
**Purpose:** Manage hospital operations, user accounts, and system settings.
**Key Pages:**
*   **Dashboard (`/dashboard/admin/page.jsx`):**
    *   **Header:** Start/Overview page.
    *   **Components:** Recent Activity Table, Security Summary, System Alerts, Quick Actions.
*   **Manage Accounts (`.../manage-accounts`):** User list and invitation system.
*   **Settings (`.../settings`):** Configuration options.

**Styling:** `AdminDashboard.module.css` - Dark/Professional theme.

### 3.2 Doctor Workspace (`/dashboard/doctor`)
**Purpose:** Clinical management, patient consultations, and medical records.
**Key Pages:**
*   **Dashboard (`/dashboard/doctor/page.jsx`):**
    *   **Header:** Schedule overview, quick buttons (Upload, Add Person, Schedule, Start Session).
    *   **Left Column:** Next Patient Card (vitals/details), Recent Activity Table.
    *   **Right Column:** Tasks Section.
*   **Live Consult:** Real-time video/audio interface for patient visits.
*   **Chart Review:** Reviewing patient medical history (PDF viewer, AI chat).
*   **Patients:** Roster management.
*   **Team:** Collaboration with other staff.

**Styling:** `DoctorDashboard.module.css` - Clean, data-dense interface.

### 3.3 Patient Portal (`/dashboard/patient`)
**Purpose:** Personal health management, appointment access, and record viewing.
**Key Pages:**
*   **Dashboard (`/dashboard/patient/page.jsx`):**
    *   **Header:** Welcome message, Date, Mobile search.
    *   **Left Column:** Up Next Card (Appointment), Recent Visits list.
    *   **Right Column:** Vitals Summary, Quick Actions.
*   **My Records:** Access lab results and history.
*   **Appointments:** Calendar and scheduling.
*   **Messages:** Communication with providers.

**Styling:** `PatientDashboard.module.css` - Friendly, accessible, card-based layout.

---

## 4. Styling & Design System

*   **Global (`globals.css`):**
    *   **Font:** Inter (Google Fonts).
    *   **Themes:** Dark/Light mode supported (CSS variables used implicitly via hex codes in modules).
    *   **Auth Color Scheme:** Dark navy sidebar (`#0c1424`), split layout.

*   **Component Styling:**
    *   Heavily relies on CSS Modules.
    *   **Common Patterns:** Flexbox layouts, Card-based containers with shadows, Responsive grids.

*   **Responsiveness:**
    *   **Mobile (<768px):** Sidebars become toggleable drawers (hamburger menu).
    *   **Tablet (<1024px):** Adjusted padding and 2-column grids becoming 1-column.

---

## 5. File Location Reference for Agent

| Role | Page | File Path |
| :--- | :--- | :--- |
| **Auth** | Login | `/app/auth/login/page.jsx` |
| | Signup | `/app/auth/signup/page.tsx` |
| | 2FA Login | `/app/auth/2fa/login/page.jsx` |
| **Admin** | Dashboard | `/app/dashboard/admin/page.jsx` |
| | Sidebar | `/app/dashboard/admin/components/Sidebar.jsx` |
| **Doctor** | Dashboard | `/app/dashboard/doctor/page.jsx` |
| | Sidebar | `/app/dashboard/doctor/components/Sidebar.jsx` |
| | Onboarding 1 | `/app/auth/signup/onboarding/doctor/step-1/page.jsx` |
| **Patient** | Dashboard | `/app/dashboard/patient/page.jsx` |
| | Sidebar | `/app/dashboard/patient/components/Sidebar.jsx` |
