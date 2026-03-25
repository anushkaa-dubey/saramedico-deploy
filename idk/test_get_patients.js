const Blob = require('node:buffer').Blob;
const API = "http://107.20.98.130:8000/api/v1";

async function run() {
  const loginDoc = await fetch(API + "/auth/login", {
      method: "POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({email: "aarul@test.com", password: "SecurePass123!"})
  });
  const docToken = (await loginDoc.json()).access_token;
  
  const patientsRes = await fetch(API + "/doctor/patients", {
      headers: {"Authorization": "Bearer " + docToken}
  });
  const pats = await patientsRes.json();
  console.log("Found patients. Length:", pats.length);
  if (pats.length > 0) {
      console.log("First patient ID:", pats[0].id);
      
      const chatReq = await fetch("http://107.20.98.130:8000/api/v1/doctor/ai/chat/doctor", {
        method: "POST", headers: {"Content-Type":"application/json", "Authorization": "Bearer " + docToken},
        body: JSON.stringify({
          patient_id: pats[0].id,
          query: "hello",
          document_id: null
        })
      });
      console.log("Chat response on EXISITNG pat:", chatReq.status, await chatReq.text());

      // If it fails with 403, and doctor cannot grant access, then it means the doctor 
      // MUST wait for patient to respond to the notification request!
      // Let's also check if there is an endpoint to bypass or anything.
  }

}
run();
