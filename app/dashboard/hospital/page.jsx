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
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className={styles.container}
            style={{ flexDirection: 'column', background: 'transparent', padding: 0 }}
        >
            <Topbar title="Hospital Overview" />

            <div style={{ padding: '24px 24px 24px 24px' }}>
                <motion.div className={styles.card} variants={itemVariants} style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#0f172a' }}>Good Morning, Admin</h2>
                    <p style={{ color: '#64748b' }}>Here's what's happening in your hospital today.</p>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                    {[
                        { label: "Active Doctors", value: "24", icon: dashboardIcon, color: "#3b82f6", link: "/dashboard/hospital/doctors" },
                        { label: "New Messages", value: "5", icon: messagesIcon, color: "#f59e0b", link: "/dashboard/hospital/messages" },
                        { label: "Appointments", value: "85", icon: scheduleIcon, color: "#10b981", link: "/dashboard/hospital/appointments" },
                        { label: "Revenue", value: "$42k", icon: manageIcon, color: "#8b5cf6", link: "/dashboard/hospital/analytics" },
                    ].map((stat, idx) => (
                        <motion.div key={idx} variants={itemVariants}>
                            <Link href={stat.link} style={{ textDecoration: 'none' }}>
                                <div className={styles.card} style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.2s', cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                        <div style={{ padding: '10px', borderRadius: '10px', background: `${stat.color}20` }}>
                                            <img src={stat.icon.src} alt={stat.label} width="24" height="24" style={{ filter: `drop-shadow(0 2px 4px ${stat.color}40)` }} />
                                        </div>
                                        <span style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{stat.value}</span>
                                    </div>
                                    <h3 style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>{stat.label}</h3>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <motion.div variants={itemVariants} style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    <div className={styles.card}>
                        <div className={styles.cardTitle} style={{ marginBottom: '20px' }}>
                            <span>Recent Activity</span>
                            <button style={{ color: '#3b82f6', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer' }}>View All</button>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                {[
                                    { action: "Dr. Sarah started a session", time: "10 mins ago", status: "Active" },
                                    { action: "New patient registered", time: "1 hour ago", status: "Completed" },
                                    { action: "System maintenance", time: "Yesterday", status: "Scheduled" },
                                ].map((row, i) => (
                                    <tr key={i} style={{ borderBottom: i !== 2 ? '1px solid #f1f5f9' : 'none' }}>
                                        <td style={{ padding: '16px 0', color: '#0f172a', fontWeight: '500' }}>{row.action}</td>
                                        <td style={{ padding: '16px 0', color: '#64748b', textAlign: 'right' }}>{row.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardTitle} style={{ marginBottom: '20px' }}>
                            <span>Quick Actions</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button className={styles.outlineBtn} style={{ justifyContent: 'center', width: '100%' }}>Add New Doctor</button>
                            <button className={styles.outlineBtn} style={{ justifyContent: 'center', width: '100%' }}>Generate Report</button>
                            <button className={styles.outlineBtn} style={{ justifyContent: 'center', width: '100%' }}>Manage Shift</button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
