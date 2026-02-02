"use client";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion } from "framer-motion";

export default function SurgeryPage() {
    const surgeries = [
        { id: "SRG-001", patient: "Alice Cooper", doctor: "Dr. Elena Rodriguez", time: "08:00 AM", room: "Theater 1", status: "In Progress", risk: "Medium" },
        { id: "SRG-002", patient: "Robert Brown", doctor: "Dr. Michael Chen", time: "11:30 AM", room: "Theater 3", status: "Scheduled", risk: "High" },
        { id: "SRG-003", patient: "Sarah Miller", doctor: "Dr. Sarah Wilson", time: "02:00 PM", room: "Theater 2", status: "Completed", risk: "Low" },
        { id: "SRG-004", patient: "James Smith", doctor: "Dr. Elena Rodriguez", time: "04:30 PM", room: "Theater 1", status: "Scheduled", risk: "Medium" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.container}
            style={{ flexDirection: 'column', background: 'transparent', padding: 0 }}
        >
            <Topbar title="Surgery Schedule" />

            <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
                    <div className={styles.card} style={{ borderLeft: '4px solid #ef4444' }}>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>Now In Progress</div>
                        <div style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0' }}>2</div>
                        <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: '700' }}>THEATER 1 & 4 active</div>
                    </div>
                    <div className={styles.card} style={{ borderLeft: '4px solid #3b82f6' }}>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>Scheduled Today</div>
                        <div style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0' }}>8</div>
                        <div style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '700' }}>Next: 11:30 AM</div>
                    </div>
                    <div className={styles.card} style={{ borderLeft: '4px solid #10b981' }}>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>Theaters Available</div>
                        <div style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0' }}>3 / 6</div>
                        <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>READY FOR NEXT SHIFT</div>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardTitle}>
                        <span style={{ fontSize: '18px', fontWeight: '700' }}>Surgery List</span>
                        <button className={styles.primaryBtn}>+ Schedule Surgery</button>
                    </div>

                    <div className={styles.activityTableContainer} style={{ marginTop: '20px' }}>
                        <table className={styles.activityTable}>
                            <thead>
                                <tr className={styles.activityHeader}>
                                    <th>ID</th>
                                    <th>PATIENT</th>
                                    <th>DOCTOR</th>
                                    <th>TIME</th>
                                    <th>THEATER</th>
                                    <th>RISK</th>
                                    <th style={{ textAlign: 'right' }}>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {surgeries.map(surg => (
                                    <tr key={surg.id} className={styles.activityRow}>
                                        <td style={{ color: '#64748b', fontSize: '12px' }}>{surg.id}</td>
                                        <td style={{ fontWeight: '700' }}>{surg.patient}</td>
                                        <td>{surg.doctor}</td>
                                        <td>{surg.time}</td>
                                        <td>{surg.room}</td>
                                        <td>
                                            <span style={{
                                                fontSize: '11px',
                                                fontWeight: '800',
                                                color: surg.risk === 'High' ? '#ef4444' : (surg.risk === 'Medium' ? '#f59e0b' : '#10b981')
                                            }}>{surg.risk}</span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span className={surg.status === 'Completed' ? styles.statusCompleted : (surg.status === 'In Progress' ? styles.statusReview : '')}
                                                style={{ background: surg.status === 'Scheduled' ? '#f1f5f9' : undefined, color: surg.status === 'Scheduled' ? '#64748b' : undefined }}
                                            >
                                                {surg.status}
                                            </span>
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
