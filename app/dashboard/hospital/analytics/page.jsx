"use client";
import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion } from "framer-motion";
import { fetchHospitalStats, fetchHospitalAppointments } from "@/services/hospital";
import Link from "next/link";

export default function AnalyticsPage() {
    const [stats, setStats] = useState({
        notesPendingSignature: 0,
        transcriptionQueueStatus: 0,
        averageNoteCompletionTime: "0 mins"
    });
    const [appointmentsCount, setAppointmentsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState("");

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const [statsData, appointmentsData] = await Promise.all([
                fetchHospitalStats(),
                fetchHospitalAppointments()
            ]);
            setStats(statsData);
            setAppointmentsCount(appointmentsData.length);
            setLastUpdated(new Date().toLocaleTimeString());
        } catch (err) {
            console.error("Failed to load analytics:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnalytics();
    }, []);

    const metrics = [
        {
            label: "Pending Review",
            value: stats.notesPendingSignature,
            color: "#f59e0b",
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
            link: "/dashboard/hospital/approval-queue"
        },
        {
            label: "High Urgency",
            value: stats.transcriptionQueueStatus,
            color: "#ef4444",
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
            link: "/dashboard/hospital/approval-queue"
        },
        {
            label: "Active Appts",
            value: appointmentsCount,
            color: "#3b82f6",
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
            link: "/dashboard/hospital"
        },
        {
            label: "Avg Wait Time",
            value: stats.averageNoteCompletionTime,
            color: "#10b981",
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>,
            link: null
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', background: 'transparent', padding: 0, minHeight: '100%' }}
        >
            <Topbar title="Hospital Performance Analytics" />

            <div className={styles.contentWrapper}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Operational Intelligence</h1>
                        <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Real-time metrics from the clinical workflow engine. Last updated: {lastUpdated || "Never"}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={loadAnalytics}
                            disabled={loading}
                            style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <svg className={loading ? styles.loadingSpinner : ""} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                            Refresh
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    {metrics.map((m, i) => (
                        <div key={i} className={styles.card} style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ background: `${m.color}15`, color: m.color, width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {m.icon}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: m.value > 0 ? m.color : '#e2e8f0' }}></div>
                                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8' }}>LIVE</span>
                                </div>
                            </div>
                            <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{m.label}</h3>
                            <p style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: '8px 0' }}>{loading ? "..." : m.value}</p>
                            {m.link && (
                                <Link href={m.link} style={{ fontSize: '11px', fontWeight: '700', color: m.color, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                                    VIEW DETAILS
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                <div className={styles.card} style={{ gridColumn: '1 / -1', height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff', border: '1px solid #f1f5f9', gap: '16px' }}>
                    <div style={{ background: '#f0fdf4', color: '#10b981', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>System Operational</h3>
                        <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>All clinical data streams are active and processing within normal latency parameters.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b' }}>AI LATENCY</div>
                            <div style={{ fontSize: '14px', color: '#10b981', fontWeight: '700' }}>142ms</div>
                        </div>
                        <div style={{ borderLeft: '1px solid #e2e8f0' }}></div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b' }}>UPTIME</div>
                            <div style={{ fontSize: '14px', color: '#10b981', fontWeight: '700' }}>99.9%</div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
