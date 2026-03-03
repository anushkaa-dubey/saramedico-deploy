"use client";
import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion } from "framer-motion";
import { fetchAuditLogs } from "@/services/hospital";

export default function AuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadLogs = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await fetchAuditLogs();
            setLogs(data || []);
        } catch (err) {
            console.error("Failed to load audit logs:", err);
            setError("Could not retrieve system logs. Please check your permissions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLogs();
    }, []);

    const getActionColor = (action = "") => {
        const a = action.toLowerCase();
        if (a.includes("delete") || a.includes("remove") || a.includes("error")) return "#ef4444";
        if (a.includes("update") || a.includes("edit") || a.includes("patch")) return "#f59e0b";
        if (a.includes("create") || a.includes("post") || a.includes("register")) return "#10b981";
        return "#3b82f6"; // Access/View
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', background: 'transparent', padding: 0, minHeight: '100%' }}
        >
            <Topbar title="System Audit Trail" />

            <div className={styles.contentWrapper}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Enterprise Security Audit</h1>
                        <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Real-time immutable activity logs for the hospital enterprise network.</p>
                    </div>
                    <button
                        onClick={loadLogs}
                        disabled={loading}
                        style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: '700',
                            color: '#1e293b',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <svg className={loading ? styles.loadingSpinner : ""} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                        {loading ? "Refreshing..." : "Refresh Logs"}
                    </button>
                </div>

                {error && (
                    <div style={{ padding: '16px', background: '#fef2f2', color: '#991b1b', borderRadius: '12px', border: '1px solid #fee2e2', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
                        {error}
                    </div>
                )}

                <div className={styles.card} style={{ padding: '0', borderRadius: '16px', border: 'none', overflow: 'hidden', background: '#ffffff' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Access & Activity Logs</h3>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table className={styles.activityTable} style={{ fontSize: '13px', width: '100%' }}>
                            <thead>
                                <tr className={styles.activityHeader} style={{ background: '#f8fafc' }}>
                                    <th style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left' }}>TIMESTAMP</th>
                                    <th style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left' }}>USER (ID/EMAIL)</th>
                                    <th style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left' }}>ACTION</th>
                                    <th style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', textAlign: 'left' }}>IP ORIGIN</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && logs.length === 0 ? (
                                    <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading secure logs...</td></tr>
                                ) : logs.length === 0 ? (
                                    <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No activity records found in the current period.</td></tr>
                                ) : logs.map((log, i) => (
                                    <tr key={log.id || i} className={styles.activityRow} style={{ borderBottom: '1px solid #f8fafc' }}>
                                        <td style={{ padding: '20px 24px', color: '#64748b', fontWeight: '500' }}>
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td style={{ color: '#1e293b', fontWeight: '700' }}>
                                            {log.user_id || log.user_email || "System/Public"}
                                        </td>
                                        <td>
                                            <span style={{
                                                color: getActionColor(log.action),
                                                fontWeight: '800',
                                                fontSize: '11px',
                                                background: `${getActionColor(log.action)}10`,
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                textTransform: 'uppercase'
                                            }}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td style={{ color: '#64748b', fontWeight: '600', fontFamily: 'monospace' }}>
                                            {log.metadata?.ip_address || log.ip_address || "Internal"}
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
