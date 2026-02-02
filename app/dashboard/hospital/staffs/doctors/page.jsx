"use client";
import Topbar from "../../components/Topbar";
import styles from "../../HospitalDashboard.module.css";
import { motion } from "framer-motion";

const doctors = [
    { id: 1, name: "Dr. Sarah Smith", specialty: "Cardiology", patients: 120, status: "Active", shift: "Day" },
    { id: 2, name: "Dr. James Wilson", specialty: "Neurology", patients: 85, status: "On Leave", shift: "Night" },
    { id: 3, name: "Dr. Emily Chen", specialty: "Pediatrics", patients: 200, status: "Active", shift: "Day" },
    { id: 4, name: "Dr. Michael Brown", specialty: "Orthopedics", patients: 95, status: "Active", shift: "Day" },
    { id: 5, name: "Dr. Lisa Taylor", specialty: "Dermatology", patients: 150, status: "Active", shift: "Night" },
];

export default function DoctorsPage() {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={styles.container}
            style={{ flexDirection: 'column', background: 'transparent', padding: 0 }}
        >
            <Topbar title="Doctors Management" />

            <div style={{ padding: '24px' }}>
                <div className={styles.card}>
                    <div className={styles.cardTitle}>
                        <span style={{ fontSize: '18px', fontWeight: '700' }}>Doctors Directory</span>
                        <button className={styles.primaryBtn}>+ Add New Doctor</button>
                    </div>

                    <div className={styles.activityTableContainer} style={{ marginTop: '20px' }}>
                        <table className={styles.activityTable}>
                            <thead>
                                <tr className={styles.activityHeader}>
                                    <th>NAME</th>
                                    <th>SPECIALTY</th>
                                    <th>PATIENTS</th>
                                    <th>SHIFT</th>
                                    <th>STATUS</th>
                                    <th style={{ textAlign: 'right' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {doctors.map(doc => (
                                    <tr key={doc.id} className={styles.activityRow}>
                                        <td style={{ fontWeight: '700' }}>{doc.name}</td>
                                        <td style={{ color: '#64748b' }}>{doc.specialty}</td>
                                        <td>{doc.patients}</td>
                                        <td>{doc.shift}</td>
                                        <td>
                                            <span className={doc.status === 'Active' ? styles.statusCompleted : styles.statusReview}>
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button style={{ background: 'none', border: 'none', color: '#359aff', cursor: 'pointer', fontWeight: '700' }}>Manage</button>
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
