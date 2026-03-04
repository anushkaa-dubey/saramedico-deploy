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
  const pat = pats[1] || pats[0]; // Let's take Patterson if he's the second one
  
  console.log("Using patient:", pat.first_name, pat.last_name, pat.id);

  // Let's send a bare AI chat request just to confirm IF this patient has access 
  const chatReq = await fetch("http://107.20.98.130:8000/api/v1/doctor/ai/chat/doctor", {
        method: "POST", headers: {"Content-Type":"application/json", "Authorization": "Bearer " + docToken},
        body: JSON.stringify({
          patient_id: pat.id,
          query: "hello",
          document_id: null
        })
  });
  console.log("Chat response:", chatReq.status, await chatReq.text());
}
run();
