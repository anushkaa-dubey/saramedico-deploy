"use client";
import { useState, useEffect } from "react";
import { fetchReviewQueue, fetchHospitalStats, fetchHospitalAppointments } from "@/services/hospital";
import { motion } from "framer-motion";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";

export default function ApprovalQueuePage() {
    const [queue, setQueue] = useState([]);
    const [stats, setStats] = useState({ notesPendingSignature: 0, transcriptionQueueStatus: 0, averageNoteCompletionTime: "0m", clearedToday: 0, avgWaitTime: "0m" });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [queueData, statsData, appointments] = await Promise.all([
                    fetchReviewQueue({ search, limit: 10 }),
                    fetchHospitalStats(),
                    fetchHospitalAppointments()
                ]);

                // Filter for today's completed appointments
                const today = new Date().toISOString().split('T')[0];
                const todayAppts = appointments.filter(a => a.requested_date?.split('T')[0] === today);
                const completedToday = todayAppts.filter(a => a.status === 'completed').length;

                // Calculate wait time: difference between first and last meeting time of the day
                let waitTimeStr = "0m";
                if (todayAppts.length > 1) {
                    const times = todayAppts
                        .map(a => new Date(a.requested_date).getTime())
                        .sort((a, b) => a - b);
                    const diffMs = times[times.length - 1] - times[0];
                    const diffMins = Math.round(diffMs / 60000);
                    const hours = Math.floor(diffMins / 60);
                    const mins = diffMins % 60;
                    waitTimeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                }

                setQueue(queueData || []);
                setStats({
                    ...statsData,
                    clearedToday: completedToday,
                    avgWaitTime: waitTimeStr
                });
            } catch (err) {
                console.error("Failed to load queue data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [search]);

    const statusColors = {
        "needs review": "#f59e0b",
        "processing": "#3b82f6",
        "in-progress": "#64748b",
        "completed": "#10b981",
        "signed": "#059669"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', background: 'transparent', padding: 0, minHeight: '100% ' }}
        >
            <Topbar title="Approval Queue" />

            <div className={styles.contentWrapper}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Structured Approval Queue</h1>
                        <span style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: '800',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            letterSpacing: '0.02em'
                        }}>QUEUE ACTIVE</span>
                    </div>
                </div>

                {/* Approval Stats */}
                <div className={styles.overviewSection} style={{ marginBottom: '32px' }}>
                    {[
                        { label: "Pending Review", value: stats.notesPendingSignature, color: "#f59e0b", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> },
                        // { label: "High Urgency", value: stats.transcriptionQueueStatus, color: "#ef4444", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> },
                        { label: "Cleared Today", value: stats.clearedToday, color: "#10b981", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> },
                        { label: "Avg Wait Time", value: stats.avgWaitTime, color: "#359aff", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> }
                    ].map((s, i) => (
                        <div key={i} style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ background: `${s.color}15`, color: s.color, width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>{s.label}</div>
                                <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{s.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.card} style={{ border: 'none', background: '#ffffff', padding: '0', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <svg style={{ position: 'absolute', left: '12px', top: '48%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                <input
                                    placeholder="Search Patient Name or MRN"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '10px', border: '1px solid #f1f5f9', fontSize: '13px', background: '#ffffff' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.tableScrollWrapper}>
                        <table className={styles.activityTable} style={{ fontSize: '13px' }}>
                            <thead>
                                <tr className={styles.activityHeader}>
                                    <th style={{ padding: '16px 24px', color: '#94a3b8', whiteSpace: 'nowrap' }}>PATIENT</th>
                                    <th style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>DOCTOR</th>
                                    <th style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>TIMESTAMP</th>
                                    <th style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>VISIT STATE</th>
                                    <th style={{ textAlign: 'right', paddingRight: '24px', color: '#94a3b8', whiteSpace: 'nowrap' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading queue...</td></tr>
                                ) : queue.length === 0 ? (
                                    <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No sessions found in queue</td></tr>
                                ) : queue.map((row, i) => {
                                    const color = statusColors[row.status.toLowerCase()] || "#64748b";
                                    return (
                                        <tr key={i} className={styles.activityRow} style={{ borderBottom: '1px solid #f8fafc' }}>
                                            <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                                                        {row.patient.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '800', color: '#1e293b' }}>{row.patient}</div>
                                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>MRN: {row.mrn}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                <div style={{ fontWeight: '700', color: '#1e293b' }}>{row.provider}</div>
                                            </td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                <div style={{ fontWeight: '700', color: '#3b82f6' }}>{row.time}</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{row.date}</div>
                                            </td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '11px',
                                                    fontWeight: '800',
                                                    background: `${color}15`,
                                                    color: color
                                                }}>
                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
                                                    {row.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right', paddingRight: '24px', whiteSpace: 'nowrap' }}>
                                                <button className={styles.outlineBtn} style={{ padding: '0 16px', height: '32px', fontSize: '12px', background: '#ffffff', color: '#64748b', border: '1px solid #e2e8f0' }}>
                                                    Review
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
