"use client";

import { useState, useEffect } from "react";
import styles from "../AdminDashboard.module.css";
import messagesIcon from "@/public/icons/messages.svg";
import { motion } from "framer-motion";
import { fetchCalendarEvents } from "@/services/calendar";

export default function AppointmentsManagement() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAppointments = async () => {
            setLoading(true);

            try {
                const start = new Date();
                const end = new Date();

                end.setDate(end.getDate() + 30); // fetch next 30 days

                const data = await fetchCalendarEvents({
                    start_date: start.toISOString(),
                    end_date: end.toISOString(),
                    event_type: "appointment"
                });

                setAppointments(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch appointments:", err);
            } finally {
                setLoading(false);
            }
        };

        loadAppointments();
    }, []);

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        >
            <motion.div className={styles.titleRow} variants={itemVariants}>
                <div>
                    <h2 className={styles.heading}>Appointments Management</h2>
                    <p className={styles.subtext}>
                        Monitor and manage clinic bookings, schedules, and patient notifications
                    </p>
                </div>
            </motion.div>

            <motion.div className={styles.managementSection} variants={itemVariants}>
                <div className={styles.contextPanel} style={{ height: "auto", opacity: 1 }}>
                    <div className={styles.panelContent}>
                        <div className={styles.bookingsTableWrapper}>
                            <table className={styles.bookingsTable}>
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Patient</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                                                Loading appointments...
                                            </td>
                                        </tr>
                                    ) : appointments.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                                                No appointments found.
                                            </td>
                                        </tr>
                                    ) : (
                                        appointments.map((b, i) => (
                                            <tr key={b.id || i}>
                                                <td>
                                                    {b.start_time
                                                        ? new Date(b.start_time).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit"
                                                        })
                                                        : "N/A"}
                                                </td>

                                                <td>
                                                    {b.metadata?.patient_name ||
                                                        b.user_name ||
                                                        b.title ||
                                                        "Consultation"}
                                                </td>

                                                <td>{b.event_type || "Appointment"}</td>

                                                <td>
                                                    <span
                                                        className={`${styles.statusBadge} ${styles[(b.status || "pending").toLowerCase()]
                                                            }`}
                                                    >
                                                        {b.status || "Pending"}
                                                    </span>
                                                </td>

                                                <td className={styles.actionBtns}>
                                                    <button className={styles.tableActionBtn}>
                                                        Confirm
                                                    </button>
                                                    <button className={styles.tableActionBtnSecondary}>
                                                        Reschedule
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>

                            <div className={styles.notifyBanner}>
                                <img src={messagesIcon.src} alt="" width="16" />
                                <span>
                                    Selected patients will be notified automatically via Email.
                                </span>
                                <button className={styles.notifyAllBtn}>Notify All</button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}