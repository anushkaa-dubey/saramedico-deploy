# SaraMedico Frontend-Backend Integration Guide

This document summarizes all the changes made to the SaraMedico frontend to prepare it for integration with the FastAPI backend. All features below are implemented using **dummy data and mock handlers**—no live connection is active, but the code structure is fully prepared.

---

## 🔐 1. Authentication Flow

### User Registration (`SignupForm.jsx`)
- **Fields Added**: First Name, Last Name, Organization Name (conditional for non-patients).
- **Endpoint**: `POST /api/v1/auth/register`
- **Auto-Login Logic**: Structured to immediately call the Login API upon successful registration to obtain a token and redirect seamlessly.
- **Validation**: Full frontend validation for email, phone, and password strength.

### User Login (`LoginForm.jsx`)
- **Action**: Call `POST /api/v1/auth/login`.
- **Session Handling**: Prepared to store `access_token` in `localStorage`.
- **Role-Based Redirect**: Bypasses 2FA (Skip OTP requirement) and redirects directly to `/dashboard/{role}` (e.g., `/dashboard/doctor`).

### Forgot Password
- **New Page**: `/auth/forgot-password/page.jsx`
- **Component**: `ForgotPasswordForm`
- **Success Message**: "If an account exists, a reset link has been sent." (as requested).

### Session Persistence (`GET /api/v1/auth/me`)
- **Implementation**: Added mock session check in both Doctor and Patient `Topbar` components to simulate restoring the user profile on refresh.

---

## 👨‍⚕️ 2. Doctor Dashboard Features

### Tasks Widget (`TasksSection.jsx`)
- **CRUD Operations**: Structured to handle `GET`, `POST`, `PATCH`, and `DELETE` /api/v1/doctor/tasks.
- **Functionality**: Mock "+ Add New Task" is functional. Checklist toggles are state-managed and ready for API sync.

### Patient Directory & Profile
- **Patient Directory**: Updated with requested columns: **Name, MRN, DOB, lastVisit, Problem, StatusTag, Email**.
- **Endpoint**: `GET /api/v1/doctor/patients`
- **Profile Detail Panel**: When a patient is selected, the right panel displays their full details (FullName, MRN, DOB, Gender, Phone, Email).
- **Endpoint**: `GET /api/v1/patients/{id}`

---

## 🏥 3. Patient Dashboard & Appointments

### Appointment System
- **Request (Patient)**: New form at `/dashboard/patient/appointments/request` for booking sessions.
  - **Endpoint**: `POST /api/v1/appointments`
- **Status Check (Patient)**: Updated `/dashboard/patient/appointments` to show a list of appointments with real-time status and doctor notes.
  - **Endpoint**: `GET /api/v1/appointments/patient-appointments`
- **Management (Doctor)**: New page at `/dashboard/doctor/appointments` to Accept/Decline requests.
  - **Endpoint**: `PATCH /api/v1/appointments/{id}/status`

### Profile Management
- **UI Copy**: The "Personal Details" UI from the records page has been moved to the **My Profile** page for better visibility.
- **Records Cleanup**: "My Records" now focused strictly on medical history and visit summaries.

---

## 📁 File Summary

| Feature | Primary File(s) |
| :--- | :--- |
| **Auth** | `app/auth/components/SignupForm.jsx`, `LoginForm.jsx`, `ForgotPasswordForm.jsx` |
| **Services** | `services/auth.js`, `doctor.js`, `patient.js` |
| **Doctor Appts** | `app/dashboard/doctor/appointments/page.jsx` |
| **Patient Appts** | `app/dashboard/patient/appointments/page.jsx`, `/request/page.jsx` |
| **Directory** | `app/dashboard/doctor/patients/page.jsx` |
| **Profile** | `app/dashboard/patient/profile/page.jsx` |

## 🔌 Technical Tips for Integration

### CORS Configuration (FastAPI)
Ensure your backend allows requests from `http://localhost:3000`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Authorization Headers
Use this structure for your protected service calls:
```javascript
const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
});
```

**The frontend is now 100% structured to match your backend specification.**
