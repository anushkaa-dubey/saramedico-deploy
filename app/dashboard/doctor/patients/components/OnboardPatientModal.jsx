"use client";
import { useState } from "react";
import styles from "./OnboardPatientModal.module.css";
import { onboardPatient } from "@/services/doctor";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Check, X } from "lucide-react";

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

        try {
            const payload = {
                full_name: `${formData.first_name} ${formData.last_name}`,
                email: formData.email,
                password: formData.password,
                date_of_birth: formData.date_of_birth,
                gender: formData.gender,
                // phone_number: formData.phone_number,
                phone_number: `+${formData.phone_number.replace(/\D/g, "")}`,
                address: {
                    street: formData.address_street,
                    city: formData.address_city,
                    state: formData.address_state,
                    zip_code: formData.address_zipCode
                },
                emergency_contact: {
                    name: formData.emergency_name,
                    relationship: formData.emergency_relationship,
                    phone_number: formData.emergency_phone
                }
            }; await onboardPatient(payload);
            setOnboardedData({ email: formData.email, password: formData.password });
            onSuccess();
        } catch (err) {
            console.error("Onboarding error:", err);
            setError(err.message || "Failed to onboard patient. Please check all fields.");
        } finally {
            setLoading(false);
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
                    {onboardedData ? (
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
