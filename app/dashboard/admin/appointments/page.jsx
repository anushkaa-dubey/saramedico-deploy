"use client";
import styles from "../AdminDashboard.module.css";
import messagesIcon from "@/public/icons/messages.svg";
import { motion } from "framer-motion";

export default function AppointmentsManagement() {
    const bookings = [
        { time: "09:00 AM", patient: "John Doe", type: "Checkup", status: "Pending" },
        { time: "10:30 AM", patient: "Jane Smith", type: "Follow-up", status: "Confirmed" },
        { time: "02:00 PM", patient: "Robert Brown", type: "Consultation", status: "Pending" },
        { time: "03:15 PM", patient: "Sarah Wilson", type: "Emergency", status: "Rescheduled" },
        { time: "04:30 PM", patient: "Michael Scott", type: "General", status: "Confirmed" },
    ];

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    return (
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div className={styles.titleRow} variants={itemVariants}>
                <div>
                    <h2 className={styles.heading}>Appointments Management</h2>
                    <p className={styles.subtext}>Monitor and manage clinic bookings, schedules, and patient notifications</p>
                </div>
            </motion.div>

            <motion.div className={styles.managementSection} variants={itemVariants}>
                <div className={styles.contextPanel} style={{ height: 'auto', opacity: 1 }}>
                    <div className={styles.panelContent}>
                        <div className={styles.bookingsTableWrapper}>
                            <table className={styles.bookingsTable}>
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Patient</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((b, i) => (
                                        <tr key={i}>
                                            <td>{b.time}</td>
                                            <td>{b.patient}</td>
                                            <td>{b.type}</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${styles[b.status.toLowerCase()]}`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className={styles.actionBtns}>
                                                <button className={styles.tableActionBtn}>Confirm</button>
                                                <button className={styles.tableActionBtnSecondary}>Reschedule</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className={styles.notifyBanner}>
                                <img src={messagesIcon.src} alt="" width="16" />
                                <span>Selected patients will be notified automatically via SMS/Email.</span>
                                <button className={styles.notifyAllBtn}>Notify All</button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Appointment Distribution "Chart" (Mock) */}
            <motion.div className={styles.card} style={{ marginTop: '24px' }} variants={itemVariants}>
                <h3 style={{ marginBottom: '16px', fontSize: '15px' }}>Appointment Distribution</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '100px', padding: '0 20px' }}>
                    {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                        <div key={i} style={{ flex: 1, height: `${h}%`, background: 'linear-gradient(to top, #359AFF, #9CCDFF)', borderRadius: '4px 4px 0 0' }} />
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', color: '#64748b' }}>
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
            </motion.div>
        </motion.div>
    );
}
