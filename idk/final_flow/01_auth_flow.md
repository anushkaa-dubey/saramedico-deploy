# Authentication Flow

## 1. Standard Registration & Login

```mermaid
sequenceDiagram
    actor User
    participant API as Backend API
    participant DB as PostgreSQL
    participant Email as Email Service

    User->>API: POST /auth/register\n{email, password, full_name, role}
    API->>DB: Create User (hashed password)
    API->>Email: Send verification email (link with token)
    API-->>User: 201 {user object}

    User->>API: POST /auth/verify-email\n{token}
    API->>DB: Mark email as verified
    API-->>User: 200 {message: "Email verified"}

    User->>API: POST /auth/login\n{email, password}
    API->>DB: Check credentials
    API-->>User: 200 {access_token, refresh_token}
```

---

## 2. MFA (Multi-Factor Authentication) Setup

```mermaid
sequenceDiagram
    actor Doctor
    participant API as Backend API
    participant DB as PostgreSQL

    Note over Doctor,API: Doctor already logged in (has access_token)

    Doctor->>API: POST /auth/setup-mfa\nAuthorization: Bearer {token}
    API->>DB: Generate TOTP secret, store encrypted
    API-->>Doctor: 200 {qr_code_url, secret}

    Doctor->>API: POST /auth/verify-mfa-setup\n{code: "123456"}
    API->>DB: Validate TOTP code, mark MFA enabled
    API-->>Doctor: 200 {message: "MFA enabled"}

    Note over Doctor,API: On future logins — MFA required

    Doctor->>API: POST /auth/verify-mfa\n{code: "123456"}
    API->>DB: Validate TOTP
    API-->>Doctor: 200 {access_token}

    Doctor->>API: POST /auth/disable-mfa\n{code: "123456"}
    API->>DB: Disable MFA flag
    API-->>Doctor: 200 {message: "MFA disabled"}
```

---

## 3. Token Refresh & Logout

```mermaid
sequenceDiagram
    actor User
    participant API as Backend API
    participant DB as PostgreSQL

    User->>API: POST /auth/refresh\n{refresh_token}
    API->>DB: Validate refresh token
    API-->>User: 200 {access_token, refresh_token}

    User->>API: POST /auth/logout\nAuthorization: Bearer {token}
    API->>DB: Blacklist token
    API-->>User: 200 {message: "Logged out"}
```

---

## 4. Password Reset

```mermaid
sequenceDiagram
    actor User
    participant API as Backend API
    participant DB as PostgreSQL
    participant Email as Email Service

    User->>API: POST /auth/forgot-password\n{email}
    API->>DB: Generate reset token
    API->>Email: Send reset link
    API-->>User: 200 {message: "Reset email sent"}

    User->>API: POST /auth/reset-password\n{token, new_password}
    API->>DB: Validate token, update password hash
    API-->>User: 200 {message: "Password reset"}
```

---

## 5. Get Current User Info

```mermaid
flowchart LR
    A[Client] -->|GET /auth/me\nBearer token| B[API]
    B -->|Decode JWT| C[DB]
    C -->|User record| B
    B -->|200 user object| A
```
