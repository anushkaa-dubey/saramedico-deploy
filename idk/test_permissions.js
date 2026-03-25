const Blob = require('node:buffer').Blob;
const API = "http://localhost:3000/api/v1";
async function run() {
  // Login as doctor
  const login = await fetch(API + "/auth/login", {
    method: "POST", headers: {"Content-Type":"application/json"},
    body: JSON.stringify({email:"drakeshkumar@yopmail.com", password:"SecurePass123!"})
  });
  const tokenData = await login.json();
  const token = tokenData.access_token;
  console.log("Logged in:", !!token);

  // Get doctor me
  const me = await fetch(API + "/doctor/me", { headers: {"Authorization": "Bearer " + token} });
  const docProfile = await me.json();
  const doctorId = docProfile.doctor_id || docProfile.id;
  console.log("Doctor ID:", doctorId);

  // Patient ID (from the error log)
  const patientId = "35d6e076-3213-4750-afca-d660c3f99f26";

  // Try to grant access to ITSELF using grant-doctor-access
  const grant1 = await fetch(API + "/permissions/grant-doctor-access", {
    method: "POST", headers: {"Content-Type":"application/json", "Authorization": "Bearer " + token},
    body: JSON.stringify({
      doctor_id: doctorId,
      ai_access_permission: true,
      access_level: "read_analyze",
      expiry_days: 90,
      reason: "Bypass"
    })
  });
  console.log("Grant-doctor-access response:", grant1.status, await grant1.text());
}
run();
