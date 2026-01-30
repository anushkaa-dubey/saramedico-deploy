"use client";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion } from "framer-motion";

const appointments = [
    { id: 1, patient: "John Doe", doctor: "Dr. Sarah Smith", date: "Oct 24, 2025", time: "10:00 AM", type: "Check-up", status: "Confirmed" },
    { id: 2, patient: "Jane Roe", doctor: "Dr. Michael Brown", date: "Oct 24, 2025", time: "11:30 AM", type: "Consultation", status: "Pending" },
    { id: 3, patient: "Alice Bob", doctor: "Dr. Emily Chen", date: "Oct 25, 2025", time: "09:15 AM", type: "Vaccination", status: "Confirmed" },
];

export default function AppointmentsPage() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.container}
            style={{ flexDirection: 'column', background: 'transparent', padding: 0 }}
        >
            <Topbar title="Hospital Appointments" />

            <div style={{ padding: '24px' }}>
                <div className={styles.card}>
                    <div className={styles.cardTitle}>
                        <span>Scheduled Appointments</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className={styles.outlineBtn}>Filter</button>
                            <button className={styles.outlineBtn}>Export</button>
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                                <th style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>PATIENT</th>
                                <th style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>DOCTOR</th>
                                <th style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>DATE/TIME</th>
                                <th style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>TYPE</th>
                                <th style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map(apt => (
                                <tr key={apt.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 12px', fontWeight: '600', color: '#0f172a' }}>{apt.patient}</td>
                                    <td style={{ padding: '16px 12px', color: '#64748b' }}>{apt.doctor}</td>
                                    <td style={{ padding: '16px 12px', color: '#64748b' }}>{apt.date} at {apt.time}</td>
                                    <td style={{ padding: '16px 12px', color: '#359aff', fontWeight: '500' }}>{apt.type}</td>
                                    <td style={{ padding: '16px 12px' }}>
                                        <span style={{
                                            background: apt.status === 'Confirmed' ? '#ecfdf5' : '#fef3c7',
                                            color: apt.status === 'Confirmed' ? '#16a34a' : '#d97706',
                                            padding: '4px 10px',
                                            borderRadius: '99px',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}>
                                            {apt.status}
                                        </span>
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
