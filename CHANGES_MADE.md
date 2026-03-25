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
