const API = "http://107.20.98.130:8000/api/v1";

async function run() {
    const loginDoc = await fetch(API + "/auth/login", {
        method: "POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({email: "aarul@test.com", password: "SecurePass123!"})
    });
    const docToken = (await loginDoc.json()).access_token;
    
    // Patient id
    const patId = "35d6e076-3213-4750-afca-d660c3f99f26";
    
    // Let's try omitting patient_id completely if there's a document_id maybe? No the error says "No AI access" which means patient_id is required or checked.
    // What about sending as doctor_id instead? Let's trace it.
    console.log("Checking if the payload structure should be different");
}
run();
