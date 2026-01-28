
// Native fetch is available in Node 22

const API_BASE_URL = "http://localhost:8000/api/v1";

async function testDoctorFlow() {
    console.log("Testing Doctor Flow Integration...");

    const uniqueId = Date.now();
    // Doctor Payload
    const doctorPayload = {
        first_name: "Dr",
        last_name: `Strange${uniqueId}`,
        email: `doctor${uniqueId}@example.com`,
        phone: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        password: "password123",
        confirm_password: "password123",
        role: "doctor",
        organization_name: "Marvel Hospital" // Required for doctors?
    };

    try {
        // 1. Register Doctor
        console.log(`\n1. Registering doctor: ${doctorPayload.email}`);
        let res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doctorPayload)
        });

        if (!res.ok) {
            const err = await res.text();
            console.error("Doctor Registration Failed:", res.status);
            const fs = require('fs');
            fs.writeFileSync('doctor_error.log', err);
            return;
        }
        const registerData = await res.json();
        console.log("Doctor Registration Success:", registerData);

        // 2. Login as Doctor
        console.log(`\n2. Logging in as Doctor...`);
        res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: doctorPayload.email, password: doctorPayload.password })
        });

        const loginData = await res.json();
        const token = loginData.access_token || loginData.token;
        console.log("Doctor Login Success.");

        // 3. Check Onboarding Status (via /auth/me)
        console.log(`\n3. Checking /auth/me...`);
        res = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const meData = await res.json();
        console.log("Me Data:", JSON.stringify(meData, null, 2));

        if (!meData.onboarding_complete) {
            console.log("Onboarding not complete. Updating profile...");
            const updateRes = await fetch(`${API_BASE_URL}/auth/me`, {
                method: "PATCH",
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ specialty: "General Medicine", onboarding_complete: true })
            });
            if (!updateRes.ok) {
                console.error("Update Profile Failed:", updateRes.status, await updateRes.text());
            } else {
                console.log("Update Profile Success:", await updateRes.json());
            }
        }

        // 4. Verify Doctor appears in Public List (Client side fetch)
        // Login as patient first? Or public?
        // fetchDoctors in patient.js uses GET /doctors/search
        console.log(`\n4. Fetching Public Doctor List...`);
        res = await fetch(`${API_BASE_URL}/doctors`, {
            // headers: { 'Authorization': `Bearer ${token}` } // Maybe public?
            // Usually doctor list is protected or public. 
            // If protected, use the recently created doctor token or creating a patient token.
            // We'll try with doctor token first.
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 404) {
            console.log("/doctors 404, trying /doctors/search...");
            res = await fetch(`${API_BASE_URL}/doctors/search?name=${doctorPayload.last_name}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }

        if (res.ok) {
            const doctors = await res.json();
            const list = Array.isArray(doctors) ? doctors : (doctors.items || []);
            console.log(`Found ${list.length} doctors.`);
            const found = list.find(d => d.email === doctorPayload.email || d.user?.email === doctorPayload.email);
            if (found) {
                console.log("SUCCESS: Newly registered doctor found in list!");
            } else {
                console.warn("WARNING: Newly registered doctor NOT found in list. Maybe requires approval/onboarding?");
            }
        } else {
            console.error("Failed to fetch doctors:", res.status);
        }

    } catch (error) {
        console.error("Test Error:", error);
    }
}

testDoctorFlow();
