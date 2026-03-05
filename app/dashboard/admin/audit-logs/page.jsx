"use client";
import { useState, useEffect } from "react";
import styles from "../AdminDashboard.module.css";
import { fetchAdminAuditLogs, exportAuditLogs } from "@/services/admin";
import { fetchProfile } from "@/services/doctor";
import { motion } from "framer-motion";

export default function AuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        action: "",
        resource_type: "",
        date: ""
    });
    const [exporting, setExporting] = useState(false);
    const [adminUser, setAdminUser] = useState(null);

    useEffect(() => {
        fetchProfile().then(profile => setAdminUser(profile)).catch(() => { });
    }, []);

    useEffect(() => {
        loadLogs();
    }, [filter]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await fetchAdminAuditLogs(filter);
            setLogs(data || []);
        } catch (err) {
            console.error("Failed to load audit logs:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const response = await exportAuditLogs(filter);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Export failed:", err);
            alert("Failed to export logs. Backend not connected.");
        } finally {
            setExporting(false);
        }
    };

    const getActionColor = (action) => {
        const a = action?.toLowerCase() || "";
        if (a.includes("delete") || a.includes("remove") || a.includes("revoke")) return "#ef4444";
        if (a.includes("create") || a.includes("add") || a.includes("invite") || a.includes("grant")) return "#10b981";
        if (a.includes("update") || a.includes("edit") || a.includes("patch")) return "#3b82f6";
        return "#64748b";
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.pageWrapper}
        >
            <div className={styles.topbar} style={{ justifyContent: "flex-end" }}>
                <div className={styles.topActions} style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <div className={styles.profile} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                        <span style={{ fontWeight: "700", color: "#0f172a", fontSize: "14px" }}>
                            {adminUser?.full_name || "Admin"}
                        </span>
                        <small style={{ color: "#64748b", fontSize: "11px" }}>{adminUser?.role || "Administrator"}</small>
                    </div>
                </div>
            </div>

            <div className={styles.header} style={{ padding: "24px", paddingBottom: "0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h2 className={styles.greeting}>Audit Logs</h2>
                        <p className={styles.sub}>Track every system-wide action and security event</p>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exporting || loading}
                        className={styles.inviteBtn}
                        style={{ width: "auto", padding: "0 20px" }}
                    >
                        {exporting ? "Exporting..." : "Download CSV"}
                    </button>
                </div>
            </div>

            <div className={styles.card} style={{ margin: "24px" }}>
                {/* Filters */}
                <div style={{
                    display: "flex",
                    gap: "16px",
                    marginBottom: "20px",
                    padding: "16px",
                    background: "#f8fafc",
                    borderRadius: "12px",
                    flexWrap: "wrap"
                }}>
                    <div style={{ flex: 1, minWidth: "150px" }}>
                        <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "4px" }}>ACTION TYPE</label>
                        <select
                            className={styles.input}
                            value={filter.action}
                            onChange={(e) => setFilter({ ...filter, action: e.target.value })}
                        >
                            <option value="">All Actions</option>
                            <option value="create">Create</option>
                            <option value="update">Update</option>
                            <option value="delete">Delete</option>
                            <option value="login">Login</option>
                        </select>
                    </div>
                    <div style={{ flex: 1, minWidth: "150px" }}>
                        <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "4px" }}>RESOURCE</label>
                        <select
                            className={styles.input}
                            value={filter.resource_type}
                            onChange={(e) => setFilter({ ...filter, resource_type: e.target.value })}
                        >
                            <option value="">All Resources</option>
                            <option value="user">User</option>
                            <option value="appointment">Appointment</option>
                            <option value="organization">Organization</option>
                            <option value="document">Document</option>
                        </select>
                    </div>
                    <div style={{ flex: 1, minWidth: "150px" }}>
                        <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "4px" }}>DATE</label>
                        <input
                            type="date"
                            className={styles.input}
                            value={filter.date}
                            onChange={(e) => setFilter({ ...filter, date: e.target.value })}
                        />
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: "auto" }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>TIMESTAMP</th>
                                <th>USER</th>
                                <th>ACTION</th>
                                <th>RESOURCE</th>
                                <th>IP ADDRESS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                                        Loading audit logs...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                                        No logs found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log, idx) => log && (
                                    <tr key={log.id || `log-${idx}`}>
                                        <td style={{ fontSize: "12px", color: "#64748b" }}>
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: "600", color: "#0f172a" }}>{log.user_name || log.email || "System"}</div>
                                            <div style={{ fontSize: "10px", color: "#94a3b8" }}>ID: {log.user_id?.substring(0, 8)}...</div>
                                        </td>
                                        <td>
                                            <span style={{
                                                display: "inline-block",
                                                padding: "4px 8px",
                                                borderRadius: "6px",
                                                fontSize: "11px",
                                                fontWeight: "700",
                                                textTransform: "uppercase",
                                                backgroundColor: `${getActionColor(log.action)}10`,
                                                color: getActionColor(log.action),
                                                border: `1px solid ${getActionColor(log.action)}20`
                                            }}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: "13px" }}>{log.resource_type}</div>
                                            <div style={{ fontSize: "11px", color: "#94a3b8" }}>{log.resource_details || "N/A"}</div>
                                        </td>
                                        <td style={{ fontFamily: "monospace", fontSize: "12px", color: "#64748b" }}>
                                            {log.ip_address || "—"}
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
