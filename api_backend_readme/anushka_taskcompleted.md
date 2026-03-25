# ✅ Anushka Task Completed

**Date:** 2026-03-14  
**Scope:** Hospital Settings, Doctor Status & Specialty — Backend + Frontend Integration

---

## What Was Done

### 🔧 Backend Changes

#### 1. `app/schemas/hospital.py`
- Added `specialty: Optional[str] = None` to `DoctorCreateRequest`
  - Doctors can now be created with a specialty from the hospital dashboard form
- Added `status: Optional[str] = None` to `DoctorUpdateRequest`
  - Allows hospital admins to set `active | inactive | on_leave` via the PATCH endpoint

#### 2. `app/api/v1/hospital.py`
- `create_doctor_account`: now saves `request.specialty` to the new `User.specialty` field
- `update_doctor_account`: added status upsert logic
  - Validates status against `{"active", "inactive", "on_leave"}`
  - Upserts into the `DoctorStatus` table (creates if not exists, updates if exists)
  - All other profile fields (`name`, `department`, `department_role`, `specialty`, `license_number`) unchanged

#### 3. `app/schemas/team.py`
- Added `specialty: Optional[str] = None` to `StaffMemberResponse`
  - Ensures `GET /team/staff` returns specialty for every staff member

#### 4. `app/api/v1/team.py`
- `list_department_staff`: now passes `specialty=getattr(u, 'specialty', None)` in each `StaffMemberResponse`

---

### 🖥️ Frontend Changes

#### 5. `services/hospital.js`
Updated all hospital settings service functions to use the correct hospital-scoped endpoints:

| Function | Old Endpoint | New Endpoint |
|---|---|---|
| `fetchHospitalSettingsData` | `/admin/settings` | `/hospital/settings` |
| `updateHospitalOrgSettings` | `/admin/settings/organization` | `/hospital/settings/organization` |
| `updateHospitalAdminProfile` | `/admin/settings/profile` | `/hospital/settings/profile` |
| `uploadHospitalAvatar` | `/admin/settings/avatar` | `/hospital/settings/avatar` |

Added new helper:
- `updateHospitalDoctorStatus(doctorId, newStatus)` — thin wrapper around `updateHospitalDoctor`

#### 6. `app/dashboard/hospital/settings/page.jsx`
- Fixed `loadSettings` to correctly parse the `/hospital/settings` response shape:
  - `data.profile` → name, email, avatar_url
  - `data.organization` → org_email, timezone, date_format
- Set `userRole = "hospital"` directly upon successful load (no longer depends on a separate profile fetch)
- Replaced `isAdmin` variable with `canEdit = userRole === "admin" || userRole === "hospital"`
  - All JSX references (`readOnly`, `disabled`, conditional button rendering) updated
  - **Zero `isAdmin` references remain** in the file

---

## Specialty Consistency — All Listing Endpoints ✅

| Endpoint | specialty included? |
|---|---|
| `GET /hospital/directory` | ✅ (`hospital_service.py:128`) |
| `GET /hospital/staff` | ✅ (`hospital_service.py:311`) |
| `GET /hospital/doctors/status` | ✅ (`DoctorDetailedWithStatusItem.specialty`) |
| `GET /doctor/by-department` | ✅ (`doctor.py:1038`) |
| `GET /team/staff` | ✅ (added in this task) |

---

## No Breaking Changes
- All existing endpoints remain backward-compatible
- The `status` field in `DoctorUpdateRequest` is `Optional` — old calls without it still work
- The `specialty` field in `DoctorCreateRequest` is `Optional` — existing create flows not affected
