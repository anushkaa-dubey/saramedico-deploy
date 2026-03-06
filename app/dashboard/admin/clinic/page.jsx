"use client";
import styles from "../AdminDashboard.module.css";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { fetchOrgStats } from "@/services/admin";
import { Building2, BarChart2 } from "lucide-react";

export default function ClinicManagement() {
    const [orgStats, setOrgStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const stats = await fetchOrgStats();
            setOrgStats(stats || []);
        } catch (err) {
            console.error("Failed to load organization stats:", err);
        } finally {
            setLoading(false);
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} style={{ width: "100%" }}>

            <motion.div className={styles.titleRow} variants={itemVariants}>
                <div>
                    <h2 className={styles.heading}>Organization Statistics</h2>
                    <p className={styles.subtext}>Overview of hospitals registered in the system.</p>
                </div>
            </motion.div>

            <motion.div className={styles.card} variants={itemVariants}>
                <div className={styles.cardHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <BarChart2 size={18} color="#6366f1" />
                        <h3>Clinic Statistics</h3>
                    </div>
                </div>

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ORGANIZATION</th>
                            <th style={{ textAlign: "center" }}>ACTIVE STAFF</th>
                            <th style={{ textAlign: "center" }}>TOTAL PATIENTS</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="3" style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
                                    Loading organization data...
                                </td>
                            </tr>
                        ) : orgStats.length === 0 ? (
                            <tr>
                                <td colSpan="3" style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
                                    No organization stats available.
                                </td>
                            </tr>
                        ) : (
                            orgStats.map((stat, i) => (
                                <tr key={stat.organization_id || i}>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <div style={{
                                                width: "34px",
                                                height: "34px",
                                                borderRadius: "10px",
                                                background: "#eff6ff",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}>
                                                <Building2 size={16} color="#2563eb" />
                                            </div>

                                            <span style={{ fontWeight: "600", color: "#0f172a" }}>
                                                {stat.organization_name || "—"}
                                            </span>
                                        </div>
                                    </td>

                                    <td style={{ textAlign: "center" }}>
                                        <span style={{
                                            background: "#eff6ff",
                                            color: "#2563eb",
                                            padding: "4px 12px",
                                            borderRadius: "99px",
                                            fontSize: "13px",
                                            fontWeight: "700"
                                        }}>
                                            {stat.active_staff_count ?? "—"}
                                        </span>
                                    </td>

                                    <td style={{ textAlign: "center" }}>
                                        <span style={{
                                            background: "#f0fdf4",
                                            color: "#16a34a",
                                            padding: "4px 12px",
                                            borderRadius: "99px",
                                            fontSize: "13px",
                                            fontWeight: "700"
                                        }}>
                                            {stat.total_patient_count ?? "—"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </motion.div>
        </motion.div>
    );
}