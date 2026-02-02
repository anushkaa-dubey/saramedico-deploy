"use client";
import Topbar from "../../components/Topbar";
import styles from "../../HospitalDashboard.module.css";
import { motion } from "framer-motion";

const nurses = [
    { id: "NS-01", name: "Jessica Alba", ward: "ICU", experience: "8 Years", status: "Active", shift: "Night" },
    { id: "NS-02", name: "Maria Garcia", ward: "Pediatrics", experience: "5 Years", status: "Active", shift: "Day" },
    { id: "NS-03", name: "Susan Boyle", ward: "General Ward", experience: "12 Years", status: "On Leave", shift: "Day" },
    { id: "NS-04", name: "Linda Hamilton", ward: "Surgery", experience: "10 Years", status: "Active", shift: "Night" },
    { id: "NS-05", name: "Emma Watson", ward: "Emergency", experience: "3 Years", status: "Active", shift: "Day" },
];

export default function NursesPage() {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={styles.container}
            style={{ flexDirection: 'column', background: 'transparent', padding: 0 }}
        >
            <Topbar title="Nurses Management" />

            <div style={{ padding: '24px' }}>
                <div className={styles.card}>
                    <div className={styles.cardTitle}>
                        <span style={{ fontSize: '18px', fontWeight: '700' }}>Nurses Directory</span>
                        <button className={styles.primaryBtn}>+ Onboard Nurse</button>
                    </div>

                    <div className={styles.activityTableContainer} style={{ marginTop: '20px' }}>
                        <table className={styles.activityTable}>
                            <thead>
                                <tr className={styles.activityHeader}>
                                    <th>NAME</th>
                                    <th>WARD</th>
                                    <th>EXP.</th>
                                    <th>SHIFT</th>
                                    <th>STATUS</th>
                                    <th style={{ textAlign: 'right' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {nurses.map(nurse => (
                                    <tr key={nurse.id} className={styles.activityRow}>
                                        <td style={{ fontWeight: '700' }}>{nurse.name}</td>
                                        <td style={{ color: '#64748b' }}>{nurse.ward}</td>
                                        <td>{nurse.experience}</td>
                                        <td>{nurse.shift}</td>
                                        <td>
                                            <span className={nurse.status === 'Active' ? styles.statusCompleted : styles.statusReview}>
                                                {nurse.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button style={{ background: 'none', border: 'none', color: '#359aff', cursor: 'pointer', fontWeight: '700' }}>Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
