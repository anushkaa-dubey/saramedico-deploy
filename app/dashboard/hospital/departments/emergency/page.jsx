"use client";
import Topbar from "../../components/Topbar";
import styles from "../../HospitalDashboard.module.css";
import { motion } from "framer-motion";

export default function EmergencyDepartmentPage() {
    const stats = [
        { label: "Active Trauma", value: "4", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>, color: "#ef4444" },
        { label: "Beds Available", value: "12/50", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"></path><path d="M4 10V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6"></path><path d="M12 4v4"></path></svg>, color: "#3b82f6" },
        { label: "Wait Time", value: "18m", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>, color: "#f59e0b" },
        { label: "Triage Queue", value: "9", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>, color: "#10b981" }
    ];

    const emergencyCases = [
        { id: "#TR-9021", patient: "Sarah Connor", condition: "Major Trauma", triage: "Level 1", status: "In Surgery", doc: "Dr. House" },
        { id: "#TR-9025", patient: "John McClane", condition: "Deep Laceration", triage: "Level 2", status: "Triage", doc: "Dr. Grey" },
        { id: "#TR-9028", patient: "Ellen Ripley", condition: "Respiratory Distress", triage: "Level 1", status: "Stabilizing", doc: "Dr. Strange" }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', background: 'transparent', padding: 0, minHeight: '100%' }}
        >
            <Topbar title="Emergency Department (ER)" />

            <div className={styles.contentWrapper}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Emergency Department (ER)</h1>
                        <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Real-time triage, trauma management and emergency resource allocation.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className={styles.primaryBtn} style={{ background: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            CODE BLUE
                        </button>
                        <button className={styles.outlineBtn}>Resource Map</button>
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
                    <div className={styles.cardTitle}>Live Trauma & Triage Queue</div>
                    <table className={styles.activityTable} style={{ marginTop: '20px' }}>
                        <thead>
                            <tr className={styles.activityHeader}>
                                <th>PATIENT</th>
                                <th>TRIAGE</th>
                                <th>CONDITION</th>
                                <th>ASSIGNED MD</th>
                                <th>STATUS</th>
                                <th style={{ textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {emergencyCases.map((c, i) => (
                                <tr key={i} className={styles.activityRow}>
                                    <td style={{ fontWeight: '700' }}>{c.patient} <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '400' }}>{c.id}</span></td>
                                    <td>
                                        <span style={{
                                            background: c.triage === 'Level 1' ? '#fee2e2' : '#fff7ed',
                                            color: c.triage === 'Level 1' ? '#ef4444' : '#f59e0b',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontWeight: '800',
                                            fontSize: '10px'
                                        }}>{c.triage}</span>
                                    </td>
                                    <td>{c.condition}</td>
                                    <td>{c.doc}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#359aff', animation: 'pulse 1.5s infinite' }} />
                                            {c.status}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className={styles.outlineBtn} style={{ height: '28px', fontSize: '11px' }}>Open Chart</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.4; }
                    100% { opacity: 1; }
                }
            `}</style>
        </motion.div>
    );
}
