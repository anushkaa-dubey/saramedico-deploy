"use client";
import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import styles from "../DoctorDashboard.module.css";
import { motion } from "framer-motion";
import { fetchAppointments, approveAppointment, updateAppointmentStatus } from "@/services/doctor";

export default function DoctorAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await fetchAppointments();
            setAppointments(data);
        } catch (error) {
            console.error("Failed to load appointments:", error);
            setError("Failed to load appointments. Please ensure you are logged in.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            if (status === 'accepted') {
                const updated = await approveAppointment(id);
                setAppointments(prev => prev.map(apt =>
                    apt.id === id ? { ...apt, status: 'accepted', zoom_url: updated.join_url } : apt
                ));
            } else {
                await updateAppointmentStatus(id, status);
                setAppointments(prev => prev.map(apt =>
                    apt.id === id ? { ...apt, status } : apt
                ));
            }
        } catch (error) {
            console.error("Failed to update status:", error);
            alert(error.message || "Failed to update status");
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

            <section className={styles.header}>
                <div>
                    <h2 className={styles.greeting}>Appointment Requests</h2>
                    <p className={styles.sub}>Manage your consultation requests</p>
                </div>
            </section>

            {error && <p style={{ color: "red", padding: "0 24px" }}>{error}</p>}

            <div className={styles.card} style={{ margin: "24px" }}>
                {loading ? (
                    <div style={{ padding: "40px", textAlign: "center" }}>Loading requests...</div>
                ) : appointments.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center" }}>No appointment requests found.</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>PATIENT</th>
                                <th>DATE & TIME</th>
                                <th>REASON</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((apt) => (
                                <tr key={apt.id}>
                                    <td>{apt.patient_name || apt.patientName || (apt.user && apt.user.full_name) || "Unknown Patient"}</td>
                                    <td>{new Date(apt.requested_date || apt.date).toLocaleString()}</td>
                                    <td>{apt.reason}</td>
                                    <td>
                                        <span className={apt.status === 'pending' ? styles.inReview : styles.completed}>
                                            {apt.status}
                                        </span>
                                        {apt.status === 'accepted' && (apt.join_url || apt.zoom_url) && (
                                            <a
                                                href={apt.join_url || apt.zoom_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ display: "block", fontSize: "11px", color: "#3b82f6", marginTop: "4px" }}
                                            >
                                                Join Zoom
                                            </a>
                                        )}
                                    </td>
                                    <td>
                                        {apt.status === 'pending' && (
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                <button
                                                    onClick={() => handleStatusChange(apt.id, 'accepted')}
                                                    style={{ background: "#22c55e", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(apt.id, 'declined')}
                                                    style={{ background: "#ef4444", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </motion.div>
    );
}
