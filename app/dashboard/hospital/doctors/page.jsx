"use client";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { fetchDepartmentStaff, fetchOrganizationMembers } from "@/services/hospital";

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                // Try department staff first, fallback to org members
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

    const filtered = doctors.filter(d => {
        const q = search.toLowerCase();
        return (
            (d.full_name || d.name || "").toLowerCase().includes(q) ||
            (d.specialty || "").toLowerCase().includes(q)
        );
    });

    const getStatusStyle = (status) => {
        const s = (status || "active").toLowerCase();
        if (s === "active") return { background: "#ecfdf5", color: "#16a34a" };
        if (s === "on leave" || s === "leave") return { background: "#fff7ed", color: "#c2410c" };
        return { background: "#f1f5f9", color: "#64748b" };
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", flexDirection: "column", background: "transparent", padding: 0, minHeight: "100%" }}
        >
            <Topbar title="Doctors Directory" />

            <div className={styles.contentWrapper}>
                <div className={styles.card}>
                    <div className={styles.cardTitle}>
                        <span>All Doctors</span>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            <input
                                type="text"
                                placeholder="Search doctors..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" }}
                            />
                            <button className={styles.primaryBtn}>+ Add New Doctor</button>
                        </div>
                    </div>

                    {error && (
                        <div style={{ padding: "14px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px", margin: "16px 0", fontSize: "13px" }}>
                            {error}
                        </div>
                    )}

                    <div className={styles.tableScrollWrapper}>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                                    <th style={{ padding: "12px", color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>NAME</th>
                                    <th style={{ padding: "12px", color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>SPECIALTY</th>
                                    <th style={{ padding: "12px", color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>EMAIL</th>
                                    <th style={{ padding: "12px", color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>STATUS</th>
                                    <th style={{ padding: "12px", color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>Loading doctors...</td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
                                            {doctors.length === 0 ? "Backend not connected — no doctors found." : "No doctors match your search."}
                                        </td>
                                    </tr>
                                ) : filtered.map((doc, i) => (
                                    <tr key={doc.id || i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                        <td style={{ padding: "16px 12px", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>
                                            {doc.full_name || doc.name || "—"}
                                        </td>
                                        <td style={{ padding: "16px 12px", color: "#64748b", whiteSpace: "nowrap" }}>
                                            {doc.specialty || doc.department || "General"}
                                        </td>
                                        <td style={{ padding: "16px 12px", color: "#64748b", fontSize: "13px" }}>
                                            {doc.email || "—"}
                                        </td>
                                        <td style={{ padding: "16px 12px" }}>
                                            <span style={{
                                                ...getStatusStyle(doc.status || (doc.is_active ? "active" : "inactive")),
                                                padding: "4px 10px",
                                                borderRadius: "99px",
                                                fontSize: "12px",
                                                fontWeight: "600",
                                                whiteSpace: "nowrap"
                                            }}>
                                                {doc.status || (doc.is_active ? "Active" : "Inactive")}
                                            </span>
                                        </td>
                                        <td style={{ padding: "16px 12px" }}>
                                            <button style={{ background: "none", border: "none", color: "#359aff", cursor: "pointer", fontWeight: "600" }}>
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
