"use client";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion } from "framer-motion";
import { useState } from "react";

export default function AppointmentsPage() {
    const [view, setView] = useState('schedule'); // 'list' or 'schedule'

    const appointments = [
        { time: "09:00 AM", patient: "John Doe", doctor: "Dr. Sarah Jenkins", type: "Follow-up", status: "Completed", color: "#10b981" },
        { time: "10:30 AM", patient: "Jane Smith", doctor: "Dr. Emily Chen", type: "New Visit", status: "In Progress", color: "#359aff" },
        { time: "11:45 AM", patient: "Robert Brown", doctor: "Dr. Michael Ross", type: "Consultation", status: "Pending", color: "#f59e0b" },
        { time: "02:00 PM", patient: "Alice Li", doctor: "Dr. Sarah Jenkins", type: "Routine Check", status: "Upcoming", color: "#64748b" }
    ];

    const weeks = Array.from({ length: 5 }).map((_, w) => Array.from({ length: 7 }).map((_, d) => w * 7 + d + 1));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', background: 'transparent', padding: 0, minHeight: '100%' }}
        >
            <Topbar title={view === 'schedule' ? "Staff Schedule" : "Appointments Schedule"} />

            <div className={styles.contentWrapper}>
                <div className={styles.pageHeaderRow} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                            {view === 'schedule' ? "Schedule" : "Master Appointment Schedule"}
                        </h1>
                        <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>
                            {view === 'schedule'
                                ? "Manage shift coverage and personnel assignments for the cardiology wing."
                                : "Daily overview of all clinical encounters across departments."}
                        </p>
                    </div>
                    <div className={styles.pageHeaderActions} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                            <button
                                onClick={() => setView('list')}
                                style={{
                                    padding: '6px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: view === 'list' ? 'white' : 'transparent',
                                    color: view === 'list' ? '#1e293b' : '#94a3b8',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    boxShadow: view === 'list' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                                }}
                            >
                                Appointments
                            </button>
                            <button
                                onClick={() => setView('schedule')}
                                style={{
                                    padding: '6px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: view === 'schedule' ? 'white' : 'transparent',
                                    color: view === 'schedule' ? '#1e293b' : '#94a3b8',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    boxShadow: view === 'schedule' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                                }}
                            >
                                Staff Schedule
                            </button>
                        </div>

                        {view === 'schedule' ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className={styles.outlineBtn} style={{ background: '#ffffff', color: '#3b82f6', width: '40px', padding: 0, justifyContent: 'center' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                </button>
                                <button className={styles.primaryBtn} style={{ background: '#3b82f6', color: 'white' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px' }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    New Shift
                                </button>
                            </div>
                        ) : (
                            <button className={styles.primaryBtn}>+ Schedule Appt</button>
                        )}
                    </div>
                </div>

                {view === 'list' ? (
                    <div className={styles.card} style={{ border: 'none', borderRadius: '16px', padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                            <div style={{ fontWeight: '700', color: '#0f172a' }}>Tuesday, October 24, 2026</div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <select className={styles.outlineBtn} style={{ background: '#ffffff' }}><option>All Doctors</option></select>
                                <select className={styles.outlineBtn} style={{ background: '#ffffff' }}><option>All Statuses</option></select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {appointments.map((appt, i) => (
                                <div key={i} className={styles.appointmentListItem} style={{ display: 'flex', padding: '24px', borderBottom: i === appointments.length - 1 ? 'none' : '1px solid #f1f5f9', alignItems: 'center' }}>
                                    <div style={{ width: '100px', flexShrink: 0 }}>
                                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>{appt.time}</div>
                                    </div>
                                    <div className={styles.appointmentListItem} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '48px' }}>
                                        <div style={{ minWidth: '200px' }}>
                                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Patient</div>
                                            <div style={{ fontWeight: '700', color: '#1e293b' }}>{appt.patient}</div>
                                        </div>
                                        <div style={{ minWidth: '200px' }}>
                                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Practitioner</div>
                                            <div style={{ fontWeight: '600', color: '#475569' }}>{appt.doctor}</div>
                                        </div>
                                        <div style={{ minWidth: '150px' }}>
                                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Visit Type</div>
                                            <div style={{ fontWeight: '500', color: '#64748b' }}>{appt.type}</div>
                                        </div>
                                        <div style={{ flex: 1, textAlign: 'right' }}>
                                            <span style={{ color: appt.color, background: `${appt.color}10`, padding: '6px 16px', borderRadius: '8px', fontWeight: '800', fontSize: '10px', textTransform: 'uppercase' }}>{appt.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className={styles.dashboardGrid}>
                        <div className={styles.card} style={{ border: 'none', borderRadius: '16px', padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 }}>October 2026</h2>
                                    <div style={{ display: 'flex', gap: '8px', color: '#94a3b8' }}>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>‹</button>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>›</button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                                    <button style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: 'white', color: '#1e293b', fontSize: '12px', fontWeight: '700', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>Monthly</button>
                                    <button style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>Weekly</button>
                                    <button style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>Daily</button>
                                </div>
                            </div>

                            <div className={styles.tableScrollWrapper} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', border: '1px solid #f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
                                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(h => (
                                    <div key={h} style={{ padding: '12px', textAlign: 'center', fontSize: '10px', fontWeight: '800', color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>{h}</div>
                                ))}
                                {Array.from({ length: 31 }).map((_, i) => {
                                    const day = i + 1;
                                    const hasShift = day === 1 || day === 5 || day === 6;
                                    return (
                                        <div key={i} style={{ minHeight: '100px', padding: '8px', borderRight: (i + 1) % 7 === 0 ? 'none' : '1px solid #f1f5f9', borderBottom: i >= 24 ? 'none' : '1px solid #f1f5f9' }}>
                                            <div style={{ fontSize: '11px', fontWeight: '700', color: day === 6 ? '#3b82f6' : '#94a3b8', marginBottom: '8px' }}>{day}</div>
                                            {day === 1 && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <div style={{ fontSize: '9px', fontWeight: '800', background: '#eff6ff', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px' }}>Dr. Von • Morning</div>
                                                    <div style={{ fontSize: '9px', fontWeight: '800', background: '#f0fdf4', color: '#10b981', padding: '4px 8px', borderRadius: '4px' }}>Nurse K. • Morning</div>
                                                </div>
                                            )}
                                            {day === 5 && (
                                                <div style={{ fontSize: '9px', fontWeight: '800', background: '#fffbeb', color: '#f59e0b', padding: '4px 8px', borderRadius: '4px' }}>Dr. Sarah • Night</div>
                                            )}
                                            {day === 6 && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <div style={{ fontSize: '9px', fontWeight: '800', background: '#eff6ff', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px' }}>Dr. Von • Morning</div>
                                                    <div style={{ fontSize: '9px', fontWeight: '800', background: '#fef2f2', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ef4444' }} />
                                                        Understaffed
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className={styles.card} style={{ padding: '24px', borderRadius: '16px', border: 'none' }}>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '16px', textTransform: 'uppercase' }}>Statistics</div>
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
                                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Pending Invites</div>
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
                                            <div style={{ fontSize: '9px', fontWeight: '800', color: '#f59e0b', border: '1px solid #fef3c7', padding: '2px 8px', borderRadius: '4px' }}>PENDING</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
