"use client";
import { useState } from "react";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion } from "framer-motion";
import { inviteStaff } from "@/services/hospital";

export default function SettingsPage() {
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        department: "Cardiology Department",
        role: "doctor",
        password: "TempPassword123!" // Temporary password for invitation
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleInvite = async () => {
        if (!formData.full_name || !formData.email) {
            setMessage({ type: "error", text: "Please fill in all required fields." });
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            await inviteStaff({
                email: formData.email,
                password: formData.password,
                role: formData.role,
                full_name: formData.full_name
            });
            setMessage({ type: "success", text: `Invitation sent to ${formData.email} successfully!` });
            setFormData({ ...formData, full_name: "", email: "" });
        } catch (err) {
            setMessage({ type: "error", text: err.message || "Failed to send invitation. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', background: 'transparent', padding: 0, minHeight: '100%' }}
        >
            <Topbar title="Invite Staff Member" />

            <div className={styles.contentWrapper}>
                <div className={styles.pageHeaderRow} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Invite Staff Member</h1>
                        <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Onboard a new medical professional to your department network with secure credential.</p>
                    </div>
                </div>

                {message.text && (
                    <div style={{
                        padding: '16px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                        color: message.type === 'success' ? '#166534' : '#991b1b',
                        border: `1px solid ${message.type === 'success' ? '#dcfce7' : '#fee2e2'}`,
                        fontSize: '14px',
                        fontWeight: '600'
                    }}>
                        {message.text}
                    </div>
                )}

                <div className={styles.dashboardGrid}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className={styles.card} style={{ padding: '32px', borderRadius: '16px', border: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                                <div style={{ color: '#3b82f6' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" /></svg>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>Staff Details</h3>
                            </div>

                            <div className={styles.overviewSection} style={{ gap: '24px' }}>
                                <div className={styles.formGroup}>
                                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>FULL NAME</label>
                                    <div style={{ position: 'relative' }}>
                                        <svg style={{ position: 'absolute', left: '12px', top: '48%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #f1f5f9', background: '#ffffff' }}
                                        />
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>EMAIL ADDRESS</label>
                                    <div style={{ position: 'relative' }}>
                                        <svg style={{ position: 'absolute', left: '12px', top: '48%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                        <input
                                            type="email"
                                            placeholder="john.doe@hospital.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #f1f5f9', background: '#ffffff' }}
                                        />
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>DEPARTMENT</label>
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9', background: '#ffffff', color: '#64748b' }}
                                    >
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
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9', background: '#ffffff', color: '#64748b' }}
                                    >
                                        <option value="doctor">Medical Doctor</option>
                                        <option value="patient">Staff Member</option>
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
                                        <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>Inviting this user will provide access to PHI(Protected Health Information). An encrypted invitation link will be sent to the email provided, valid for 48 hours.</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                                <button style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: 'transparent', color: '#1e293b', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                                <button
                                    onClick={handleInvite}
                                    disabled={loading}
                                    className={styles.primaryBtn}
                                    style={{ padding: '12px 32px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                    {loading ? "Sending..." : "Send Invite"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
