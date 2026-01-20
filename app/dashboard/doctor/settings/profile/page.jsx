"use client";

import Image from "next/image";
import styles from "../Settings.module.css";
import lock from "@/public/icons/lock.svg";
import notification from "@/public/icons/notification.svg";
import mfa from "@/public/icons/MFA.svg";
import { motion } from "framer-motion";

export default function ProfileSettings() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Topbar */}
            <div className={styles.topbar}>
                <input
                    className={styles.search}
                    placeholder="Search settings, reports, notes..."
                />
                <div className={styles.topActions}>
                    <button className={styles.iconBtn}><Image src={notification.src} alt="Notification" width="18" height="18" /> </button>
                    <div className={styles.profile}>
                        <div className={styles.avatar}></div>
                        <div>
                            <strong>Dr. Sarah Smith</strong>
                            <p>Cardiology</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>My Profile</h1>
                <p className={styles.description}>
                    Manage your personal information and account details.
                </p>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {/* Profile Card */}
                <div className={styles.profileCard}>
                    <h2 className={styles.profileCardTitle}>My Profile</h2>
                    <div className={styles.profileCardContent}>
                        <div className={styles.profileAvatar}></div>
                        <div className={styles.profileInfo}>
                            <h3>Dr. Sarah Smith</h3>
                            <p>MD, CARDIOLOGY</p>
                        </div>
                    </div>

                    <div className={styles.formGrid}>
                        <div className={styles.formField}>
                            <label className={styles.label}>FULL NAME</label>
                            <input className={styles.input} placeholder="Your name" defaultValue="Dr. Sarah Smith" />
                        </div>
                        <div className={styles.formField}>
                            <label className={styles.label}>EMAIL ADDRESS</label>
                            <input className={styles.input} placeholder="drhospital@gmail.com" defaultValue="drhospital@gmail.com" />
                        </div>
                        <div className={styles.formField}>
                            <label className={styles.label}>CREDENTIAL</label>
                            <input className={styles.input} placeholder="MD, MBBS" defaultValue="MD, MBBS" />
                        </div>
                        <div className={styles.formField}>
                            <label className={styles.label}>SPECIALITY</label>
                            <input className={styles.input} placeholder="Cardiology" defaultValue="Cardiology" />
                        </div>
                    </div>

                    <div className={styles.buttonGroup}>
                        <button className={styles.cancelBtn}>Cancel</button>
                        <button className={styles.saveBtn}>Save Changes</button>
                    </div>
                </div>

                {/* Bottom Cards */}
                <div className={styles.cardsGrid}>
                    <div className={styles.card}>
                        <div className={styles.cardTitleRow}>
                            <span className={styles.cardIcon}><Image src={lock.src} alt="Lock" width="18" height="18" /></span>
                            <h3>Password</h3>
                        </div>
                        <p>Last changed 3 months ago. We recommend changing every 90 days.</p>
                        <button className={styles.cardButton}>Change Password</button>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardTitleRow}>
                            <span className={styles.cardIcon}><Image src={mfa.src} alt="MFA" width="18" height="18" /></span>
                            <h3>MFA Setup</h3>
                            <span className={styles.badge}>Enabled</span>
                        </div>
                        <p>
                            Multi-factor authentication is currently active via authenticator
                            App.
                        </p>
                        <button className={styles.cardButton}>Manage</button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
