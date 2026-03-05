"use client";
import Topbar from "./components/Topbar";
import styles from "./HospitalDashboard.module.css";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { fetchAdminOverview } from "@/services/admin";
import { fetchProfile } from "@/services/doctor";
import { fetchOrganizationMembers, fetchHospitalAppointments } from "@/services/hospital";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function HospitalDashboard() {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [overviewData, setOverviewData] = useState(null);
    const [statsData, setStatsData] = useState({});
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [overview, profileData, staffMembers, apptData] = await Promise.all([
                    fetchAdminOverview(),
                    fetchProfile(),
                    fetchOrganizationMembers(),
                    fetchHospitalAppointments()
                ]);

                if (!profileData) return;

                if (profileData.role !== "hospital") {
                    router.replace(`/dashboard/${profileData.role}`);
                    return;
                }

                setOverviewData(overview);
                setDoctorProfile(profileData);
                setStatsData({
                    totalStaff: staffMembers.length,
                    storage: overview?.storage || { used_gb: 0, total_gb: 0, percentage: 0 },
                    alerts: overview?.alerts || [],
                    recentActivity: overview?.recent_activity || [],
                    appointmentsToday: apptData.filter(a => {
                        const today = new Date().toISOString().split('T')[0];
                        const apptDate = a.requested_date ? a.requested_date.split('T')[0] : "";
                        return apptDate === today;
                    }).length
                });

            } catch (err) {
                console.error("Failed to load hospital dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [router]);

    const stats = [
        {
            label: "TOTAL STAFF COUNT",
            value: statsData.totalStaff || "0",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
            color: "#3b82f6",
            bgColor: "#eff6ff",
            lineColor: "#3b82f6"
        },
        {
            label: "STORAGE USED",
            value: `${statsData.storage?.used_gb || 0} GB`,
            subValue: `/ ${statsData.storage?.total_gb || 0} GB`,
            badge: `${statsData.storage?.percentage || 0}%`,
            badgeColor: "#3b82f6",
            badgeBg: "#eff6ff",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
            color: "#f59e0b",
            bgColor: "#fffbeb",
            lineColor: "#fde68a"
        },
        {
            label: "APPOINTMENTS TODAY",
            value: statsData.appointmentsToday || "0",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
            color: "#10b981",
            bgColor: "#f0fdf4",
            lineColor: "#10b981"
        }
    ];

    // encounters removed — table now uses filteredQueue from live API (reviewQueue from /consultations)

    const filteredActivity = useMemo(() => {
        return (statsData.recentActivity || []).filter(item => {
            if (!item) return false;
            const searchLower = searchTerm.toLowerCase();
            return !searchTerm ||
                (item.user_name && item.user_name.toLowerCase().includes(searchLower)) ||
                (item.event_description && item.event_description.toLowerCase().includes(searchLower));
        });
    }, [statsData.recentActivity, searchTerm]);

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            style={{ display: 'flex', flexDirection: 'column', background: 'transparent', padding: 0, minHeight: '100%' }}
        >
            <Topbar title="Clinical Dashboard" onSearch={setSearchTerm} />

            <div className={styles.contentWrapper}>
                <div className={styles.dashboardHeaderRow} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Clinical Dashboard</h1>
                        <p style={{ color: '#64748b', fontSize: '13px', margin: '2px 0 0 0' }}>
                            Good morning{doctorProfile?.full_name ? `, ${doctorProfile.full_name}` : ''}.
                            Your clinical queue is clear.
                        </p>
                    </div>
                    <div className={styles.dashboardHeaderActions} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', alignItems: 'center', gap: '4px' }}>
                            <button
                                onClick={() => setIsAvailable(true)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: isAvailable ? '#10b981' : 'transparent',
                                    color: isAvailable ? 'white' : '#64748b',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ width: '6px', height: '6px', background: isAvailable ? 'white' : '#10b981', borderRadius: '50%' }} />
                                Available
                            </button>
                            <button
                                onClick={() => setIsAvailable(false)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: !isAvailable ? '#f59e0b' : 'transparent',
                                    color: !isAvailable ? 'white' : '#64748b',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Busy
                            </button>
                        </div>
                        <button className={styles.primaryBtn} style={{ height: '36px', fontSize: '13px', padding: '0 20px', borderRadius: '10px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px' }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Start New Visit
                        </button> */}
                    </div>
                </div>

                <div className={styles.dashboardGrid}>
                    {/* Main Content Area */}
                    <div className={styles.leftColMain}>
                        <div className={`${styles.overviewSection} ${styles.statCardsGrid}`} style={{ marginBottom: '32px' }}>
                            {stats.map((s, i) => (
                                <div key={`${s.label}-${i}`} className={styles.statCard} style={{ padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', background: '#ffffff', minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ fontSize: 'var(--font-label)', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '8px' }}>{s.label}</div>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                                <div style={{ fontSize: 'var(--font-stat)', fontWeight: '800', color: '#1e293b' }}>{s.value}</div>
                                                {s.subValue && <div style={{ fontSize: 'var(--font-xs)', color: '#94a3b8', fontWeight: '500' }}>{s.subValue}</div>}
                                                {s.badge && <div style={{ fontSize: '10px', color: s.badgeColor || '#ef4444', background: s.badgeBg || '#fee2e2', padding: '2px 8px', borderRadius: '4px', fontWeight: '800', marginLeft: '8px' }}>{s.badge}</div>}
                                            </div>
                                        </div>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: s.bgColor, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                                    </div>
                                    {s.tags ? (
                                        <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
                                            {s.tags.map((tag, idx) => (
                                                <span key={`${tag}-${idx}`} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#64748b', fontWeight: '700' }}>{tag}</span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ width: '100%', height: '4px', background: '#f1f5f9', borderRadius: '2px', marginTop: '16px', position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '40%', background: s.lineColor, borderRadius: '2px' }} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* <div className={styles.card} style={{ border: 'none', background: '#ffffff', padding: '24px 0', borderRadius: '16px', marginBottom: '32px' }}>
                            ... (commented out per requirement)
                        </div> */}

                        {/* Recent Activity Section */}
                        <div className={styles.card} style={{ border: 'none', background: '#ffffff', padding: '24px', borderRadius: '16px' }}>
                            <div className={styles.scheduleSectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>Recent Activity</h2>
                            </div>
                            <div className={styles.scheduleListWrapper} style={{ display: 'flex', flexDirection: 'column', border: '1px solid #f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
                                {filteredActivity.length === 0 ? (
                                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No recent activity.</div>
                                ) : filteredActivity.map((item, i) => {
                                    const timeStr = item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently";
                                    const dateStr = item.timestamp ? new Date(item.timestamp).toLocaleDateString() : "";

                                    return (
                                        <div key={item.id || i} style={{ display: 'flex', borderBottom: i === filteredActivity.length - 1 ? 'none' : '1px solid #f1f5f9', position: 'relative' }}>
                                            <div style={{ width: '120px', padding: '20px 16px', flexShrink: 0, textAlign: 'center', borderRight: '1px solid #f1f5f9' }}>
                                                <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{timeStr}</div>
                                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginTop: '2px' }}>{dateStr}</div>
                                            </div>
                                            <div style={{ flex: 1, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
                                                        {item.user_name}
                                                    </div>
                                                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                                                        {item.event_description}
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '11px', color: item.status === 'success' ? '#10b981' : '#f59e0b', background: item.status === 'success' ? '#f0fdf4' : '#fffbeb', padding: '2px 8px', borderRadius: '4px', fontWeight: '700', textTransform: 'uppercase' }}>
                                                    {item.status}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Side Column */}
                    <div className={styles.rightColMain}>
                        {/* System Alerts */}
                        <div className={styles.card} style={{ padding: '20px', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px', color: '#1e293b' }}>System Alerts</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {(!statsData.alerts || statsData.alerts.length === 0) ? (
                                    <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>No active alerts.</div>
                                ) : statsData.alerts.map((alert, i) => (
                                    <div key={alert.id || i} style={{ padding: '12px', borderRadius: '10px', background: alert.severity === 'critical' ? '#fee2e2' : '#f1f5f9', border: `1px solid ${alert.severity === 'critical' ? '#fecaca' : '#e2e8f0'}` }}>
                                        <div style={{ fontSize: '13px', fontWeight: '700', color: alert.severity === 'critical' ? '#991b1b' : '#1e293b' }}>{alert.title}</div>
                                        <div style={{ fontSize: '12px', color: alert.severity === 'critical' ? '#b91c1c' : '#64748b', marginTop: '2px' }}>{alert.message}</div>
                                        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px', fontWeight: '600' }}>{alert.time_ago}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions Integration */}
                        <div className={styles.card} style={{ padding: '20px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px', color: '#1e293b' }}>Quick Actions</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                                {overviewData?.quick_actions?.map((action, i) => (
                                    <button key={i} className={styles.outlineBtn} style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left', padding: '10px 16px', fontSize: '13px' }}>
                                        {action}
                                    </button>
                                ))}
                                <Link href="/dashboard/hospital/staff-management" style={{ textDecoration: 'none' }}>
                                    <button className={styles.primaryBtn} style={{ width: '100%', fontSize: '13px', padding: '10px' }}>+ Manage Staff</button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}


