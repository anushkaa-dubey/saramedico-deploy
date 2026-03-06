"use client";
import { useState, useEffect } from "react";
import { User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./Topbar.module.css";
import { fetchAdminSettings } from "@/services/admin";
import NotificationBell from "@/app/dashboard/components/NotificationBell";

export default function AdminTopbar() {
    const router = useRouter();
    const [adminUser, setAdminUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const settings = await fetchAdminSettings();
                // fetchAdminSettings returns { profile: { name, email, avatar_url }, organization: { name } }
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
    }, []);

    const adminInitial = adminUser?.full_name ? adminUser.full_name.charAt(0).toUpperCase() : "A";

    return (
        <header className={styles.topbar}>
            <div className={styles.topActions} style={{ display: "flex", alignItems: "center", gap: "16px", marginLeft: "auto" }}>
                <NotificationBell />

                <Link
                    href="/dashboard/admin/profile"
                    className={styles.profile}
                    style={{ textDecoration: "none" }}
                >
                    <div className={styles.profileInfo}>
                        <span className={styles.adminName}>
                            {loading ? "..." : (adminUser?.full_name || "Admin")}
                        </span>
                        <small className={styles.role}>Administrator</small>
                    </div>

                    <div className={styles.avatar}>
                        {adminUser?.photo_url ? (
                            <img
                                src={adminUser.photo_url}
                                alt="Profile"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: "50%",
                                    objectFit: "cover"
                                }}
                            />
                        ) : (
                            adminInitial
                        )}
                    </div>
                </Link>
            </div>
        </header>
    );
}