"use client";
import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import styles from "../DoctorDashboard.module.css";
import { motion } from "framer-motion";
import { fetchAppointments, approveAppointment, updateAppointmentStatus, fetchPatients } from "@/services/doctor";

export default function DoctorAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadAppointments();
    }, []);

    const [patientsMap, setPatientsMap] = useState({});

    const loadAppointments = async () => {
        setLoading(true);
        setError("");
        try {
            const [appointmentsData, patientsData] = await Promise.all([
                fetchAppointments(),
                fetchPatients()
            ]);

            // Create a lookup map for patients
            const pMap = {};
            if (Array.isArray(patientsData)) {
                patientsData.forEach(p => {
                    if (p.id) pMap[p.id] = p;
                });
            }
            setPatientsMap(pMap);
            setAppointments(appointmentsData);
        } catch (error) {
            console.error("Failed to load data:", error);
            setError("Failed to load appointments. Please ensure you are logged in.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (appointment, status) => {
        const id = appointment.id || appointment;

        try {
            if (status === 'accepted') {
                // Use requested_date as appointment_time
                const appointmentTime = appointment.requested_date || new Date().toISOString();

                const updated = await approveAppointment(id, {
                    appointment_time: appointmentTime
                });

                setAppointments(prev => prev.map(apt =>
                    apt.id === id ? {
                        ...apt,
                        status: 'accepted',
                        start_url: updated.start_url,
                        join_url: updated.join_url
                    } : apt
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
                    <div style={{ overflowX: "auto" }}>
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
                                        <td>
                                            {
                                                apt.patient_name ||
                                                apt.patientName ||
                                                (apt.patient && (apt.patient.full_name || (apt.patient.first_name ? `${apt.patient.first_name} ${apt.patient.last_name}` : null))) ||
                                                (patientsMap[apt.patient_id] && (patientsMap[apt.patient_id].name || patientsMap[apt.patient_id].full_name)) ||
                                                (apt.user && apt.user.full_name) ||
                                                "Unknown Patient"
                                            }
                                        </td>
                                        <td>{new Date(apt.requested_date || apt.date).toLocaleString()}</td>
                                        <td>{apt.reason}</td>
                                        <td>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                <span
                                                    className={apt.status === 'pending' ? styles.inReview : styles.completed}
                                                    style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "12px", width: "fit-content", fontWeight: "600" }}
                                                >
                                                    {apt.status.toUpperCase()}
                                                </span>
                                                {apt.status === 'accepted' && (apt.start_url || apt.zoom_url) && (
                                                    <a
                                                        href={apt.start_url || apt.zoom_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            padding: "6px 12px",
                                                            background: "#3b82f6",
                                                            color: "white",
                                                            borderRadius: "6px",
                                                            fontSize: "12px",
                                                            fontWeight: "bold",
                                                            textDecoration: "none",
                                                            width: "fit-content"
                                                        }}
                                                    >
                                                        Start Meeting
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {apt.status === 'pending' && (
                                                <div style={{ display: "flex", gap: "8px" }}>
                                                    <button
                                                        onClick={() => handleStatusChange(apt, 'accepted')}
                                                        style={{ background: "#22c55e", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(apt, 'declined')}
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
                    </div>
                )}
            </div>
        </motion.div>
    );
}
