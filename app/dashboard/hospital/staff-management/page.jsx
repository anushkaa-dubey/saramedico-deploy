"use client";
import { fetchAdminAccounts, adminRemoveMember } from "@/services/admin";
import { onboardPatient } from "@/services/doctor";
import { motion } from "framer-motion";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import InviteStaffModal from "./components/InviteStaffModal";
import CreatePatientModal from "./components/CreatePatientModal";
import DoctorDetailsModal from "./components/DoctorDetailsModal";
import { useState, useEffect } from "react";
export default function StaffManagementPage() {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState(null);

    const loadStaff = async () => {
        setLoading(true);
        try {
            const results = await fetchAdminAccounts();
            setStaffList(results || []);
        } catch (err) {
            console.error("Failed to load staff:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveStaff = async (id) => {
        if (!confirm("Are you sure you want to remove this team member?")) return;
        try {
            await adminRemoveMember(id);
            loadStaff();
        } catch (err) {
            console.error("Failed to remove staff:", err);
            alert("Failed to remove staff member.");
        }
    };

    useEffect(() => {
        loadStaff();
    }, []);

    const stats = [
        { label: "Total Staff", value: staffList.length, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-3-3.87"></path><path d="M9 21v-2a4 4 0 0 0-4-4H3a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>, color: "#359aff" },
        // { label: "On Shift", value: staffList.length > 0 ? Math.ceil(staffList.length * 0.4) : 0, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>, color: "#10b981" },
        // { label: "On Leave", value: "0", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>, color: "#f59e0b" },
        // { label: "Medical Leave", value: "0", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>, color: "#ef4444" }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', background: 'transparent', padding: 0, minHeight: '100%' }}
        >
            <Topbar title="Staff Management" />

            <div className={styles.contentWrapper}>
                <div className={styles.pageHeaderRow} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Staff Management</h1>
                        <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Manage hospital personnel, shifts, and department assignments.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => setIsPatientModalOpen(true)}
                            className={styles.outlineBtn}
                            style={{ background: '#ffffff', color: '#10b981', borderColor: '#10b981' }}
                        >
                            + Create Patient ID
                        </button>
                        <button
                            onClick={() => setIsInviteModalOpen(true)}
                            className={styles.primaryBtn}
                        >
                            + Invite Doctor
                        </button>
                    </div>
                </div>

                <div className={styles.overviewSection} style={{ marginBottom: '32px' }}>
                    {stats.map((s, i) => (
                        <div key={i} style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                            <div style={{ color: s.color, marginBottom: '12px' }}>{s.icon}</div>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>{s.label}</div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{s.value}</div>
                        </div>
                    ))}
                </div>

                <div className={styles.card} style={{ border: 'none', borderRadius: '16px', padding: '0', overflow: 'hidden' }}>
                    <div className={styles.tableScrollWrapper}>
                        <table className={styles.activityTable} style={{ fontSize: '13px' }}>
                            <thead>
                                <tr className={styles.activityHeader}>
                                    <th style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>STAFF MEMBER</th>
                                    <th style={{ whiteSpace: 'nowrap' }}>ROLE / SPECIALTY</th>
                                    <th style={{ whiteSpace: 'nowrap' }}>EMAIL</th>
                                    <th style={{ whiteSpace: 'nowrap' }}>PHONE</th>
                                    <th style={{ whiteSpace: 'nowrap' }}>STATUS</th>
                                    <th style={{ textAlign: 'right', paddingRight: '24px', whiteSpace: 'nowrap' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading personnel directory...</td></tr>
                                ) : staffList.length === 0 ? (
                                    <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No staff members currently registered.</td></tr>
                                ) : staffList.map((s, i) => (
                                    <tr key={i} className={styles.activityRow}>
                                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#359aff15', color: '#359aff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '11px' }}>
                                                    {(s.full_name || "S").split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div style={{ fontWeight: '700' }}>{s.full_name}</div>
                                            </div>
                                        </td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{s.specialty || "Practitioner"}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{s.email || "N/A"}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{s.phone_number || "N/A"}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>
                                            <span style={{ color: '#10b981', background: `#10b98110`, padding: '4px 12px', borderRadius: '20px', fontWeight: '700', fontSize: '11px' }}>ACTIVE</span>
                                        </td>
                                        <td style={{ textAlign: 'right', paddingRight: '24px', whiteSpace: 'nowrap' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => setSelectedDoctorId(s.id)}
                                                    className={styles.outlineBtn}
                                                    style={{ height: '32px', fontSize: '12px' }}
                                                >
                                                    Manage
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveStaff(s.id)}
                                                    className={styles.outlineBtn}
                                                    style={{ height: '32px', fontSize: '12px', color: '#ef4444', borderColor: '#fee2e2' }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <InviteStaffModal
                    isOpen={isInviteModalOpen}
                    onClose={() => setIsInviteModalOpen(false)}
                    onSuccess={() => { setIsInviteModalOpen(false); loadStaff(); }}
                />

                <CreatePatientModal
                    isOpen={isPatientModalOpen}
                    onClose={() => setIsPatientModalOpen(false)}
                    onSuccess={() => { setIsPatientModalOpen(false); }}
                />

                <DoctorDetailsModal
                    isOpen={!!selectedDoctorId}
                    onClose={() => setSelectedDoctorId(null)}
                    doctorId={selectedDoctorId}
                />
            </div>
        </motion.div>
    );
}
