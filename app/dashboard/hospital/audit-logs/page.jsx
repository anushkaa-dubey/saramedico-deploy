"use client";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion } from "framer-motion";

export default function AuditLogsPage() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', background: 'transparent', padding: 0, minHeight: '100%' }}
        >
            <Topbar title="Audit Logs" />

            <div className={styles.contentWrapper}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Audit Logs</h1>
                    <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Detailed activity logs for General Hospital enterprise network.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px', alignItems: 'start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className={styles.card} style={{ padding: '0', borderRadius: '16px', border: 'none', overflow: 'hidden' }}>
                            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Recent Activities</h3>
                                <button style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>View All</button>
                            </div>

                            <table className={styles.activityTable} style={{ fontSize: '13px' }}>
                                <thead>
                                    <tr className={styles.activityHeader} style={{ background: '#f8fafc' }}>
                                        <th style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>TIMESTAMP</th>
                                        <th style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>USER</th>
                                        <th style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>ACTION</th>
                                        <th style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>DEPARTMENT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <tr key={i} className={styles.activityRow} style={{ borderBottom: '1px solid #f8fafc' }}>
                                            <td style={{ padding: '20px 24px', color: '#64748b', fontWeight: '500' }}>TODAY, 11:42 AM</td>
                                            <td style={{ color: '#1e293b', fontWeight: '600' }}>Dr. Rex Hex</td>
                                            <td style={{ color: '#64748b', fontWeight: '500' }}>{i === 0 ? "PHI Record Accessed" : "Role Permission Updated"}</td>
                                            <td style={{ color: '#64748b', fontWeight: '500' }}>Cardiology</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className={styles.card} style={{ padding: '24px', borderRadius: '16px', border: 'none' }}>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', marginBottom: '16px' }}>Statistics</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                </div>
                                <div>
                                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>72</div>
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>TOTAL STAFF MEMBERS</div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.card} style={{ padding: '24px', borderRadius: '16px', border: 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8' }}>Pending Invites</div>
                                <button style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>View All</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[1, 2].map(i => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Robert Yep</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>robert.yep@mail.com</div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '9px', fontWeight: '800', color: '#f59e0b', background: '#fffbeb', padding: '4px 8px', borderRadius: '4px', border: '1px solid #fef3c7' }}>PENDING</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
