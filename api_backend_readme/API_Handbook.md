# Sara Medical Backend — API Handbook for Frontend Developers

Below is the complete API reference ensuring the frontend developer can directly copy-paste JSON into Swagger and successfully test the flows without facing paths or SignatureDoesNotMatch errors.

---

## 🏗️ 1. Authentication Endpoints

### 1.1 `POST /api/v1/auth/register`
**Short Description:** Register a new user (Doctor, Staff, or Admin).
**Required Headers:** `Content-Type: application/json`
**Authentication Requirement:** None
**Status Codes:** `201 Created`, `400 Bad Request`

**Sample JSON Request Body:**
```json
{
  "email": "dr.frontend@saratest.com",
  "password": "TestPass123!",
  "confirm_password": "TestPass123!",
  "full_name": "Dr. Frontend User",
  "role": "doctor",
  "organization_name": "Sara Test Hospital",
  "phone_number": "+11234567890"
}
```

**Expected JSON Success Response (201):**
```json
{
  "id": "353d735a-5470-44aa-ae35-2ab5070800c3",
  "email": "dr.frontend@saratest.com",
  "full_name": "Dr. Frontend User",
  "role": "doctor",
  "is_verified": false,
  "organization_id": "abc12345-0000-0000-0000-000000000000",
  "created_at": "2026-03-03T04:15:00Z"
}
```

**Expected JSON Error Response (400):**
```json
{
  "detail": "Email already registered"
}
```

---

### 1.2 `POST /api/v1/auth/login`
**Short Description:** Login to retrieve JWT Access and Refresh Tokens.
**Required Headers:** `Content-Type: application/json`
**Authentication Requirement:** None
**Status Codes:** `200 OK`, `401 Unauthorized`

**Sample JSON Request Body:**
```json
{
  "email": "dr.frontend@saratest.com",
  "password": "TestPass123!"
}
```

**Expected JSON Success Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": "353d735a-5470-44aa-ae35-2ab5070800c3",
    "email": "dr.frontend@saratest.com",
    "full_name": "Dr. Frontend User",
    "role": "doctor"
  }
}
```

**Expected JSON Error Response (401):**
```json
{
  "detail": "Incorrect email or password"
}
```

---

## 🧑‍⚕️ 2. Patient Management

### 2.1 `POST /api/v1/patients`
**Short Description:** Onboard a new Patient.
**Required Headers:** `Content-Type: application/json`, `Authorization: Bearer <token>`
**Authentication Requirement:** Required (Doctor/Admin)
**Status Codes:** `201 Created`, `403 Forbidden`

**Sample JSON Request Body:**
```json
{
  "full_name": "John Doe",
  "date_of_birth": "1985-06-15",
  "gender": "male",
  "blood_type": "O+",
  "phone_number": "+11234567891",
  "email": "john.frontend@patient.com",
  "address": "123 Application St, Web City",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+11234567892"
}
```

**Expected JSON Success Response (201):**
```json
{
  "id": "7f2a1b3c-0000-0000-0000-000000000000",
  "mrn": "MRN-20260303-001",
  "full_name": "John Doe",
  "date_of_birth": "1985-06-15",
  "gender": "male",
  "blood_type": "O+",
  "phone_number": "+11234567891",
  "email": "john.frontend@patient.com",
  "organization_id": "abc12345-0000-0000-0000-000000000000",
  "created_at": "2026-03-03T05:00:00Z"
}
```

**Expected JSON Error Response (400):**
```json
{
  "detail": "A patient with this email already exists"
}
```

---

## 📂 3. Document Management (Files correctly process to MinIO bucket)

> **Important Fix Note**: The [storage_path](file:///media/omkar/DATA/Omkar/CODE-111/Liomonk/Sara_medical_backend-main/app/services/storage_service.py#110-130) issues returning `/tmp/` leading to `SignatureDoesNotMatch` errors and `//tmp` double slashes are fully resolved. Storage correctly uses `organization_id/patient_id/...` pattern without double-slashes.

### 3.1 `POST /api/v1/documents/upload-url`
**Short Description:** Obtain a MinIO Presigned URL for uploading a file directly from Frontend.
**Required Headers:** `Content-Type: application/json`, `Authorization: Bearer <token>`
**Authentication Requirement:** Required (Doctor)
**Status Codes:** `201 Created`, `403 Forbidden`, `404 Not Found`

**Sample JSON Request Body:** (Note: Attributes are camelCase)
```json
{
  "fileName": "lab_results.pdf",
  "fileType": "application/pdf",
  "fileSize": 204800,
  "patientId": "7f2a1b3c-0000-0000-0000-000000000000"
}
```

**Expected JSON Success Response (201):**
```json
{
  "documentId": "d1e2f3a4-0000-0000-0000-000000000000",
  "uploadUrl": "http://localhost:9010/saramedico-documents/abc12345-0000-0000-0000-000000000000/7f2a1b3c-00.../lab_results.pdf?X-Amz-Algorithm=...",
  "expiresIn": 3600
}
```

**Expected JSON Error Response (403):**
```json
{
  "detail": "Access Denied: You do not have permission to upload documents for this patient."
}
```

---

### 3.2 `POST /api/v1/documents/{document_id}/confirm`
**Short Description:** Confirm that the MinIO direct upload is complete so the backend begins processing.
**Required Headers:** `Content-Type: application/json`, `Authorization: Bearer <token>`
**Authentication Requirement:** Required (Doctor)
**Status Codes:** `200 OK`, `404 Not Found`

**Sample JSON Request Body:**
```json
{
  "metadata": {
    "title": "Lab Results",
    "category": "lab_report",
    "notes": "Patient CBC results"
  }
}
```

**Expected JSON Success Response (200):**
```json
{
  "id": "d1e2f3a4-0000-0000-0000-000000000000",
  "patientId": "7f2a1b3c-0000-0000-0000-000000000000",
  "fileName": "lab_results.pdf",
  "fileType": "application/pdf",
  "fileSize": 204800,
  "category": "lab_report",
  "title": "Lab Results",
  "notes": "Patient CBC results",
  "uploadedAt": "2026-03-03T05:05:00Z",
  "uploadedBy": "353d735a-5470-44aa-ae35-2ab5070800c3"
}
```

**Expected JSON Error Response (404):**
```json
{
  "detail": "Document not found"
}
```

---

### 3.3 `GET /api/v1/documents`
**Short Description:** List patient documents with active (working) `downloadUrl`.
**Required Headers:** `Authorization: Bearer <token>`
**Authentication Requirement:** Required (Doctor)
**Status Codes:** `200 OK`

**Sample JSON Request Query Params:**
`?patient_id=7f2a1b3c-0000-0000-0000-000000000000`

**Expected JSON Success Response (200):**
```json
{
  "documents": [
    {
      "id": "d1e2f3a4-0000-0000-0000-000000000000",
      "patientId": "7f2a1b3c-0000-0000-0000-000000000000",
      "fileName": "lab_results.pdf",
      "fileType": "application/pdf",
      "fileSize": 204800,
      "category": "lab_report",
      "title": "Lab Results",
      "uploadedAt": "2026-03-03T05:05:00Z",
      "downloadUrl": "http://localhost:9010/saramedico-documents/abc12345.../lab_results.pdf?X-Amz-..."
    }
  ],
  "total": 1
}
```

---

## 🔐 4. Data Permissions

### 4.1 `POST /api/v1/permissions/grant-doctor-access`
**Short Description:** Generate record access to a specific doctor.
**Required Headers:** `Content-Type: application/json`, `Authorization: Bearer <token>`
**Authentication Requirement:** Required (Patient / Admin)
**Status Codes:** `201 Created`

**Sample JSON Request Body:**
```json
{
  "patient_id": "7f2a1b3c-0000-0000-0000-000000000000",
  "doctor_id": "353d735a-5470-44aa-ae35-2ab5070800c3"
}
```

**Expected JSON Success Response (201):**
```json
{
  "id": "p1q2r3s4-0000-0000-0000-000000000000",
  "patient_id": "7f2a1b3c-0000-0000-0000-000000000000",
  "doctor_id": "353d735a-5470-44aa-ae35-2ab5070800c3",
  "granted_at": "2026-03-03T05:00:00Z",
  "ai_access_permission": false,
  "access_level": "read_only"
}
```

---

## 📅 5. Appointments & Consultations

### 5.1 `POST /api/v1/appointments`
**Short Description:** Request an appointment from Patient to Doctor.
**Required Headers:** `Content-Type: application/json`, `Authorization: Bearer <token>`
**Authentication Requirement:** Required (Patient)
**Status Codes:** `201 Created`

**Sample JSON Request Body:**
```json
{
  "doctor_id": "353d735a-5470-44aa-ae35-2ab5070800c3",
  "appointment_type": "consultation",
  "scheduled_at": "2026-03-10T10:00:00Z",
  "duration_minutes": 30,
  "notes": "Review lab results"
}
```

**Expected JSON Success Response (201):**
```json
{
  "id": "a1b2c3d4-0000-0000-0000-000000000000",
  "patient_id": "7f2a1b3c-0000-0000-0000-000000000000",
  "doctor_id": "353d735a-5470-44aa-ae35-2ab5070800c3",
  "appointment_type": "consultation",
  "status": "pending",
  "scheduled_at": "2026-03-10T10:00:00Z",
  "duration_minutes": 30
}
```

### 5.2 `POST /api/v1/consultations`
**Short Description:** Start a consultation (triggers tracking & Google Meet links).
**Required Headers:** `Content-Type: application/json`, `Authorization: Bearer <token>`
**Authentication Requirement:** Required (Doctor)
**Status Codes:** `201 Created`

**Sample JSON Request Body:**
```json
{
  "patient_id": "7f2a1b3c-0000-0000-0000-000000000000",
  "appointment_id": "a1b2c3d4-0000-0000-0000-000000000000",
  "visit_type": "video",
  "chief_complaint": "Follow-up",
  "scheduled_at": "2026-03-10T10:00:00Z"
}
```

**Expected JSON Success Response (201):**
```json
{
  "id": "c1d2e3f4-0000-0000-0000-000000000000",
  "patient_id": "7f2a1b3c-0000-0000-0000-000000000000",
  "doctor_id": "353d735a-5470-44aa-ae35-2ab5070800c3",
  "status": "scheduled",
  "visit_type": "video",
  "meet_link": "https://meet.google.com/abc-defg-hij",
  "scheduled_at": "2026-03-10T10:00:00Z"
}
```

---

## 🤖 6. AI Agent Chat

### 6.1 `POST /api/v1/doctor/ai/chat/patient`
**Short Description:** Chat with Patient records via LLM Streaming SSE.
**Required Headers:** `Content-Type: application/json`, `Authorization: Bearer <token>`
**Authentication Requirement:** Required (Doctor/Patient)
**Status Codes:** `200 OK`

**Sample JSON Request Body:**
```json
{
  "patient_id": "7f2a1b3c-0000-0000-0000-000000000000",
  "document_id": "d1e2f3a4-0000-0000-0000-000000000000",
  "query": "What are the key findings in this blood test report?"
}
```

**Expected Response Stream (text/event-stream):**
```text
data: {"token": "The "}
data: {"token": "key "}
data: {"token": "findings "}
data: {"token": "show..."}
data: [DONE]
```

### 6.2 `GET /api/v1/doctor/ai/chat-history/patient`
**Short Description:** Fetch full AI conversational history.
**Required Headers:** `Authorization: Bearer <token>`
**Authentication Requirement:** Required
**Status Codes:** `200 OK`

**Sample URL:**
`GET /api/v1/doctor/ai/chat-history/patient?patient_id=7f2a1b3c-0000-0000-0000-000000000000`

**Expected JSON Success Response (200):**
```json
[
  {
    "id": "h1i2j3k4-0000-0000-0000-000000000000",
    "patient_id": "7f2a1b3c-0000-0000-0000-000000000000",
    "query": "What are the key findings in this blood test report?",
    "response": "The key findings show...",
    "document_id": "d1e2f3a4-0000-0000-0000-000000000000",
    "created_at": "2026-03-03T05:10:00Z"
  }
]
```
