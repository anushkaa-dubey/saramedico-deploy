"use client";

import Image from "next/image";
import styles from "../Settings.module.css";
import notification from "@/public/icons/notification.svg";
import { motion } from "framer-motion";

export default function TeamSettings() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className={styles.topbar}>
                <input className={styles.search} placeholder="Search settings..." />
                <div className={styles.topActions}>
                    <button className={styles.iconBtn}><Image src={notification.src} alt="Notification" width="18" height="18" /></button>
                    <div className={styles.profile}>
                        <div className={styles.avatar}></div>
                        <div>
                            <strong>Dr. Sarah Smith</strong>
                            <p>Cardiology</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.header}>
                <h1 className={styles.title}>Team Members</h1>
                <p className={styles.description}>Manage your team access and permissions.</p>
            </div>

            <div className={styles.content}>
                <div className={styles.profileCard}>
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        <h3>Team Management</h3>
                        <p>You have 3 active team members.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
