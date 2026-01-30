"use client";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion } from "framer-motion";

const doctors = [
    { id: 1, name: "Dr. Sarah Smith", specialty: "Cardiology", patients: 120, status: "Active" },
    { id: 2, name: "Dr. James Wilson", specialty: "Neurology", patients: 85, status: "On Leave" },
    { id: 3, name: "Dr. Emily Chen", specialty: "Pediatrics", patients: 200, status: "Active" },
    { id: 4, name: "Dr. Michael Brown", specialty: "Orthopedics", patients: 95, status: "Active" },
    { id: 5, name: "Dr. Lisa Taylor", specialty: "Dermatology", patients: 150, status: "Active" },
];

export default function DoctorsPage() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.container}
            style={{ flexDirection: 'column', background: 'transparent', padding: 0 }}
        >
            <Topbar title="Doctors Directory" />

            <div style={{ padding: '24px' }}>
                <div className={styles.card}>
                    <div className={styles.cardTitle}>
                        <span>All Doctors</span>
                        <button className={styles.primaryBtn}>+ Add New Doctor</button>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                                <th style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>NAME</th>
                                <th style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>SPECIALTY</th>
                                <th style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>PATIENTS</th>
                                <th style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>STATUS</th>
                                <th style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.map(doc => (
                                <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 12px', fontWeight: '600', color: '#0f172a' }}>{doc.name}</td>
                                    <td style={{ padding: '16px 12px', color: '#64748b' }}>{doc.specialty}</td>
                                    <td style={{ padding: '16px 12px', color: '#64748b' }}>{doc.patients}</td>
                                    <td style={{ padding: '16px 12px' }}>
                                        <span style={{
                                            background: doc.status === 'Active' ? '#ecfdf5' : '#fff7ed',
                                            color: doc.status === 'Active' ? '#16a34a' : '#c2410c',
                                            padding: '4px 10px',
                                            borderRadius: '99px',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}>
                                            {doc.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 12px' }}>
                                        <button style={{ background: 'none', border: 'none', color: '#359aff', cursor: 'pointer', fontWeight: '600' }}>View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
