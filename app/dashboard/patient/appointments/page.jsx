"use client";

import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import styles from "../records/Records.module.css";
import { motion } from "framer-motion";
import Link from "next/link";
// import { fetchAppointments } from "@/services/patient";

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        setLoading(true);
        try {
            // TODO: Replace with actual API call
            // const data = await fetchAppointments();
            // setAppointments(data);

            // Dummy data for Section 6 Part 3
            const dummyAppointments = [
                {
                    id: "uuid-1",
                    doctor_id: "doc-1",
                    doctor_name: "Dr. Emily Chen",
                    requested_date: "2026-02-01T10:00:00Z",
                    status: "accepted",
                    doctor_notes: "Scheduled for next week"
                },
                {
                    id: "uuid-2",
                    doctor_id: "doc-2",
                    doctor_name: "Dr. Sarah Wilson",
                    requested_date: "2026-02-15T14:30:00Z",
                    status: "pending",
                    doctor_notes: ""
                }
            ];
            setAppointments(dummyAppointments);
        } catch (error) {
            console.error("Failed to load appointments:", error);
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
                        <button className={styles.editBtn} style={{ background: '#3b82f6', color: 'white', border: 'none' }}>
                            + Request New Appointment
                        </button>
                    </Link>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>Appointment Status</h3>
                    </div>

                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>Loading appointments...</div>
                    ) : (
                        <div style={{ padding: '0 24px 24px' }}>
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
                                            <td>{apt.doctor_name}</td>
                                            <td>{new Date(apt.requested_date).toLocaleString()}</td>
                                            <td>
                                                <span
                                                    style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        background: apt.status === 'accepted' ? '#dcfce7' : '#fef9c3',
                                                        color: apt.status === 'accepted' ? '#166534' : '#854d0e'
                                                    }}
                                                >
                                                    {apt.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '14px', color: '#64748b' }}>
                                                {apt.doctor_notes || "No notes yet"}
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

