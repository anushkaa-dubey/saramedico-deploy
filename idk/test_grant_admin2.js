const Blob = require('node:buffer').Blob;
const API = "http://107.20.98.130:8000/api/v1";

async function run() {
  // Let's create a NEW PATIENT with a known password.
  const patEmail = "pattest" + Date.now() + "@test.com";
  await fetch(API + "/auth/register", {
      method: "POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({email: patEmail, password: "SecurePass123!", role: "patient"})
  });
  
  const loginPat = await fetch(API + "/auth/login", {
      method: "POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({email: patEmail, password: "SecurePass123!"})
  });
  const patToken = (await loginPat.json()).access_token;
  
  const mePat = await fetch(API + "/patients", { headers: {"Authorization": "Bearer " + patToken} });
  const patData = await mePat.json();
  const patId = patData.id || patData.patient_id || "none";
  console.log("Created patient ID:", patId);

  // Now, AS THE PATIENT, try to grant access to the doctor!
  // Doctor aarual's ID is 4b30bf5a-ae5e-4e21-b38d-c6217872fe2a
  const grantReq = await fetch(API + "/permissions/grant-doctor-access?patient_id=" + patId, {
      method: "POST", headers: {"Content-Type":"application/json", "Authorization": "Bearer " + patToken},
      body: JSON.stringify({
        doctor_id: "4b30bf5a-ae5e-4e21-b38d-c6217872fe2a",
        ai_access_permission: true,
        access_level: "read_analyze",
        expiry_days: 90,
        reason: "Test Auto Grant",
      })
  });
  
  console.log("PATIENT GRANT RESPONSE:", grantReq.status, await grantReq.text());

  // Now log in as Doctor again and try to chat WITH THIS specific patient.
  const loginDoc = await fetch(API + "/auth/login", {
      method: "POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({email: "aarul@test.com", password: "SecurePass123!"})
  });
  const docToken = (await loginDoc.json()).access_token;

  const chatReq = await fetch(API + "/doctor/ai/chat/doctor", {
        method: "POST", headers: {"Content-Type":"application/json", "Authorization": "Bearer " + docToken},
        body: JSON.stringify({
          patient_id: patId,
          query: "hello",
          document_id: null
        })
  });
  console.log("Chat response on new auto-granted pat:", chatReq.status, await chatReq.text());

}
run();
