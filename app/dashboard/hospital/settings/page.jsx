"use client";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion } from "framer-motion";

export default function SettingsPage() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', background: 'transparent', padding: 0, minHeight: '100%' }}
        >
            <Topbar title="Invite Staff Member" />

            <div className={styles.contentWrapper}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Invite Staff Member</h1>
                    <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Onboard a new medical professional to your department network with secure credential.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px', alignItems: 'start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className={styles.card} style={{ padding: '32px', borderRadius: '16px', border: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                                <div style={{ color: '#3b82f6' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" /></svg>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>Staff Details</h3>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div className={styles.formGroup}>
                                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>FULL NAME</label>
                                    <div style={{ position: 'relative' }}>
                                        <svg style={{ position: 'absolute', left: '12px', top: '48%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                        <input type="text" placeholder="Von eumann" style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #f1f5f9', background: '#ffffff' }} />
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>EMAIL ADDRESS</label>
                                    <div style={{ position: 'relative' }}>
                                        <svg style={{ position: 'absolute', left: '12px', top: '48%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                        <input type="email" placeholder="Von.eumann@mail.com" style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #f1f5f9', background: '#ffffff' }} />
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>DEPARTMENT</label>
                                    <select style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9', background: '#ffffff', color: '#64748b' }}>
                                        <option>Cardiology Department</option>
                                        <option>General Medicine</option>
                                        <option>Dermatology</option>
                                        <option>Pediatrics</option>
                                        <option>Psychiatry</option>
                                        <option>Orthopedics</option>
                                        <option>Oncology</option>
                                        <option>Neurology</option>
                                        <option>Radiology</option>
                                        <option>Surgery</option>
                                        <option>Emergency</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>ROLES & PERMISSIONS</label>
                                    <select style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9', background: '#ffffff', color: '#64748b' }}>
                                        <option>Senior Physician</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginTop: '32px', padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ color: '#64748b', marginTop: '4px' }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '800', color: '#1e293b', marginBottom: '4px' }}>Security & HIPAA Policy</div>
                                        <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>Inviting this user will provide access to PHI(Protected Health Information). An encrpted invitation link will be sent to the email provided, valid for 48 hours.</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                                <button style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: 'transparent', color: '#1e293b', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                                <button className={styles.primaryBtn} style={{ padding: '12px 32px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                    Send Invite
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className={styles.card} style={{ padding: '24px', borderRadius: '16px', border: 'none' }}>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', marginBottom: '16px' }}>Statistics</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                </div>
                                <div>
                                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>72</div>
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>TOTAL STAFF MEMBERS</div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.card} style={{ padding: '24px', borderRadius: '16px', border: 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8' }}>Pending Invites</div>
                                <button style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>View All</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[1, 2].map(i => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Robert Yep</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>robert.yep@mail.com</div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '9px', fontWeight: '800', color: '#f59e0b', background: '#fffbeb', padding: '4px 8px', borderRadius: '4px', border: '1px solid #fef3c7' }}>PENDING</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
