# Permissions & Data Access Grant Flow

## 1. Granting a Doctor Access to Patient Data

```mermaid
sequenceDiagram
    actor Patient
    actor Doctor
    participant API as Backend API
    participant DB as PostgreSQL

    Note over Patient,Doctor: Patient must have an auth account\n(POST /auth/register with role="patient")

    Patient->>API: POST /permissions/grant-doctor-access\n{\n  doctor_id: "uuid",\n  ai_access_permission: true\n}\nAuthorization: Bearer {patient_token}

    API->>DB: INSERT data_access_grants\n{patient_id, doctor_id,\n ai_access_permission: true,\n status: "active"}
    API-->>Patient: 201 {grant_id, doctor_id, ai_access_permission}

    Note over Doctor,API: Doctor can now access patient documents & chat

    Doctor->>API: GET /documents/{document_id}\nAuthorization: Bearer {doctor_token}
    API->>DB: Check DataAccessGrant\nWHERE patient_id=X AND doctor_id=current_user
    DB-->>API: Grant exists & active
    API-->>Doctor: 200 {document data}
```

---

## 2. Requesting Access (Doctor Initiates)

```mermaid
sequenceDiagram
    actor Doctor
    participant API as Backend API
    participant DB as PostgreSQL

    Doctor->>API: POST /permissions/request\n{\n  patient_id: "uuid",\n  reason: "Ongoing treatment"\n}\nAuthorization: Bearer {doctor_token}

    API->>DB: INSERT access_request\n{doctor_id, patient_id, status: "pending"}
    API-->>Doctor: 201 {request_id, status: "pending"}

    Note over Doctor,API: Patient must approve (currently manual)
```

---

## 3. Revoking Access

```mermaid
sequenceDiagram
    actor Patient
    participant API as Backend API
    participant DB as PostgreSQL

    Patient->>API: DELETE /permissions/revoke-doctor-access\n{doctor_id: "uuid"}\nAuthorization: Bearer {patient_token}

    API->>DB: DELETE data_access_grants\nWHERE patient_id=current_user\nAND doctor_id=X

    API-->>Patient: 200 {message: "Access revoked"}
```

---

## 4. Checking Permissions

```mermaid
flowchart LR
    A[GET /permissions/check\n?patient_id=X&doctor_id=Y] --> B[DB: SELECT FROM data_access_grants]
    B --> C{Grant exists?}
    C -->|Yes| D[200 {has_access: true,\nai_access_permission: true/false}]
    C -->|No| E[200 {has_access: false}]
```

---

## 5. Permission Impact Map

```mermaid
flowchart TD
    A[DataAccessGrant\nai_access_permission = true] --> B[Doctor can access:\nGET /documents/id\nGET /patients/id]
    A --> C[AI Chat enabled:\nPOST /doctor/ai/chat/doctor\nPOST /doctor/ai/chat/patient]
    A --> D[SOAP notes visible\nin AI chat context]

    E[DataAccessGrant\nai_access_permission = false] --> F[Doctor can view patient\nbut AI chat is blocked]
