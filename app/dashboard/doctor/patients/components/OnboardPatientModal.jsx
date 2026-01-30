"use client";
import { useState } from "react";
import styles from "./OnboardPatientModal.module.css";
import { onboardPatient } from "@/services/doctor";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function OnboardPatientModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        phone_number: "",
        email: "",
        password: "",
        gender: "male"
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
                first_name: formData.first_name,
                last_name: formData.last_name,
                fullName: `${formData.first_name} ${formData.last_name}`,
                email: formData.email,
                password: formData.password,
                date_of_birth: formData.date_of_birth,
                gender: formData.gender,
                phone: formData.phone_number.startsWith("+") ? formData.phone_number : `+${formData.phone_number}`,
                phone_number: formData.phone_number.startsWith("+") ? formData.phone_number : `+${formData.phone_number}`,
                role: "patient"
            };

            await onboardPatient(payload);
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
                    <button onClick={onClose} className={styles.closeBtn}>&times;</button>
                </div>
                <div className={styles.scrollContent}>
                    {onboardedData ? (
                        <div className={styles.successView}>
                            <div className={styles.successIcon}>✓</div>
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
                                <div className={styles.credItem}>
                                    <label>Password</label>
                                    <div className={styles.credValue}>
                                        <span>{onboardedData.password}</span>
                                        <button onClick={() => handleCopy(onboardedData.password)} className={styles.copyBtn}>Copy</button>
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
