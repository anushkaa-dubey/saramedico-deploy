const Blob = require('node:buffer').Blob;
const API = "http://localhost:3000/api/v1";

async function run() {
  // Let's create a new doctor and test!
  const fakeEmail = "testdoc" + Date.now() + "@test.com";
  const regDoc = await fetch(API + "/auth/register", {
    method: "POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({email: fakeEmail, password: "SecurePass123!", role: "doctor", full_name: "Test Doc", first_name: "Test", last_name: "Doc"})
  });
  console.log("Reg doc:", regDoc.status);
  
  const loginDoc = await fetch(API + "/auth/login", {
    method: "POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({email: fakeEmail, password: "SecurePass123!"})
  });
  const docToken = (await loginDoc.json()).access_token;
  console.log("Doc logged in. Token length:", docToken ? docToken.length : "none");

  const fakeEmailPat = "testpat" + Date.now() + "@test.com";
  const regPat = await fetch(API + "/auth/register", {
    method: "POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({email: fakeEmailPat, password: "SecurePass123!", role: "patient", full_name: "Test Pat", first_name: "Test", last_name: "Pat"})
  });
  console.log("Reg pat:", regPat.status);

  const loginPat = await fetch(API + "/auth/login", {
    method: "POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({email: fakeEmailPat, password: "SecurePass123!"})
  });
  const patToken = (await loginPat.json()).access_token;
  
  const meDoc = await fetch(API + "/doctor/me", { headers: {"Authorization":"Bearer "+docToken}});
  const docId = (await meDoc.json()).doctor_id || "none";
  
  const mePat = await fetch(API + "/patients", { headers: {"Authorization":"Bearer "+patToken}});
  const patData = await mePat.json();
  const patId = patData.id || patData.patient_id || "none";
  console.log("Ids:", "doc", docId, "pat", patId);
}
run();
