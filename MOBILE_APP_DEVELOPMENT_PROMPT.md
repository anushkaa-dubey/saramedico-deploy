Task: Build the "Sara Medical" mobile application (iOS/Android) using React Native / Flutter (specify preference). The app must mirror the functionality, role-based workflows, and premium aesthetic of the existing web platform.

## Design Language

*   **Theme:** Professional Medical Dark Mode with High-End "Glassmorphism".
*   **Color Palette:**
    *   **Background:** Deep Navy (`#0c1424`) to lighter Midnight Blue gradients.
    *   **Primary Action:** Bright Blue Gradient (`#4cc9f0` to `#4361ee`).
    *   **Text:** White (Primary), Cool Gray (`#94a3b8` - Secondary).
    *   **Status Colors:** Emerald (Completed), Amber (In Review), Red (Alerts).
*   **Typography:** Inter / San Francisco (Clean, modern sans-serif).
*   **Interactive Elements:** Touch-friendly cards, smooth transitions, bottom sheets for forms.

---

## 1. Authentication Module
**User Persona:** All users (Patient, Doctor, Admin) entry point.

**Screen Requirements:**
*   **A. Role Selection (Landing):**
    *   Visual: cards for "Patient", "Doctor", "Admin", "Hospital".
    *   Action: Tapping a card prompts "Login" or "Sign Up".
*   **B. Unified Login Screen:**
    *   Inputs: Email, Password.
    *   Social Login: Google/Apple options.
    *   Logic: Detects role and routes to 2FA.
*   **C. 2FA Input:**
    *   Visual: 6-digit PIN input with auto-focus.
    *   Success Action: Transitions to the specific Role Dashboard.
*   **D. Doctor Onboarding (Special Flow):**
    *   **Step 1:** Specialty Grid (Select from icons like Cardiology, Neurology).
    *   **Step 2:** Document Upload (File picker for licenses).
    *   **Step 3:** Audio Calibration (Microphone permission & test recording).

---

## 2. Patient Module
**User Persona:** A patient managing appointments, viewing records, and attending virtual visits.

**Navigation Structure (Bottom Tab):**
`Dashboard` | `Records` | `Appointments` | `Messages`

**Screen Requirements:**
*   **A. Patient Dashboard (Home):**
    *   **Header:** "Good Morning, [Name]" + Notification Bell.
    *   **Up Next Card:** Prominent card showing the *next* appointment time, doctor, and "Join" button.
    *   **Vitals Summary:** Horizontal scroll of slightly transparent cards (Heart Rate, BP, Weight).
    *   **Recent Visits:** Vertical list of past consultations.
*   **B. My Records Screen:**
    *   List view of lab results and history.
    *   Tap to view details (PDF viewer or structured text).
*   **C. Video Call Room (Critical):**
    *   Custom UI for Telehealth.
    *   Video feed + Mute/Camera controls.
    *   "Waiting Room" state before doctor joins.

---

## 3. Doctor Module
**User Persona:** A clinician managing a schedule, reviewing charts, and seeing patients.

**Navigation Structure (Bottom Tab):**
`Dashboard` | `Live Consult` | `Patients` | `Team` | `Settings`

**Screen Requirements:**
*   **A. Doctor Dashboard:**
    *   **Header:** Schedule summary (e.g., "5 Appointments remaining").
    *   **Quick Actions:** "Start Session" (Floating Action Button or prominent button).
    *   **Next Patient:** Comprehensive card with Patient Name, Reason for Visit, and "Chart Review" shortcut.
*   **B. Patient List (Roster):**
    *   Searchable list of patients.
    *   Filters: "All", "Today's Schedule".
*   **C. Live Consult (Tablet Optimized):**
    *   Split screen (or tabbed on mobile): Video Feed + SOAP Note taking area.
    *   Access to AI summary prompts.
*   **D. Chart Review:**
    *   Timeline view of patient history.
    *   AI Chat assistant overlay to "Ask about patient history".

---

## 4. Hospital Admin Module
**User Persona:** Administrator managing users and system alerts.

**Navigation Structure:**
`Overview` | `Accounts` | `Alerts` | `Settings`

**Screen Requirements:**
*   **A. Overview Dashboard:**
    *   **Key Metrics:** Total Patients, Active Doctors, System Status.
    *   **Recent Activity:** real-time log of system events (Logins, Reports Generated).
*   **B. Account Management:**
    *   List of doctors/staff.
    *   "Invite User" flow (Email invitation form).
*   **C. Security Center:**
    *   Status of 2FA enforcements and system locks.

---

## Technical Context for the Agent

*   **API Mapping:**
    *   Auth: Match web logic (Email/Password -> role detection).
    *   Data: Ensure field names match the web schema (e.g., `patient_id`, `appointment_time`, `soap_notes`).
*   **Assets:**
    *   Use the same SVG icons as the web (exported as React Native SVG or Vector Drawables).
    *   Maintain the specific Gradient Codes: `#359AFF` to `#9CCDFF` (Light Blue) and `#0d1b2a` (Background).
