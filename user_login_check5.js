const Blob = require('node:buffer').Blob;
const API = "http://107.20.98.130:8000/api/v1";

async function run() {
    const loginDoc = await fetch(API + "/auth/login", {
        method: "POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({email: "aarul@test.com", password: "SecurePass123!"})
    });
    const docToken = (await loginDoc.json()).access_token;
    
    // Attempt chat without patient_id
    const chatReq = await fetch(API + "/doctor/ai/chat/doctor", {
        method: "POST", headers: {"Content-Type":"application/json", "Authorization": "Bearer " + docToken},
        body: JSON.stringify({
          query: "hello",
          document_id: null
        })
    });
    console.log("Chat without patient_id:", chatReq.status, await chatReq.text());

}
run();
