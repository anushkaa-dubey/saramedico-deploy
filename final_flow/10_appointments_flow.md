# Appointments Flow

## 1. Full Appointment Lifecycle

```mermaid
sequenceDiagram
    actor Patient
    actor Doctor
    participant API as Backend API
    participant DB as PostgreSQL
    participant Calendar as Calendar Service

    %% Step 1: Patient requests appointment
    Patient->>API: POST /appointments\n{\n  doctor_id: "uuid",\n  scheduled_at: "2026-03-15T09:00:00Z",\n  reason: "Annual checkup"\n}\nAuthorization: Bearer {patient_token}

    API->>DB: INSERT appointments\n{patient_id, doctor_id, status="pending"}
    API-->>Patient: 201 {appointment_id, status: "pending"}

    %% Step 2: Doctor approves
    Doctor->>API: POST /appointments/{appointment_id}/approve\nAuthorization: Bearer {doctor_token}

    API->>DB: UPDATE appointment SET status="approved"
    API->>Calendar: Create CalendarEvent\n{event_type: "appointment",\n linked to appointment_id}
    API-->>Doctor: 200 {appointment_id, status: "approved"}

    Note over Patient,Doctor: Appointment now visible in calendar
```

---

## 2. Appointment Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> pending : POST /appointments\n(patient requests)

    pending --> approved : POST /appointments/id/approve\n(doctor approves)
    pending --> cancelled : PATCH /appointments/id/status\n{status: "cancelled"}
    pending --> rejected : PATCH /appointments/id/status\n{status: "rejected"}

    approved --> completed : PATCH /appointments/id/status\n{status: "completed"}
    approved --> no_show : PATCH /appointments/id/status\n{status: "no_show"}
    approved --> cancelled : PATCH /appointments/id/status\n{status: "cancelled"}

    completed --> [*]
    cancelled --> [*]
    rejected --> [*]
    no_show --> [*]
```

---

## 3. Patient Views Their Appointments

```mermaid
flowchart LR
    A[Patient — Authenticated] --> B[GET /appointments/patient-appointments\nAuthorization: Bearer patient_token]
    B --> C[DB: SELECT WHERE patient_id=current_user]
    C --> D["200 [\n  {id, doctor_name, scheduled_at,\n   status, reason},\n  ...\n]"]
```

---

## 4. Status Updates (Doctor / Admin)

```mermaid
flowchart TD
    A[Doctor / Admin] --> B{Update Method}

    B -->|PATCH /appointments/id/status\n{status: X}| C[Partial update\nonly the status field]

    B -->|PUT /appointments/id/status\n{status: X, notes: Y}| D[Full update with\nadditional fields]

    C --> E[CalendarEvent auto-updates\nvia calendar_service.sync_appointment]
    D --> E
```

---

## 5. Appointments vs Consultations — Key Difference

```mermaid
flowchart LR
    subgraph appt["Appointments"]
        A1[Requested by Patient]
        A2[Lightweight — date + doctor + reason]
        A3[No video link generated]
        A4[Visible in calendar as 'appointment' event]
    end

    subgraph consult["Consultations"]
        B1[Scheduled by Doctor]
        B2[Full — Google Meet link generated]
        B3[Supports SOAP note generation]
        B4[Tracks: notes, diagnosis, prescription]
        B5[Has queue metrics & urgency levels]
    end

    appt -->|Doctor can convert\nto a full consultation| consult
