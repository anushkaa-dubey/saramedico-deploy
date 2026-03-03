# API Alignment Report: Frontend vs Backend

This report summarizes the alignment between the frontend documentation (in `documentation/`) and the backend documentation (in `api_backend_readme/`), and highlights discrepancies found in endpoints, request structures, and unsupported domains.

## ✅ Aligned APIs
The following APIs are well-aligned between frontend and backend specifications:

- **Authentication:** `POST /auth/register`, `POST /auth/login`, `GET /auth/me`.
- **Patients:** 
  - `GET /patients/:id`
  - `GET /appointments/patient-appointments`
  - `POST /appointments`
  - `PATCH /appointments/{id}/status`
- **Doctors:**
  - `GET /doctor/tasks` (GET and POST)
  - `GET /doctor/patients`
  - `GET /doctor/patients/{patient_id}/documents`
  - Onboarding a patient (Frontend: `POST /patients`, Backend: `POST /doctor/onboard-patient` / `POST /patients`)
  - `GET /doctor/appointments`
  - `PATCH /doctor/profile`
  - `GET /doctors/search`
- **Consultations/Hospital:**
  - `GET /consultations`, `POST /consultations`, `GET /consultations/{id}`, `PUT /consultations/{id}`.
- **Documents:**
  - `POST /documents/upload-url`
  - `POST /documents/{id}/confirm`
  - `POST /documents/upload`
- **Artificial Intelligence:**
  - `POST /doctor/ai/process-document`
  - `POST /doctor/ai/chat/doctor`
  - `POST /doctor/ai/chat/patient`
  - `GET /doctor/ai/chat-history/doctor`
  - `GET /doctor/ai/chat-history/patient`

---

## ❌ Discrepancies & Mismatches

### 1. Missing Backend Implementations (Defined in Frontend, Missing in Backend Docs)
*These endpoints are expected by the frontend but do not appear in the backend documentation workflow diagrams:*
- **Authentication:**
  - `POST /auth/logout`
  - `PATCH /auth/me` (Backend uses `PATCH /doctor/profile` for doctors, but frontend expects generic `/me` profile update)
  - `POST /auth/forgot-password`
- **Doctor Operations:**
  - `DELETE /doctor/tasks/{taskId}`
  - `GET /doctor/{doctor_id}/recent-patients`
  - `GET /doctor/activity`
  - `GET /doctor/me/dashboard`
- **Hospital/Consultation:**
  - `GET /consultations/queue/metrics` (Queue statistics)
- **Artificial Intelligence:**
  - `POST /documents/{document_id}/analyze` (Backend expects `POST /doctor/ai/process-document`)
  - `GET /documents/{document_id}/status` (Frontend expects AI analysis status here, but backend provides upload status here. AI status in backend is tracked via `aiStatus` field in the Consultation object).
- **Calendar (Entire Domain):**
  - Frontend `Calendar.md` expects a full suite of `/calendar` endpoints (`GET /calendar/month/...`, `GET /calendar/day/...`, `GET /calendar/events`, `POST /calendar/events`, `PUT /calendar/events/{id}`, `DELETE /calendar/events/{id}`).
  - Backend documentation has no mention of the Calendar domain.

### 2. Missing Frontend Implementations (Defined in Backend, Missing in Frontend Docs)
*These endpoints are defined in the backend workflow but are missing from the frontend specifications:*
- **Permissions Domain:**
  - Backend defines robust permission mechanisms for patients to grant/revoke access to doctors (`POST /permissions/request`, `POST /permissions/grant-doctor-access`, `DELETE /permissions/revoke-doctor-access`, `GET /permissions/check`).
  - The frontend documentation currently lacks a `Permissions.md` or any integration details for managing these access grants.
- **Medical History (Doctor Uploads):**
  - Backend defines `POST /doctor/medical-history` (custom multipart upload endpoint with category tagging). Frontend only specifies the standard Documents flow (`/documents/upload`).

### 3. Structural Differences & Clarifications needed
- **Patient Onboarding Endpoint:** Frontend `Doctor.md` lists `POST /patients` to onboard a patient, whereas backend emphasizes `POST /doctor/onboard-patient` which automatically grants `DataAccessGrant` permissions. Frontend should ideally use `POST /doctor/onboard-patient` to benefit from the auto-grant flow.
- **Google Meet:** Consultations now use Google Meet. The backend provides a `meet_link` in the Consultation or Appointment object. The frontend strictly uses this link for joining sessions.
