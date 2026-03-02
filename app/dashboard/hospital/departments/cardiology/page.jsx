"use client";
import Topbar from "../../components/Topbar";
import styles from "../../HospitalDashboard.module.css";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', background: 'transparent', padding: 0, minHeight: '100%' }}
        >
            <Topbar title="Cardiology Department" />

            <div className={styles.contentWrapper}>
                <div className={styles.dashboardGrid}>
                    {/* Left Column */}
                    <div className={styles.leftColMain}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Structured Approval Queue</h1>
                                <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Review and approve pending clinical sessions for AI-assisted documentation.</p>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <button className={styles.outlineBtn} style={{ background: '#ffffff', color: '#64748b', border: '1px solid #eef2f7', width: '40px', padding: 0, justifyContent: 'center' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                </button>
                                <button className={styles.outlineBtn} style={{ background: '#ffffff', color: '#64748b', border: '1px solid #eef2f7', width: '40px', padding: 0, justifyContent: 'center' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="17" y1="11" x2="23" y2="11" /></svg>
                                </button>
                                <button className={styles.outlineBtn} style={{ color: '#3b82f6', border: '1px solid #eef2f7', background: '#ffffff', padding: '0 24px', fontWeight: '700' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                    Schedule
                                </button>
                                <button className={styles.primaryBtn} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0 24px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    Rename
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className={styles.overviewSection} style={{ marginBottom: '32px' }}>
                            {stats.map((stat, idx) => (
                                <div key={idx} className={styles.statCard} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#ffffff', minHeight: '130px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.02em', maxWidth: '80%' }}>{stat.label}</div>
                                        <div style={{ color: '#e2e8f0' }}>{stat.icon}</div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                            <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>{stat.value}</div>
                                            {stat.subtext && <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>{stat.subtext}</div>}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {stat.isWave && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>}
                                            <div style={{ fontSize: '10px', fontWeight: '800', color: stat.badgeColor, background: stat.badgeBg || 'transparent', padding: stat.badgeBg ? '2px 8px' : '0', borderRadius: '4px' }}>{stat.badge}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Today's Sessions Live */}
                        <div className={styles.card} style={{ marginBottom: '24px' }}>
                            <div className={styles.cardTitle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>Today's Sessions</span>
                                    <span style={{ background: '#0f172a', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '12px' }}>Live</span>
                                </div>
                            </div>
                            <div style={{ marginTop: '20px' }}>
                                {[
                                    { initials: "SW", name: "Dr. Sarah Wilson", with: "John Von", status: "RECORDING", color: "#ef4444" },
                                    { initials: "MC", name: "Dr. Michael Chen", with: "Alice Bob", status: "DRAFT READY", color: "#10b981" },
                                    { initials: "JR", name: "Dr. Jane Roe", with: "Tim Cook", status: "PROCESSING", color: "#f59e0b" }
                                ].map((s, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: i === 2 ? 'none' : '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>{s.initials}</div>
                                            <div>
                                                <div style={{ fontWeight: '700', color: '#0f172a' }}>{s.name} <span style={{ color: '#64748b', fontWeight: '400', fontSize: '14px' }}>with {s.with}</span></div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>#CONF-00{i + 1}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '10px', fontWeight: '800', color: s.color }}>{s.status}</div>
                                                <div style={{ width: '100px', height: '4px', background: '#f1f5f9', borderRadius: '2px', marginTop: '4px' }}>
                                                    <div style={{ width: s.status === 'RECORDING' ? '70%' : '100%', height: '100%', background: s.color, borderRadius: '2px' }} />
                                                </div>
                                            </div>
                                            <button className={styles.outlineBtn} style={{ height: '32px', fontSize: '12px' }}>{s.status === 'DRAFT READY' ? 'Review' : s.status === 'RECORDING' ? 'Resume' : 'Wait'}</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Review Queue */}
                        <div className={styles.card}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <svg style={{ position: 'absolute', left: '12px', top: '48%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                    <input placeholder="Search Patient Name, MRN or Session ID" style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '10px', border: '1px solid #f1f5f9', fontSize: '13px', background: '#f8fafc' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className={styles.outlineBtn} style={{ background: '#f8fafc', color: '#64748b', fontSize: '12px', height: '36px' }}>All Departments <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg></button>
                                    <button className={styles.outlineBtn} style={{ background: '#f8fafc', color: '#64748b', fontSize: '12px', height: '36px' }}>All Providers <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg></button>
                                    <button className={styles.outlineBtn} style={{ background: '#f8fafc', color: '#64748b', fontSize: '12px', height: '36px' }}>All urgency <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg></button>
                                    <button style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '12px', textDecoration: 'underline', cursor: 'pointer', padding: '0 8px' }}>Clear Filters</button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                <div style={{ background: '#DFF2FF', color: '#359aff', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    Department: Cardiology <span style={{ cursor: 'pointer', fontSize: '14px' }}>×</span>
                                </div>
                            </div>

                            <table className={styles.activityTable}>
                                <thead>
                                    <tr className={styles.activityHeader}>
                                        <th>PATIENT</th>
                                        <th>SESSION ID</th>
                                        <th>PROVIDER</th>
                                        <th>VISIT STATE</th>
                                        <th style={{ textAlign: 'right' }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { patient: "Doe, John", dob: "01/12/1980", age: "43y", sessionId: "#SESS-8842", time: "Today, 09:41 AM", provider: "Dr. Sarah Jenkins", dept: "Cardiology", status: "Needs Review", color: "#ef4444", active: true },
                                        { patient: "Smith, Jane", dob: "05/22/1975", age: "48y", sessionId: "#SESS-8841", time: "Today, 09:15 AM", provider: "Dr. Emily Chen", dept: "Neurology", status: "Processing", color: "#359aff", active: false },
                                        { patient: "Brown, Robert", dob: "11/30/1990", age: "33y", sessionId: "#SESS-8839", time: "Today, 08:50 AM", provider: "Dr. Michael Ross", dept: "Pediatrics", status: "In Progress", color: "#94a3b8", active: true },
                                        { patient: "Wilson, Alice", dob: "03/14/1985", age: "39y", sessionId: "#SESS-8835", time: "Today, 08:30 AM", provider: "Dr. Sarah Jenkins", dept: "Cardiology", status: "Needs Review", color: "#ef4444", active: false },
                                        { patient: "Davis, Chris", dob: "09/05/1962", age: "61y", sessionId: "#SESS-8830", time: "Today, 08:10 AM", provider: "Dr. James Wilson", dept: "Orthopedics", status: "Needs Review", color: "#ef4444", active: true }
                                    ].map((row, i) => (
                                        <tr key={i} className={styles.activityRow}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ position: 'relative' }}>
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: '#64748b', fontSize: '12px' }}>{row.patient.split(', ').map(n => n[0]).reverse().join('')}</div>
                                                        {row.active && <div style={{ position: 'absolute', bottom: '0', right: '0', width: '10px', height: '10px', background: '#10b981', border: '2px solid #ffffff', borderRadius: '50%' }} />}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{row.patient}</div>
                                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>DOB: {row.dob} ({row.age})</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: '600', color: '#359aff' }}>{row.sessionId}</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{row.time}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: '600', color: '#0f172a' }}>{row.provider}</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{row.dept}</div>
                                            </td>
                                            <td>
                                                <span style={{ color: row.color, background: `${row.color}15`, padding: '4px 12px', borderRadius: '20px', fontWeight: '700', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: row.color }} />
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button className={styles.outlineBtn} style={{ height: '32px', fontSize: '12px', marginLeft: 'auto', background: '#ffffff', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                    Review
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className={styles.rightColMain}>
                        <div className={styles.calendarCard} style={{ marginBottom: '24px', paddingBottom: '24px' }}>
                            <div className={styles.calendarHeader} style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                    <h3 style={{ fontSize: 'var(--font-base)', fontWeight: '800', margin: 0 }}>February 2026</h3>
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}>‹</button>
                                    <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}>›</button>
                                </div>
                            </div>
                            <div className={styles.calendarGrid}>
                                {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(d => <div key={d} className={styles.dayLabel} style={{ fontSize: '10px', fontWeight: '800' }}>{d}</div>)}
                                {Array.from({ length: 28 }).map((_, i) => {
                                    const day = i + 1;
                                    const isAvailable = day % 3 !== 0;
                                    const isSelected = day === 8;
                                    return (
                                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', position: 'relative' }}>
                                            <div className={`${styles.day} ${isSelected ? styles.selectedDay : ''}`} style={{
                                                background: isSelected ? '#359aff' : 'transparent',
                                                color: isSelected ? 'white' : '#475569',
                                                fontWeight: isSelected ? '800' : '600',
                                                borderRadius: '12px',
                                                width: '32px',
                                                height: '32px',
                                                zIndex: 2
                                            }}>
                                                {day}
                                            </div>
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '-2px',
                                                width: '12px',
                                                height: '2px',
                                                borderRadius: '2px',
                                                background: isAvailable ? '#10b981' : '#359aff'
                                            }} />
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ marginTop: '24px', display: 'flex', gap: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: '800', color: '#64748b' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#359aff' }} />
                                    FULLY BOOKED
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: '800', color: '#64748b' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                                    AVAILABLE
                                </div>
                            </div>
                        </div>

                        <div className={styles.card} style={{ marginBottom: '24px' }}>
                            <div className={styles.cardTitle} style={{ fontSize: '14px' }}>On-Duty Staff & Workload</div>
                            <div style={{ marginTop: '16px' }}>
                                {[
                                    { name: "Dr. Sarah Wilson", status: "5 Pending Notes", color: "#f59e0b" },
                                    { name: "Dr. Michael Chen", status: "1 Pending Note", color: "#10b981" }
                                ].map((s, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i === 1 ? 'none' : '1px solid #f1f5f9' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '600' }}>{s.name}</div>
                                        <div style={{ fontSize: '10px', color: s.color, fontWeight: '800' }}>{s.status}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.card}>
                            <div className={styles.cardTitle} style={{ fontSize: '14px' }}>Ward Capacity</div>
                            <div style={{ marginTop: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '700' }}>ICU</span>
                                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#ef4444' }}>92% Load</span>
                                </div>
                                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px' }}>
                                    <div style={{ width: '92%', height: '100%', background: '#ef4444', borderRadius: '3px' }} />
                                </div>
                                <div style={{ marginTop: '12px', padding: '8px', background: '#fef2f2', borderRadius: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                    <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: '600' }}>Documentation pressure critical</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
