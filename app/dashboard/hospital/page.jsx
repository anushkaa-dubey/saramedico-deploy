"use client";
import Topbar from "./components/Topbar";
import styles from "./HospitalDashboard.module.css";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchHospitalDashboardOverview, fetchHospitalDirectory, fetchOrganizationMembers } from "@/services/hospital";
import { fetchProfile } from "@/services/doctor";
import { API_BASE_URL, getAuthHeaders, handleResponse } from "@/services/apiConfig";
import { Users, Building2, Stethoscope, Calendar, BarChart2, UserPlus } from "lucide-react";

// ── Helpers ─────────────────────────────────────────────────────────────────
async function fetchDailyAgenda() {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const res = await fetch(`${API_BASE_URL}/calendar/organization/events?start_date=${startOfDay.toISOString()}&end_date=${endOfDay.toISOString()}`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(res);
        return Array.isArray(data) ? data : (data?.events || []);
    } catch { return []; }
}

async function fetchAuditActivity() {
    try {
        const res = await fetch(`${API_BASE_URL}/audit/logs?limit=5`, { headers: getAuthHeaders() });
        const data = await handleResponse(res);
        return data?.logs || data || [];
    } catch { return []; }
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 }
};

export default function HospitalDashboard() {
    const router = useRouter();
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ doctors: 0, patients: 0, staff: 0, appointments: 0, departments: 0 });
    const [recentActivity, setRecentActivity] = useState([]);
    const [dailyAgenda, setDailyAgenda] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [profileData, dashboardOverview, directoryData, membersData, agendaData] = await Promise.all([
                    fetchProfile().catch(() => null),
                    fetchHospitalDashboardOverview().catch(() => ({ metrics: { totalDoctors: 0, todayAppointments: 0 }, recentActivities: [] })),
                    fetchHospitalDirectory().catch(() => ({ doctors: [], patients: [] })),
                    fetchOrganizationMembers().catch(() => []),
                    fetchDailyAgenda(),
                ]);

                if (!profileData) { router.replace("/auth/login"); return; }
                if (profileData.role !== "hospital") {
                    const r = (profileData.role || "").toLowerCase();
                    router.replace(r === "patient" ? "/dashboard/patient" : r === "doctor" ? "/dashboard/doctor" : "/auth/login");
                    return;
                }

                setDoctorProfile(profileData);

                const docs = Array.isArray(directoryData) ? directoryData : (directoryData?.doctors || []);
                const patients = Array.isArray(directoryData?.patients) ? directoryData.patients : [];
                const members = Array.isArray(membersData) ? membersData : [];
                const uniqueDepts = [...new Set([...docs, ...members].map(d => d.department || d.specialty).filter(Boolean))];

                const staffCount = members.filter(m => m.role !== 'patient').length;
                const appsToday = dashboardOverview?.metrics?.todayAppointments || agendaData.filter(e => e.event_type === 'appointment').length;

                setStats({
                    doctors: dashboardOverview?.metrics?.totalDoctors || docs.length || members.filter(m => m.role === "doctor").length,
                    patients: patients.length,
                    staff: staffCount,
                    departments: uniqueDepts.length,
                    appointments: appsToday,
                });

                setDailyAgenda(Array.isArray(agendaData) ? agendaData.slice(0, 6) : []);

                const activity = dashboardOverview?.recentActivities || [];
                if (Array.isArray(activity) && activity.length > 0) {
                    setRecentActivity(activity.slice(0, 5));
                } else {
                    const logs = await fetchAuditActivity();
                    setRecentActivity(Array.isArray(logs) ? logs.slice(0, 5) : []);
                }

            } catch (err) {
                console.error("Dashboard load error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [router]);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

    const statCards = [
        { label: "DOCTORS", value: stats.doctors, icon: <Stethoscope size={20} />, color: "#6366f1", bg: "#eef2ff", href: "/dashboard/hospital/doctors" },
        { label: "PATIENTS", value: stats.patients, icon: <Users size={20} />, color: "#10b981", bg: "#f0fdf4", href: "/dashboard/hospital/patients" },
        { label: "STAFF MEMBERS", value: stats.staff, icon: <Building2 size={20} />, color: "#f59e0b", bg: "#fffbeb", href: "/dashboard/hospital/staff-management" },
        { label: "APPOINTMENTS TODAY", value: stats.appointments, icon: <Calendar size={20} />, color: "#3b82f6", bg: "#eff6ff", href: "/dashboard/hospital/appointments" },
        { label: "DEPARTMENTS", value: stats.departments, icon: <BarChart2 size={20} />, color: "#ec4899", bg: "#fdf2f8", href: "/dashboard/hospital/departments" },
    ];

    const quickActions = [
        { label: "Onboard Doctor", icon: <UserPlus size={18} />, href: "/dashboard/hospital/staff-management", color: "#3b82f6", bg: "#eff6ff" },
        { label: "Patient Registry", icon: <Users size={18} />, href: "/dashboard/hospital/patients", color: "#10b981", bg: "#f0fdf4" },
        { label: "View Analytics", icon: <BarChart2 size={18} />, href: "/dashboard/hospital/analytics", color: "#6366f1", bg: "#eef2ff" },
        { label: "Manage Staff", icon: <Building2 size={18} />, href: "/dashboard/hospital/staff-management", color: "#f59e0b", bg: "#fffbeb" },
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Topbar title="Clinical Dashboard" />
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#F5F7FA' }}>
                    <div className={styles.spinner}></div>
                    <span style={{ marginLeft: '12px', fontWeight: 'bold', color: '#64748b' }}>Loading dashboard...</span>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            style={{ display: "flex", flexDirection: "column", background: "transparent", padding: 0, minHeight: "100%" }}
        >
            <Topbar title="Clinical Dashboard" />

            <div className={styles.contentWrapper}>
                {/* Header */}
                <motion.div variants={cardVariants} style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                        <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
                            Clinical Dashboard
                        </h1>
                        <p style={{ color: "#64748b", fontSize: "14px", margin: "4px 0 0 0", fontWeight: "500" }}>
                            {greeting}{doctorProfile?.full_name ? `, ${doctorProfile.full_name}` : ""}. Your clinical queue is {stats.appointments > 0 ? `active with ${stats.appointments} events` : "clear"}.
                        </p>
                    </div>
                </motion.div>

                {/* Hero Stats */}
                <motion.div variants={cardVariants} style={{ marginBottom: "32px" }}>
                    <div style={{
                        background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                        borderRadius: "24px",
                        padding: "40px",
                        color: "white",
                        position: "relative",
                        overflow: "hidden",
                        boxShadow: "0 20px 40px -12px rgba(37, 99, 235, 0.3)"
                    }}>
                        <div style={{ position: "relative", zIndex: 1 }}>
                            <div style={{ fontSize: "14px", fontWeight: "800", opacity: 0.9, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>Appointments Today</div>
                            <div style={{ fontSize: "56px", fontWeight: "900", marginBottom: "24px", letterSpacing: "-0.04em" }}>{stats.appointments}</div>
                            <Link href="/dashboard/hospital/appointments" style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                color: "white",
                                textDecoration: "none",
                                fontSize: "14px",
                                fontWeight: "800",
                                background: "rgba(255,255,255,0.15)",
                                padding: "10px 20px",
                                borderRadius: "12px",
                                backdropFilter: "blur(10px)",
                                transition: "all 0.2s"
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                            >
                                View Full Schedule <Calendar size={16} />
                            </Link>
                        </div>
                        <Calendar size={120} style={{ position: "absolute", right: "30px", top: "50%", transform: "translateY(-50%) rotate(-15deg)", opacity: 0.1, zIndex: 0 }} />
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div variants={cardVariants} className={styles.statCardsGrid} style={{ marginBottom: "28px", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" }}>
                    {statCards.map((s) => (
                        <Link key={s.label} href={s.href} style={{ textDecoration: "none" }}>
                            <div style={{
                                background: "#fff", padding: "20px", borderRadius: "16px",
                                border: "1px solid #f1f5f9", cursor: "pointer",
                                transition: "transform 0.15s, box-shadow 0.15s",
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                            >
                                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
                                    {s.icon}
                                </div>
                                <div style={{ fontSize: "11px", fontWeight: "800", color: "#94a3b8", letterSpacing: "0.05em" }}>{s.label}</div>
                                <div style={{ fontSize: "30px", fontWeight: "800", color: "#1e293b", marginTop: "4px" }}>
                                    {s.value}
                                </div>
                            </div>
                        </Link>
                    ))}
                </motion.div>

                {/* Two column layout */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px" }}>
                    {/* Left: Recent Activity */}
                    <motion.div variants={cardVariants}>
                        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9", overflow: "hidden" }}>
                            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f8fafc" }}>
                                <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#1e293b", margin: 0 }}>Recent Activity</h2>
                            </div>
                            {recentActivity.length === 0 ? (
                                <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                                    No recent activity to display.
                                </div>
                            ) : recentActivity.map((item, i) => {
                                const timeStr = item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recent";
                                return (
                                    <div key={i} style={{ display: "flex", padding: "18px 24px", borderBottom: i < recentActivity.length - 1 ? "1px solid #f8fafc" : "none", alignItems: "center" }}>
                                        <div style={{ width: "80px", flexShrink: 0 }}>
                                            <div style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>{timeStr}</div>
                                        </div>
                                        <div style={{ flex: 1, paddingLeft: "16px" }}>
                                            <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>{item.user_name || item.action || "System Event"}</div>
                                            <div style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>{item.event_description || item.description || ""}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Right Column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {/* Quick Actions */}
                        <motion.div variants={cardVariants}>
                            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9", padding: "20px" }}>
                                <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b", marginBottom: "16px", marginTop: 0 }}>Quick Actions</h3>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                    {quickActions.map((a) => (
                                        <Link key={a.label} href={a.href} style={{ textDecoration: "none" }}>
                                            <div style={{
                                                display: "flex", flexDirection: "column", alignItems: "center",
                                                padding: "14px 10px", borderRadius: "12px",
                                                border: "1.5px solid #f1f5f9", cursor: "pointer",
                                                transition: "all 0.15s", gap: "8px",
                                            }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = a.bg; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.background = "transparent"; }}
                                            >
                                                <div style={{ color: a.color }}>{a.icon}</div>
                                                <div style={{ fontSize: "11px", fontWeight: "700", color: "#475569", textAlign: "center" }}>{a.label}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
