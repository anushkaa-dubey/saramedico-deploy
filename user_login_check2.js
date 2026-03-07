const API = "http://107.20.98.130:8000/api/v1";

async function run() {
    const loginDoc = await fetch(API + "/auth/login", {
        method: "POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({email: "aarul@test.com", password: "SecurePass123!"})
    });
    const docToken = (await loginDoc.json()).access_token;
    
    // Patient id
    const patId = "35d6e076-3213-4750-afca-d660c3f99f26";
    
    // What if the doctor can just call /api/v1/doctor/patients/{patient_id} and somehow it grants AI permission implicitly?
    // Let's check status
    const status = await fetch(API + "/permissions/check?patient_id=" + patId, {
      headers: {"Authorization": "Bearer " + docToken}
    });

    console.log("Check permission:", await status.text());

}
run();
