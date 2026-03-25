const Blob = require('node:buffer').Blob;
const API = "http://localhost:3000/api/v1";
async function run() {
  const login = await fetch(API + "/auth/login", {
    method: "POST", headers: {"Content-Type":"application/json"},
    body: JSON.stringify({email:"aarul@test.com", password:"SecurePass123!"})
  });
  const token = (await login.json()).access_token;
  
  const fd = new FormData();
  fd.append("file", new Blob(["hello"], {type:"application/pdf"}), "test.pdf");
  fd.append("patient_id", "35d6e076-3213-4750-afca-d660c3f99f26");

  const upload = await fetch(API + "/documents/upload", {
    method: "POST", headers: {"Authorization": "Bearer " + token},
    body: fd
  });
  const doc = await upload.json();
  console.log("Uploaded doc:", JSON.stringify(doc));
}
run();
