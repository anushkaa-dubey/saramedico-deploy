"use client";

import { useState } from "react";
import Topbar from "../components/Topbar";
import styles from "./Team.module.css";
import { motion } from "framer-motion";

export default function TeamPage() {
    const [selectedRole, setSelectedRole] = useState('member');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Topbar />

            <div className={styles.titleSection}>
                <h1 className={styles.title}>Invite Team Members</h1>
                <p className={styles.subtitle}>Grant access yo your clinic's workspace securely</p>
            </div>

            <div className={styles.card}>
                <div className={styles.formGrid}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>FULL NAME</label>
                        <input type="text" placeholder="Your name" className={styles.input} />
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>EMAIL ADDRESS</label>
                        <input type="email" placeholder="drhospital@gmail.com" className={styles.input} />
                    </div>
                </div>

                <div className={styles.roleSection}>
                    <h3 className={styles.roleTitle}>Select Role</h3>
                    <div className={styles.roleCards}>
                        <div
                            className={`${styles.roleCard} ${selectedRole === 'admin' ? styles.roleCardActive : ''}`}
                            onClick={() => setSelectedRole('admin')}
                        >
                            <div className={styles.roleHeader}>
                                <div className={`${styles.roleIconBox} ${styles.adminIcon}`}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                </div>
                                <div>
                                    <span className={styles.roleName}>Administrator</span>
                                    <span className={styles.roleDesc}>Full Platform Access</span>
                                </div>
                            </div>
                            <div className={styles.featureList}>
                                <div className={styles.feature}>✓ Manage team & billing</div>
                                <div className={styles.feature}>✓ Full patient record access</div>
                                <div className={styles.feature}>✓ Configure AI settings</div>
                            </div>
                        </div>

                        <div
                            className={`${styles.roleCard} ${selectedRole === 'member' ? styles.roleCardActive : ''}`}
                            onClick={() => setSelectedRole('member')}
                        >
                            <div className={styles.roleHeader}>
                                <div className={`${styles.roleIconBox} ${styles.memberIcon}`}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                </div>
                                <div>
                                    <span className={styles.roleName}>Member</span>
                                    <span className={styles.roleDesc}>Clinician & Staff</span>
                                </div>
                            </div>
                            <div className={styles.featureList}>
                                <div className={styles.feature}>✓ View assigned patients</div>
                                <div className={styles.feature}>✓ Use AI diagnostic tools</div>
                                <div className={`${styles.feature} ${styles.featureDisabled}`}>✕ No billing access</div>
                            </div>
                        </div>

                        <div
                            className={`${styles.roleCard} ${selectedRole === 'patient' ? styles.roleCardActive : ''}`}
                            onClick={() => setSelectedRole('patient')}
                        >
                            <div className={styles.roleHeader}>
                                <div className={`${styles.roleIconBox} ${styles.patientIcon}`}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                </div>
                                <div>
                                    <span className={styles.roleName}>Patient</span>
                                </div>
                            </div>
                            <div className={styles.featureList}>
                                <div className={styles.feature}>✓ Check-in appointments</div>
                                <div className={styles.feature}>✓ Access Records</div>
                                <div className={`${styles.feature} ${styles.featureDisabled}`}>✕ No billing access</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.securityNotice}>
                    <div className={styles.noticeIcon}>i</div>
                    <div className={styles.noticeContent}>
                        <h4>Security Notice</h4>
                        <p>The user will receive an email to join the Team. The invitation link expired in 48hours. They will be required to set up Two-Factor Authentication (2FA) upon their first login.</p>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.cancelBtn}>Cancel</button>
                    <button className={styles.saveBtn}>Save Invite</button>
                </div>
            </div>
        </motion.div>
    );
}
