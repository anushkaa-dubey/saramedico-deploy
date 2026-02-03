"use client";
import styles from "../AdminDashboard.module.css";
import scheduleIcon from "@/public/icons/schedule.svg";
import personIcon from "@/public/icons/person.svg";
import settingsIcon from "@/public/icons/settings.svg";
import { motion } from "framer-motion";

export default function ClinicManagement() {
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    return (
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div className={styles.titleRow} variants={itemVariants}>
                <div>
                    <h2 className={styles.heading}>Clinic Management</h2>
                    <p className={styles.subtext}>Configure clinic profile, staff availability, and medical services</p>
                </div>
            </motion.div>

            <motion.div className={styles.managementSection} variants={itemVariants}>
                <div className={styles.contextPanel} style={{ height: 'auto', opacity: 1, background: 'transparent', border: 'none', boxShadow: 'none' }}>
                    <div className={styles.clinicGrid}>
                        <div className={styles.clinicCard}>
                            <div className={styles.clinicCardHead}>
                                <img src={scheduleIcon.src} alt="" width="20" />
                                <h4>Availability</h4>
                            </div>
                            <p>Set operational hours, emergency slots, and holiday schedules.</p>
                            <div style={{ marginTop: 'auto' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                                    Current: <strong>09:00 AM - 06:00 PM</strong>
                                </div>
                                <button className={styles.inlineBtn}>Update Schedule</button>
                            </div>
                        </div>
                        <div className={styles.clinicCard}>
                            <div className={styles.clinicCardHead}>
                                <img src={personIcon.src} alt="" width="20" />
                                <h4>Doctors</h4>
                            </div>
                            <p>Onboard new medical staff, manage permissions and specializations.</p>
                            <div style={{ marginTop: 'auto' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                                    Staff Count: <strong>12 Active</strong>
                                </div>
                                <button className={styles.inlineBtn}>Add/Edit Staff</button>
                            </div>
                        </div>
                        <div className={styles.clinicCard}>
                            <div className={styles.clinicCardHead}>
                                <img src={settingsIcon.src} alt="" width="20" />
                                <h4>Services</h4>
                            </div>
                            <p>Define treatment packages, lab offerings, and pricing tiers.</p>
                            <div style={{ marginTop: 'auto' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                                    Active Services: <strong>24 Items</strong>
                                </div>
                                <button className={styles.inlineBtn}>Configure Services</button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div className={styles.card} style={{ marginTop: '24px' }} variants={itemVariants}>
                <h3 style={{ marginBottom: '16px', fontSize: '15px' }}>Clinic Profile</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    <div>
                        <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Clinic Name</label>
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>Sara Medical Center</div>
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Location</label>
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>Downtown, Medical District</div>
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Emergency Contact</label>
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>+1 (555) 900-1234</div>
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>License Status</label>
                        <div style={{ fontSize: '12px', color: '#16a34a', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>Active</div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
