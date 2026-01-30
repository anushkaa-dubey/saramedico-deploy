"use client";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion } from "framer-motion";

const messages = [
    { id: 1, sender: "Dr. Sarah Smith", subject: "Patient Update: John Doe", time: "10:30 AM", unread: true },
    { id: 2, sender: "Admin Support", subject: "System Maintenance Scheduled", time: "Yesterday", unread: false },
    { id: 3, sender: "Dr. Emily Chen", subject: "Shift Change Request", time: "Oct 12", unread: false },
];

export default function MessagesPage() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.container}
            style={{ flexDirection: 'column', background: 'transparent', padding: 0 }}
        >
            <Topbar title="Messages" />

            <div style={{ padding: '24px' }}>
                <div className={styles.card}>
                    <div className={styles.cardTitle}>
                        <span>Inbox</span>
                        <button className={styles.outlineBtn}>Compose</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                        {messages.map(msg => (
                            <div key={msg.id} style={{
                                padding: '16px',
                                background: msg.unread ? '#f8fafc' : 'white',
                                border: '1px solid #eef2f7',
                                borderRadius: '12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                cursor: 'pointer'
                            }}>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', background: '#bfdbfe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a8a', fontWeight: 'bold' }}>
                                        {msg.sender[0]}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{msg.sender}</div>
                                        <div style={{ fontSize: '14px', color: '#64748b' }}>{msg.subject}</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>
                                    {msg.time}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
