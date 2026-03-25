"use client";
import Image from "next/image";
import styles from "../Settings.module.css";
import notification from "@/public/icons/notification.svg";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { fetchProfile } from "@/services/doctor";
import { getUser as getStoredUser } from "@/services/tokenService";

export default function BillingSettings() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const profile = await fetchProfile();
                setUser(profile);
            } catch (err) {
                const stored = getStoredUser();
                if (stored) { setUser(stored); }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const displayName = user?.full_name || (user?.first_name ? `Dr. ${user.first_name} ${user.last_name || ""}` : loading ? "Loading..." : "Doctor");
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
                <h1 className={styles.title}>Billings &amp; Plans</h1>
                <p className={styles.description}>Manage your subscription and billing details.</p>
            </div>

            <div className={styles.content}>
                <div className={styles.profileCard}>
                    <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                        <h3>Current Plan</h3>
                        <p>
                            {user?.plan || user?.subscription_plan
                                ? `Plan: ${user.plan || user.subscription_plan}`
                                : "Backend not connected — billing info unavailable."}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
