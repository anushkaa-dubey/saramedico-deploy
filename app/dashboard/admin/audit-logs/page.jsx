"use client";
import { useState, useEffect } from "react";
import styles from "../AdminDashboard.module.css";
import { fetchAdminAuditLogs } from "@/services/admin";
import { motion } from "framer-motion";

export default function AuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [insights, setInsights] = useState({
        total_events_24h: 0,
        new_users_24h: 0,
        new_doctors_24h: 0,
        new_hospitals_24h: 0
    });
    const [loading, setLoading] = useState(true);

    const [filter, setFilter] = useState({
        action: "",
        resource_type: "",
        date: ""
    });

    useEffect(() => {
        loadLogs();
    }, [filter]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await fetchAdminAuditLogs(filter);
            if (data && data.logs) {
                setLogs(data.logs);
                setInsights(data.insights || insights);
            } else if (Array.isArray(data)) {
                setLogs(data);
            }
        } catch (err) {
            console.error("Audit logs failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case "critical": return "#ef4444";
            case "warning": return "#f59e0b";
            case "info": return "#3b82f6";
            default: return "#64748b";
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Page Header */}
            <div className={styles.titleRow}>
                <div>
                    <h2 className={styles.heading}>Security Audit Center</h2>
                    <p className={styles.subtext}>
                        Global monitoring of application activity and PHI access logs
                    </p>
                </div>
            </div>

            {/* Insight Stats */}
            <div className={styles.statsGrid} style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                gap: "16px",
                marginTop: "24px"
            }}>
                <div className={styles.statCard} style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <p style={{ color: "#64748b", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>Events (24h)</p>
                    <h3 style={{ fontSize: "24px", margin: "8px 0 0" }}>{insights.total_events_24h}</h3>
                </div>
                <div className={styles.statCard} style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <p style={{ color: "#3b82f6", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>Users Onboarding</p>
                    <h3 style={{ fontSize: "24px", margin: "8px 0 0", color: "#3b82f6" }}>{insights.new_users_24h}</h3>
                </div>
                <div className={styles.statCard} style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <p style={{ color: "#10b981", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>Doctors Today</p>
                    <h3 style={{ fontSize: "24px", margin: "8px 0 0", color: "#10b981" }}>{insights.new_doctors_24h}</h3>
                </div>
                <div className={styles.statCard} style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <p style={{ color: "#8b5cf6", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>New Hospitals</p>
                    <h3 style={{ fontSize: "24px", margin: "8px 0 0", color: "#8b5cf6" }}>{insights.new_hospitals_24h}</h3>
                </div>
            </div>

            {/* Main Log Card */}
            <div className={styles.card} style={{ marginTop: "24px" }}>
                {/* Filters */}
                <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: "14px" }}>System-Wide Audit Trail</h4>
                    </div>
                    <select
                        className={styles.input}
                        value={filter.action}
                        onChange={(e) => setFilter({ ...filter, action: e.target.value })}
                        style={{ width: "auto" }}
                    >
                        <option value="">All Actions</option>
                        <option value="create">Create</option>
                        <option value="update">Update</option>
                        <option value="delete">Delete</option>
                        <option value="login">Login</option>
                        <option value="export">Export</option>
                    </select>

                    <select
                        className={styles.input}
                        value={filter.resource_type}
                        onChange={(e) => setFilter({ ...filter, resource_type: e.target.value })}
                        style={{ width: "auto" }}
                    >
                        <option value="">All Resources</option>
                        <option value="user">User</option>
                        <option value="appointment">Appointment</option>
                        <option value="consultation">Consultation</option>
                        <option value="medical_record">Medical Records</option>
                    </select>

                    <input
                        type="date"
                        className={styles.input}
                        value={filter.date}
                        onChange={(e) => setFilter({ ...filter, date: e.target.value })}
                        style={{ width: "auto" }}
                    />
                </div>

                {/* Table */}
                <div style={{ overflowX: "auto" }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>TIMESTAMP</th>
                                <th>IDENTITY</th>
                                <th>EVENT ACTION</th>
                                <th>TARGET RESOURCE</th>
                                <th>SOURCE IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", padding: "60px" }}>
                                        <div className={styles.loadingSpinner}>Analyzing Audit Trail...</div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", padding: "40px" }}>
                                        No audit entries discovered for the selected criteria.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} style={{ borderLeft: `3px solid ${getSeverityColor(log.severity)}` }}>
                                        <td style={{ fontSize: "12px", color: "#64748b" }}>
                                            {new Date(log.timestamp).toLocaleString(undefined, {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                        <td style={{ fontWeight: "500" }}>{log.user_name}</td>
                                        <td>
                                            <span style={{
                                                padding: "4px 8px",
                                                borderRadius: "6px",
                                                fontSize: "11px",
                                                fontWeight: "700",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.5px",
                                                background: `${getSeverityColor(log.severity)}15`,
                                                color: getSeverityColor(log.severity)
                                            }}>
                                                {log.action.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ color: "#475569", fontWeight: "600" }}>{log.resource_type}</span>
                                        </td>
                                        <td style={{ fontFamily: "monospace", color: "#94a3b8", fontSize: "13px" }}>
                                            {log.ip_address || "Internal"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
