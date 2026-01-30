"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "../../components/Topbar";
import styles from "../../PatientDashboard.module.css";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { bookAppointment, fetchDoctors } from "@/services/patient";

export default function RequestAppointment() {
    const router = useRouter();
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        doctor_id: "",
        requested_date: "",
        reason: "",
        grant_access_to_history: true
    });
    const [submitting, setSubmitting] = useState(false);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadDoctors();
    }, []);

    const loadDoctors = async () => {
        setLoadingDocs(true);
        setError("");
        try {
            const data = await fetchDoctors();
            console.log("Fetched doctors raw data:", data);

            // Defensive: ensure we have an array
            let doctorsArray = [];
            if (Array.isArray(data)) {
                doctorsArray = data;
            } else if (data && typeof data === 'object') {
                // Check for common wrappers
                doctorsArray = data.doctors || data.items || data.data || [];
            }

            setDoctors(doctorsArray);
        } catch (err) {
            console.error("Failed to load doctors:", err);
            setError(err.message || "Failed to load available doctors.");
        } finally {
            setLoadingDocs(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.doctor_id) {
            alert("Please select a doctor");
            return;
        }
        setSubmitting(true);
        setError("");

        try {
            const payload = {
                ...formData,
                requested_date: new Date(formData.requested_date).toISOString()
            };

            await bookAppointment(payload);
            alert("Appointment requested successfully!");
            router.push("/dashboard/patient/appointments");
        } catch (error) {
            console.error("Failed to request appointment:", error);
            setError(error.message || "Failed to book appointment. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ width: "100%" }}
        >
            <Topbar />

            <section className={styles.header} style={{ padding: "24px 24px 12px 24px" }}>
                <div>
                    <h2 className={styles.greeting}>Request Appointment</h2>
                    <p className={styles.sub}>Schedule a new consultation with your doctor</p>
                </div>
            </section>

            <div className={styles.formCard} style={{ marginTop: "12px" }}>
                {error && <p style={{ color: "#ef4444", background: "#fef2f2", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", border: "1px solid #fee2e2" }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Select Doctor</label>
                        {loadingDocs ? (
                            <p style={{ fontSize: "14px", color: "#64748b" }}>Loading doctors...</p>
                        ) : (
                            <select
                                required
                                value={formData.doctor_id}
                                onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                            >
                                <option value="">Choose a doctor</option>
                                {doctors.map(doc => (
                                    <option key={doc.id} value={doc.id}>
                                        {doc.name} ({doc.specialty})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Preferred Date & Time</label>
                        <input
                            type="datetime-local"
                            required
                            value={formData.requested_date}
                            onChange={(e) => setFormData({ ...formData, requested_date: e.target.value })}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Reason for Visit</label>
                        <textarea
                            required
                            placeholder="Briefly describe your health concern..."
                            style={{ height: "120px" }}
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        />
                    </div>

                    <div style={{ marginBottom: "24px", display: "flex", alignItems: "flex-start", gap: "10px", marginTop: "12px" }}>
                        <input
                            type="checkbox"
                            id="grant_access"
                            checked={formData.grant_access_to_history}
                            onChange={(e) => setFormData({ ...formData, grant_access_to_history: e.target.checked })}
                            style={{ marginTop: "3px", width: "16px", height: "16px", flexShrink: 0 }}
                        />
                        <label htmlFor="grant_access" style={{ fontSize: "14px", color: "#475569", lineHeight: "1.5" }}>
                            Grant doctor access to my medical history (HIPAA compliant)
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className={styles.submitBtn}
                    >
                        {submitting ? (
                            <>
                                <div className={styles.loadingSpinner}></div>
                                Sending Request...
                            </>
                        ) : (
                            "Request Appointment"
                        )}
                    </button>
                </form>
            </div>
        </motion.div>
    );
}
