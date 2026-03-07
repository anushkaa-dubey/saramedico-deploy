"use client";
import { motion } from "framer-motion";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import InviteStaffModal from "./components/InviteStaffModal";
import DoctorDetailsModal from "./components/DoctorDetailsModal";
import { useState, useEffect } from "react";
import { fetchHospitalDoctorStatus } from "@/services/hospital";
// import { adminRemoveMember } from "@/services/admin";

export default function StaffManagementPage() {
    const [doctorStatusList, setDoctorStatusList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState(null);
    const [activeTab, setActiveTab] = useState("all"); // "all" | "active" | "inactive"

    const loadDoctorStatus = async () => {
        setLoading(true);
        try {
            const results = await fetchHospitalDoctorStatus();
            setDoctorStatusList(results || []);
        } catch (err) {
            console.error("Failed to load doctor status:", err);
        } finally {
            setLoading(false);
        }
    };

    // const handleRemoveStaff = async (id) => {
    //     if (!confirm("Are you sure you want to remove this team member?")) return;
    //     try {
    //         await adminRemoveMember(id);
    //         loadDoctorStatus();
    //     } catch (err) {
    //         console.error("Failed to remove staff:", err);
    //         alert("Failed to remove staff member.");
    //     }
    // };

    useEffect(() => {
        loadDoctorStatus();
    }, []);

    const activeCount = doctorStatusList.filter(d => (d.status || "").toLowerCase() === "active").length;
    const inactiveCount = doctorStatusList.filter(d => (d.status || "").toLowerCase() !== "active").length;

    const filteredList = doctorStatusList.filter(d => {
        if (activeTab === "active") return (d.status || "").toLowerCase() === "active";
        if (activeTab === "inactive") return (d.status || "").toLowerCase() !== "active";
        return true;
    });

    const stats = [
        {
            label: "Total Staff",
            value: doctorStatusList.length,
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            ),
            color: "#359aff"
        },
        {
            label: "Active",
            value: activeCount,
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <polyline points="16 11 18 13 22 9"></polyline>
                </svg>
            ),
            color: "#10b981"
        },
        {
            label: "Inactive",
            value: inactiveCount,
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            ),
            color: "#ef4444"
        },
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
                        <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>View doctor availability and manage hospital personnel.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => setIsInviteModalOpen(true)}
                            className={styles.primaryBtn}
                        >
                            + Invite Doctor
                        </button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className={styles.overviewSection} style={{ marginBottom: '32px' }}>
                    {stats.map((s, i) => (
                        <div key={i} style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                            <div style={{ color: s.color, marginBottom: '12px' }}>{s.icon}</div>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>{s.label}</div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
                                {loading ? '...' : s.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Status Filter Tabs */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                    {[
                        { key: 'all', label: `All (${doctorStatusList.length})` },
                        { key: 'active', label: `Active (${activeCount})` },
                        { key: 'inactive', label: `Inactive (${inactiveCount})` },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: '7px 18px',
                                borderRadius: '99px',
                                border: '1px solid',
                                fontSize: '13px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                borderColor: activeTab === tab.key ? '#359aff' : '#e2e8f0',
                                background: activeTab === tab.key ? '#359aff' : '#fff',
                                color: activeTab === tab.key ? '#fff' : '#64748b',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Doctor Status Table */}
                <div className={styles.card} style={{ border: 'none', borderRadius: '16px', padding: '0', overflow: 'hidden' }}>
                    <div className={styles.tableScrollWrapper}>
                        <table className={styles.activityTable} style={{ fontSize: '13px' }}>
                            <thead>
                                <tr className={styles.activityHeader}>
                                    <th style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>DOCTOR</th>
                                    <th style={{ whiteSpace: 'nowrap' }}>SPECIALTY</th>
                                    <th style={{ whiteSpace: 'nowrap' }}>EMAIL</th>
                                    <th style={{ whiteSpace: 'nowrap' }}>DEPARTMENT</th>
                                    <th style={{ whiteSpace: 'nowrap' }}>STATUS</th>
                                    <th style={{ textAlign: 'right', paddingRight: '24px', whiteSpace: 'nowrap' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading staff directory...</td></tr>
                                ) : filteredList.length === 0 ? (
                                    <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                        {activeTab === 'active' ? 'No active doctors found.' : activeTab === 'inactive' ? 'No inactive doctors found.' : 'No staff members found.'}
                                    </td></tr>
                                ) : filteredList.map((d, i) => {
                                    const isActive = (d.status || "").toLowerCase() === "active";
                                    return (
                                        <tr key={d.id || i} className={styles.activityRow}>
                                            <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#359aff15', color: '#359aff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '11px' }}>
                                                        {(d.full_name || d.name || "D").split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                    </div>
                                                    <div style={{ fontWeight: '700' }}>{d.full_name || d.name || '—'}</div>
                                                </div>
                                            </td>
                                            <td style={{ whiteSpace: 'nowrap', color: '#64748b' }}>{d.specialty || d.specialization || '—'}</td>
                                            <td style={{ whiteSpace: 'nowrap', color: '#64748b' }}>{d.email || '—'}</td>
                                            <td style={{ whiteSpace: 'nowrap', color: '#64748b' }}>{d.department || '—'}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                <span style={{
                                                    color: isActive ? '#10b981' : '#ef4444',
                                                    background: isActive ? '#10b98115' : '#ef444415',
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontWeight: '700',
                                                    fontSize: '11px',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {d.status || 'Unknown'}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right', paddingRight: '24px', whiteSpace: 'nowrap' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => setSelectedDoctorId(d)}
                                                        className={styles.outlineBtn}
                                                    >
                                                        Manage
                                                    </button>
                                                    {/* <button
                                                        onClick={() => handleRemoveStaff(d.id)}
                                                        className={styles.outlineBtn}
                                                        style={{ height: '32px', fontSize: '12px', color: '#ef4444', borderColor: '#fee2e2' }}
                                                    >
                                                        Remove
                                                    </button> */}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <InviteStaffModal
                    isOpen={isInviteModalOpen}
                    onClose={() => setIsInviteModalOpen(false)}
                    onSuccess={() => { setIsInviteModalOpen(false); loadDoctorStatus(); }}
                />

                <DoctorDetailsModal
                    isOpen={!!selectedDoctorId}
                    onClose={() => setSelectedDoctorId(null)}
                    doctor={selectedDoctorId}
                />            </div>
        </motion.div>
    );
}
