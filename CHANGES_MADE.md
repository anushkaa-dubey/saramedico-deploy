# Frontend Security Changes — Token Service Migration

## Summary

All auth-related `localStorage` usage has been replaced with `tokenService` (sessionStorage-based).  
Single `logoutUser()` function from `auth.js` is used everywhere.  
ZERO direct storage access for auth tokens/user outside `tokenService.js`.

---

## Files Modified

### Core Services
| File | Change |
|------|--------|
| `services/tokenService.js` | ✅ Already complete — single source of truth |
| `services/api.js` | ✅ Already complete — interceptor uses tokenService |
| `services/auth.js` | ✅ Already complete — login/logout/delete use tokenService |
| `services/apiConfig.js` | `getAuthHeaders()` → uses `getAccessToken()` via tokenService |

### Auth Flow Pages
| File | Change |
|------|--------|
| `app/auth/components/LoginForm.jsx` | `clearTokens()`, `setAccessToken()`, `setRefreshToken()`, `setUser()` |
| `app/auth/components/SignupForm.jsx` | `setAccessToken()` for onboarding token |
| `app/auth/google/callback/page.jsx` | All 3 token writes → tokenService |
| `app/auth/signup/onboarding/hospital/page.jsx` | Post-onboarding token/user → tokenService |
| `app/auth/signup/onboarding/doctor/step-2/page.jsx` | Post-onboarding token/user → tokenService |

### Dashboard Layouts (Auth Guards)
| File | Change |
|------|--------|
| `app/dashboard/doctor/layout.jsx` | `getAccessToken()` + `getUser()` |
| `app/dashboard/patient/layout.jsx` | `getAccessToken()` + `getUser()` |
| `app/dashboard/hospital/layout.jsx` | `getAccessToken()` + `getUser()` |
| `app/dashboard/admin/layout.jsx` | `getAccessToken()` + `getUser()` |

### Dashboard Components
| File | Change |
|------|--------|
| `app/dashboard/doctor/components/Topbar.jsx` | User cache → tokenService; inline logout → `logoutUser()` |
| `app/dashboard/patient/components/Topbar.jsx` | User cache → tokenService; inline logout → `logoutUser()` |
| `app/dashboard/hospital/components/Sidebar.jsx` | Inline logout (fetch + manual clear) → `logoutUser()`; user cache → tokenService |
| `app/dashboard/hospital/components/Topbar.jsx` | User cache → tokenService |
| `app/dashboard/components/NotificationBell.jsx` | WS token → `getAccessToken()` |

### Dashboard Pages
| File | Change |
|------|--------|
| `app/dashboard/patient/page.jsx` | User cache read/write → tokenService |
| `app/dashboard/hospital/settings/page.jsx` | User sync read/write → tokenService |
| `app/dashboard/doctor/settings/notifications/page.jsx` | Fallback user → `getStoredUser()` |
| `app/dashboard/doctor/settings/billing/page.jsx` | Fallback user → `getStoredUser()` |
| `app/dashboard/admin/manage-accounts/edit/[id]/page.jsx` | Fallback user → `getStoredUser()` |

---

## Logout Consolidation

All logout triggers now call the **single** `logoutUser()` from `services/auth.js`:
- Doctor Topbar ✅
- Patient Topbar ✅
- Hospital Sidebar ✅
- Hospital Settings ✅
- API interceptor force-logout uses `clearTokens()` ✅
- Delete account uses `clearTokens()` ✅

---

## Remaining localStorage (NOT auth-related)

| File | Keys | Purpose |
|------|------|---------|
| `soap/page.jsx` | `soap_poll_start_*` | SOAP polling timestamps (app state, not auth) |
| Onboarding pages | `signup_data` (sessionStorage) | Temporary signup payload for onboarding flow |

---

# Hospital Workflow & Backend Stabilization Changes

## Summary

Finalized the hospital-onboarded patient appointment workflow. This involved resolving critical 404/500 errors, implementing a "Middleman" approval queue, enhancing the hospital dashboard UI/UX, and stabilizing real-time notifications.

---

## Backend (FastAPI) Changes

### Routes & Controllers
| File | Change |
|------|--------|
| `app/api/v1/hospital.py` | 🚀 Relocated appointment routes to the top to prevent route shadowing (fixed 404 error). |
| `app/api/v1/appointments.py` | 🔄 Logic added to identify hospital-onboarded patients; automatic routing to `pending_hospital_approval` status. |
| `app/api/v1/doctor.py` | 🛡️ Added filters to exclude appointments awaiting hospital approval from doctor views. |
| `app/api/v1/calendar.py` | 📅 Updated Day/Month views to support organization-wide filtering for hospital admins. |

### Services & Business Logic
| File | Change |
|------|--------|
| `app/services/hospital_service.py` | 📊 Implemented dashboard metrics: `totalDoctors`, `todayAppointments`, `clearedToday`, `avgWaitTime`. |
| `app/services/hospital_service.py` | 🔔 Added automated notifications for patients and doctors when an appointment is approved or rescheduled. |
| `app/services/calendar_service.py` | 📅 Synchronized `accepted` status with calendar creation; localized times to organization timezone. |
| `app/services/organization_service.py` | 🏢 Seeded default departments (General, Cardiology, etc.) to organizations. |

### Database & Models
| File | Change |
|------|--------|
| `app/models/appointment.py` | 🛠️ Verified `approved_by_hospital` data type (UUID). |
| `app/database.py` | ⛓️ Performed transactional migration to convert `approved_by_hospital` column from BOOLEAN to UUID in PostgreSQL. |

---

## Frontend (Next.js) Changes

### Hospital Approval Queue
| File | Change |
|------|--------|
| `app/dashboard/hospital/approval-queue/page.jsx` | 📅 **Reschedule Modal**: Replaced standard `prompt` with a high-end styled rescheduling dialog. |
| `app/dashboard/hospital/approval-queue/page.jsx` | 🖱️ Cards for "Cleared Today" and "Wait Time" are now interactive navigation shortcuts. |
| `app/dashboard/hospital/approval-queue/page.jsx` | 📊 Real-time mapping for `clearedToday` and `avgWaitTime` metrics from backend. |

### Staff Schedule & Filtering
| File | Change |
|------|--------|
| `app/dashboard/hospital/appointments/page.jsx` | 🔄 Fixed department dropdown mapping (previously empty due to data type mismatch). |
| `app/dashboard/hospital/appointments/page.jsx` | 🔍 Optimized `deptFilter` and `doctorFilter` for the Shift Schedule calendar view. |

### Notification Enhancements
| File | Change |
|------|--------|
| `app/dashboard/components/NotificationBell.jsx` | 🔄 **Auto-Refresh**: Added a 30-second polling fallback to WebSocket for high reliability. |
| `app/dashboard/components/NotificationBell.jsx` | 🛡️ Implemented deduplication logic to prevent identical multi-source notifications. |
| `app/dashboard/hospital/components/Topbar.jsx` | 🔔 Integrated `NotificationBell` for hospital admins (previously missing). |

---

## Known Fixes & Stabilizations
- **404 Resolved**: Moved `/api/v1/hospital/appointments` above generic routes in the router.
- **500 Resolved**: Database migration for `approved_by_hospital` ensures UUID compatibility with the backend model.
- **Data Binding**: Fixed mapping in `fetchHospitalStats` to correctly drill into `.metrics` before spreading props into state.
