"use client";
import { useState } from "react";
import styles from "./OnboardPatientModal.module.css";
import { onboardPatient, fetchDoctorProfile } from "@/services/doctor";
import { requestAccess } from "@/services/permissions";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Check, X, ShieldCheck } from "lucide-react";

export default function OnboardPatientModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        phone_number: "",
        email: "",
        password: "",
        gender: "male",
        address_street: "",
        address_city: "",
        address_state: "",
        address_zipCode: "",
        emergency_name: "",
        emergency_relationship: "",
        emergency_phone: "",
        medicalHistory: "",
        allergies: "",
        medications: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [onboardedData, setOnboardedData] = useState(null);

    // Conflict state — patient already exists
    const [conflictPatient, setConflictPatient] = useState(null); // { patient_id, email }
    const [requestingAccess, setRequestingAccess] = useState(false);
    const [accessRequested, setAccessRequested] = useState(false);

    if (!isOpen) return null;

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    const isFormValid = formData.first_name &&
        formData.last_name &&
        formData.email &&
        formData.date_of_birth &&
        formData.phone_number &&
        formData.password;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setConflictPatient(null);
        setAccessRequested(false);

        try {
            const payload = {
                full_name: `${formData.first_name} ${formData.last_name}`,
                email: formData.email,
                password: formData.password,
                phone_number: `+${formData.phone_number.replace(/\D/g, "")}`,
                date_of_birth: formData.date_of_birth,
                gender: formData.gender,
                address: {
                    street: formData.address_street,
                    city: formData.address_city,
                    state: formData.address_state,
                    zip: formData.address_zipCode
                },
                medical_history: formData.medicalHistory || "None",
                allergies: formData.allergies
                    ? formData.allergies.split(",").map(a => a.trim())
                    : [],
                medications: formData.medications
                    ? formData.medications.split(",").map(m => m.trim())
                    : []
            };

            await onboardPatient(payload);
            setOnboardedData({ email: formData.email, password: formData.password });
            onSuccess();
        } catch (err) {
            console.error("Onboarding error:", err);

            // Detect 409 conflict: patient already exists
            const isConflict =
                err?.status === 409 ||
                err?.status_code === 409 ||
                (typeof err?.detail === "string" && (
                    err.detail.toLowerCase().includes("already exists") ||
                    err.detail.toLowerCase().includes("duplicate") ||
                    err.detail.toLowerCase().includes("conflict")
                )) ||
                (typeof err?.message === "string" && (
                    err.message.toLowerCase().includes("already exists") ||
                    err.message.toLowerCase().includes("conflict")
                ));

            if (isConflict) {
                // Extract patient_id from the conflict response if backend provides it
                const existingPatientId = err?.patient_id || err?.data?.patient_id || null;
                setConflictPatient({ patient_id: existingPatientId, email: formData.email });
                setError("");
            } else {
                const msg = typeof err?.detail === "string"
                    ? err.detail
                    : (err?.message || "Failed to onboard patient. Please check all fields.");
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRequestAccess = async () => {
        if (!conflictPatient?.patient_id) {
            // If we don't have a patient_id, show a message — doctor must find patient in directory
            setAccessRequested(true);
            return;
        }
        setRequestingAccess(true);
        try {
            const profile = await fetchDoctorProfile();
            const doctorId = profile?.id;
            await requestAccess({
                patient_id: conflictPatient.patient_id,
                doctor_id: doctorId,
                access_level: "read_analyze",
                ai_access_permission: true,
            });
            setAccessRequested(true);
        } catch (err) {
            setError(err?.message || "Failed to send access request. Please try again.");
        } finally {
            setRequestingAccess(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3>{onboardedData ? "Patient Onboarded Ready!" : "Onboard New Patient"}</h3>
                    <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
                </div>
                <div className={styles.scrollContent}>
                    {conflictPatient && !onboardedData ? (
                        /* ── Conflict: patient already exists ── */
                        <div className={styles.successView}>
                            <div style={{
                                width: "56px", height: "56px", borderRadius: "50%",
                                background: "#fef9c3", display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 16px"
                            }}>
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            </div>
                            {!accessRequested ? (
                                <>
                                    <p className={styles.successTitle} style={{ color: "#92400e" }}>
                                        Patient Already Exists
                                    </p>
                                    <p style={{ fontSize: "13px", color: "#64748b", textAlign: "center", marginBottom: "20px", lineHeight: 1.6 }}>
                                        A patient with email <strong>{conflictPatient.email}</strong> is already registered.
                                        Would you like to request access to this patient's records?
                                    </p>
                                    {error && <div className={styles.errorContainer} style={{ marginBottom: "12px" }}>{error}</div>}
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                        <button
                                            onClick={handleRequestAccess}
                                            disabled={requestingAccess}
                                            className={styles.submitBtn}
                                            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                                        >
                                            <ShieldCheck size={16} />
                                            {requestingAccess ? "Sending Request..." : "Request Access"}
                                        </button>
                                        <button onClick={() => { setConflictPatient(null); setError(""); }} className={styles.cancelBtn}>
                                            Go Back
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className={styles.successTitle} style={{ color: "#059669" }}>Access Request Sent!</p>
                                    <p style={{ fontSize: "13px", color: "#64748b", textAlign: "center", marginBottom: "20px", lineHeight: 1.6 }}>
                                        Your access request has been sent to the patient. Once approved, you will be
                                        able to view their documents and use AI chat.
                                    </p>
                                    <button onClick={onClose} className={styles.doneBtn}>Done</button>
                                </>
                            )}
                        </div>
                    ) : onboardedData ? (
                        <div className={styles.successView}>
                            <div className={styles.successIcon}><Check size={32} /></div>
                            <p className={styles.successTitle}>Patient Created Successfully!</p>
                            <p className={styles.warningText}>Please share these credentials with the patient. <strong>This password is shown only once.</strong></p>

                            <div className={styles.credentialBox}>
                                <div className={styles.credItem}>
                                    <label>Email</label>
                                    <div className={styles.credValue}>
                                        <span>{onboardedData.email}</span>
                                        <button onClick={() => handleCopy(onboardedData.email)} className={styles.copyBtn}>Copy</button>
                                    </div>
                                </div>
                                <div className={styles.credentialBoxInner}>
                                    <div className={styles.credItem}>
                                        <label>Password</label>
                                        <div className={styles.credValue}>
                                            <span>{onboardedData.password}</span>
                                            <button onClick={() => handleCopy(onboardedData.password)} className={styles.copyBtn}>Copy</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button onClick={onClose} className={styles.doneBtn}>Done</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label>First Name <span className={styles.required}>*</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g. John"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Last Name <span className={styles.required}>*</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Doe"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label>Email Address <span className={styles.required}>*</span></label>
                                <input
                                    type="email"
                                    placeholder="patient@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label>Date of Birth <span className={styles.required}>*</span></label>
                                    <input
                                        type="date"
                                        value={formData.date_of_birth}
                                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Gender <span className={styles.required}>*</span></label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        required
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label>Phone Number <span className={styles.required}>*</span></label>
                                <PhoneInput
                                    country={"in"}
                                    value={formData.phone_number}
                                    onChange={(phone) => setFormData({ ...formData, phone_number: phone })}
                                    inputStyle={{
                                        width: "100%",
                                        height: "42px",
                                        fontSize: "14px",
                                        borderRadius: "6px",
                                        border: "1px solid #e2e8f0",
                                    }}
                                    buttonStyle={{
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "6px 0 0 6px",
                                        backgroundColor: "#fff"
                                    }}
                                    containerStyle={{ marginBottom: "0px" }}
                                    enableSearch={true}
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>

                            <div className={styles.field}>
                                <label>Password <span className={styles.required}>*</span></label>
                                <input
                                    type="password"
                                    placeholder="Min. 8 characters"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>

                            <hr style={{ margin: "20px 0", border: "0", borderTop: "1px solid #e2e8f0" }} />
                            <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#0f172a" }}>Address</h4>

                            <div className={styles.field}>
                                <label>Street Address</label>
                                <input
                                    type="text"
                                    placeholder="123 Main St"
                                    value={formData.address_street}
                                    onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                                />
                            </div>
                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label>City</label>
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={formData.address_city}
                                        onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>State</label>
                                    <input
                                        type="text"
                                        placeholder="State"
                                        value={formData.address_state}
                                        onChange={(e) => setFormData({ ...formData, address_state: e.target.value })}
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Zip Code</label>
                                    <input
                                        type="text"
                                        placeholder="Zip"
                                        value={formData.address_zipCode}
                                        onChange={(e) => setFormData({ ...formData, address_zipCode: e.target.value })}
                                    />
                                </div>
                            </div>

                            <hr style={{ margin: "20px 0", border: "0", borderTop: "1px solid #e2e8f0" }} />
                            <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#0f172a" }}>Emergency Contact</h4>

                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        placeholder="Jane Doe"
                                        value={formData.emergency_name}
                                        onChange={(e) => setFormData({ ...formData, emergency_name: e.target.value })}
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Relationship</label>
                                    <input
                                        type="text"
                                        placeholder="Spouse"
                                        value={formData.emergency_relationship}
                                        onChange={(e) => setFormData({ ...formData, emergency_relationship: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className={styles.field}>
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    placeholder="+1 555-000-0000"
                                    value={formData.emergency_phone}
                                    onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                                />
                            </div>

                            <hr style={{ margin: "20px 0", border: "0", borderTop: "1px solid #e2e8f0" }} />
                            <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#0f172a" }}>Medical Information</h4>

                            <div className={styles.field}>
                                <label>Medical History</label>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="Past conditions, surgeries, etc."
                                    value={formData.medicalHistory}
                                    onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                                />
                            </div>
                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label>Allergies (comma separated)</label>
                                    <input
                                        type="text"
                                        placeholder="Peanuts, Penicillin"
                                        value={formData.allergies}
                                        onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Medications (comma separated)</label>
                                    <input
                                        type="text"
                                        placeholder="Lisinopril, Metformin"
                                        value={formData.medications}
                                        onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                                    />
                                </div>
                            </div>

                            {error && <div className={styles.errorContainer}>{error}</div>}

                            <div className={styles.actions}>
                                <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
                                <button
                                    type="submit"
                                    className={styles.submitBtn}
                                    disabled={loading || !isFormValid}
                                >
                                    {loading ? "Onboarding..." : "Onboard Patient"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
