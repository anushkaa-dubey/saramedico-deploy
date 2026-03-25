# API Flows — Complete Documentation

This folder contains **step-by-step Mermaid diagrams** for every major feature in the Sara Medical backend.

## Files in This Folder

| File | Feature |
|------|---------|
| [01_auth_flow.md](./01_auth_flow.md) | Registration, Login, MFA, Token Refresh |
| [02_document_upload_flow.md](./02_document_upload_flow.md) | Upload documents, AI processing, chunks |
| [03_ai_chat_flow.md](./03_ai_chat_flow.md) | Chat with AI (doctor & patient), RAG context |
| [04_soap_notes_flow.md](./04_soap_notes_flow.md) | SOAP note generation via Bedrock |
| [05_calendar_flow.md](./05_calendar_flow.md) | Calendar events CRUD + day/month views |
| [06_consultation_flow.md](./06_consultation_flow.md) | Consultation scheduling, Google Meet, updates |
| [07_permissions_flow.md](./07_permissions_flow.md) | Data access grants, AI permissions |
| [08_admin_hospital_flow.md](./08_admin_hospital_flow.md) | Admin overview, settings, accounts, invites |
| [09_patient_onboarding_flow.md](./09_patient_onboarding_flow.md) | Doctor onboards patient, profile, records |
| [10_appointments_flow.md](./10_appointments_flow.md) | Appointment request, approval, status updates |

---

> All flows assume the user is already authenticated unless stated otherwise.  
> All API endpoints are prefixed with `/api/v1`.
