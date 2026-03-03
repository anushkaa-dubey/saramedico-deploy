# Patient Onboarding Flow

## 1. Complete Patient Onboarding (Doctor-Led)

```mermaid
sequenceDiagram
    actor Doctor
    actor Patient
    participant API as Backend API
    participant DB as PostgreSQL
    participant Email as Email Service

    Note over Doctor,API: Patients CANNOT self-register.\nOnly doctors can create patient profiles.

    %% Step 1: Doctor creates patient
    Doctor->>API: POST /patients\n{\n  full_name: "Amit Sharma",\n  date_of_birth: "1970-01-01",\n  gender: "male",\n  phone: "+919876543210",\n  email: "amit@example.com",\n  address: "...",\n  medical_record_number: "MRN001"\n}\nAuthorization: Bearer {doctor_token}

    API->>DB: INSERT patients\n{encrypted: full_name, phone, email}\n{plain: dob, gender, org_id, doctor_id}
    API-->>Doctor: 201 {patient_id, full_name, mrn}

    %% Step 2: Patient creates their auth account
    Patient->>API: POST /auth/register\n{\n  email: "amit@example.com",\n  password: "SecurePass@1",\n  full_name: "Amit Sharma",\n  role: "patient"\n}
    API->>DB: INSERT users {email, hashed_password, role="patient"}
    API->>Email: Send verification email
    API-->>Patient: 201 {user_id}

    Patient->>API: POST /auth/verify-email {token}
    API-->>Patient: 200 verified

    %% Step 3: Patient grants doctor access
    Patient->>API: POST /permissions/grant-doctor-access\n{\n  doctor_id: "uuid",\n  ai_access_permission: true\n}\nAuthorization: Bearer {patient_token}
    API->>DB: INSERT data_access_grants
    API-->>Patient: 201 {grant_id}

    Note over Doctor,Patient: Doctor can now access patient documents,\nuse AI chat, and view patient data
```

---

## 2. Doctor Manages Patient Data

```mermaid
flowchart TD
    A[Doctor — Authenticated] --> B{Patient Management}

    B -->|GET /patients| C[List all patients in org]
    B -->|GET /patients/id| D[Get patient profile\nRequires DataAccessGrant]
    B -->|PUT /patients/id| E[Update patient info\ndob, address, emergency contact]
    B -->|DELETE /patients/id| F[Soft-delete patient]

    B -->|GET /patients/id/health| G[Patient health metrics\nBMI, vitals summary]
    B -->|GET /patients/id/recent-doctors| H[List doctors who treated patient]
    B -->|GET /patients/id/details| I[Full dashboard details\nfor doctor dashboard view]
```

---

## 3. Medical History

```mermaid
sequenceDiagram
    actor Doctor
    participant API as Backend API
    participant DB as PostgreSQL

    Doctor->>API: POST /doctor/medical-history\n{\n  patient_id: "uuid",\n  condition: "Type 2 Diabetes",\n  diagnosed_date: "2020-03-15",\n  notes: "HbA1c = 8.2, on Metformin"\n}\nAuthorization: Bearer {doctor_token}

    API->>DB: INSERT medical_history
    API-->>Doctor: 201 {id, patient_id, condition}
```

---

## 4. Patient Data Access Flow Summary

```mermaid
flowchart LR
    A[Doctor creates patient\nPOST /patients] --> B[Patient sets up auth\nPOST /auth/register]
    B --> C[Patient grants access\nPOST /permissions/grant-doctor-access]
    C --> D[Doctor uploads document\nPOST /documents/upload]
    D --> E[Doctor processes for AI\nPOST /doctor/ai/process-document]
    E --> F[Doctor chats with AI\nabout patient data\nPOST /doctor/ai/chat/doctor]
    C --> G[Patient chats about\nown data\nPOST /doctor/ai/chat/patient]
```

---

## 5. Doctor's Patient Overview Routes

```mermaid
flowchart LR
    A[Doctor Dashboard] --> B[GET /doctor/patients\nAll my patients]
    A --> C[GET /doctor/patients/id/documents\nPatient's uploaded docs]
    A --> D[GET /doctor/id/recent-patients\nLast seen patients]
    A --> E[GET /doctor/id/history\nFull consultation history]
    A --> F[GET /doctor/me/dashboard\nDoctor KPI dashboard]
