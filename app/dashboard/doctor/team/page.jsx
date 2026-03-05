"use client";

import { useState } from "react";
import Topbar from "../components/Topbar";
import styles from "./Team.module.css";
import { motion } from "framer-motion";
import { Check, X, Shield, Users, User } from "lucide-react";
import Link from "next/link";

export default function TeamPage() {
    const [selectedRole, setSelectedRole] = useState('member');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ padding: '0 24px 24px 24px' }}
        >
            <Topbar />

            <div className={styles.titleSection}>
                <h1 className={styles.title}>Invite Team Members</h1>
                <p className={styles.subtitle}>Grant access to your clinic's workspace securely</p>
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
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <span className={styles.roleName}>Administrator</span>
                                    <span className={styles.roleDesc}>Full Platform Access</span>
                                </div>
                            </div>
                            <div className={styles.featureList}>
                                <div className={styles.feature}><Check size={14} color="#16a34a" /> Manage team & billing</div>
                                <div className={styles.feature}><Check size={14} color="#16a34a" /> Full patient record access</div>
                                <div className={styles.feature}><Check size={14} color="#16a34a" /> Configure AI settings</div>
                            </div>
                        </div>

                        <div
                            className={`${styles.roleCard} ${selectedRole === 'member' ? styles.roleCardActive : ''}`}
                            onClick={() => setSelectedRole('member')}
                        >
                            <div className={styles.roleHeader}>
                                <div className={`${styles.roleIconBox} ${styles.memberIcon}`}>
                                    <Users size={20} />
                                </div>
                                <div>
                                    <span className={styles.roleName}>Member</span>
                                    <span className={styles.roleDesc}>Clinician & Staff</span>
                                </div>
                            </div>
                            <div className={styles.featureList}>
                                <div className={styles.feature}><Check size={14} color="#16a34a" /> View assigned patients</div>
                                <div className={styles.feature}><Check size={14} color="#16a34a" /> Use AI diagnostic tools</div>
                                <div className={`${styles.feature} ${styles.featureDisabled}`}><X size={14} color="#dc2626" /> No billing access</div>
                            </div>
                        </div>

                        <div
                            className={`${styles.roleCard} ${selectedRole === 'patient' ? styles.roleCardActive : ''}`}
                            onClick={() => setSelectedRole('patient')}
                        >
                            <div className={styles.roleHeader}>
                                <div className={`${styles.roleIconBox} ${styles.patientIcon}`}>
                                    <User size={20} />
                                </div>
                                <div>
                                    <span className={styles.roleName}>Patient</span>
                                </div>
                            </div>
                            <div className={styles.featureList}>
                                <div className={styles.feature}><Check size={14} color="#16a34a" /> Check-in appointments</div>
                                <div className={styles.feature}><Check size={14} color="#16a34a" /> Access Records</div>
                                <div className={`${styles.feature} ${styles.featureDisabled}`}><X size={14} color="#dc2626" /> No billing access</div>
                            </div>
                        </div>
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
