# SaraMedico Complete API Integration & Roles Flow

This document provides a comprehensive overview of the full frontend-to-backend API integration achieved in SaraMedico, mapping all major functionalities, role-based workflows, and operational endpoints.

## 1. Environment & Network Configuration
- **API Base Setup**: The frontend uses a dynamic resolver (`services/apiConfig.js`) that automatically defaults to `process.env.NEXT_PUBLIC_API_URL` (which points to `http://localhost:8000/api/v1` for local development).
- **Authentication**: All requests requiring authenticated access consistently append Bearer tokens via the `getAuthHeaders` utility.
- **Error Handling**: Every fetch call uses the centralized `handleResponse` helper which gracefully extracts semantic FastAPI validation errors (`detail` arrays or strings) so users never see generic `[object Object]` errors.
- **CORS Handling**: The backend explicitly white-lists the frontend origins (`http://localhost:3000`) ensuring seamless Cross-Origin communication.

---

## 2. Role-Based Flows & Capabilities

### A. Patient Workflow
Patients have autonomous capability to handle their personal profile, search for doctors, book appointments, and review documents the doctor has shared.
- **Appointments & Booking**: Patients can initiate booking via `POST /api/v1/appointments`. Medical history sharing toggles trigger permissions via the backend `PermissionService`.
- **Viewing Medical Records**: Fetches through `GET /api/v1/documents`. The backend enforces that only records securely linked to the patient's UUID are returned.
- **AI Chat (Their Own Data)**: Patients can query their own history via `POST /api/v1/doctor/ai/chat/patient`.

### B. Doctor Workflow
The Doctor's dashboard is the core operational hub consisting of scheduling, documentation, and AI functionalities.
- **Dashboard & KPIs**: Fetches immediate patient activity, urgent tasks, and pending notes queue via `GET /api/v1/doctor/me/dashboard` and `GET /api/v1/doctor/activity`.
- **Calendar & Scheduling**: 
  - Retrieves day agendas and monthly overviews via new Calendar endpoints (`GET /api/v1/calendar/day/{date}`, `GET /api/v1/calendar/month/{year}/{month}`).
  - Custom events are modifiable (`POST`, `PUT`, `DELETE` to `/api/v1/calendar/events`).
  - Doctor approves patient requests via `POST /api/v1/appointments/{id}/approve` (which auto-generates Google Meet links).
- **Document Management**:
  - Doctors use a **presigned URL** approach: first hitting `POST /api/v1/documents/upload-url`, successfully putting the file directly into MinIO (bypassing backend authorization headers on the secondary PUT request to prevent AWS signature mismatch errors), and finalizing via `POST /api/v1/documents/{id}/confirm`.
- **AI Integration**:
  - Document RAG indexing triggers via `POST /api/v1/doctor/ai/process-document`.
  - Polling is wired up to `GET /api/v1/documents/{id}/status` waiting for `indexed` or `completed` status correctly!
  - `POST /api/v1/doctor/ai/chat/doctor` streams medical AI insights based on the patient history to the chat window.

### C. Admin & Hospital Workflows
Admins supervise operations, and hospitals monitor organizational metrics.
- **Document Upload via Admin Panel**: Admins can safely assist doctors heavily by also using the presigned URL flow logic via the exact same backend validations on `documents`. 
- **Hospital Structured Review Queue**: Aggregates all visits, their `visit_state` (Scheduled, Checked-In, Signed, Needs Review), and urgency via `GET /api/v1/consultations?limit=X`.

---

## 3. Critical Integrations Addressed in the Audit

1. **Document Upload Presigned Flow Fixed**: S3/MinIO explicitly forbids generic JWT `Authorization` headers when pushing arrays to a signed URL. Modifying `doctor.js` properly decoupled authentication from the actual S3 chunk payload while accurately committing the database confirmation (`/confirm`) properly with body payload metadata.
2. **CORS/Routing Errors Removed**: Resolved initial blocking bugs where local endpoints misconfigured IPs. Replaced hardcoded references. Database PostgreSQL dependencies (`vector`) completely verified and backend initialized successfully via Celery and workers.
3. **Calendar Patches Corrected**: The frontend previously sought out `PATCH /calendar/events/`, creating 405 Method Not Allowed errors. Validated and modified to conform to the backend's designated `PUT` parameter mapping format. 
4. **AI Processing Endpoint Wiring**: In the Doctor's Document List, the "Process with AI" originally pointed to a placeholder `/analyze` route. The correct Bedrock/Textract pipeline has now been mapped strictly to `POST /api/v1/doctor/ai/process-document`, ensuring reliable vector embeddings (`pgvector`) within `saramedico_dev`.
5. **AI Polling Infinite Loop Disconnected**: Updated frontend document polling conditions to correctly catch both `indexed` (actual value the backend yields on success if chunks > 0) and `completed`, avoiding hanging interfaces.

## 4. Overall Health & Production Readiness Status
- **Contracts**: ✅ Verified 
- **Date/Time consistency**: ✅ Handled natively through ISO formatting in the `doctor.js` handlers.
- **UUID & Schema Formatting**: ✅ Validated against Python Pydantic structures.
- **Stability**: ✅ No terminal server crashes or 500 Network errors observed.
