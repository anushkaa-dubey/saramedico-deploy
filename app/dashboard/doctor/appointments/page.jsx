"use client";
import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import styles from "../DoctorDashboard.module.css";
import { motion } from "framer-motion";
// import { fetchAppointments, updateAppointmentStatus } from "@/services/doctor";

export default function DoctorAppointments() {
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

            // Dummy data
            const dummyAppointments = [
                {
                    id: "uuid-1",
                    patientName: "Rohit Sharma",
                    date: "2026-02-01T10:00:00Z",
                    reason: "Follow-up consultation",
                    status: "pending"
                },
                {
                    id: "uuid-2",
                    patientName: "Sara Shetty",
                    date: "2026-02-02T11:30:00Z",
                    reason: "Initial check-up",
                    status: "pending"
                }
            ];
            setAppointments(dummyAppointments);
        } catch (error) {
            console.error("Failed to load appointments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            // TODO: Replace with actual API call
            // await updateAppointmentStatus(id, status);

            setAppointments(prev => prev.map(apt =>
                apt.id === id ? { ...apt, status } : apt
            ));
            console.log(`Appointment ${id} status updated to ${status}`);
        } catch (error) {
            console.error("Failed to update status:", error);
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

            <div className={styles.card} style={{ margin: "24px" }}>
                {loading ? (
                    <div style={{ padding: "40px", textAlign: "center" }}>Loading requests...</div>
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
                                    <td>{apt.patientName}</td>
                                    <td>{new Date(apt.date).toLocaleString()}</td>
                                    <td>{apt.reason}</td>
                                    <td>
                                        <span className={apt.status === 'pending' ? styles.inReview : styles.completed}>
                                            {apt.status}
                                        </span>
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
