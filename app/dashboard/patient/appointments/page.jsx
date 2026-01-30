"use client";

import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import styles from "../records/Records.module.css";
import { motion } from "framer-motion";
import Link from "next/link";
import { fetchAppointments } from "@/services/patient";

export default function AppointmentsPage() {
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
        } catch (err) {
            console.error("Failed to load appointments:", err);
            setError(err.message || "Failed to load your appointments. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Topbar />

            <section className={styles.wrapper}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>My Appointments</h2>
                        <p style={{ color: '#64748b' }}>Check your appointment status and history.</p>
                    </div>
                    <Link href="/dashboard/patient/appointments/request">
                        <button className={styles.requestCTA}>
                            <span>+</span> Request New Appointment
                        </button>
                    </Link>
                </div>

                {error && <p style={{ color: "red", padding: "0 24px" }}>{error}</p>}

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>Appointment Status</h3>
                    </div>

                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>Loading appointments...</div>
                    ) : appointments.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>You have no appointment requests.</div>
                    ) : (
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>DOCTOR</th>
                                        <th>DATE & TIME</th>
                                        <th>STATUS</th>
                                        <th>NOTES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map((apt) => (
                                        <tr key={apt.id}>
                                            <td>{apt.doctor_name || (apt.doctor && apt.doctor.full_name) || "Unknown Doctor"}</td>
                                            <td>{new Date(apt.requested_date).toLocaleString()}</td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <span
                                                        style={{
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            background: apt.status === 'accepted' ? '#dcfce7' :
                                                                apt.status === 'declined' ? '#fee2e2' : '#fef9c3',
                                                            color: apt.status === 'accepted' ? '#166534' :
                                                                apt.status === 'declined' ? '#991b1b' : '#854d0e',
                                                            width: 'fit-content'
                                                        }}
                                                    >
                                                        {apt.status.toUpperCase()}
                                                    </span>
                                                    {apt.status === 'accepted' && (apt.join_url || apt.zoom_url) && (
                                                        <a
                                                            href={apt.join_url || apt.zoom_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                padding: "6px 12px",
                                                                background: "linear-gradient(90deg, #359AFF, #9CCDFF)",
                                                                color: "white",
                                                                borderRadius: "6px",
                                                                fontSize: "12px",
                                                                fontWeight: "bold",
                                                                textDecoration: "none",
                                                                marginTop: "4px"
                                                            }}
                                                        >
                                                            🎥 Join Meeting
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ fontSize: '14px', color: '#64748b' }}>
                                                {apt.doctor_notes || apt.reason || "No notes yet"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>
        </motion.div>
    );
}

