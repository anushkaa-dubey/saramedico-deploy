const Blob = require('node:buffer').Blob;
const API = "http://107.20.98.130:8000/api/v1";

async function run() {
  const loginDoc = await fetch(API + "/auth/login", {
      method: "POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({email: "aarul@test.com", password: "SecurePass123!"})
  });
  const docToken = (await loginDoc.json()).access_token;
  
  const grantReq = await fetch(API + "/permissions/grant-doctor-access?patient_id=35d6e076-3213-4750-afca-d660c3f99f26", {
      method: "POST", headers: {"Content-Type":"application/json", "Authorization": "Bearer " + docToken},
      body: JSON.stringify({
        doctor_id: "4b30bf5a-ae5e-4e21-b38d-c6217872fe2a",
        ai_access_permission: true,
        access_level: "read_analyze",
        expiry_days: 90,
        reason: "Testing",
      })
  });
  
  console.log("GRANT RESPONSE CODE:", grantReq.status);
  console.log("GRANT RESPONSE TEXT:", await grantReq.text());

}
run();
