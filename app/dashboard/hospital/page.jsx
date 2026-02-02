"use client";
import Topbar from "./components/Topbar";
import styles from "./HospitalDashboard.module.css";
import { motion } from "framer-motion";
import Link from "next/link";

// Icons
import dashboardIcon from "@/public/icons/dashboard.svg";
import messagesIcon from "@/public/icons/messages.svg";
import scheduleIcon from "@/public/icons/schedule.svg";
import manageIcon from "@/public/icons/manage.svg";

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
    const today = new Date();
    const currentMonthName = today.toLocaleString('default', { month: 'long' });
    const currentYear = today.getFullYear();
    const daysInMonthCount = new Date(currentYear, today.getMonth() + 1, 0).getDate();
    const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
    const todayDate = today.getDate();

    const stats = [
        {
            label: "Total Doctors",
            value: "32",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <polyline points="17 11 19 13 23 9" />
                </svg>
            ),
            trend: "+2 this week",
            trendUp: true,
            color: "#3b82f6"
        },
        {
            label: "Total Revenue",
            value: "$42,850",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            ),
            trend: "+15% vs last month",
            trendUp: true,
            color: "#8b5cf6"
        },
        {
            label: "Surgeries Today",
            value: "8",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z" /></svg>
            ),
            trend: "2 in progress",
            trendUp: true,
            color: "#ef4444"
        },
        {
            label: "Pending Approvals",
            value: "14",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            ),
            trend: "5 urgent",
            trendUp: false,
            color: "#f59e0b"
        },
    ];

    const timeline = [
        { doc: "Dr. Sarah Wilson", patient: "John Von", specialty: "Cardiology", time: "09:30 AM", status: "Confirmed", id: "DR001" },
        { doc: "Dr. Michael Chen", patient: "Alice Bob", specialty: "Neurology", time: "11:00 AM", status: "Confirmed", id: "DR002" },
        { doc: "Dr. Elena Rodriguez", patient: "Jane Roe", specialty: "Pediatrics", time: "01:30 PM", status: "Pending", id: "DR003" },
        { doc: "Dr. James Bond", patient: "Daniel Benjamin", specialty: "General", time: "03:00 PM", status: "Confirmed", id: "DR004" },
    ];

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className={styles.container}
            style={{ flexDirection: 'column', background: 'transparent', padding: 0 }}
        >
            <Topbar title="Hospital Overview" />

            <div className={styles.dashboardGrid}>
                {/* Main Content Area */}
                <div className={styles.leftColMain}>
                    {/* Header Greeting */}
                    <motion.div variants={itemVariants} className={styles.alertBoxMain}>
                        <div className={styles.alertPrimaryIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <div>
                            <strong>Hospital Management System Active</strong>
                            <p style={{ margin: 0, opacity: 0.8 }}>All systems operational. Monthly revenue target is 85% achieved.</p>
                        </div>
                    </motion.div>

                    {/* Stats Overview */}
                    <div className={styles.overviewSection}>
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                whileHover={{ scale: 1.02 }}
                                className={styles.statCard}
                            >
                                <div>
                                    <div className={styles.statIconWrapper} style={{ background: `${stat.color}15` }}>
                                        <span style={{ fontSize: '20px' }}>{stat.icon}</span>
                                    </div>
                                    <h3 className={styles.statLabel}>{stat.label}</h3>
                                    <div className={styles.statValue}>{stat.value}</div>
                                </div>
                                <div className={`${styles.statTrend} ${stat.trendUp ? styles.trendUp : styles.trendDown}`}>
                                    {stat.trendUp ? "↑" : "↓"} {stat.trend}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Today's Appointments Timeline */}
                    <motion.div variants={itemVariants} className={styles.card} style={{ border: 'none', background: 'transparent', padding: 0 }}>
                        <div className={styles.timelineTitle}>
                            <span>Today's Sessions</span>
                            <Link href="/dashboard/hospital/appointments" style={{ textDecoration: 'none' }}>
                                <button className={styles.outlineBtn} style={{ fontSize: '12px', height: '34px', marginTop: '12px', color: '#359aff' }}>View Full Schedule</button>
                            </Link>
                        </div>

                        <div className={styles.appointmentTimeline}>
                            {timeline.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    className={styles.timelineItem}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <div className={styles.timelineMarker} />
                                    <div className={styles.appointmentCard}>
                                        <div className={styles.docAvatar} style={{ background: '#359aff20' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#359aff" strokeWidth="2.5">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </div>
                                        <div className={styles.appointmentInfo}>
                                            <div className={styles.docNameMain}>
                                                {item.doc}
                                                <span style={{ color: '#64748b', fontWeight: '400', margin: '0 6px', fontSize: '13px' }}>is meeting with</span>
                                                <span style={{ color: '#359aff' }}>{item.patient}</span>
                                            </div>
                                            <div className={styles.patientMetaMain}>{item.specialty} • Session #{item.id}</div>
                                        </div>
                                        <div className={styles.appointmentTimeMain}>
                                            <div className={styles.timeTextMain}>{item.time}</div>
                                            <span className={`${styles.statusTagMain} ${item.status === 'Confirmed' ? styles.tagConfirmed : styles.tagPending}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Right Sidebar Widgets */}
                <div className={styles.rightColMain}>
                    {/* Calendar Widget */}
                    <motion.div variants={itemVariants} className={styles.calendarCard}>
                        <div className={styles.calendarHeader}>
                            <h3 className={styles.calendarTitle}>{currentMonthName} {currentYear}</h3>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', fontSize: '18px' }}>‹</button>
                                <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', fontSize: '18px' }}>›</button>
                            </div>
                        </div>
                        <div className={styles.calendarGrid}>
                            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                                <div key={day} className={styles.dayLabel}>{day}</div>
                            ))}
                            {daysInMonth.map(day => (
                                <div
                                    key={day}
                                    className={`${styles.day} ${day === todayDate ? styles.todayDay : ''}`}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Staff On Duty Widget */}
                    <motion.div variants={itemVariants} className={styles.card} style={{ marginBottom: '24px' }}>
                        <div className={styles.cardTitle} style={{ fontSize: '15px', marginBottom: '16px' }}>
                            <span>On-Duty Staff</span>
                            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>12 ONLINE</span>
                        </div>
                        <div className={styles.staffList}>
                            {[
                                { name: "Dr. Sarah Wilson", role: "Head of Cardiology" },
                                { name: "Dr. Michael Chen", role: "Neurosurgeon" },
                                { name: "Nurse Jessica", role: "ER Supervisor" }
                            ].map((staff, i) => (
                                <div key={i} className={styles.staffItem}>
                                    <div className={styles.onlineDot} />
                                    <div className={styles.staffInfo}>
                                        <div className={styles.staffName}>{staff.name}</div>
                                        <div className={styles.staffRole}>{staff.role}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Ward Capacity Widget */}
                    <motion.div variants={itemVariants} className={styles.card}>
                        <div className={styles.cardTitle} style={{ fontSize: '15px', marginBottom: '16px' }}>
                            <span>Ward Capacity</span>
                        </div>
                        {[
                            { ward: "ICU", used: 85, color: "#ef4444" },
                            { ward: "General Ward", used: 62, color: "#3b82f6" },
                            { ward: "Pediatrics", used: 40, color: "#10b981" }
                        ].map((ward, i) => (
                            <div key={i} className={styles.capacityWidget}>
                                <div className={styles.capacityLabel}>
                                    <span>{ward.ward}</span>
                                    <span>{ward.used}%</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <motion.div
                                        className={styles.progressFill}
                                        style={{ background: ward.color }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${ward.used}%` }}
                                        transition={{ duration: 1.5, delay: 0.5 }}
                                    />
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}


