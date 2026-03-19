"use client";

import { useState, useEffect } from "react";
import styles from "./AuditLogs.module.css";
import { fetchAdminAuditLogs } from "@/services/admin";
import { motion } from "framer-motion";

const SEVERITY_COLORS = {
    critical: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
    default: "#64748b",
};

function severityColor(s) {
    return SEVERITY_COLORS[(s || "").toLowerCase()] || SEVERITY_COLORS.default;
}

export default function AuditLogsPage() {
    const [allLogs, setAllLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [insights, setInsights] = useState({
        total_events_24h: 0, new_users_24h: 0,
        new_doctors_24h: 0, new_hospitals_24h: 0,
    });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ action: "", resource_type: "", date: "" });

    useEffect(() => { loadLogs(); }, []);
    useEffect(() => { applyFilters(); }, [filter, allLogs]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await fetchAdminAuditLogs();
            if (data?.logs) {
                setAllLogs(data.logs);
                setInsights(data.insights || insights);
            } else if (Array.isArray(data)) {
                setAllLogs(data);
            }
        } catch (err) {
            console.error("Audit logs failed:", err);
            setAllLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let f = allLogs;
        if (filter.action) f = f.filter(l => l.action === filter.action);
        if (filter.resource_type) f = f.filter(l => l.resource_type === filter.resource_type);
        if (filter.date) f = f.filter(l =>
            new Date(l.timestamp).toISOString().split("T")[0] === filter.date
        );
        setFilteredLogs(f);
    };

    const fmtTime = (ts) => new Date(ts).toLocaleString(undefined, {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });

    const statItems = [
        { label: "Events (24h)", value: insights.total_events_24h, color: "#0f172a" },
        { label: "Users Onboarding", value: insights.new_users_24h, color: "#3b82f6" },
        { label: "Doctors Today", value: insights.new_doctors_24h, color: "#10b981" },
        { label: "New Hospitals", value: insights.new_hospitals_24h, color: "#8b5cf6" },
    ];

    return (
        <motion.div
            className={styles.pageWrapper}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Header */}
            <div className={styles.pageHeader}>
                <h2 className={styles.heading}>Security Audit Center</h2>
                <p className={styles.subtext}>
                    Global monitoring of application activity and PHI access logs
                </p>
            </div>

            {/* Stats */}
            <div className={styles.statsGrid}>
                {statItems.map(s => (
                    <div key={s.label} className={styles.statCard}>
                        <p className={styles.statLabel}>{s.label}</p>
                        <h3 className={styles.statValue} style={{ color: s.color }}>{s.value}</h3>
                    </div>
                ))}
            </div>

            {/* Main Card */}
            <div className={styles.card}>

                {/* Filters */}
                <div className={styles.filtersRow}>
                    <h4 className={styles.filtersTitle}>System-Wide Audit Trail</h4>

                    <select className={styles.filterSelect}
                        value={filter.action}
                        onChange={e => setFilter({ ...filter, action: e.target.value })}>
                        <option value="">All Actions</option>
                        <option value="create">Create</option>
                        <option value="update">Update</option>
                        <option value="delete">Delete</option>
                        <option value="login">Login</option>
                        <option value="export">Export</option>
                    </select>

                    <select className={styles.filterSelect}
                        value={filter.resource_type}
                        onChange={e => setFilter({ ...filter, resource_type: e.target.value })}>
                        <option value="">All Resources</option>
                        <option value="user">User</option>
                        <option value="appointment">Appointment</option>
                        <option value="consultation">Consultation</option>
                        <option value="medical_record">Medical Records</option>
                    </select>

                    <input type="date" className={styles.filterDate}
                        value={filter.date}
                        onChange={e => setFilter({ ...filter, date: e.target.value })} />
                </div>

                {/* ── Desktop Table ── */}
                <div className={styles.tableWrapper}>
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
                                <tr><td colSpan="5" className={styles.stateMsg}>Analyzing Audit Trail…</td></tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr><td colSpan="5" className={styles.stateMsg}>No audit entries found for the selected criteria.</td></tr>
                            ) : filteredLogs.map(log => (
                                <tr key={log.id} style={{ borderLeft: `3px solid ${severityColor(log.severity)}` }}>
                                    <td className={styles.timestamp}>{fmtTime(log.timestamp)}</td>
                                    <td className={styles.identity}>{log.user_name}</td>
                                    <td>
                                        <span className={styles.actionBadge} style={{
                                            background: `${severityColor(log.severity)}18`,
                                            color: severityColor(log.severity),
                                        }}>
                                            {(log.action || "").replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className={styles.resourceType}>{log.resource_type}</td>
                                    <td className={styles.ipAddress}>{log.ip_address || "Internal"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── Mobile Cards ── */}
                <div className={styles.mobileList}>
                    {loading ? (
                        <div className={styles.stateMsg}>Analyzing Audit Trail…</div>
                    ) : filteredLogs.length === 0 ? (
                        <div className={styles.stateMsg}>No entries found.</div>
                    ) : filteredLogs.map(log => (
                        <div key={log.id} className={styles.logCard}
                            style={{ borderLeftColor: severityColor(log.severity) }}>
                            <div className={styles.logCardTop}>
                                <span className={styles.identity}>{log.user_name}</span>
                                <span className={styles.timestamp}>{fmtTime(log.timestamp)}</span>
                            </div>
                            <div className={styles.logCardBottom}>
                                <span className={styles.actionBadge} style={{
                                    background: `${severityColor(log.severity)}18`,
                                    color: severityColor(log.severity),
                                }}>
                                    {(log.action || "").replace("_", " ")}
                                </span>
                                <span className={styles.resourceType}>{log.resource_type}</span>
                                <span className={styles.ipAddress}>{log.ip_address || "Internal"}</span>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </motion.div>
    );
}