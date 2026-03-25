# Consultation Flow

## 1. Schedule a Consultation (with Google Meet)

```mermaid
sequenceDiagram
    actor Doctor
    participant API as Backend API
    participant DB as PostgreSQL
    participant GoogleMeet as Google Meet / Calendar API
    participant WS as WebSocket Manager

    Doctor->>API: POST /consultations\n{\n  patientId: "uuid",\n  scheduledAt: "2026-03-10T14:00:00Z",\n  durationMinutes: 30,\n  notes: "Follow-up"\n}\nAuthorization: Bearer {doctor_token}

    API->>DB: Verify patient exists in org
    API->>GoogleMeet: calendar.events.insert\n{summary, start, end, conferenceData,\n attendees: [doctor_email, patient_email]}
    GoogleMeet-->>API: {google_event_id, hangoutLink}

    API->>DB: INSERT consultation\n{doctor_id, patient_id, status="scheduled",\n google_event_id, meet_link, scheduled_at}

    API->>WS: send_personal_message(\n  type="consultation.created"\n)
    API-->>Doctor: 201 {\n  id, status: "scheduled",\n  meet_link: "https://meet.google.com/...",\n  google_event_id\n}
```

---

## 2. Manage Consultation Lifecycle

```mermaid
stateDiagram-v2
    [*] --> scheduled : POST /consultations

    scheduled --> active : PUT /consultations/id\n{status: "active"}
    active --> completed : PUT /consultations/id\n{status: "completed"}
    scheduled --> cancelled : PUT /consultations/id\n{status: "cancelled"}
    scheduled --> no_show : PUT /consultations/id\n{status: "no_show"}

    completed --> [*]
    cancelled --> [*]
    no_show --> [*]
```

---

## 3. SOAP Note Generation (after consultation)

```mermaid
flowchart TD
    A[Consultation = completed] --> B[POST /consultations/id/analyze\noptional: ?scenario=chest_pain]
    B --> C[ai_status = 'processing']
    C --> D[Celery task in background\nfetches transcript → calls Bedrock]
    D --> E[ai_status = 'completed'\nsoap_note saved to DB]
    E --> F{Poll}
    F -->|GET /consultations/id/soap-note\nai_status != completed| F
    F -->|ai_status = completed| G[200 soap_note JSON]
```

---

## 4. List & Filter Consultations

```mermaid
flowchart LR
    A[GET /consultations] --> B{User Role}

    B -->|Doctor| C[All consultations in org\nfilter: status, visit_state,\nurgency_level, provider_id, search\npagination: page, limit]

    B -->|Patient| D[Only own consultations]

    B -->|Admin| E[All org consultations]
```

---

## 5. Clinical Queue Metrics

```mermaid
flowchart LR
    A[GET /consultations/queue/metrics] --> B[DB Aggregates]
    B --> C[pending_review\nvisit_state = 'Needs Review']
    B --> D[high_urgency\nurgency_level in high, critical\nstatus != completed]
    B --> E[cleared_today\nvisit_state = 'Signed'\ncompletion_time = today]
    B --> F[avg_wait_time_minutes\ncurrently mocked = 12]

    C --> G["200 {\n  pending_review: N,\n  high_urgency: N,\n  cleared_today: N,\n  avg_wait_time_minutes: 12\n}"]
    D --> G
    E --> G
    F --> G
```
