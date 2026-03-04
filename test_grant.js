const Blob = require('node:buffer').Blob;
const API = "http://localhost:3000/api/v1";

async function run() {
  // Login as doctor (using the correct email from DB or fallback to create a new one to test)
  const login = await fetch(API + "/auth/login", {
    method: "POST", headers: {"Content-Type":"application/json"},
    body: JSON.stringify({email:"drakeshkumar@yopmail.com", password:"SecurePass123!"})
  });
  if(login.status !== 200) {
     console.log("Could not login as rakeseh. Status:", login.status);
  }
}
run();
