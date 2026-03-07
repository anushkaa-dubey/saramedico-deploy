"use client";
import styles from "../AdminDashboard.module.css";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { fetchAdminAppointments } from "@/services/admin";
import {
    Calendar as CalendarIcon,
    Clock,
    User,
    Building2,
    RefreshCw
} from "lucide-react";

export default function AdminAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        setLoading(true);
        try {
            const data = await fetchAdminAppointments();
            setAppointments(data);
        } catch (err) {
            console.error("Failed to load appointments:", err);
        } finally {
            setLoading(false);
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
    };

const getStatusStyle = (status) => {

  const map = {
    accepted: { bg: "#f0fdf4", text: "#16a34a" },
    confirmed: { bg: "#f0fdf4", text: "#16a34a" },
    completed: { bg: "#f0fdf4", text: "#16a34a" },

    pending: { bg: "#fef3c7", text: "#d97706" },

    cancelled: { bg: "#fef2f2", text: "#ef4444" },
    rejected: { bg: "#fef2f2", text: "#ef4444" },
    declined: { bg: "#fef2f2", text: "#ef4444" }
  };

  return map[(status || "").toLowerCase()] || {
    bg: "#f1f5f9",
    text: "#64748b"
  };

};
    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            style={{ width: "100%" }}
        >
            <motion.div className={styles.titleRow} variants={itemVariants}>
                <div>
                    <h2 className={styles.heading}>All Appointments</h2>
                    <p className={styles.subtext}>System-wide appointment records across all organizations.</p>
                </div>
                <button className={styles.secondaryBtn} onClick={loadAppointments} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <RefreshCw size={14} />
                    Refresh
                </button>
            </motion.div>

            <motion.div className={styles.card} variants={itemVariants}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>DATE & TIME</th>
                            <th>DOCTOR</th>
                            <th>PATIENT</th>
                            <th>ORGANIZATION</th>
                            <th>REASON</th>
                            <th>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                                    Loading appointments...
                                </td>
                            </tr>
                        ) : appointments.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                                    No appointments found in the system.
                                </td>
                            </tr>
                        ) : (
appointments
  .sort((a,b) => new Date(b.requested_date) - new Date(a.requested_date))
  .map(app => {
                                return (
                                    <tr key={app.id}>
                                        {(() => {
                                            const dateObj = app.requested_date ? new Date(app.requested_date) : null;
                                            const statusStyle = getStatusStyle(app.status);
                                            return (
                                                <>
                                            <td>
                                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                                    <div style={{ padding: "8px", background: "#f8fafc", borderRadius: "8px", color: "#6366f1" }}>
                                                        <CalendarIcon size={16} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: "600", fontSize: "13px" }}>
                                                            {(() => {
                                                                const dateObj = app.requested_date ? new Date(app.requested_date) : null;
                                                                return dateObj ? dateObj.toLocaleDateString() : "—";
                                                            })()}
                                                        </div>
                                                        <div style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "3px" }}>
                                                            <Clock size={10} />
                                                            {(() => {
                                                                const dateObj = app.requested_date ? new Date(app.requested_date) : null;
                                                                return dateObj ? dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "All Day";
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <User size={14} />
                                                    {app.doctor_name || "—"}
                                                </div>
                                            </td>

                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <User size={14} />
                                                    {app.patient_name || "—"}
                                                </div>
                                            </td>

                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
                                                    <Building2 size={13} />
                                                    {app.organization_name || "—"}
                                                </div>
                                            </td>

                                            <td style={{ fontSize: "13px", maxWidth: "160px" }}>
                                                {app.reason || "—"}
                                            </td>

                                            <td>
                                                <span
                                                    style={{
                                                        padding: "4px 10px",
                                                        borderRadius: "99px",
                                                        fontSize: "11px",
                                                        fontWeight: "700",
                                                        background: statusStyle.bg,
                                                        color: statusStyle.text
                                                    }}
                                                >
                                                    {app.status || "Scheduled"}
                                                </span>
                                            </td>
                                            </>
                                            );
                                        })()}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </motion.div>
        </motion.div>
    );
}