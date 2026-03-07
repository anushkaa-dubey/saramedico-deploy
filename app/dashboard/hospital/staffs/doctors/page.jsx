"use client";
import Topbar from "../../components/Topbar";
import styles from "../../HospitalDashboard.module.css";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { fetchDepartmentStaff, fetchOrganizationMembers } from "@/services/hospital";

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await fetchDepartmentStaff({ role: "doctor" });
                if (data && data.length > 0) {
                    setDoctors(data);
                } else {
                    const members = await fetchOrganizationMembers();
                    setDoctors(members.filter(m => m.role === "doctor" || m.specialty));
                }
            } catch (err) {
                console.error("Failed to load doctors:", err);
                setError("Backend not connected — doctor list unavailable.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: "flex", flexDirection: "column", background: "transparent", padding: 0, minHeight: "100%" }}
        >
            <Topbar title="Doctors Management" />

            <div className={styles.contentWrapper}>
                <div className={styles.card}>
                    <div className={styles.cardTitle}>
                        <span style={{ fontSize: "18px", fontWeight: "700" }}>Doctors Directory</span>
                        <button className={styles.primaryBtn}>+ Add New Doctor</button>
                    </div>

                    {error && (
                        <div style={{ padding: "12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px", margin: "16px 0", fontSize: "13px" }}>
                            {error}
                        </div>
                    )}

                    <div className={styles.activityTableContainer} style={{ marginTop: "20px" }}>
                        <div className={styles.tableScrollWrapper}>
                            <table className={styles.activityTable}>
                                <thead>
                                    <tr className={styles.activityHeader}>
                                        <th>NAME</th>
                                        <th>SPECIALTY</th>
                                        <th>PATIENTS</th>
                                        <th>SHIFT</th>
                                        <th>STATUS</th>
                                        <th style={{ textAlign: "right" }}>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="6" style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>Loading doctors...</td></tr>
                                    ) : doctors.length === 0 ? (
                                        <tr><td colSpan="6" style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>Backend not connected — no doctors found.</td></tr>
                                    ) : doctors.map((doc, i) => (
                                        <tr key={doc.id || i} className={styles.activityRow}>
                                            <td style={{ fontWeight: "700", whiteSpace: "nowrap" }}>{doc.full_name || doc.name || "—"}</td>
                                            <td style={{ color: "#64748b", whiteSpace: "nowrap" }}>{doc.specialty || doc.department || "General"}</td>
                                            <td>{doc.patient_count ?? "—"}</td>
                                            <td>{doc.shift || "Day"}</td>
                                            <td>
                                                <span className={doc.is_active !== false ? styles.statusCompleted : styles.statusReview} style={{ whiteSpace: "nowrap" }}>
                                                    {doc.status || (doc.is_active !== false ? "Active" : "Inactive")}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: "right" }}>
                                                <button style={{ background: "none", border: "none", color: "#359aff", cursor: "pointer", fontWeight: "700" }}>Manage</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
