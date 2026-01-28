# Frontend Integration Requirements

The Backend APIs have been updated to support the Authentication flow for all 4 roles (Patient, Doctor, Admin, Hospital). Please update the Frontend forms (`SignupForm.jsx`, `LoginForm.jsx`) to integrate with these APIs.

## 1. User Registration (Sign Up)

**Endpoint:** `POST /api/v1/auth/register`

**Payload:**

```json
{
  "email": "user@example.com",
  "password": "StrongPassword@123",
  "confirm_password": "StrongPassword@123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+919876543210",
  "role": "doctor", // Values: "patient", "doctor", "admin", "hospital"
  "organization_name": "Saramedico Clinic"
}
```

**Notes:**

- `phone` is now accepted (maps to `phone_number`).
- `confirm_password` is optional in schema but good to send.
- **Auto-Login:** The API returns the created user object (`UserResponse`) but **NOT** an auth token.
- **Action Required:** After a successful registration (HTTP 201), the frontend must **immediately call the Login API** with the same email/password to get the token and log the user in automatically, as per the "Skip OTP" requirement.

## 2. User Login (Sign In)

**Endpoint:** `POST /api/v1/auth/login`

**Payload:**

```json
{
  "email": "user@example.com",
  "password": "StrongPassword@123"
}
```

**Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOi...", // Access Token
  "access_token": "eyJhbGciOi...", // Same as token (for compatibility)
  "refresh_token": "...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "role": "doctor",
    "email": "user@example.com",
    "organization_id": "..."
  }
}
```

**Action Required:**

- Store `token` (or `access_token`) in `localStorage` / cookies.
- Check `response.user.role`.
- Redirect user to `/dashboard/{role}` (e.g., `/dashboard/doctor`).

## 3. Forgot Password

**Endpoint:** `POST /api/v1/auth/forgot-password`

**Payload:**

```json
{
  "email": "user@example.com"
}
```

**Action:**

- Show a success message "If an account exists, a reset link has been sent."

## 4. Get Current User (Session Persistence)

**Endpoint:** `GET /api/v1/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "id": "...",
  "name": "John Doe",
  "role": "doctor",
  ...
}
```

## Summary of Changes Needed in Frontend Code

1.  **SignupForm.jsx**:
    - Add fields: **First Name**, **Last Name**, **Organization Name**.
    - Ensure `role` is passed correctly from URL or selection.
    - On "Sign Up" click:
      1.  Call `POST /register`.
      2.  If success, Call `POST /login` (using the same password).
      3.  Store token.
      4.  Redirect to `/dashboard/{role}`.

2.  **LoginForm.jsx**:
    - Call `POST /login`.
    - On success, store token and redirect based on `response.user.role`.

## 5. Doctor Tasks (Dashboard Widget)

**Endpoint:** `GET /api/v1/doctor/tasks`

**Response:**

```json
[
  {
    "id": "...",
    "title": "Sign off on lab results",
    "status": "pending",
    "priority": "urgent",
    "due_date": "2024-10-25T00:00:00Z"
  },
  ...
]
```

**Endpoint:** `POST /api/v1/doctor/tasks`

**Payload:**

```json
{
  "title": "Check Patient X",
  "priority": "urgent", // or "normal"
  "due_date": "2024-10-26T00:00:00Z",
  "status": "pending"
}
```

**Endpoint:** `PATCH /api/v1/doctor/tasks/{id}`

**Payload:**

```json
{ "status": "completed" }
```

or

```json
{ "priority": "normal" }
```

**Endpoint:** `DELETE /api/v1/doctor/tasks/{id}`

**Action Required:**

- Update `TasksSection.jsx` to fetch real data from these APIs instead of using hardcoded mock data.
- Wire up the "+ Add New Task" button to a modal or input that calls the POST endpoint.
- Wire up the checkboxes/buttons to call the PATCH endpoint.

## 6. Patient Directory & Appointment System

### Part 1: Patient Directory API

**Endpoint:** `GET /api/v1/doctor/patients`

**Response:**

```json
[
  {
    "id": "uuid",
    "name": "Rohit Sharma",
    "statusTag": "Analysis Ready",
    "dob": "01/12/80",
    "mrn": "882-921",
    "lastVisit": "15/01/26",
    "problem": "Post-op"
  }
]
```

**Action Required:**

- Wire up the Patient Directory table in the Doctor Dashboard to fetch from this endpoint.
- Display patient list with proper columns: Name, MRN, DOB, Last Visit, Status Tag.

### Part 2: Patient Profile API

**Endpoint:** `GET /api/v1/patients/{id}`

**Response:**

```json
{
  "id": "uuid",
  "fullName": "Rohit Sharma",
  "mrn": "882-921",
  "dateOfBirth": "1980-12-01",
  "gender": "male",
  "phoneNumber": "(555) 123-4567",
  "email": "rohit@example.com"
}
```

**Action Required:**

- When a patient is clicked in the directory, fetch their full profile.
- Display in the patient details panel on the right side.

### Part 3: Appointment System

**Patient: Request Appointment**

**Endpoint:** `POST /api/v1/appointments`

**Payload:**

```json
{
  "doctor_id": "uuid",
  "requested_date": "2026-02-01T10:00:00Z",
  "reason": "Follow-up consultation"
}
```

**Doctor: View Appointment Requests**

**Endpoint:** `GET /api/v1/doctor/appointments?status=pending`

**Response:**

```json
[
  {
    "id": "uuid",
    "patient_id": "uuid",
    "doctor_id": "uuid",
    "requested_date": "2026-02-01T10:00:00Z",
    "reason": "Follow-up consultation",
    "status": "pending",
    "created_at": "2026-01-23T10:00:00Z"
  }
]
```

**Doctor: Accept/Decline Appointment**

**Endpoint:** `PATCH /api/v1/appointments/{id}/status`

**Payload:**

```json
{
  "status": "accepted",
  "doctor_notes": "Scheduled for next week"
}
```

**Patient: Check Appointment Status**

**Endpoint:** `GET /api/v1/appointments/patient-appointments`

**Response:**

```json
[
  {
    "id": "uuid",
    "doctor_id": "uuid",
    "requested_date": "2026-02-01T10:00:00Z",
    "status": "accepted",
    "doctor_notes": "Scheduled for next week"
  }
]
```

**Action Required:**

- Create patient appointment request form.
- Create doctor appointment management interface.
- Display appointment status updates in real-time.
