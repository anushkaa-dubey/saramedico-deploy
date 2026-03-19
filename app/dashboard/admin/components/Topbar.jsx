"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Topbar.module.css";
import { fetchAdminSettings } from "@/services/admin";
import NotificationBell from "@/app/dashboard/components/NotificationBell";

export default function AdminTopbar() {
    const [adminUser, setAdminUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const settings = await fetchAdminSettings();
                if (settings?.profile) {
                    setAdminUser({
                        full_name: settings.profile.name || settings.profile.full_name,
                        email: settings.profile.email,
                        photo_url: settings.profile.avatar_url,
                        organization: settings.organization?.name,
                    });
                }
            } catch (err) {
                console.error("Failed to load admin profile in topbar:", err);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
        window.addEventListener("profile-updated", loadProfile);
        return () => window.removeEventListener("profile-updated", loadProfile);
    }, []);

    const adminInitial = adminUser?.full_name
        ? adminUser.full_name.charAt(0).toUpperCase()
        : "A";

    return (
        <header className={styles.topbar}>
            <div className={styles.topActions}>
                <NotificationBell />
                <Link href="/dashboard/admin/settings" className={styles.profile}>
                    <div className={styles.profileInfo}>
                        <span className={styles.adminName}>
                            {loading ? "..." : (adminUser?.full_name || "Admin")}
                        </span>
                        <small className={styles.role}>Administrator</small>
                    </div>
                    <div className={styles.avatar}>
                        {adminUser?.photo_url
                            ? <img src={adminUser.photo_url} alt="Profile" />
                            : adminInitial}
                    </div>
                </Link>
            </div>
        </header>
    );
}