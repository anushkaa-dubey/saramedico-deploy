"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "../../components/Topbar";
import styles from "../../PatientDashboard.module.css";
import { motion } from "framer-motion";
// import { createAppointment } from "@/services/patient";

export default function RequestAppointment() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        doctor_id: "default-doc-id", // In real app, this would come from a selection
        requested_date: "",
        reason: ""
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Prepare payload
            const payload = {
                ...formData,
                requested_date: new Date(formData.requested_date).toISOString()
            };

            // TODO: Replace with actual API call
            // await createAppointment(payload);

            console.log("Appointment request payload ready:", payload);
            alert("Appointment requested successfully!");
            router.push("/dashboard/patient");
        } catch (error) {
            console.error("Failed to request appointment:", error);
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

            <section className={styles.header} style={{ padding: "24px" }}>
                <div>
                    <h2 className={styles.greeting}>Request Appointment</h2>
                    <p className={styles.sub}>Schedule a new consultation with your doctor</p>
                </div>
            </section>

            <div style={{ maxWidth: "600px", margin: "24px", padding: "32px", background: "white", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#1e293b" }}>Preferred Date & Time</label>
                        <input
                            type="datetime-local"
                            required
                            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                            value={formData.requested_date}
                            onChange={(e) => setFormData({ ...formData, requested_date: e.target.value })}
                        />
                    </div>

                    <div style={{ marginBottom: "24px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#1e293b" }}>Reason for Visit</label>
                        <textarea
                            required
                            placeholder="Briefly describe your health concern..."
                            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", height: "120px" }}
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            width: "100%",
                            padding: "14px",
                            background: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "700",
                            cursor: submitting ? "not-allowed" : "pointer",
                            opacity: submitting ? 0.7 : 1
                        }}
                    >
                        {submitting ? "Sending Request..." : "Request Appointment"}
                    </button>
                </form>
            </div>
        </motion.div>
    );
}
