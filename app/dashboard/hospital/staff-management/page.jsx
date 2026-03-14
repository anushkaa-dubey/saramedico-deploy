"use client";
import { motion } from "framer-motion";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import staffStyles from "./StaffManagement.module.css";
import InviteStaffModal from "./components/InviteStaffModal";
import CreatePatientModal from "./components/CreatePatientModal";
import DoctorDetailsModal from "./components/DoctorDetailsModal";
import { useState, useEffect } from "react";
import { fetchHospitalDoctorStatus } from "@/services/hospital";

export default function StaffManagementPage() {
    const [doctorStatusList, setDoctorStatusList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState(null);
    const [activeTab, setActiveTab] = useState("all");

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

    useEffect(() => { loadDoctorStatus(); }, []);

    const activeCount = doctorStatusList.filter(d => (d.status || "").toLowerCase() === "active").length;
    const inactiveCount = doctorStatusList.filter(d => (d.status || "").toLowerCase() !== "active").length;

    const filteredList = doctorStatusList.filter(d => {
        if (activeTab === "active") return (d.status || "").toLowerCase() === "active";
        if (activeTab === "inactive") return (d.status || "").toLowerCase() !== "active";
        return true;
    });

    const stats = [
        {
            label: "Total Staff", value: doctorStatusList.length, color: "#359aff",
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
        },
        {
            label: "Active", value: activeCount, color: "#10b981",
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></svg>,
        },
        {
            label: "Inactive", value: inactiveCount, color: "#ef4444",
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>,
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", flexDirection: "column", background: "transparent", padding: 0, minHeight: "100%" }}
        >
            <Topbar title="Staff Management" />

            <div className={styles.contentWrapper}>

                {/* ── Page Header ── */}
                <div className={staffStyles.pageHeader}>
                    <div>
                        <h1 className={staffStyles.pageTitle}>Staff Management</h1>
                        <p className={staffStyles.pageSub}>View doctor availability and manage hospital personnel.</p>
                    </div>
                    <div className={staffStyles.headerBtns}>
                        <button
                            onClick={() => setIsPatientModalOpen(true)}
                            className={staffStyles.outlineBtn}
                        >
                            + Create Patient ID
                        </button>
                        <button
                            onClick={() => setIsInviteModalOpen(true)}
                            className={staffStyles.primaryBtn}
                        >
                            + Invite Doctor
                        </button>
                    </div>
                </div>

                {/* ── Stats ── */}
                <div className={staffStyles.statsGrid}>
                    {stats.map((s, i) => (
                        <div key={i} className={staffStyles.statCard}>
                            <div className={staffStyles.statIcon} style={{ color: s.color, background: `${s.color}15` }}>
                                {s.icon}
                            </div>
                            <div>
                                <div className={staffStyles.statLabel}>{s.label}</div>
                                <div className={staffStyles.statValue} style={{ color: s.color }}>
                                    {loading ? "…" : s.value}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Filter Tabs ── */}
                <div className={staffStyles.tabs}>
                    {[
                        { key: "all", label: `All (${doctorStatusList.length})` },
                        { key: "active", label: `Active (${activeCount})` },
                        { key: "inactive", label: `Inactive (${inactiveCount})` },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`${staffStyles.tab} ${activeTab === tab.key ? staffStyles.tabActive : ""}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Desktop Table ── */}
                <div className={`${styles.card} ${staffStyles.tableCard}`}>
                    <div className={styles.tableScrollWrapper}>
                        <table className={`${styles.activityTable} ${staffStyles.table}`}>
                            <thead>
                                <tr className={styles.activityHeader}>
                                    <th>DOCTOR</th>
                                    <th>SPECIALTY</th>
                                    <th>EMAIL</th>
                                    <th>DEPARTMENT</th>
                                    <th>STATUS</th>
                                    <th style={{ textAlign: "right", paddingRight: "24px" }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className={staffStyles.tableEmpty}>Loading staff directory...</td></tr>
                                ) : filteredList.length === 0 ? (
                                    <tr><td colSpan="6" className={staffStyles.tableEmpty}>No staff members found.</td></tr>
                                ) : filteredList.map((d, i) => {
                                    const isActive = (d.status || "").toLowerCase() === "active";
                                    return (
                                        <tr key={d.id || i} className={styles.activityRow}>
                                            <td style={{ padding: "16px 24px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                    <div className={staffStyles.avatar}>
                                                        {(d.full_name || d.name || "D").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                                                    </div>
                                                    <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{d.name || d.full_name || "Staff Member"}</span>
                                                </div>
                                            </td>
                                            <td className={staffStyles.muted}>{d.specialty || d.specialization || "—"}</td>
                                            <td className={staffStyles.muted}>{d.email || "—"}</td>
                                            <td className={staffStyles.muted}>{d.department || "—"}</td>
                                            <td>
                                                <span className={`${staffStyles.badge} ${isActive ? staffStyles.badgeActive : staffStyles.badgeInactive}`}>
                                                    {d.status || "Unknown"}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: "right", paddingRight: "24px" }}>
                                                <button onClick={() => setSelectedDoctorId(d)} className={styles.outlineBtn}>
                                                    Manage
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Mobile Cards (hidden on desktop) ── */}
                <div className={staffStyles.mobileList}>
                    {loading ? (
                        <div className={staffStyles.tableEmpty}>Loading staff directory...</div>
                    ) : filteredList.length === 0 ? (
                        <div className={staffStyles.tableEmpty}>No staff members found.</div>
                    ) : filteredList.map((d, i) => {
                        const isActive = (d.status || "").toLowerCase() === "active";
                        return (
                            <div key={d.id || i} className={staffStyles.mobileCard}>
                                <div className={staffStyles.mobileCardTop}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div className={staffStyles.avatar}>
                                            {(d.full_name || d.name || "D").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                                        </div>
                                        <div>
                                            <div className={staffStyles.mobileName}>{d.name || d.full_name || "Staff Member"}</div>
                                            <div className={staffStyles.mobileSpecialty}>{d.specialty || d.specialization || "—"}</div>
                                        </div>
                                    </div>
                                    <span className={`${staffStyles.badge} ${isActive ? staffStyles.badgeActive : staffStyles.badgeInactive}`}>
                                        {d.status || "Unknown"}
                                    </span>
                                </div>
                                <div className={staffStyles.mobileCardMeta}>
                                    {d.email && <span>✉ {d.email}</span>}
                                    {d.department && <span>🏥 {d.department}</span>}
                                </div>
                                <button
                                    onClick={() => setSelectedDoctorId(d)}
                                    className={staffStyles.manageBtn}
                                >
                                    Manage
                                </button>
                            </div>
                        );
                    })}
                </div>

            </div>

            <InviteStaffModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onSuccess={() => { setIsInviteModalOpen(false); loadDoctorStatus(); }}
            />
            <CreatePatientModal
                isOpen={isPatientModalOpen}
                onClose={() => setIsPatientModalOpen(false)}
                onSuccess={() => setIsPatientModalOpen(false)}
            />
            <DoctorDetailsModal
                isOpen={!!selectedDoctorId}
                onClose={() => { setSelectedDoctorId(null); loadDoctorStatus(); }}
                doctor={selectedDoctorId}
            />
        </motion.div>
    );
}