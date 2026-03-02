"use client";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion } from "framer-motion";
import { useState } from "react";

export default function ApprovalQueuePage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', background: 'transparent', padding: 0, minHeight: '100%' }}
        >
            <Topbar title="Approval Queue" />

            <div className={styles.contentWrapper}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
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
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Last updated 2m ago</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className={styles.outlineBtn} style={{ background: '#ffffff' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            Export CSV
                        </button>
                        <button className={styles.primaryBtn}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            New Session
                        </button>
                    </div>
                </div>

                {/* Approval Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                    {[
                        { label: "Pending Review", value: "14", color: "#f59e0b", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> },
                        { label: "High Urgency", value: "3", color: "#ef4444", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> },
                        { label: "Cleared Today", value: "28", color: "#10b981", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> },
                        { label: "Avg Wait Time", value: "12m", color: "#359aff", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> }
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <svg style={{ position: 'absolute', left: '12px', top: '48%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                <input placeholder="Search Patient Name, MRN or Session ID" style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '10px', border: '1px solid #f1f5f9', fontSize: '13px', background: '#ffffff' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className={styles.outlineBtn} style={{ background: '#f8fafc', color: '#1e293b', fontSize: '13px', height: '40px', borderRadius: '10px' }}>All Departments <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg></button>
                                <button className={styles.outlineBtn} style={{ background: '#f8fafc', color: '#1e293b', fontSize: '13px', height: '40px', borderRadius: '10px' }}>All Providers <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg></button>
                                <button className={styles.outlineBtn} style={{ background: '#f8fafc', color: '#1e293b', fontSize: '13px', height: '40px', borderRadius: '10px' }}>Urgency Level <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg></button>
                                <button style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '13px', textDecoration: 'underline', cursor: 'pointer', padding: '0 8px', fontWeight: '500' }}>Clear Filters</button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ background: '#DFF2FF', color: '#3b82f6', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                Department: Cardiology <span style={{ cursor: 'pointer', fontSize: '14px' }}>×</span>
                            </div>
                        </div>
                    </div>

                    <table className={styles.activityTable} style={{ fontSize: '13px' }}>
                        <thead>
                            <tr className={styles.activityHeader}>
                                <th style={{ padding: '16px 24px', color: '#94a3b8' }}>PATIENT</th>
                                <th style={{ color: '#94a3b8' }}>SESSION ID</th>
                                <th style={{ color: '#94a3b8' }}>PROVIDER</th>
                                <th style={{ color: '#94a3b8' }}>VISIT STATE</th>
                                <th style={{ textAlign: 'right', paddingRight: '24px', color: '#94a3b8' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: "Doe, John", dob: "01/12/1980 (43y)", initials: "JD", id: "#SESS-8842", time: "Today, 09:41 AM", provider: "Dr. Sarah Jenkins", dept: "Cardiology", status: "Needs Review", color: "#f59e0b", action: "Review", active: true },
                                { name: "Smith, Jane", dob: "05/22/1975 (48y)", initials: "SJ", id: "#SESS-8841", time: "Today, 09:15 AM", provider: "Dr. Emily Chen", dept: "Neurology", status: "Processing", color: "#3b82f6", action: "", active: false },
                                { name: "Brown, Robert", dob: "11/30/1990 (33y)", initials: "RB", id: "#SESS-8839", time: "Today, 08:50 AM", provider: "Dr. Michael Ross", dept: "Pediatrics", status: "In Progress", color: "#64748b", action: "", active: true },
                                { name: "Wilson, Alice", dob: "03/14/1985 (39y)", initials: "WA", id: "#SESS-8835", time: "Today, 08:30 AM", provider: "Dr. Sarah Jenkins", dept: "Cardiology", status: "Needs Review", color: "#f59e0b", action: "Review", active: false },
                                { name: "Davis, Chris", dob: "09/05/1962 (61y)", initials: "DC", id: "#SESS-8830", time: "Today, 08:10 AM", provider: "Dr. James Wilson", dept: "Orthopedics", status: "Needs Review", color: "#f59e0b", action: "Review", active: false }
                            ].map((row, i) => (
                                <tr key={i} className={styles.activityRow} style={{ borderBottom: '1px solid #f8fafc' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ position: 'relative' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px' }}>{row.initials}</div>
                                                {row.active && <div style={{ position: 'absolute', bottom: '0', right: '0', width: '10px', height: '10px', background: '#10b981', border: '2px solid #ffffff', borderRadius: '50%' }} />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '800', color: '#1e293b' }}>{row.name}</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>DOB: {row.dob}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '700', color: '#3b82f6' }}>{row.id}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{row.time}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '700', color: '#1e293b' }}>{row.provider}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{row.dept}</div>
                                    </td>
                                    <td>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: '800',
                                            background: `${row.color}15`,
                                            color: row.color
                                        }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: row.color }} />
                                            {row.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                                        {row.action && (
                                            <button className={styles.outlineBtn} style={{ padding: '0 16px', height: '32px', fontSize: '12px', background: '#ffffff', color: '#64748b', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #e2e8f0' }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                {row.action}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', borderTop: '1px solid #f8fafc' }}>
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>Showing <span style={{ fontWeight: '700', color: '#1e293b' }}>1 to 5</span> of 14 results</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className={styles.outlineBtn} style={{ height: '32px', padding: '0 16px', background: '#ffffff', color: '#94a3b8' }}>Previous</button>
                            <button className={styles.outlineBtn} style={{ height: '32px', padding: '0 16px', background: '#ffffff', color: '#1e293b', fontWeight: '700' }}>Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
