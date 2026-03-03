"use client";
import styles from "../AdminDashboard.module.css";
import scheduleIcon from "@/public/icons/schedule.svg";
import personIcon from "@/public/icons/person.svg";
import settingsIcon from "@/public/icons/settings.svg";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { fetchOrganization, fetchOrgMembers } from "@/services/admin";

export default function ClinicManagement() {
    const [org, setOrg] = useState(null);
    const [staffCount, setStaffCount] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [orgData, members] = await Promise.all([
                    fetchOrganization(),
                    fetchOrgMembers(),
                ]);
                setOrg(orgData);
                setStaffCount(members?.length ?? null);
            } catch (err) {
                console.error("ClinicManagement init error:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        }
    };

    const formatHours = (hours) => {
        if (!hours) return "Backend not connected";
        if (typeof hours === "string") return hours;
        return `${hours.open || "09:00 AM"} - ${hours.close || "06:00 PM"}`;
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
                <div className={styles.contextPanel} style={{ height: "auto", opacity: 1, background: "transparent", border: "none", boxShadow: "none" }}>
                    <div className={styles.clinicGrid}>
                        <div className={styles.clinicCard}>
                            <div className={styles.clinicCardHead}>
                                <img src={scheduleIcon.src} alt="" width="20" />
                                <h4>Availability</h4>
                            </div>
                            <p>Set operational hours, emergency slots, and holiday schedules.</p>
                            <div style={{ marginTop: "auto" }}>
                                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>
                                    Current: <strong>
                                        {loading ? "Loading..." : formatHours(org?.operating_hours || org?.hours)}
                                    </strong>
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
                            <div style={{ marginTop: "auto" }}>
                                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>
                                    Staff Count: <strong>
                                        {loading ? "Loading..." : staffCount !== null ? `${staffCount} Active` : "Backend not connected"}
                                    </strong>
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
                            <div style={{ marginTop: "auto" }}>
                                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>
                                    Active Services: <strong>
                                        {loading ? "Loading..." : org?.services_count !== undefined ? `${org.services_count} Items` : "Backend not connected"}
                                    </strong>
                                </div>
                                <button className={styles.inlineBtn}>Configure Services</button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div className={styles.card} style={{ marginTop: "24px" }} variants={itemVariants}>
                <h3 style={{ marginBottom: "16px", fontSize: "15px" }}>Clinic Profile</h3>
                {loading ? (
                    <div style={{ color: "#94a3b8", padding: "8px", fontSize: "14px" }}>Loading clinic profile...</div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
                        <div>
                            <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Clinic Name</label>
                            <div style={{ fontSize: "14px", fontWeight: "500" }}>
                                {org?.name || "Backend not connected"}
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Location</label>
                            <div style={{ fontSize: "14px", fontWeight: "500" }}>
                                {org?.address || org?.location || "Backend not connected"}
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Emergency Contact</label>
                            <div style={{ fontSize: "14px", fontWeight: "500" }}>
                                {org?.emergency_contact || org?.phone || "Backend not connected"}
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>License Status</label>
                            <div style={{
                                fontSize: "12px",
                                color: org?.license_status === "active" || org?.is_licensed ? "#16a34a" : "#94a3b8",
                                background: org?.license_status === "active" || org?.is_licensed ? "#ecfdf5" : "#f1f5f9",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                display: "inline-block"
                            }}>
                                {org?.license_status || (org?.is_licensed ? "Active" : org ? "Unknown" : "Backend not connected")}
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
