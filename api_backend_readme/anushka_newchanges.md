# Backend Changes Report
**Prepared by:** Anushka  
**Date:** March 14, 2026  
**Project:** Hospital Dashboard – Backend Fix Requests  
**File Reference:** `frontend/src/services/hospital.js`

---

## Overview

This report documents three categories of backend changes required to resolve issues identified in the Hospital Dashboard. These changes span API endpoint restructuring, schema updates, and data consistency fixes.

---

## Issue 1 — Hospital Settings Page Using Admin Endpoints

### Problem
The hospital settings page is calling `/api/v1/admin/settings/*` endpoints, which are scoped to Admin roles. Hospital-role users do not have permission to access these, causing the Add/Edit tabs on the settings page to be non-functional.

### Affected Endpoints (Currently Used)
| Method | Endpoint | Used For |
|--------|----------|----------|
| `GET` | `/api/v1/admin/settings` | Fetch settings page data |
| `PATCH` | `/api/v1/admin/settings/profile` | Update admin profile |
| `PATCH` | `/api/v1/admin/settings/organization` | Update org settings |
| `POST` | `/api/v1/admin/settings/avatar` | Upload org avatar |

### Required Backend Changes

**Option A (Recommended): Create hospital-scoped settings endpoints**

Create new endpoints under `/api/v1/hospital/settings/` that mirror the admin settings endpoints but are accessible with the hospital role:

```
GET    /api/v1/hospital/settings
PATCH  /api/v1/hospital/settings/profile
PATCH  /api/v1/hospital/settings/organization
POST   /api/v1/hospital/settings/avatar
```

- These should return and accept the same schema as the `/admin/settings` equivalents.
- Authorization middleware must allow `hospital` role JWT tokens.
- Business logic can be shared/reused from the admin settings service layer.

**Option B: Add hospital role to existing admin settings RBAC**

If a single settings endpoint is acceptable, update the RBAC/permission layer on the existing `/api/v1/admin/settings` routes to also permit the `hospital` role. This is simpler but may not be desirable if admin and hospital settings differ.

### Frontend Impact
Once the hospital-scoped endpoints exist, update the following functions in `hospital.js`:
- `fetchHospitalSettingsData()` → call `GET /api/v1/hospital/settings`
- `updateHospitalOrgSettings()` → call `PATCH /api/v1/hospital/settings/organization`
- `updateHospitalAdminProfile()` → call `PATCH /api/v1/hospital/settings/profile`
- `uploadHospitalAvatar()` → call `POST /api/v1/hospital/settings/avatar`

---

## Issue 2 — Doctor Status Cannot Be Updated via Hospital Dashboard

### Problem
The frontend calls `PATCH /api/v1/hospital/doctor/{doctor_id}` to update a doctor's status (e.g., active/inactive). However, the current Swagger schema for this endpoint does **not** include `status` as an accepted field, so status updates are silently ignored or rejected.

### Current Schema (Presumed)
```json
{
  "role": "string",
  "department": "string"
  // status field missing
}
```

### Required Backend Changes

**1. Update the request schema for `PATCH /api/v1/hospital/doctor/{doctor_id}`**

Add `status` as an optional field in the request body:

```json
{
  "role": "string (optional)",
  "department": "string (optional)",
  "status": "string (optional) — enum: ['active', 'inactive', 'busy']"
}
```

**2. Update the handler/service layer**

When `status` is present in the request body, apply the status update to the doctor record. This may involve updating a `status` column in the `doctors` or `hospital_doctors` table.

**3. Update Swagger/OpenAPI documentation**

Add `status` to the schema definition for this endpoint so the API contract is accurate.

### Note
There is a separate endpoint `POST /api/v1/doctor/status` for a **doctor to set their own status**. The change above is specifically for **hospital admins** to update a doctor's status on their behalf, which is a different permission context and should be handled separately in authorization.

---

## Issue 3 — Data Inconsistency: Doctor Status and Speciality Mismatch

### Problem
Two separate UI inconsistencies were reported that both originate from backend data issues:

**a) Doctor status discrepancy between tabs:**
- In the **Departments & Roles tab**, doctors show as `Active` / `Active Staffing`
- In the **Staff Management tab**, no doctors appear as active

This suggests the two tabs are pulling from different data sources or different fields, and the status values are not consistent.

**b) Doctor speciality showing as `nil`:**
- The doctor was registered with speciality `Surgeon`
- In the Departments & Roles tab, the speciality is displayed as `nil` / empty

### Root Cause Analysis

**Status mismatch:**
The `fetchHospitalDoctorStatus()` function calls `GET /api/v1/hospital/doctors/status` and merges `active_doctors` and `inactive_doctors` arrays. The Departments & Roles tab likely reads from a different endpoint (possibly `fetchDoctorsByDepartment` or `fetchOrganizationMembers`) which returns a different `status` field value.

The backend needs to ensure a **single, canonical `status` field** is returned consistently across all doctor-related endpoints.

**Speciality showing `nil`:**
The `speciality` (or `specialty`) field is likely being stored correctly on registration but is not being included in the serializer/response schema for department and staff listing endpoints.

### Required Backend Changes

**1. Normalize doctor status across all listing endpoints**

Ensure the following endpoints all return a consistent `status` field with the same enum values (`active`, `inactive`, `busy`):

```
GET /api/v1/hospital/doctors/status
GET /api/v1/doctor/by-department?department={name}
GET /api/v1/team/staff
GET /api/v1/hospital/directory
```

**2. Include `speciality` in doctor serializer responses**

Audit the response serializers for all doctor listing endpoints and confirm that `speciality` (check field name — may be `specialty` or `specialization`) is included in the response payload. If the field is stored in the DB but excluded from the serializer, add it.

Affected endpoints to check:
```
GET /api/v1/doctor/by-department
GET /api/v1/team/staff
GET /api/v1/hospital/directory
GET /api/v1/hospital/doctors/status
```

**3. Verify doctor creation flow stores speciality correctly**

Confirm that `POST /api/v1/hospital/doctor/create` saves the `speciality` field to the database. If the field name differs between frontend payload and DB column, add a mapping in the handler.

---

## Summary of All Required Backend Changes

| # | Area | Change Type | Endpoint(s) Affected |
|---|------|-------------|----------------------|
| 1a | Settings – RBAC | New endpoints or role permission update | `/api/v1/hospital/settings/*` |
| 2 | Doctor status update | Schema update (add `status` field) | `PATCH /api/v1/hospital/doctor/{id}` |
| 3a | Doctor status consistency | Serializer normalization | Staff, department, directory, status endpoints |
| 3b | Doctor speciality missing | Serializer field inclusion | All doctor listing endpoints |
| 3c | Doctor creation | Field mapping verification | `POST /api/v1/hospital/doctor/create` |

---

## Notes for Backend Developer

- All new hospital-scoped endpoints should follow the existing JWT auth middleware pattern used in the project.
- When adding `status` to the PATCH schema, validate the value against the allowed enum (`active`, `inactive`, `busy`) and return a `422` with a descriptive error if an invalid value is passed.
- Please update the Swagger/OpenAPI docs for every modified endpoint.
- For the speciality field — confirm whether the column is named `speciality`, `specialty`, or `specialization` in the DB and standardize it across the codebase (frontend currently sends `speciality`).

---

*Report generated from analysis of `hospital.js` frontend service file and reported UI issues.*