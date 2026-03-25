# AI Chat Flow (RAG — Retrieval Augmented Generation)

## 1. Doctor Chats About a Patient's Medical Data

```mermaid
sequenceDiagram
    actor Doctor
    participant API as Backend API
    participant DB as PostgreSQL
    participant Bedrock as AWS Bedrock (Claude)

    Note over Doctor,API: Prerequisites:\n• document_id from uploaded + processed doc\n• patient_id\n• doctor token

    Doctor->>API: POST /doctor/ai/chat/doctor\n{patient_id, document_id, query}\nAuthorization: Bearer {doctor_token}

    API->>DB: Fetch Chunk rows WHERE document_id = {id}\n(up to 10 chunks, ordered by page)
    DB-->>API: [Chunk{source, page, content, embedding}, ...]

    API->>DB: Fetch Consultations WHERE patient_id = {id}\nAND ai_status = "completed"\nAND soap_note IS NOT NULL\n(up to 5 most recent)
    DB-->>API: [Consultation{soap_note, scheduled_at}, ...]

    API->>API: Build context_text:\n══ MEDICAL DOCUMENTS ══\n[chunk text per page]\n══ PAST SOAP NOTES ══\n[Subjective / Objective / Assessment / Plan]

    API->>Bedrock: POST bedrock.invoke_model_with_response_stream\n{system: context_text, messages: [{role:user, content:query}]}

    Bedrock-->>API: stream of tokens

    API-->>Doctor: StreamingResponse\n(tokens arrive as they're generated)

    API->>DB: INSERT ChatHistory {role:"doctor", content:query}
    API->>DB: INSERT ChatHistory {role:"assistant", content:full_response}
```

---

## 2. Patient Chats About Their Own Data

```mermaid
sequenceDiagram
    actor Patient
    participant API as Backend API
    participant DB as PostgreSQL
    participant Bedrock as AWS Bedrock (Claude)

    Note over Patient,API: Prerequisites:\n• Patient registered & has auth token\n• Doctor has processed a document for this patient\n• DataAccessGrant with ai_access_permission=True exists

    Patient->>API: POST /doctor/ai/chat/patient\n{patient_id, document_id, query}\nAuthorization: Bearer {patient_token}

    Note over API: Auth check: current_user.id must match patient_id

    API->>DB: Fetch Chunks for patient's document
    API->>DB: Fetch patient's completed SOAP notes
    API->>API: Merge into structured context:\n[MEDICAL DOCUMENTS] + [SOAP NOTES]

    API->>Bedrock: Invoke stream with context as system prompt
    Bedrock-->>API: Token stream

    API-->>Patient: StreamingResponse
    API->>DB: Save ChatHistory (user_type="patient")
```

---

## 3. Retrieve Chat History

```mermaid
flowchart LR
    A[Doctor\nToken] -->|GET /doctor/ai/chat-history/doctor\n?patient_id=xxx| B[API]
    A2[Patient\nToken] -->|GET /doctor/ai/chat-history/patient\n?patient_id=xxx| B

    B --> C[DB: SELECT * FROM chat_history\nWHERE patient_id = xxx\nORDER BY created_at DESC]
    C --> D[200 list of messages\nrole: user / assistant\ncontent, created_at]
```

---

## 4. RAG Context Structure (What Claude Receives)

```mermaid
block-beta
    columns 1
    A["System Prompt sent to Claude"]:1

    block:docs
        B["=== MEDICAL DOCUMENTS ===\n[Source: TIER_1_TEXT, Page 1]\nPatient presented with fever...\n---\n[Source: TIER_1_TEXT, Page 2]\nBlood pressure reading: 140/90..."]
    end

    block:soap
        C["=== PAST CONSULTATION SOAP NOTES ===\n[SOAP Note — Consultation on 2026-03-01]\nSubjective : Patient reports chest tightness\nObjective  : BP 140/90, HR 88\nAssessment : Hypertension Stage 1\nPlan       : Lisinopril 10mg daily"]
    end

    block:query
        D["User Message:\n'What medications is this patient currently on?'"]
    end
```

---

## 5. Full Permission → Chat Prerequisite Flow

```mermaid
flowchart TD
    A[Doctor registers & logs in] --> B[Doctor creates Patient profile\nPOST /patients]
    B --> C[Doctor uploads document\nPOST /documents/upload]
    C --> D[Doctor processes document for AI\nPOST /doctor/ai/process-document]
    D --> E{Poll status}
    E -->|status != completed| E
    E -->|status = completed| F[Patient registers auth account\nPOST /auth/register]
    F --> G[Patient grants doctor access\nPOST /permissions/grant-doctor-access\n{ai_access_permission: true}]
    G --> H[Doctor chats\nPOST /doctor/ai/chat/doctor]
    G --> I[Patient chats\nPOST /doctor/ai/chat/patient]
