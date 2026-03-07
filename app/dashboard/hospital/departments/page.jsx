"use client";
import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetchHospitalDirectory } from "@/services/hospital";

export default function DepartmentsPage() {

    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDepartments = async () => {
            try {

                const directory = await fetchHospitalDirectory();
                const doctors = directory?.doctors || [];

                const uniqueDepartments = [
                    ...new Set(
                        doctors
                            .map(d => d.specialty)
                            .filter(Boolean)
                    )
                ];

                setDepartments(uniqueDepartments);

            } catch (err) {
                console.error("Failed to load departments:", err);
            } finally {
                setLoading(false);
            }
        };

        loadDepartments();
    }, []);

    const deptSlug = (name) =>
        name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
                display: "flex",
                flexDirection: "column",
                background: "transparent",
                padding: 0,
                minHeight: "100%"
            }}
        >
            <Topbar title="Departments" />

            <div className={styles.contentWrapper}>

                <div
                    className={styles.pageHeaderRow}
                    style={{
                        marginBottom: "32px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px"
                    }}
                >
                    <h1
                        style={{
                            fontSize: "24px",
                            fontWeight: "800",
                            color: "#0f172a",
                            margin: 0
                        }}
                    >
                        Departments
                    </h1>

                    <p
                        style={{
                            color: "#64748b",
                            fontSize: "14px",
                            margin: 0
                        }}
                    >
                        Manage hospital departments and assigned doctors.
                    </p>
                </div>

                <div className={styles.card} style={{ padding: 0 }}>
                    <div className={styles.tableScrollWrapper}>
                        <table className={styles.activityTable}>

                            <thead>
                                <tr className={styles.activityHeader}>
                                    <th style={{ padding: "16px 24px" }}>DEPARTMENT</th>
                                    <th style={{ textAlign: "right", paddingRight: "24px" }}>
                                        ACTION
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {loading ? (
                                    <tr>
                                        <td colSpan="2" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                                            Loading departments...
                                        </td>
                                    </tr>
                                ) : departments.length === 0 ? (
                                    <tr>
                                        <td colSpan="2" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                                            No departments found.
                                        </td>
                                    </tr>
                                ) : (
                                    departments.map((dept, i) => (
                                        <tr key={i} className={styles.activityRow}>

                                            <td style={{ padding: "16px 24px", fontWeight: "700" }}>
                                                {dept}
                                            </td>

                                            <td style={{ textAlign: "right", paddingRight: "24px" }}>
                                                <Link href={`/dashboard/hospital/departments/${deptSlug(dept)}`}>
                                                    <button
                                                        style={{
                                                            background: "transparent",
                                                            border: "none",
                                                            color: "#359aff",
                                                            fontWeight: "700",
                                                            cursor: "pointer",
                                                            fontSize: "13px"
                                                        }}
                                                    >
                                                        Manage
                                                    </button>
                                                </Link>
                                            </td>

                                        </tr>
                                    ))
                                )}

                            </tbody>

                        </table>
                    </div>
                </div>

            </div>
        </motion.div>
    );
}