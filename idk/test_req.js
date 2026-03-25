const Blob = require('node:buffer').Blob;
const API = "http://localhost:3000/api/v1";

async function run() {
  const loginDoc = await fetch("http://107.20.98.130:8000/api/v1/auth/login", {
    method: "POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({email: "aarul@test.com", password: "SecurePass123!"})
  });
  const docToken = (await loginDoc.json()).access_token;
  
  const meDoc = await fetch("http://107.20.98.130:8000/api/v1/doctor/me", { headers: {"Authorization": "Bearer " + docToken} });
  const rawMe = await meDoc.json();
  console.log("rawMe doctor object looks like this:", JSON.stringify(rawMe));

  // Determine actual doctor ID field here...
  const doctorId = rawMe.doctor_id || rawMe.id || "none";
  
  // Try the Doctor Chat endpoint again (that got 403 Forbidden in user's request)
  // Let's see if we get the 403 there now after running the `request` endpoint...
  const aiReq = await fetch("http://107.20.98.130:8000/api/v1/doctor/ai/chat/doctor", {
    method: "POST", headers: {"Content-Type":"application/json", "Authorization": "Bearer " + docToken},
    body: JSON.stringify({
      patient_id: "35d6e076-3213-4750-afca-d660c3f99f26", // The ID we requested access to
      query: "hello",
      document_id: null
    })
  });
  console.log("Chat text:", aiReq.status, await aiReq.text());

}
run();
