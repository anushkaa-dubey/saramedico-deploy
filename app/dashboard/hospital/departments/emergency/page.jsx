import { useState, useEffect } from "react";
import { fetchReviewQueue, fetchHospitalStats } from "@/services/hospital";

export default function EmergencyDepartmentPage() {
    const [queue, setQueue] = useState([]);
    const [hospitalStats, setHospitalStats] = useState({ notesPendingSignature: 0, transcriptionQueueStatus: 0, averageNoteCompletionTime: "0" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadERData = async () => {
            setLoading(true);
            try {
                const [queueData, statsData] = await Promise.all([
                    fetchReviewQueue({ limit: 10 }),
                    fetchHospitalStats()
                ]);
                setQueue(queueData || []);
                setHospitalStats(statsData);
            } catch (err) {
                console.error("Failed to load ER data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadERData();
    }, []);

    const stats = [
        { label: "Pending Review", value: hospitalStats.notesPendingSignature, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>, color: "#f59e0b" },
        { label: "Latency", value: hospitalStats.averageNoteCompletionTime, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>, color: "#3b82f6" },
        { label: "High Urgency", value: hospitalStats.transcriptionQueueStatus, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>, color: "#ef4444" },
        { label: "System Status", value: "Live", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>, color: "#10b981" }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', background: 'transparent', padding: 0, minHeight: '100%' }}
        >
            <Topbar title="Emergency Department (ER)" />

            <div className={styles.contentWrapper}>
                <div className={styles.pageHeaderRow} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Emergency Department (ER)</h1>
                        <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Real-time triage, trauma management and emergency resource allocation.</p>
                    </div>
                </div>

                <div className={styles.overviewSection} style={{ marginBottom: '32px' }}>
                    {stats.map((s, i) => (
                        <div key={i} className={styles.card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ color: s.color }}>{s.icon}</div>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>{s.label}</div>
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '12px' }}>{s.value}</div>
                        </div>
                    ))}
                </div>

                <div className={styles.card}>
                    <div className={styles.cardTitle}>Live Triage Queue</div>
                    <table className={styles.activityTable} style={{ marginTop: '20px' }}>
                        <thead>
                            <tr className={styles.activityHeader}>
                                <th>PATIENT</th>
                                <th>MRN</th>
                                <th>PROVIDER</th>
                                <th>STATUS</th>
                                <th style={{ textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading ER queue...</td></tr>
                            ) : queue.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No active triage cases.</td></tr>
                            ) : queue.map((c, i) => (
                                <tr key={i} className={styles.activityRow}>
                                    <td style={{ fontWeight: '700' }}>{c.patient}</td>
                                    <td>{c.mrn}</td>
                                    <td>{c.provider}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#359aff' }} />
                                            {c.status.toUpperCase()}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className={styles.outlineBtn} style={{ height: '28px', fontSize: '11px' }}>Review</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
