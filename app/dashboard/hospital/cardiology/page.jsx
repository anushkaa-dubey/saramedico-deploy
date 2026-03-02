"use client";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion } from "framer-motion";

export default function CardiologyDepartmentPage() {
    const stats = [
        {
            label: "NOTES PENDING SIGNATURE",
            value: "14",
            badge: "5 urgent",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
            color: "#94a3b8",
            badgeBg: "#fef2f2",
            badgeColor: "#ef4444"
        },
        {
            label: "TRANSCRIPTION QUEUE STATUS",
            value: "8",
            subtext: "Processing",
            badge: "Real-time",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20v-6M9 20v-4M15 20v-8M18 20v-10M6 20v-2"></path></svg>,
            color: "#94a3b8",
            badgeColor: "#10b981",
            isWave: true
        },
        {
            label: "AVG NOTE COMPLETION TIME",
            value: "4.2 hrs",
            badge: "-12% improvement",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
            color: "#94a3b8",
            badgeColor: "#10b981"
        },
        {
            label: "TOTAL DOCTORS ONLINE",
            value: "32",
            badge: "+2 just now",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
            color: "#94a3b8",
            badgeColor: "#10b981"
        }
    ];

    const queueData = [
        { patient: "Doe, John", mrn: "#MRN-1022", id: "#SESS-8842", time: "09:41 AM", date: "Today", prov: "Dr. Sarah Wilson", status: "Needs Review", color: "#ef4444", urgency: "High", urgencyColor: "#ef4444" },
        { patient: "Smith, Jane", mrn: "#MRN-5541", id: "#SESS-8841", time: "09:15 AM", date: "Today", prov: "Dr. Emily Chen", status: "Needs Review", color: "#ef4444", urgency: "Normal", urgencyColor: "#3b82f6" },
        { patient: "Brown, Robert", mrn: "#MRN-3329", id: "#SESS-8839", time: "08:50 AM", date: "Today", prov: "Dr. Michael Ross", status: "Needs Review", color: "#ef4444", urgency: "Medium", urgencyColor: "#f59e0b" }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', background: 'transparent', padding: 0, minHeight: '100%' }}
        >
            <Topbar title="Cardiology Department" />

            <div className={styles.contentWrapper}>
                <div className={styles.dashboardGrid}>
                    <div className={styles.leftColMain}>
                        <div className={styles.pageHeaderRow} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Approval Queue</h1>
                                <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Review clinical sessions for AI documentation.</p>
                            </div>
                            <div className={styles.pageHeaderActions} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <button className={styles.primaryBtn} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0 24px', fontWeight: '700' }}>Schedule</button>
                            </div>
                        </div>

                        <div className={styles.overviewSection} style={{ marginBottom: '32px' }}>
                            {stats.map((stat, idx) => (
                                <div key={idx} className={styles.statCard} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#ffffff', minHeight: '130px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.02em', textTransform: 'uppercase' }}>{stat.label}</div>
                                        <div style={{ color: '#e2e8f0' }}>{stat.icon}</div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                            <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>{stat.value}</div>
                                        </div>
                                        <div style={{ fontSize: '10px', fontWeight: '800', color: stat.badgeColor, background: stat.badgeBg || '#ecfdf5', padding: '2px 8px', borderRadius: '4px' }}>{stat.badge}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.card}>
                            <div className={styles.cardTitle}>Review Queue</div>
                            <div className={styles.filterButtonRow} style={{ display: 'flex', gap: '8px', marginTop: '16px', marginBottom: '16px' }}>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <input placeholder="Search..." style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '13px' }} />
                                </div>
                                <button className={styles.outlineBtn} style={{ height: '36px' }}>Filters</button>
                            </div>

                            <div className={styles.tableScrollWrapper}>
                                <table className={styles.activityTable}>
                                    <thead>
                                        <tr className={styles.activityHeader}>
                                            <th style={{ whiteSpace: 'nowrap' }}>PATIENT</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>SESSION ID</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>URGENCY</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>DATE/TIME</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>PROVIDER</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>STATUS</th>
                                            <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {queueData.map((row, i) => (
                                            <tr key={i} className={styles.activityRow}>
                                                <td style={{ whiteSpace: 'nowrap' }}>
                                                    <div style={{ fontWeight: '800', color: '#1e293b' }}>{row.patient}</div>
                                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{row.mrn}</div>
                                                </td>
                                                <td style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', whiteSpace: 'nowrap' }}>{row.id}</td>
                                                <td style={{ whiteSpace: 'nowrap' }}>
                                                    <span style={{ fontSize: '10px', fontWeight: '800', color: row.urgencyColor, background: `${row.urgencyColor}15`, padding: '2px 8px', borderRadius: '4px' }}>{row.urgency}</span>
                                                </td>
                                                <td style={{ whiteSpace: 'nowrap' }}>
                                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>{row.time}</div>
                                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{row.date}</div>
                                                </td>
                                                <td style={{ whiteSpace: 'nowrap' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#64748b' }}>{row.prov[0]}</div>
                                                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>{row.prov}</span>
                                                    </div>
                                                </td>
                                                <td style={{ whiteSpace: 'nowrap' }}>
                                                    <span style={{ color: row.color, background: `${row.color}15`, padding: '4px 12px', borderRadius: '20px', fontWeight: '700', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: row.color }} />
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                    <button className={styles.outlineBtn} style={{ height: '32px', fontSize: '12px' }}>Review</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className={styles.rightColMain}>
                        <div className={styles.calendarCard} style={{ marginBottom: '24px' }}>
                            <div className={styles.calendarHeader}>
                                <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>February 2026</h3>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}>‹</button>
                                    <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}>›</button>
                                </div>
                            </div>
                            <div className={styles.calendarGrid}>
                                {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(d => <div key={d} className={styles.dayLabel}>{d}</div>)}
                                {Array.from({ length: 28 }).map((_, i) => (
                                    <div key={i} className={`${styles.day} ${i + 1 === 8 ? styles.selectedDay : ''}`}>{i + 1}</div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.card} style={{ marginBottom: '24px' }}>
                            <div className={styles.cardTitle}>On-Duty Staff</div>
                            <div style={{ marginTop: '16px' }}>
                                {[
                                    { name: "Dr. Sarah Wilson", status: "Active", color: "#10b981" },
                                    { name: "Dr. Michael Chen", status: "Away", color: "#f59e0b" }
                                ].map((s, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i === 1 ? 'none' : '1px solid #f1f5f9' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '600' }}>{s.name}</div>
                                        <div style={{ fontSize: '10px', color: s.color, fontWeight: '800' }}>{s.status}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.card}>
                            <div className={styles.cardTitle}>Ward Capacity</div>
                            <div style={{ marginTop: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '700' }}>ICU Load</span>
                                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#ef4444' }}>92%</span>
                                </div>
                                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px' }}>
                                    <div style={{ width: '92%', height: '100%', background: '#ef4444', borderRadius: '3px' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
