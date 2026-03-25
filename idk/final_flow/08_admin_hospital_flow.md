# Admin & Hospital Flow

## 1. Admin Overview

```mermaid
flowchart TD
    A[Admin / Hospital User\nLogs In] --> B{Admin Actions}

    B -->|GET /admin/overview| C[Dashboard stats:\nuser counts, consultation counts,\norg summary]

    B -->|GET /admin/settings| D[Org settings:\nname, email, timezone,\nbilling info]

    B -->|PATCH /admin/settings/organization| E[Update org profile\nname, contact, timezone]

    B -->|PATCH /admin/settings/developer| F[Toggle developer mode\nwebhook URLs, API keys]

    B -->|PATCH /admin/settings/backup| G[Configure backup schedule\nS3 bucket, frequency]
```

---

## 2. User Account Management

```mermaid
sequenceDiagram
    actor Admin
    participant API as Backend API
    participant DB as PostgreSQL

    %% List all accounts
    Admin->>API: GET /admin/accounts
    API->>DB: SELECT * FROM users WHERE org_id=X
    API-->>Admin: 200 [{id, email, role, status, ...}]

    %% View specific doctor
    Admin->>API: GET /admin/doctors/{doctor_id}/details
    API->>DB: SELECT doctor + patients + consultations
    API-->>Admin: 200 {doctor details + stats}

    %% Deactivate account
    Admin->>API: DELETE /admin/accounts/{user_id}
    API->>DB: Soft-delete or deactivate user
    API-->>Admin: 200 {message: "Account removed"}
```

---

## 3. Team Management (Invite & Staff)

```mermaid
sequenceDiagram
    actor Admin
    participant API as Backend API
    participant DB as PostgreSQL
    participant Email as Email Service

    %% Invite a new team member
    Admin->>API: POST /team/invite\n{\n  email: "newdoc@hospital.com",\n  full_name: "Dr. Smith",\n  role: "doctor"\n}\nAuthorization: Bearer {admin_token}

    API->>DB: Check for duplicate pending invite
    API->>DB: INSERT invitation {email, role, token}
    API->>Email: Send invitation link
    API-->>Admin: 200 {invitation_id}

    %% View pending invites
    Admin->>API: GET /team/invites/pending
    API->>DB: SELECT FROM invitations WHERE status='pending'
    API-->>Admin: 200 [{email, role, invited_at}]

    %% View current staff
    Admin->>API: GET /team/staff
    API->>DB: SELECT users in org
    API-->>Admin: 200 [{user list with roles}]

    %% View available roles
    Admin->>API: GET /team/roles
    API-->>Admin: 200 ["doctor", "nurse", "admin", "receptionist"]
```

---

## 4. Organization Invitations (Self-Managed)

```mermaid
sequenceDiagram
    actor Admin
    actor NewUser as New User
    participant API as Backend API

    Admin->>API: POST /organization/invitations\n{email, role, full_name}
    API-->>Admin: 200 {invitation_link}

    NewUser->>API: POST /organization/invitations/accept\n{invitation_token}
    API-->>NewUser: 200 {message: "Joined organization"}
```

---

## 5. Audit Logs

```mermaid
flowchart LR
    A[Admin] --> B[GET /audit/logs\nAll actions logged in org\nfilter: action, resource_type, date]
    A --> C[GET /audit/export\nDownload full audit CSV]
    A --> D[GET /audit/stats\nCount by action type]

    B --> E["Logged for every API call:\n• user_id, action\n• resource_type, resource_id\n• timestamp, IP address"]
```

---

## 6. Admin Role Access Map

```mermaid
flowchart TD
    subgraph roles["Role-Based Access"]
        A["admin / hospital"]
        B["doctor"]
        C["patient"]
    end

    A -->|full access| D[/admin/* endpoints]
    A -->|full access| E[/team/* endpoints]
    A -->|full access| F[/organization/* endpoints]
    A -->|full access| G[/audit/* endpoints]

    B -->|own org only| H[/doctor/* endpoints]
    B -->|own data| I[/calendar, /consultations, /documents]

    C -->|own data only| J[/patients/id, /documents]
    C -->|own history| K[/chat-history/patient]
