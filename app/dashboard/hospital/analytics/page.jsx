"use client";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.container}
            style={{ flexDirection: 'column', background: 'transparent', padding: 0 }}
        >
            <Topbar title="Hospital Analytics" />

            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                <div className={styles.card}>
                    <h3 style={{ fontSize: '14px', color: '#64748b' }}>Total Patients</h3>
                    <p style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: '8px 0' }}>1,280</p>
                    <span style={{ color: '#16a34a', fontSize: '12px', fontWeight: '600' }}>+12% this month</span>
                </div>
                <div className={styles.card}>
                    <h3 style={{ fontSize: '14px', color: '#64748b' }}>Appointments</h3>
                    <p style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: '8px 0' }}>85</p>
                    <span style={{ color: '#16a34a', fontSize: '12px', fontWeight: '600' }}>+5% today</span>
                </div>
                <div className={styles.card}>
                    <h3 style={{ fontSize: '14px', color: '#64748b' }}>Revenue</h3>
                    <p style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: '8px 0' }}>$124,500</p>
                    <span style={{ color: '#16a34a', fontSize: '12px', fontWeight: '600' }}>+8% this month</span>
                </div>

                <div className={styles.card} style={{ gridColumn: '1 / -1', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '2px dashed #e2e8f0' }}>
                    <p style={{ color: '#94a3b8', fontWeight: '600' }}>Analytics Chart Placeholder (Dummy)</p>
                </div>
            </div>
        </motion.div>
    );
}
