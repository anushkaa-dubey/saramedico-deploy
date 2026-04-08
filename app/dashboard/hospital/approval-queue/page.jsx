"use client";
import { useState, useEffect } from "react";
import { getHospitalAppointments, manageHospitalAppointment, fetchHospitalStats } from "@/services/hospital";
import { motion } from "framer-motion";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import Alert from "../../components/Alert";

export default function ApprovalQueuePage() {
    const [queue, setQueue] = useState([]);
    const [stats, setStats] = useState({
        notesPendingSignature: 0,
        transcriptionQueueStatus: 0,
        clearedToday: 0,
        avgWaitTime: "0m"
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [alertConfig, setAlertConfig] = useState({ open: false, title: "", message: "", type: "info", action: null, appointmentId: null });
    const [rescheduleData, setRescheduleData] = useState({ open: false, id: null, date: "", time: "" });

    useEffect(() => {
        loadData();
    }, [search]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [queueData, statsData] = await Promise.all([
                getHospitalAppointments("pending"),
                fetchHospitalStats()
            ]);

            setQueue(queueData || []);
            setStats(prev => ({
                ...prev,
                ...(statsData?.metrics || {}),
                notesPendingSignature: queueData?.length || 0
            }));
        } catch (err) {
            console.error("Failed to load queue data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (appointmentId, action) => {
        if (action === 'reschedule') {
            setRescheduleData({ open: true, id: appointmentId, date: "", time: "" });
            return;
        }

        try {
            await manageHospitalAppointment(appointmentId, action);
            loadData();
        } catch (err) {
            alert(`Failed to ${action}: ` + err.message);
        }
    };

    const statusColors = {
        "pending": "#f59e0b",
        "accepted": "#10b981",
        "declined": "#ef4444",
        "denied": "#ef4444",
        "cancelled": "#64748b"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', background: 'transparent', padding: 0, minHeight: '100%' }}
        >
            <Topbar title="Approval Queue" />

            <div className={styles.contentWrapper}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Patient Request Queue</h1>
                        <span style={{
                            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: '800',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            letterSpacing: '0.02em'
                        }}>PENDING ACTION</span>
                    </div>
                </div>

                {/* Approval Stats */}
                <div className={styles.overviewSection} style={{ marginBottom: '32px' }}>
                    {[
                        { label: "Pending Requests", value: stats.notesPendingSignature, color: "#f59e0b", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>, link: "/dashboard/hospital/approval-queue" },
                        { label: "Cleared Today", value: stats.clearedToday, color: "#10b981", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>, link: "/dashboard/hospital/appointments" },
                        { label: "Avg Wait Time", value: stats.avgWaitTime || "0m", color: "#3b82f6", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>, link: "/dashboard/hospital/approval-queue" }
                    ].map((s, i) => (
                        <div key={i}
                            onClick={() => s.link && (window.location.href = s.link)}
                            style={{
                                background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9',
                                display: 'flex', alignItems: 'center', gap: '16px', cursor: s.link ? 'pointer' : 'default',
                                transition: 'transform 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
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
                                <svg style={{ position: 'absolute', left: '12px', top: '40%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                <input
                                    placeholder="Search Patient ID or Reason"
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
                                    <th style={{ padding: '16px 24px', color: '#94a3b8', whiteSpace: 'nowrap' }}>PATIENT ID</th>
                                    <th style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>DOCTOR ID</th>
                                    <th style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>REQUESTED DATE</th>
                                    <th style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>REASON</th>
                                    <th style={{ textAlign: 'right', paddingRight: '24px', color: '#94a3b8', whiteSpace: 'nowrap' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading queue...</td></tr>
                                ) : queue.length === 0 ? (
                                    <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No pending requests found</td></tr>
                                ) : queue.map((row, i) => {
                                    return (
                                        <tr key={i} className={styles.activityRow} style={{ borderBottom: '1px solid #f8fafc' }}>
                                            <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                                                <div style={{ fontWeight: '800', color: '#1e293b' }}>{row.patient_id.substring(0, 8)}...</div>
                                            </td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                <div style={{ fontWeight: '700', color: '#1e293b' }}>{row.doctor_id.substring(0, 8)}...</div>
                                            </td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                <div style={{ fontWeight: '700', color: '#3b82f6' }}>{new Date(row.requested_date).toLocaleString()}</div>
                                            </td>
                                            <td style={{ whiteSpace: 'nowrap', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                <span style={{ color: '#64748b' }}>{row.reason}</span>
                                            </td>
                                            <td style={{ textAlign: 'right', paddingRight: '24px', whiteSpace: 'nowrap' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => handleAction(row.id, 'approve')}
                                                        style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(row.id, 'reschedule')}
                                                        style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                                    >
                                                        Reschedule
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(row.id, 'decline')}
                                                        style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                                    >
                                                        Decline
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Alert
                isOpen={alertConfig.open}
                onClose={() => setAlertConfig({ ...alertConfig, open: false })}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />

            {/* Reschedule Modal */}
            {rescheduleData.open && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>Reschedule Appointment</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>NEW DATE</label>
                                <input
                                    type="date"
                                    value={rescheduleData.date}
                                    onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>NEW TIME</label>
                                <input
                                    type="time"
                                    value={rescheduleData.time}
                                    onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                            <button
                                onClick={() => setRescheduleData({ ...rescheduleData, open: false })}
                                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (!rescheduleData.date || !rescheduleData.time) return;
                                    try {
                                        const dt = new Date(`${rescheduleData.date}T${rescheduleData.time}`);
                                        await manageHospitalAppointment(rescheduleData.id, "reschedule", { new_date: dt.toISOString() });
                                        setRescheduleData({ open: false, id: null, date: "", time: "" });
                                        loadData();
                                    } catch (err) {
                                        alert("Failed to reschedule: " + err.message);
                                    }
                                }}
                                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: '700', cursor: 'pointer' }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}


