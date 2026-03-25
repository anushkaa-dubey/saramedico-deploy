const Blob = require('node:buffer').Blob;
const API = "http://localhost:3000/api/v1";

async function run() {
  const loginDoc = await fetch("http://107.20.98.130:8000/api/v1/auth/login", {
    method: "POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({email: "aarul@test.com", password: "SecurePass123!"})
  });
  const docToken = (await loginDoc.json()).access_token;

  // Let's create a NEW PATIENT and link it to the doctor manually to see if
  // "patient_id" mapping is successful without needing to grant anything.
  const newEmail = "testnew" + Date.now() + "@test.com";
  // The backend might auto-grant AI access upon patient creation if done by the doctor! Let's check:
  const pResponse = await fetch("http://107.20.98.130:8000/api/v1/patients", {
      method: "POST", headers: {"Content-Type":"application/json", "Authorization": "Bearer " + docToken},
      body: JSON.stringify({
          firstName: "New", lastName: "Patient", email: newEmail, date_of_birth: "1990-01-01", phone: "1234567890", gender: "O"
      })
  });
  const patData = await pResponse.json();
  console.log("Created patient:", patData.id);

  if (patData.id) {
    // Try chat
    const chatReq = await fetch("http://107.20.98.130:8000/api/v1/doctor/ai/chat/doctor", {
        method: "POST", headers: {"Content-Type":"application/json", "Authorization": "Bearer " + docToken},
        body: JSON.stringify({
          patient_id: patData.id,
          query: "hello",
          document_id: null
        })
    });
    console.log("Chat response on new pat:", chatReq.status, await chatReq.text());
  }

}
run();
