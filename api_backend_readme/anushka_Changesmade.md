# Backend Changes Log — SaraMedico

> **Project:** `Sara_medical_backend-main`  
> **Author:** Anushka  
> **Last Updated:** 2026-03-14  
> All paths are relative to `d:/SaraMedico/Sara_medical_backend-main/`

---

## Session 1 — Google OAuth Callback Fix

**Problem:** The "Continue with Google" button was non-functional. The backend was returning JSON directly to the browser instead of redirecting the browser back to the frontend with tokens.

---

### 1. `.env`

**Lines changed:** `GOOGLE_REDIRECT_URI`, `FRONTEND_URL`

```diff
- GOOGLE_REDIRECT_URI="http://localhost:8080/"
+ GOOGLE_REDIRECT_URI="http://localhost:8000/api/v1/auth/google/callback"
+ FRONTEND_URL="http://localhost:3000"
```

**Why:** The old URI pointed to port `8080` which didn't match the actual backend port. Google OAuth requires the redirect URI to exactly match what is registered in Google Cloud Console. `FRONTEND_URL` was added so the backend knows where to redirect the browser after authentication.

<!-- > ⚠️ **Action Required:** Add `http://localhost:8000/api/v1/auth/google/callback` as an **Authorized Redirect URI** in Google Cloud Console → OAuth Credentials.
 -->


---

### 2. `app/config.py`

**Lines changed:** ~28

```python
FRONTEND_URL: str = "http://localhost:3000"  # Used in email links and OAuth redirects
```

**Why:** Added `FRONTEND_URL` as a proper Pydantic `Settings` field so it can be read from `.env` and has a safe local default. Previously it was not formally declared.

---

### 3. `app/api/v1/auth.py` — `google_callback` endpoint

**Lines changed:** 963–1048

**Before (broken):**
```python
@router.get("/google/callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    # ... token logic ...
    return LoginResponse(access_token=access_token, ...)  # ❌ returns JSON to browser
```

**After (fixed):**
```python
@router.get("/google/callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    frontend_url = settings.FRONTEND_URL or "http://localhost:3000"
    frontend_callback = f"{frontend_url}/auth/google/callback"

    try:
        user_info = await google_sso.verify_and_process(request)
    except Exception as e:
        error_msg = urllib.parse.quote(f"Google Auth Failed: {str(e)}")
        return RedirectResponse(url=f"{frontend_callback}?error={error_msg}")  # ✅ error redirect

    # ... token + user data logic ...

    encoded_user = urllib.parse.quote(_json.dumps(user_data))
    redirect_url = (
        f"{frontend_callback}"
        f"?access_token={encoded_access}"
        f"&refresh_token={encoded_refresh}"
        f"&user={encoded_user}"
    )
    return RedirectResponse(url=redirect_url)  # ✅ browser redirect with tokens in URL params
```

**Why:** OAuth flows require the authorization server to redirect the browser to the client app. The old implementation returned a JSON body, which the browser displayed as raw text — the frontend callback page never ran. The fix uses `RedirectResponse` so the browser navigates to `/auth/google/callback` on the frontend, where JavaScript reads the query parameters and completes the login.

---

---

## Session 2 — Hospital Settings, Doctor Status & Specialty

**Problem:** Hospital-role users couldn't access settings (endpoints were admin-only), the doctor update endpoint didn't handle the `status` field, doctor creation silently dropped the `specialty` field, and the `team/staff` listing didn't return specialty.

---

### 4. `app/schemas/hospital.py`

**Lines changed:** `DoctorCreateRequest` (~74–82), `DoctorUpdateRequest` (~88–95)

```diff
 class DoctorCreateRequest(BaseModel):
     email: EmailStr
     password: str
     name: str
     department: str
     department_role: str
     license_number: str
+    specialty: Optional[str] = None      # ← ADDED

 class DoctorUpdateRequest(BaseModel):
     name: Optional[str] = None
     department: Optional[str] = None
     department_role: Optional[str] = None
     specialty: Optional[str] = None
     license_number: Optional[str] = None
+    status: Optional[str] = None         # ← ADDED  enum: active | inactive | on_leave
```

**Why:**
- `specialty` in create: The hospital dashboard's "Onboard Doctor" modal already sent a `specialty` field, but the schema didn't accept it, so it was silently dropped and never saved.
- `status` in update: The "Edit Doctor" modal sends `status` but the backend schema had no field for it, causing the status change to be ignored on every save.

---

### 5. `app/api/v1/hospital.py`

#### 5a. `create_doctor_account` — save specialty on create

**Lines changed:** ~176–191

```diff
 new_doctor = User(
     email=request.email,
     password_hash=hash_password(request.password),
     full_name=pii_encryption.encrypt(request.name),
     role="doctor",
     organization_id=organization_id,
     email_verified=True,
     department=request.department,
     department_role=request.department_role,
+    specialty=request.specialty,         # ← ADDED
     license_number=pii_encryption.encrypt(request.license_number)
 )
```

**Why:** Without this line, even though `specialty` was now accepted by the schema, it was never written to the database.

#### 5b. `update_doctor_account` — upsert status in DoctorStatus table

**Lines changed:** ~267–305

```python
# 5. Handle status update via DoctorStatus table
if request.status is not None:
    VALID_STATUSES = {"active", "inactive", "on_leave"}
    if request.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}"
        )
    # Upsert: update existing record or create new one
    status_result = await db.execute(
        select(DoctorStatus).where(DoctorStatus.doctor_id == doctor_id)
    )
    doctor_status_record = status_result.scalar_one_or_none()
    if doctor_status_record:
        doctor_status_record.status = request.status
    else:
        new_status = DoctorStatus(doctor_id=doctor.id, status=request.status)
        db.add(new_status)
```

**Why:** Doctor status is stored in a separate `doctor_status` table (not a column on `users`). The handler needed to upsert into that table. Validation is done server-side to prevent invalid status values being stored.

---

### 6. `app/schemas/team.py`

**Lines changed:** `StaffMemberResponse` schema

```diff
 class StaffMemberResponse(BaseModel):
     id: UUID
     name: str
     email: str
     role: str
+    specialty: Optional[str] = None   # ← ADDED
     last_accessed: Optional[datetime] = None
     status: str
```

**Why:** The `GET /team/staff` endpoint powers the hospital's staff roster table. The frontend displays the doctor's specialty in that table, but the field was missing from the schema so it was always `null`.

---

### 7. `app/api/v1/team.py`

**Lines changed:** `list_department_staff` serializer (~134–144)

```diff
 staff_list.append(StaffMemberResponse(
     id=u.id,
     name=name,
     email=u.email,
     role=getattr(u, 'department_role', None) or u.role.capitalize(),
+    specialty=getattr(u, 'specialty', None),   # ← ADDED
     last_accessed=u.last_login,
     status=getattr(u, 'staff_status', None) or "Active"
 ))
```

**Why:** Needed to wire the newly added schema field to the actual `User.specialty` column value.

---

---

## What Was Already In Place (No Changes Needed)

These were verified during this work as already correctly implemented:

| Endpoint | specialty included? | Notes |
|---|---|---|
| `GET /hospital/settings` | ✅ | Returns `profile` + `organization` for hospital role |
| `GET /hospital/settings/profile` (PATCH) | ✅ | PII-encrypted, hospital role allowed |
| `GET /hospital/settings/organization` (PATCH) | ✅ | Hospital role allowed |
| `POST /hospital/settings/avatar` | ✅ | MinIO upload, hospital role allowed |
| `GET /hospital/directory` | ✅ | `specialty` at `hospital_service.py:128` |
| `GET /hospital/staff` | ✅ | `specialty` at `hospital_service.py:311` |
| `GET /hospital/doctors/status` | ✅ | Via `DoctorDetailedWithStatusItem.specialty` |
| `GET /doctor/by-department` | ✅ | `specialty` at `doctor.py:1038` |

---

## Files Changed — Full List

| File | Change Type | Session |
|---|---|---|
| `.env` | Config fix | 1 |
| `app/config.py` | New field | 1 |
| `app/api/v1/auth.py` | Logic fix (OAuth redirect) | 1 |
| `app/schemas/hospital.py` | New fields on schemas | 2 |
| `app/api/v1/hospital.py` | Save specialty + upsert status | 2 |
| `app/schemas/team.py` | New field on schema | 2 |
| `app/api/v1/team.py` | Pass new field in serializer | 2 |

---

## Deployment Notes

- **No migrations needed** — `specialty` already exists as a column on the `users` table and `DoctorStatus` table already exists. All changes are schema/logic only.
- **Restart backend** after `.env` changes for `GOOGLE_REDIRECT_URI` and `FRONTEND_URL` to take effect.
- **Google Cloud Console** — must add `http://localhost:8000/api/v1/auth/google/callback` to **Authorized Redirect URIs** for the OAuth flow to work.
## Session 3 — Doctor Status Persistence Fix

**Problem:** Status changes via PATCH `/hospital/doctor/{doctor_id}` returned 200 but
didn't persist — the `doctor_statuses` table was never being created in the database.

### 8. `app/models/__init__.py`
```diff
+ from app.models.doctor_status import DoctorStatus
```
**Why:** `DoctorStatus` was missing from the models registry. Since `init_db()` calls
`Base.metadata.create_all`, any model not imported here never gets its table created
on startup. The table didn't exist in the DB, causing silent transaction rollbacks.

### 9. `app/api/v1/hospital.py` — hardened status upsert

**Lines changed:** `update_doctor_account` status block

- Added `await db.flush()` before and after the DoctorStatus upsert to sequence writes
- Explicit `UUID(str(doctor_id))` cast to prevent silent type-mismatch in WHERE clause
- Added `db.expire_all()` after commit so subsequent GETs read fresh DB data

## Updated Deployment Notes

- **Backend restart required** after pulling — `create_all` runs on startup and will
  now create the missing `doctor_statuses` table automatically
- **No manual migration needed** — `create_all` handles it via `IF NOT EXISTS`
- All Pyre2 red squiggles in VS Code are false positives — linter lacks virtualenv
  path access and does not affect runtime