"use client";
import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion } from "framer-motion";
import { fetchHospitalAppointments } from "@/services/hospital";

export default function SurgeryPage() {
    const [surgeries, setSurgeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        inProgress: 0,
        scheduled: 0,
        theatersActive: "THEATER 1 & 4 active"
    });

    useEffect(() => {
        const loadSurgeries = async () => {
            try {
                const data = await fetchHospitalAppointments();
                // Filter for surgery-related appointments
                const filtered = data.filter(a =>
                (a.visit_type?.toLowerCase().includes('surgery') ||
                    a.reason?.toLowerCase().includes('surgery') ||
                    a.reason?.toLowerCase().includes('procedure'))
                );

                const mapped = filtered.map(s => ({
                    id: s.id?.substring(0, 8).toUpperCase() || "SRG-NEW",
                    patient: s.patient_name || s.patient?.full_name || "Patient",
                    doctor: s.doctor_name || s.doctor?.full_name || "Surgeon",
                    time: s.scheduled_at ? new Date(s.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD",
                    room: s.location || "Theater 1",
                    status: s.status === 'accepted' ? 'In Progress' : (s.status === 'completed' ? 'Completed' : 'Scheduled'),
                    risk: "Medium"
                }));

                setSurgeries(mapped);
                setStats({
                    inProgress: mapped.filter(m => m.status === 'In Progress').length,
                    scheduled: mapped.filter(m => m.status === 'Scheduled').length,
                    theatersActive: `${mapped.filter(m => m.status === 'In Progress').length || 'Zero'} theaters active`
                });
            } catch (err) {
                console.error("Failed to load surgeries:", err);
            } finally {
                setLoading(false);
            }
        };
        loadSurgeries();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', background: 'transparent', padding: 0, minHeight: '100%' }}
        >
            <Topbar title="Surgery Schedule" />

            <div className={styles.contentWrapper}>
                <div className={styles.inlineGrid3} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
                    <div className={styles.card} style={{ borderLeft: '4px solid #ef4444' }}>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>Now In Progress</div>
                        <div style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0' }}>{stats.inProgress}</div>
                        <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: '700' }}>{stats.theatersActive.toUpperCase()}</div>
                    </div>
                    <div className={styles.card} style={{ borderLeft: '4px solid #3b82f6' }}>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>Scheduled Today</div>
                        <div style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0' }}>{stats.scheduled}</div>
                        <div style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '700' }}>{loading ? "CHECKING QUEUE..." : "ALL ROOMS READY"}</div>
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
                                {loading ? (
                                    <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading scheduled procedures...</td></tr>
                                ) : surgeries.length === 0 ? (
                                    <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Backend not connected — no surgeries found.</td></tr>
                                ) : surgeries.map(surg => (
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
