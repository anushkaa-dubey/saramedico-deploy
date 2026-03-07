// Native fetch is available in Node 22

const API_BASE_URL = "http://localhost:8000/api/v1";

async function testAuth() {
    console.log("Testing Auth Integration...");
    console.log(`Using API_BASE_URL: ${API_BASE_URL}`);

    const uniqueId = Date.now();
    const userPayload = {
        first_name: "Test",
        last_name: `User${uniqueId}`,
        email: `test${uniqueId}@example.com`,
        phone: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        date_of_birth: "1990-01-01",
        gender: "Male",
        password: "password123",
        confirm_password: "password123",
        role: "patient",
        organization_name: ""
    };

    try {
        // 1. Register
        console.log(`\n1. Registering user: ${userPayload.email}`);
        let res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userPayload)
        });

        if (!res.ok) {
            const err = await res.text();
            console.error("Registration Failed:", res.status);
            const fs = require('fs');
            fs.writeFileSync('error.log', err);
            return;
        }
        const registerData = await res.json();
        console.log("Registration Success:", registerData);

        // 2. Login
        console.log(`\n2. Logging in...`);
        res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userPayload.email, password: userPayload.password })
        });

        if (!res.ok) {
            const err = await res.text();
            console.error("Login Failed:", res.status, err);
            return;
        }
        const loginData = await res.json();
        console.log("Login Success. Token received.");
        const token = loginData.access_token || loginData.token;

        if (!token) {
            console.error("No token in login response:", loginData);
            return;
        }

        // 3. Get Me
        console.log(`\n3. Fetching /auth/me...`);
        res = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            const err = await res.text();
            console.error("Get Me Failed:", res.status, err);
        } else {
            const meData = await res.json();
            console.log("Get Me Success:", meData);
        }

        // 4. Fetch Doctors (Public or Protected?)
        console.log(`\n4. Fetching Doctors...`);
        res = await fetch(`${API_BASE_URL}/doctors`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            console.log("Get Doctors Main endpoint failed, trying search...");
            res = await fetch(`${API_BASE_URL}/doctors/search`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }

        if (!res.ok) {
            const err = await res.text();
            console.error("Fetch Doctors Failed:", res.status, err);
        } else {
            const doctors = await res.json();
            console.log("Fetch Doctors Success, count:", Array.isArray(doctors) ? doctors.length : (doctors.items?.length || 0));
        }

    } catch (error) {
        console.error("Integration Test Error:", error);
    }
}

testAuth();
