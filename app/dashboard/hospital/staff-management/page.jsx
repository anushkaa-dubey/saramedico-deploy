"use client";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion } from "framer-motion";
import Link from "next/link";

export default function StaffManagementPage() {
    const stats = [
        { label: "Total Staff", value: "142", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-3-3.87"></path><path d="M9 21v-2a4 4 0 0 0-4-4H3a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>, color: "#359aff" },
        { label: "On Shift", value: "32", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>, color: "#10b981" },
        { label: "On Leave", value: "8", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>, color: "#f59e0b" },
        { label: "Medical Leave", value: "3", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>, color: "#ef4444" }
    ];

    const staffList = [
        { name: "Dr. Sarah Jenkins", role: "Sr. Cardiologist", dept: "Cardiology", shift: "Day (08:00 - 16:00)", status: "On Duty", color: "#10b981" },
        { name: "Dr. Emily Chen", role: "Resident Doctor", dept: "Emergency", shift: "Night (22:00 - 06:00)", status: "Off Duty", color: "#64748b" },
        { name: "Mark Wilson", role: "Head Nurse", dept: "General Ward", shift: "Evening (14:00 - 22:00)", status: "On Duty", color: "#10b981" },
        { name: "Dr. Michael Ross", role: "Pediatrician", dept: "Pediatrics", shift: "Day (08:00 - 16:00)", status: "On Leave", color: "#f59e0b" }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', background: 'transparent', padding: 0, minHeight: '100%' }}
        >
            <Topbar title="Staff Management" />

            <div className={styles.contentWrapper}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Staff Management</h1>
                        <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Manage hospital personnel, shifts, and department assignments.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className={styles.outlineBtn} style={{ background: '#ffffff' }}>Export Roster</button>
                        <Link href="/dashboard/hospital/settings" style={{ textDecoration: 'none' }}>
                            <button className={styles.primaryBtn}>+ Add New Staff</button>
                        </Link>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                    {stats.map((s, i) => (
                        <div key={i} style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                            <div style={{ color: s.color, marginBottom: '12px' }}>{s.icon}</div>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>{s.label}</div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{s.value}</div>
                        </div>
                    ))}
                </div>

                <div className={styles.card} style={{ border: 'none', borderRadius: '16px', padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '300px' }}>
                            <input
                                type="text"
                                placeholder="Search staff name or role..."
                                style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none' }}
                            />
                            <svg style={{ position: 'absolute', left: '10px', top: '48%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <select className={styles.outlineBtn} style={{ background: '#ffffff', fontSize: '12px' }}><option>All Departments</option></select>
                            <select className={styles.outlineBtn} style={{ background: '#ffffff', fontSize: '12px' }}><option>All Roles</option></select>
                        </div>
                    </div>

                    <table className={styles.activityTable} style={{ fontSize: '13px' }}>
                        <thead>
                            <tr className={styles.activityHeader}>
                                <th style={{ padding: '16px 24px' }}>STAFF MEMBER</th>
                                <th>ROLE</th>
                                <th>DEPARTMENT</th>
                                <th>SHIFT</th>
                                <th>STATUS</th>
                                <th style={{ textAlign: 'right', paddingRight: '24px' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffList.map((s, i) => (
                                <tr key={i} className={styles.activityRow}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#359aff15', color: '#359aff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '11px' }}>{s.name.split(' ').map(n => n[0]).join('')}</div>
                                            <div style={{ fontWeight: '700' }}>{s.name}</div>
                                        </div>
                                    </td>
                                    <td>{s.role}</td>
                                    <td>{s.dept}</td>
                                    <td>{s.shift}</td>
                                    <td>
                                        <span style={{ color: s.color, background: `${s.color}10`, padding: '4px 12px', borderRadius: '20px', fontWeight: '700', fontSize: '11px' }}>{s.status}</span>
                                    </td>
                                    <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                                        <button className={styles.outlineBtn} style={{ height: '32px', fontSize: '12px' }}>Edit</button>
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
