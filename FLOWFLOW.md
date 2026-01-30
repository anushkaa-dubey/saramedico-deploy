1. doctor register
      "email": "custom_doctor1_1769690483@test.com",
      "password": "SecurePass123!",
      "full_name": "Dr. 1 Test",
      "role": "doctor",
      "date_of_birth": "1975-01-01",
      "phone_number": "+15551110001",
      "organization_name": "Test Hospital",
      "specialty": "Cardiology",
      "license_number": "LIC-1-1769690483"

2, doctor login:
{
  "email": "custom_doctor1_1769690483@test.com",
  "password": "SecurePass123!"
}
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjNDY1ZWUwMy1iYTgxLTRiZTMtYWFlMS05ZjFlYWMxZDBiNDEiLCJyb2xlIjoiZG9jdG9yIiwiZXhwIjoxNzY5ODQxMzUxLCJpYXQiOjE3Njk3NTQ5NTEsInR5cGUiOiJhY2Nlc3MifQ.l_Rcsp_kr7FbK8VAizN1X49vdBdBmQSOM_fe8I69uOs

create patient:
{
  "fullName": "Test",
  "dateOfBirth": "2026-01-30",
  "gender": "prefer_not_to_say",
  "phoneNumber": "91123456789",
  "email": "test@test.com",
  "address": {
    "street": "x",
    "city": "y",
    "state": "z",
    "zipCode": "42008"
  },
  "emergencyContact": {
    "name": "test",
    "relationship": "test",
    "phoneNumber": "9123456778"
  },
  "medicalHistory": "none",
  "allergies": [],
  "medications": [],
  "password": "SecurePass123!"
}

patient login : token-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTBjZDJjYi1kZjNmLTRjMzktYjg5Zi1kYTc3ZTA4ZDhlMmMiLCJyb2xlIjoicGF0aWVudCIsImV4cCI6MTc2OTg0MTc2OSwiaWF0IjoxNzY5NzU1MzY5LCJ0eXBlIjoiYWNjZXNzIn0.y4BPvq3IIeOQlbse-dDL9vN06Ggxo-9jTm_bu0yw_P8

create appointment:
{
  "doctor_id": "c465ee03-ba81-4be3-aae1-9f1eac1d0b41",
  "requested_date": "2026-01-30T06:44:21Z",
  "reason": "test",
  "grant_access_to_history": false
}
response:{
  "doctor_id": "c465ee03-ba81-4be3-aae1-9f1eac1d0b41",
  "requested_date": "2026-01-31T06:47:25.070000Z",
  "reason": "string",
  "id": "daffc5b8-f2cc-4680-a792-73b18a7ba8e4",
  "patient_id": "890cd2cb-df3f-4c39-b89f-da77e08d8e2c",
  "status": "pending",
  "doctor_notes": null,
  "meeting_id": null,
  "join_url": null,
  "start_url": null,
  "meeting_password": null,
  "created_at": "2026-01-30T06:47:34.069498Z",
  "updated_at": "2026-01-30T06:47:34.069501Z"
}
doctor login:
get appointment
[
  {
    "doctor_id": "c465ee03-ba81-4be3-aae1-9f1eac1d0b41",
    "requested_date": "2026-01-31T06:47:25.070000Z",
    "reason": "string",
    "id": "daffc5b8-f2cc-4680-a792-73b18a7ba8e4",
    "patient_id": "890cd2cb-df3f-4c39-b89f-da77e08d8e2c",
    "status": "pending",
    "doctor_notes": null,
    "meeting_id": null,
    "join_url": null,
    "start_url": null,
    "meeting_password": null,
    "created_at": "2026-01-30T06:47:34.069498Z",
    "updated_at": "2026-01-30T06:47:34.069501Z"
  }
]
approve appointment:
Doctor approves an appointment and generates a Zoom meeting.

Parameters
Cancel
Reset
Name	Description
appointment_id *
string($uuid)
(path)
daffc5b8-f2cc-4680-a792-73b18a7ba8e4
Request body

application/json
{
  "appointment_time": "2026-01-31T06:47:25.070000Z",
  "doctor_notes": "string"
}
response:

{
  "doctor_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "requested_date": "2026-01-30T06:55:44.591Z",
  "reason": "string",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "patient_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "string",
  "doctor_notes": "string",
  "meeting_id": "string",
  "join_url": "string",
  "start_url": "string",
  "meeting_password": "string",
  "created_at": "2026-01-30T06:55:44.591Z",
  "updated_at": "2026-01-30T06:55:44.591Z"
}