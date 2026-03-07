const API = "http://107.20.98.130:8000/api/v1";

async function run() {
    const loginDoc = await fetch(API + "/auth/login", {
        method: "POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({email: "aarul@test.com", password: "SecurePass123!"})
    });
    const docToken = (await loginDoc.json()).access_token;
    
    // Patient id
    const patId = "35d6e076-3213-4750-afca-d660c3f99f26";
    
    const chatReq = await fetch("http://107.20.98.130:8000/api/v1/doctor/ai/chat/doctor", {
        method: "POST", headers: {"Content-Type":"application/json", "Authorization": "Bearer " + docToken},
        body: JSON.stringify({
          patient_id: patId,
          query: "hello",
          document_id: null
        })
  });
  console.log("Chat response:", chatReq.status, await chatReq.text());

}
run();
