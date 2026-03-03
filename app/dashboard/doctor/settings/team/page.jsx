"use client";
import Image from "next/image";
import styles from "../Settings.module.css";
import notification from "@/public/icons/notification.svg";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { fetchProfile } from "@/services/doctor";
import { fetchTeamMembers } from "@/services/doctor";

export default function TeamSettings() {
    const [user, setUser] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [profile, members] = await Promise.all([
                    fetchProfile(),
                    fetchTeamMembers(),
                ]);
                setUser(profile);
                setTeamMembers(members || []);
            } catch (err) {
                const stored = localStorage.getItem("user");
                if (stored) { try { setUser(JSON.parse(stored)); } catch (_) { } }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const displayName = user?.full_name || user?.first_name
        ? (user.full_name || `Dr. ${user.first_name} ${user.last_name || ""}`)
        : loading ? "Loading..." : "Doctor";
    const displayRole = user?.specialty || user?.role || "Doctor";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className={styles.topbar}>
                <input className={styles.search} placeholder="Search settings..." />
                <div className={styles.topActions}>
                    <button className={styles.iconBtn}>
                        <Image src={notification.src} alt="Notification" width="18" height="18" />
                    </button>
                    <div className={styles.profile}>
                        <div className={styles.avatar}></div>
                        <div>
                            <strong>{displayName}</strong>
                            <p>{displayRole}</p>
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
                    {loading ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>Loading team info...</div>
                    ) : (
                        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                            <h3>Team Management</h3>
                            <p>
                                {teamMembers.length > 0
                                    ? `You have ${teamMembers.length} active team member${teamMembers.length !== 1 ? "s" : ""}.`
                                    : "Backend not connected — team members unavailable."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
