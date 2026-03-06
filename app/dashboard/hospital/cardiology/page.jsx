"use client";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { fetchHospitalStats, fetchHospitalStaff } from "@/services/hospital";
import { fetchCalendarMonth } from "@/services/calendar";

export default function CardiologyDepartmentPage() {
    const [stats, setStats] = useState({ notesPendingSignature: 0, transcriptionQueueStatus: 0, averageNoteCompletionTime: "—" });
    const [staff, setStaff] = useState([]);
    const [calendarData, setCalendarData] = useState({});
    const [loading, setLoading] = useState(true);
    const currentDate = new Date();
    const monthName = currentDate.toLocaleString("default", { month: "long" });
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
    const todayDate = currentDate.getDate();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [statsData, staffData, calData] = await Promise.all([
                    fetchHospitalStats(),
                    fetchHospitalStaff(),
                    fetchCalendarMonth(currentYear, currentDate.getMonth() + 1),
                ]);
                setStats(statsData?.metrics || { notesPendingSignature: 0, transcriptionQueueStatus: 0, averageNoteCompletionTime: "—" });
                setStaff(staffData || []);
                if (calData?.days) {
                    const mapped = {};
                    calData.days.forEach(d => { mapped[d.day] = d.event_count || d.count || 0; });
                    setCalendarData(mapped);
                }
            } catch (err) {
                console.error("CardiologyPage init error:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const statCards = [
        {
            label: "NOTES PENDING SIGNATURE",
            value: loading ? "..." : stats.notesPendingSignature,
            badge: loading ? "..." : (stats.notesPendingSignature > 0 ? `${Math.ceil(stats.notesPendingSignature * 0.35)} urgent` : "None urgent"),
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
            badgeBg: "#fef2f2", badgeColor: "#ef4444"
        },
        {
            label: "TRANSCRIPTION QUEUE STATUS",
            value: loading ? "..." : stats.transcriptionQueueStatus,
            badge: "Real-time",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20v-6M9 20v-4M15 20v-8M18 20v-10M6 20v-2"></path></svg>,
            badgeColor: "#10b981"
        },
        {
            label: "AVG NOTE COMPLETION TIME",
            value: loading ? "..." : stats.averageNoteCompletionTime,
            badge: "Live",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
            badgeColor: "#10b981"
        },
        {
            label: "CLINICAL STAFF",
            value: loading ? "..." : staff.length || "—",
            badge: "Active",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
            badgeColor: "#10b981"
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", flexDirection: "column", background: "transparent", padding: 0, minHeight: "100%" }}
        >
            <Topbar title="Cardiology Department" />

            <div className={styles.contentWrapper}>
                <div className={styles.dashboardGrid}>
                    <div className={styles.leftColMain}>
                        <div className={styles.pageHeaderRow} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <div>
                                <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Clinical Staff</h1>
                                <p style={{ color: "#64748b", margin: "4px 0 0 0" }}>Manage cardiology department providers and roles.</p>
                            </div>
                            <div className={styles.pageHeaderActions} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                <button className={styles.primaryBtn} style={{ background: "#3b82f6", color: "white", border: "none", padding: "0 24px", fontWeight: "700" }}>Schedule</button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className={styles.overviewSection} style={{ marginBottom: "32px" }}>
                            {statCards.map((stat, idx) => (
                                <div key={idx} className={styles.statCard} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "16px", borderRadius: "12px", border: "1px solid #f1f5f9", background: "#ffffff", minHeight: "130px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div style={{ fontSize: "10px", fontWeight: "800", color: "#94a3b8", letterSpacing: "0.02em", textTransform: "uppercase" }}>{stat.label}</div>
                                        <div style={{ color: "#e2e8f0" }}>{stat.icon}</div>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "12px" }}>
                                        <div style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a" }}>{stat.value}</div>
                                        <div style={{ fontSize: "10px", fontWeight: "800", color: stat.badgeColor, background: stat.badgeBg || "#ecfdf5", padding: "2px 8px", borderRadius: "4px" }}>{stat.badge}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Staff Table */}
                        <div className={styles.card}>
                            <div className={styles.cardTitle}>Department Staff</div>
                            <div className={styles.filterButtonRow} style={{ display: "flex", gap: "8px", marginTop: "16px", marginBottom: "16px" }}>
                                <div style={{ flex: 1, position: "relative" }}>
                                    <input placeholder="Search staff..." style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #f1f5f9", fontSize: "13px" }} />
                                </div>
                                <button className={styles.outlineBtn} style={{ height: "36px" }}>Filters</button>
                            </div>

                            <div className={styles.tableScrollWrapper}>
                                <table className={styles.activityTable}>
                                    <thead>
                                        <tr className={styles.activityHeader}>
                                            <th style={{ whiteSpace: "nowrap" }}>NAME</th>
                                            <th style={{ whiteSpace: "nowrap" }}>ROLE</th>
                                            <th style={{ whiteSpace: "nowrap" }}>EMAIL</th>
                                            <th style={{ whiteSpace: "nowrap" }}>STATUS</th>
                                            <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="5" style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>Loading staff...</td></tr>
                                        ) : staff.length === 0 ? (
                                            <tr><td colSpan="5" style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>No staff members found.</td></tr>
                                        ) : staff.map((member, i) => {
                                            const statusColor = member.status === "active" ? "#10b981" : "#f59e0b";
                                            return (
                                                <tr key={i} className={styles.activityRow}>
                                                    <td style={{ whiteSpace: "nowrap" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                            <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", color: "#64748b" }}>{(member.full_name || "U")[0]}</div>
                                                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>{member.full_name || member.name || "Unknown"}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "capitalize" }}>{member.role || "Provider"}</td>
                                                    <td style={{ fontSize: "12px", color: "#64748b" }}>{member.email}</td>
                                                    <td style={{ whiteSpace: "nowrap" }}>
                                                        <span style={{ color: statusColor, background: `${statusColor}15`, padding: "4px 12px", borderRadius: "20px", fontWeight: "700", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: statusColor }} />
                                                            {member.status || "Active"}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                                                        <button className={styles.outlineBtn} style={{ height: "32px", fontSize: "12px" }}>Details</button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className={styles.rightColMain}>
                        {/* Calendar */}
                        <div className={styles.calendarCard} style={{ marginBottom: "24px" }}>
                            <div className={styles.calendarHeader}>
                                <h3 style={{ fontSize: "15px", fontWeight: "800", margin: 0 }}>{monthName} {currentYear}</h3>
                            </div>
                            <div className={styles.calendarGrid}>
                                {["MO", "TU", "WE", "TH", "FR", "SA", "SU"].map(d => <div key={d} className={styles.dayLabel}>{d}</div>)}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const hasEvent = calendarData[day] > 0;
                                    const isToday = day === todayDate;
                                    return (
                                        <div key={i} className={`${styles.day} ${isToday ? styles.selectedDay : ""}`} style={{ position: "relative" }}>
                                            {day}
                                            {hasEvent && <div style={{ position: "absolute", bottom: "2px", width: "4px", height: "4px", borderRadius: "50%", background: "#3b82f6" }} />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Hospital Staff Overview */}
                        <div className={styles.card} style={{ marginBottom: "24px" }}>
                            <div className={styles.cardTitle}>Active Staff</div>
                            <div style={{ marginTop: "16px" }}>
                                {loading ? (
                                    <div style={{ color: "#94a3b8", fontSize: "13px", padding: "12px 0" }}>Loading staff...</div>
                                ) : staff.length === 0 ? (
                                    <div style={{ color: "#94a3b8", fontSize: "13px", padding: "12px 0" }}>No staff members available.</div>
                                ) : staff.slice(0, 4).map((s, i) => (
                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: i < staff.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                                        <div style={{ fontSize: "13px", fontWeight: "600" }}>{s.full_name || s.name || "—"}</div>
                                        <div style={{ fontSize: "10px", color: s.status === "active" ? "#10b981" : "#f59e0b", fontWeight: "800" }}>
                                            {s.status || "Active"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Ward Capacity */}
                        <div className={styles.card}>
                            <div className={styles.cardTitle}>Ward Capacity</div>
                            <div style={{ marginTop: "16px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                    <span style={{ fontSize: "12px", fontWeight: "700" }}>ICU Load</span>
                                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8" }}>
                                        {loading ? "Loading..." : "Backend not connected"}
                                    </span>
                                </div>
                                <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "3px" }}>
                                    <div style={{ width: "0%", height: "100%", background: "#ef4444", borderRadius: "3px" }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
