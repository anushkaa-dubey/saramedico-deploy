/**
 * Full AI Permission Flow Test
 * ============================
 * 1. Doctor logs in, gets patient list
 * 2. Doctor sends AI access request to patient
 * 3. Patient logs in, GRANTS access with ai_access_permission: true
 * 4. Doctor verifies permission is now active
 * 5. Doctor tests AI chat — should succeed
 */

const API = "http://107.20.98.130:8000/api/v1";
const DOCTOR_EMAIL = "aarul@test.com";
const DOCTOR_PASS = "SecurePass123!";
const PATIENT_EMAIL = "panda@test.com";
const PATIENT_PASS = "SecurePass123!";

function log(label, data) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`  ${label}`);
    console.log("=".repeat(60));
    if (typeof data === "object") {
        console.log(JSON.stringify(data, null, 2));
    } else {
        console.log(data);
    }
}

async function step(name, fn) {
    process.stdout.write(`\n▶  ${name}... `);
    try {
        const result = await fn();
        console.log("✅ OK");
        return result;
    } catch (err) {
        console.log(`❌ FAILED: ${err.message}`);
        throw err;
    }
}

async function main() {
    console.log("\n🔬 AI Access Permission Flow — Full End-to-End Test");
    console.log(`   Backend: ${API}`);
    console.log(`   Doctor:  ${DOCTOR_EMAIL}`);
    console.log(`   Patient: ${PATIENT_EMAIL}`);

    // ─── STEP 1: Doctor Login ────────────────────────────────────────
    const doctorLoginRes = await step("Doctor login", async () => {
        const r = await fetch(`${API}/auth/login`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: DOCTOR_EMAIL, password: DOCTOR_PASS })
        });
        const data = await r.json();
        if (!r.ok) throw new Error(`${r.status} ${JSON.stringify(data)}`);
        return data;
    });
    const doctorToken = doctorLoginRes.access_token;
    log("Doctor Login Response", { access_token: "****" + doctorToken?.slice(-8), user: doctorLoginRes.user });

    // ─── STEP 2: Doctor gets their profile (to get doctor UUID) ─────
    const doctorMe = await step("Fetch doctor profile (/doctor/me)", async () => {
        const r = await fetch(`${API}/doctor/me`, {
            headers: { "Authorization": `Bearer ${doctorToken}` }
        });
        const data = await r.json();
        if (!r.ok) throw new Error(`${r.status} ${JSON.stringify(data)}`);
        return data;
    });
    const doctorId = doctorMe.id || doctorMe.doctor_profile?.id;
    log("Doctor Profile", { id: doctorId, name: doctorMe.full_name });

    // ─── STEP 3: Get doctor's patient list ──────────────────────────
    const patients = await step("Fetch doctor's patients", async () => {
        const r = await fetch(`${API}/doctor/patients`, {
            headers: { "Authorization": `Bearer ${doctorToken}` }
        });
        const data = await r.json();
        if (!r.ok) throw new Error(`${r.status} ${JSON.stringify(data)}`);
        return Array.isArray(data) ? data : (data.items || data.patients || []);
    });
    if (patients.length === 0) throw new Error("No patients found for this doctor!");
    const patient = patients[0];
    const patientId = patient.id || patient.patient_id;
    log("Using Patient", { id: patientId, name: patient.full_name || patient.name });

    // ─── STEP 4: Check current permission status ────────────────────
    const permBefore = await step("Check current permission (before)", async () => {
        const r = await fetch(`${API}/permissions/check?patient_id=${patientId}`, {
            headers: { "Authorization": `Bearer ${doctorToken}` }
        });
        return r.json();
    });
    log("Permission Status (BEFORE)", permBefore);

    // ─── STEP 5: Doctor requests AI access ──────────────────────────
    const requestResult = await step("Doctor requests AI access", async () => {
        const r = await fetch(`${API}/permissions/request`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${doctorToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                patient_id: patientId,
                reason: "AI Chart Review and Analysis — Test",
                expiry_days: 90
            })
        });
        const text = await r.text();
        console.log(`   Status: ${r.status}`);
        try { return JSON.parse(text); } catch { return text; }
    });
    log("Permission Request Result", requestResult);

    // ─── STEP 6: Patient Login ───────────────────────────────────────
    const patientLoginRes = await step("Patient login", async () => {
        const r = await fetch(`${API}/auth/login`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: PATIENT_EMAIL, password: PATIENT_PASS })
        });
        const data = await r.json();
        if (!r.ok) throw new Error(`${r.status} ${JSON.stringify(data)}`);
        return data;
    });
    const patientToken = patientLoginRes.access_token;
    log("Patient Login Response", { access_token: "****" + patientToken?.slice(-8), user: patientLoginRes.user });

    // ─── STEP 7: Patient grants AI access to doctor ─────────────────
    const grantResult = await step("Patient grants AI access to doctor", async () => {
        const r = await fetch(`${API}/permissions/grant-doctor-access`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${patientToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                doctor_id: doctorId,
                ai_access_permission: true   // ← explicitly enables AI access
            })
        });
        const text = await r.text();
        console.log(`   Status: ${r.status}`);
        try { return JSON.parse(text); } catch { return text; }
    });
    log("Grant Result", grantResult);

    // ─── STEP 8: Verify permission is now active ────────────────────
    const permAfter = await step("Check permission status (after grant)", async () => {
        const r = await fetch(`${API}/permissions/check?patient_id=${patientId}`, {
            headers: { "Authorization": `Bearer ${doctorToken}` }
        });
        return r.json();
    });
    log("Permission Status (AFTER)", permAfter);

    // ─── STEP 9: Test AI Chat ────────────────────────────────────────
    const chatRes = await step("Test AI chat (POST /doctor/ai/chat/doctor)", async () => {
        const r = await fetch(`${API}/doctor/ai/chat/doctor`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${doctorToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                patient_id: patientId,
                query: "What is a brief summary of this patient's health status?",
                document_id: null
            })
        });
        const text = await r.text();
        console.log(`   Status: ${r.status}`);
        return { status: r.status, body: text.slice(0, 300) };
    });
    log("AI Chat Response", chatRes);

    // ─── SUMMARY ─────────────────────────────────────────────────────
    console.log("\n" + "=".repeat(60));
    if (chatRes.status === 200) {
        console.log("  🎉 SUCCESS — Full AI permission flow works end-to-end!");
    } else if (chatRes.status === 403) {
        console.log("  ⚠️  AI chat still 403 after grant. Backend may require");
        console.log("      additional configuration (ai_access_permission in the DB).");
        console.log(`  Permission check says: has_permission=${permAfter.has_permission}, ai=${permAfter.ai_access_permission}`);
    } else {
        console.log(`  ⚠️  Unexpected status: ${chatRes.status}`);
    }
    console.log("=".repeat(60) + "\n");
}

main().catch(err => {
    console.error("\n\n💥 Test crashed:", err.message);
    process.exit(1);
});
