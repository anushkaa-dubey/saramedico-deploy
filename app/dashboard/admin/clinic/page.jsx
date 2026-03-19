"use client";

import styles from "./ClinicManagement.module.css";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { fetchOrgStats } from "@/services/admin";
import { Building2, BarChart2 } from "lucide-react";

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function ClinicManagement() {
    const [orgStats, setOrgStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

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

    return (
        <motion.div
            className={styles.pageWrapper}
            initial="hidden"
            animate="show"
            variants={containerVariants}
        >
            {/* Page heading */}
            <motion.div className={styles.pageHeader} variants={itemVariants}>
                <h2 className={styles.heading}>Organization Statistics</h2>
                <p className={styles.subtext}>Overview of hospitals registered in the system.</p>
            </motion.div>

            {/* Card */}
            <motion.div className={styles.card} variants={itemVariants}>
                <div className={styles.cardHeader}>
                    <BarChart2 size={18} color="#6366f1" />
                    <h3>Clinic Statistics</h3>
                </div>

                {/* ── DESKTOP TABLE ── */}
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ORGANIZATION</th>
                                <th className={styles.centerCol}>ACTIVE STAFF</th>
                                <th className={styles.centerCol}>TOTAL PATIENTS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className={styles.stateMsg}>
                                        Loading organization data…
                                    </td>
                                </tr>
                            ) : orgStats.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className={styles.stateMsg}>
                                        No organization stats available.
                                    </td>
                                </tr>
                            ) : orgStats.map((stat, i) => (
                                <tr key={stat.organization_id || i}>
                                    <td>
                                        <div className={styles.orgCell}>
                                            <div className={styles.orgIcon}>
                                                <Building2 size={16} color="#2563eb" />
                                            </div>
                                            <span className={styles.orgName}>
                                                {stat.organization_name || "—"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className={styles.centerCol}>
                                        <span className={styles.badgeBlue}>
                                            {stat.active_staff_count ?? "—"}
                                        </span>
                                    </td>
                                    <td className={styles.centerCol}>
                                        <span className={styles.badgeGreen}>
                                            {stat.total_patient_count ?? "—"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── MOBILE CARDS ── */}
                <div className={styles.mobileList}>
                    {loading ? (
                        <div className={styles.stateMsg}>Loading…</div>
                    ) : orgStats.length === 0 ? (
                        <div className={styles.stateMsg}>No stats available.</div>
                    ) : orgStats.map((stat, i) => (
                        <div key={stat.organization_id || i} className={styles.statCard}>
                            <div className={styles.statCardLeft}>
                                <div className={styles.orgIcon}>
                                    <Building2 size={16} color="#2563eb" />
                                </div>
                                <span className={styles.orgName}>
                                    {stat.organization_name || "—"}
                                </span>
                            </div>
                            <div className={styles.statCardRight}>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>Staff</span>
                                    <span className={styles.badgeBlue}>{stat.active_staff_count ?? "—"}</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>Patients</span>
                                    <span className={styles.badgeGreen}>{stat.total_patient_count ?? "—"}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </motion.div>
        </motion.div>
    );
}