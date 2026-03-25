# SaraMedico Full-Stack Integration Guide

This document outlines the end-to-end integration between the SaraMedico Frontend (Next.js) and the SaraMedico Backend (FastAPI).

## 🚀 Roles & Clinical Workflows

### 1. Doctor Role
Empowers clinicians with AI-driven document analysis and session management.
- **Dashboard**: Real-time KPIs (Pending Notes, Clinical Records, Monthly Patients) and Activity Feed connected to `/doctor/me/dashboard` and `/doctor/activity`.
- **Clinical Chat**: Document-aware AI assistant in Chart Review (`/doctor/ai/chat`).
- **Patient Management**: Onboard new patients and view comprehensive records via `/doctor/patients`.
- **Task Management**: Integrated task board connected to `/doctor/tasks`.
- **Calendar**: Dynamic scheduling with Month/Day views via `/calendar`.

### 2. Patient Role
Provides patients access to their health records and easy booking.
- **Health Assistant**: AI-powered assistant to discuss health history and uploaded records.
- **Medical Records**: Securely upload and view lab reports/imaging via `/patient/medical-history`.
- **Appointments**: Request and view visit history via `/appointments`.
- **Profile**: Self-management of personal data via `/auth/me`.

### 3. Admin/Hospital Role
High-level oversight of clinic operations and system metrics.
- **Clinic Metrics**: Access to resource utilization and queue metrics via `/consultations/queue/metrics`.
- **Review Queue**: Advanced filtering for all clinic sessions via `/consultations`.
- **Department View**: Specialized view (e.g., Cardiology) with department-specific stats and calendars.
- **User Management**: Invite staff and manage permissions.

---

## 🛠 Features Integrated (End-to-End)

### 📂 Document Management (Docs Part)
- **High-Performance Upload**: Frontend uses a 3-step presigned URL flow (FastAPI -> S3/MinIO) for secure, large file uploads. 
- **Fallback**: Reliable multipart/form-data upload if direct storage access is unavailable.
- **Patient Linking**: All documents are cryptographically linked to patient IDs.
- **Endpoints**: `POST /documents/upload-url`, `POST /documents/{id}/confirm`, `GET /doctor/patients/{id}/documents`.

### 🤖 AI Integration
- **Contextual Chat**: Both Doctors and Patients have access to AI models that can "read" their medical documents.
- **Real-time Processing**: Documents are automatically processed for AI retrieval upon confirmation.
- **Endpoints**: `POST /doctor/ai/chat`, `POST /patient/ai/chat`.

### 🗓 Calendar & Scheduling
- **Dynamic Views**: Calendar is no longer static; it reflects actual database events.
- **Availability Grids**: Monthly view highlights busy days using green/red density indicators.
- **Endpoints**: `GET /calendar/month/{y}/{m}`, `GET /calendar/day/{date}`.

---

## 🔗 Technical Setup

### Backend API URL
All services are configured to communicate with the local backend by default:
- **URL**: `http://localhost:8000/api/v1`
- **Configuration**: Managed via `.env.local` (`NEXT_PUBLIC_API_URL`) and `services/apiConfig.js`.

### Authentication
- Uses **JWT (JSON Web Tokens)** stored in `localStorage`.
- All clinical requests include the `Authorization: Bearer <token>` header automatically via `getAuthHeaders()`.

### Fallback Logic (UI Strategy)
Where backend endpoints were available but missing clear UI entry points, we have added:
- **AI Health Assistant Button**: Added to Patient Dashboard Quick Actions for better discoverability.
- **Doctor Metrics Bar**: Added to the Doctor Dashboard to expose clinical KPIs.
- **Review Queue Filtering**: Integrated into Department pages to demonstrate administrative control.

---

## 🛠 Development Commands
- **Frontend**: `npm run dev` (Port 3000)
- **Backend**: `uvicorn app.main:app --reload` (Port 8000)

*Note: Google Meet integration is handled via server-side API hooks during appointment approval but is not part of the core frontend UI assets yet.*
