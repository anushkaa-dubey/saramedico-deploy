"use client";
import { useState, useEffect } from "react";
import styles from "./OnboardPatientModal.module.css"; // Reuse the same styles
import { fetchPatientForDoctor, updatePatientForDoctor } from "@/services/doctor";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function EditPatientModal({ isOpen, onClose, patientId, onSuccess }) {
    const [formData, setFormData] = useState({
        fullName: "",
        dateOfBirth: "",
        gender: "male",
        phoneNumber: "",
        homePhone: "",
        email: "",
        address: {
            street: "",
            city: "",
            state: "",
            zipCode: ""
        },
        emergencyContact: {
            name: "",
            relationship: "",
            phoneNumber: ""
        },
        medicalHistory: "",
        allergies: [],
        medications: []
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen && patientId) {
            loadPatientData();
        }
    }, [isOpen, patientId]);

    const loadPatientData = async () => {
        setFetching(true);
        setError("");
        try {
            const data = await fetchPatientForDoctor(patientId);
            setFormData({
                fullName: data.full_name || data.fullName || "",
                dateOfBirth: data.dob || data.dateOfBirth || data.date_of_birth || "",
                gender: data.gender || "male",
                phoneNumber: data.phone_number || data.phoneNumber || "",
                homePhone: data.home_phone || data.homePhone || "",
                email: data.email || "",
                address: {
                    street: data.address?.street || "",
                    city: data.address?.city || "",
                    state: data.address?.state || "",
                    zipCode: data.address?.zipCode || ""
                },
                emergencyContact: {
                    name: data.emergency_contact?.name || data.emergencyContact?.name || "",
                    relationship: data.emergency_contact?.relationship || data.emergencyContact?.relationship || "",
                    phoneNumber: data.emergency_contact?.phone_number || data.emergencyContact?.phoneNumber || ""
                },
                medicalHistory: typeof (data.medical_history || data.medicalHistory) === 'object' 
                    ? JSON.stringify(data.medical_history || data.medicalHistory, null, 2) 
                    : (data.medical_history || data.medicalHistory || ""),
                allergies: data.allergies || [],
                medications: data.medications || []
            });
        } catch (err) {
            console.error("Failed to fetch patient data:", err);
            setError("Failed to load patient profile.");
        } finally {
            setFetching(false);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const payload = {
                ...formData,
                phoneNumber: formData.phoneNumber.startsWith("+") ? formData.phoneNumber : `+${formData.phoneNumber}`,
                homePhone: formData.homePhone ? (formData.homePhone.startsWith("+") ? formData.homePhone : `+${formData.homePhone}`) : null,
            };
            await updatePatientForDoctor(patientId, payload);
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error("Update error:", err);
            setError(err.message || "Failed to update patient details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal} style={{ maxWidth: '650px' }}>
                <div className={styles.header}>
                    <h3>Edit Patient Profile</h3>
                    <button onClick={onClose} className={styles.closeBtn}>&times;</button>
                </div>
                <div className={styles.scrollContent}>
                    {fetching ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>Loading patient details...</div>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.field}>
                                <label>Full Name <span className={styles.required}>*</span></label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                />
                            </div>

                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label>Date of Birth <span className={styles.required}>*</span></label>
                                    <input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
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

                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Mobile Phone <span className={styles.required}>*</span></label>
                                    <PhoneInput
                                        country={"in"}
                                        value={formData.phoneNumber}
                                        onChange={(phone) => setFormData({ ...formData, phoneNumber: phone })}
                                        inputStyle={{ width: "100%", height: "42px" }}
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Home Phone</label>
                                    <PhoneInput
                                        country={"in"}
                                        value={formData.homePhone}
                                        onChange={(phone) => setFormData({ ...formData, homePhone: phone })}
                                        inputStyle={{ width: "100%", height: "42px" }}
                                    />
                                </div>
                            </div>

                            <hr style={{ margin: "20px 0", border: "0", borderTop: "1px solid #e2e8f0" }} />
                            <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#0f172a" }}>Address</h4>

                            <div className={styles.field}>
                                <label>Street Address</label>
                                <input
                                    type="text"
                                    value={formData.address.street}
                                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                                />
                            </div>
                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label>City</label>
                                    <input
                                        type="text"
                                        value={formData.address.city}
                                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>State</label>
                                    <input
                                        type="text"
                                        value={formData.address.state}
                                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Zip Code</label>
                                    <input
                                        type="text"
                                        value={formData.address.zipCode}
                                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zipCode: e.target.value } })}
                                    />
                                </div>
                            </div>

                            <hr style={{ margin: "20px 0", border: "0", borderTop: "1px solid #e2e8f0" }} />
                            <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#0f172a" }}>Medical Information</h4>

                            <div className={styles.field}>
                                <label>Medical History</label>
                                <textarea
                                    style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", minHeight: "80px" }}
                                    value={formData.medicalHistory}
                                    onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                                />
                            </div>
                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label>Allergies (comma separated)</label>
                                    <input
                                        type="text"
                                        value={Array.isArray(formData.allergies) ? formData.allergies.join(", ") : formData.allergies}
                                        onChange={(e) => setFormData({ ...formData, allergies: e.target.value.split(",").map(s => s.trim()) })}
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Medications (comma separated)</label>
                                    <input
                                        type="text"
                                        value={Array.isArray(formData.medications) ? formData.medications.join(", ") : formData.medications}
                                        onChange={(e) => setFormData({ ...formData, medications: e.target.value.split(",").map(s => s.trim()) })}
                                    />
                                </div>
                            </div>

                            {error && <div className={styles.errorContainer}>{error}</div>}

                            <div className={styles.actions}>
                                <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
                                <button
                                    type="submit"
                                    className={styles.submitBtn}
                                    disabled={loading}
                                >
                                    {loading ? "Updating..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
