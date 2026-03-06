"use client";
import { useState, useEffect } from "react";
import styles from "../AdminDashboard.module.css";
import { fetchAdminAuditLogs, exportAuditLogs } from "@/services/admin";
import { motion } from "framer-motion";

export default function AuditLogsPage() {

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

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
            setLogs(data || []);
        } catch (err) {
            console.error("Audit logs failed:", err);
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

            a.download = `audit_logs_${new Date().toISOString().split("T")[0]}.csv`;

            document.body.appendChild(a);

            a.click();

            window.URL.revokeObjectURL(url);

        } catch (err) {

            console.error("Export failed:", err);

        } finally {

            setExporting(false);

        }
    };

    const getActionColor = (action) => {

        const a = action?.toLowerCase() || "";

        if (a.includes("delete")) return "#ef4444";

        if (a.includes("create")) return "#10b981";

        if (a.includes("update")) return "#3b82f6";

        return "#64748b";
    };

    return (

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            {/* Page Header */}

            <div className={styles.titleRow}>

                <div>

                    <h2 className={styles.heading}>Audit Logs</h2>

                    <p className={styles.subtext}>
                        Track every system-wide action and security event
                    </p>

                </div>

                <button
                    onClick={handleExport}
                    disabled={exporting || loading}
                    className={styles.inviteBtn}
                >
                    {exporting ? "Exporting..." : "Download CSV"}
                </button>

            </div>


            {/* Card */}

            <div className={styles.card} style={{ marginTop: "24px" }}>


                {/* Filters */}

                <div style={{
                    display: "flex",
                    gap: "16px",
                    marginBottom: "20px",
                    flexWrap: "wrap"
                }}>

                    <select
                        className={styles.input}
                        value={filter.action}
                        onChange={(e) =>
                            setFilter({ ...filter, action: e.target.value })
                        }
                    >
                        <option value="">All Actions</option>
                        <option value="create">Create</option>
                        <option value="update">Update</option>
                        <option value="delete">Delete</option>
                        <option value="login">Login</option>
                    </select>

                    <select
                        className={styles.input}
                        value={filter.resource_type}
                        onChange={(e) =>
                            setFilter({
                                ...filter,
                                resource_type: e.target.value
                            })
                        }
                    >
                        <option value="">All Resources</option>
                        <option value="user">User</option>
                        <option value="appointment">Appointment</option>
                        <option value="organization">Organization</option>
                    </select>

                    <input
                        type="date"
                        className={styles.input}
                        value={filter.date}
                        onChange={(e) =>
                            setFilter({
                                ...filter,
                                date: e.target.value
                            })
                        }
                    />

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
                                    <td colSpan="5" style={{ textAlign: "center", padding: "40px" }}>
                                        Loading audit logs...
                                    </td>
                                </tr>

                            ) : logs.length === 0 ? (

                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", padding: "40px" }}>
                                        No logs found.
                                    </td>
                                </tr>

                            ) : (

                                logs.map((log) => (

                                    <tr key={log.id}>

                                        <td style={{ fontSize: "12px" }}>
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>

                                        <td>{log.user_name || "System"}</td>

                                        <td>

                                            <span style={{
                                                padding: "4px 8px",
                                                borderRadius: "6px",
                                                fontSize: "11px",
                                                fontWeight: "700",
                                                background: `${getActionColor(log.action)}15`,
                                                color: getActionColor(log.action)
                                            }}>
                                                {log.action}
                                            </span>

                                        </td>

                                        <td>{log.resource_type}</td>

                                        <td style={{ fontFamily: "monospace" }}>
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