# Sara Medical - Consultation & AI Flow Handbook (Frontend Guide)

This handbook provides the complete step-by-step API integration guide for the new End-to-End Consultation Flow, including scheduling Google Meets, completing consultations, and retrieving the AI-generated SOAP notes.

---

## Architecture Overview
1. **Auth & Identity**: Users need JWT Bearer tokens. Doctors and Patients are linked securely.
2. **Scheduling**: Creates a Google Meet automatically and securely emails invitations (decrypted backend side).
3. **Execution**: The consultation occurs on Google Meet.
4. **Completion**: The frontend tells the backend the meeting is over.
5. **AI Processing**: The backend waits for Google to process the transcript (2-4 minutes), then queries AWS Bedrock to build the clinical note.

---

## Flow 1: Authentication

All endpoints (except login/register) require the `Authorization: Bearer <token>` header.

### 1.1 Doctor Login
Used by providers to access the portal.

**Request**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "doctor@saramedico.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK)**
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": {
    "id": "doctor-uuid...",
    "email": "doctor@saramedico.com",
    "role": "doctor"
  }
}
```

---

## Flow 2: Patient Management

### 2.1 Onboard a Patient
Creates a patient profile so they can be booked for consultations.

**Request**
```http
POST /api/v1/patients
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "johndoe@example.com",
  "password": "Password123!",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "phoneNumber": "+919000000000",
  "address": {
    "street": "1 Main St",
    "city": "Pune",
    "state": "MH",
    "zipCode": "411001"
  },
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Spouse",
    "phoneNumber": "+919000000001"
  },
  "medicalHistory": "None",
  "allergies": [],
  "medications": []
}
```

**Response (201 Created)**
```json
{
  "id": "patient-uuid...",
  "message": "Patient created successfully"
}
```

---

## Flow 3: Consultation & Google Meet

### 3.1 Schedule Consultation
This integrates with Google Workspace to automatically generate a Google Meet link and send Calendar Invites to the doctor and patient.

**Request**
```http
POST /api/v1/consultations
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "<patient-uuid>",
  "scheduledAt": "2026-03-07T10:00:00Z",
  "durationMinutes": 30,
  "notes": "General checkup."
}
```

**Response (200 OK)**
```json
{
  "id": "consultation-uuid...",
  "patientId": "patient-uuid...",
  "scheduledAt": "2026-03-07T10:00:00Z",
  "status": "scheduled",
  "meetLink": "https://meet.google.com/abc-defg-hij",
  "googleEventId": "eventstring..."
}
```
*Action for Frontend:* Provide a button to click that opens the `meetLink`.

---

## Flow 4: triggers AI SOAP Note Generation

### 4.1 Mark Consultation as Complete
When the doctor ends the Google Meet call, they click a "Mark Complete" button in your UI. This action tells the backend to fetch the transcripts and run the AI.

**Request**
```http
POST /api/v1/consultations/<consultation-uuid>/complete
Authorization: Bearer <token>
```

**Response (200 OK)**
```json
{
  "message": "Consultation marked as completed. AI SOAP note generation started.",
  "consultation_id": "consultation-uuid...",
  "ai_status": "processing",
  "soap_note_url": "/api/v1/consultations/<consultation-uuid>/soap-note",
  "instructions": "Poll the soap_note_url every 5 seconds. Returns 202 while processing, 200 when ready."
}
```

---

## Flow 5: Retrieving the SOAP Note (Polling Pattern)

Because Google Meet requires **2 to 4 minutes** to process spoken audio into a written transcript attachment, the backend uses Celery to patiently wait (retry loops) until Google generates the file.

The frontend MUST poll the endpoint continuously until it receives a 200 HTTP code.

### 5.1 Polling Endpoint

**Request**
```http
GET /api/v1/consultations/<consultation-uuid>/soap-note
Authorization: Bearer <token>
```

### 5.2 Polling Responses

**Scenario A: Still Processing (HTTP 202 Accepted)**
*Action required: `setTimeout` and hit the GET endpoint again in 10 seconds.*
```json
{
  "status": "processing",
  "message": "SOAP note is being generated. Please check back shortly.",
  "consultation_id": "consultation-uuid..."
}
```

**Scenario B: Finished Processing (HTTP 200 OK)**
*Action required: Stop polling, and display the JSON below to the doctor.*
```json
{
  "consultation_id": "consultation-uuid...",
  "status": "completed",
  "ai_status": "completed",
  "transcript_available": true,
  "soap_note": {
    "subjective": "Patient reports experiencing severe headaches...",
    "objective": "No vital signs documented...",
    "assessment": "Possible blood pressure issues...",
    "plan": "Diagnostic evaluation indicated."
  }
}
```

>*Note on Fallbacks:* If no one speaks in the Google Meet, or the transcript generation completely fails, the AI will gracefully return strings stating `"did not able to collect proper data"` in the SOAP note fields instead of crashing.

### Frontend Javascript Polling Example

```javascript
async function pollForSoapNote(consultationId, token) {
  let attempts = 0;
  const maxAttempts = 40; // up to ~4 minutes 
  
  const interval = setInterval(async () => {
    attempts++;
    
    // Call the GET Endpoint
    const res = await fetch(`/api/v1/consultations/${consultationId}/soap-note`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // Status 200 means done!
    if (res.status === 200) {
      clearInterval(interval);
      const data = await res.json();
      console.log("Here is the patient's AI Note:", data.soap_note);
      renderUI(data.soap_note);
      return;
    }
    
    // Give up if it takes too incredibly long
    if (attempts >= maxAttempts) {
      clearInterval(interval);
      alert("Note generation timed out. Please try again later.");
    }
    
    // (If status is 202, it just naturally waits for the next interval tick to retry)
  }, 10000); // 10 second delay between checks
}
```
