"use client";
import styles from "../HospitalDashboard.module.css";
import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchHospitalSettingsData } from "@/services/hospital";
import NotificationBell from "@/app/dashboard/components/NotificationBell";

export default function Topbar({ title }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getProfile = async () => {
        try {
            const data = await fetchHospitalSettingsData();
            if (data?.profile) {
                setUser({
                    full_name: data.profile.name || data.profile.full_name || "Hospital Admin",
                    avatar_url: data.profile.avatar_url,
                    role: "Hospital Administrator",
                });
            }
        } catch (err) {
            console.error("Failed to fetch profile in Topbar", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getProfile();
        window.addEventListener("profile-updated", getProfile);
        return () => window.removeEventListener("profile-updated", getProfile);
    }, []);

    const displayName = user?.name || user?.full_name || "";
    const initials = displayName ? displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "HA";

    return (
        <header className={styles.topbar}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                   <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{title || "Overview"}</h2>
                </div>

                <div className={styles.topActions}>
                    <div className={styles.profile}>
                        <div className={styles.profileInfo}>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{user?.name || user?.full_name || "Hospital Admin"}</span>
                            {user?.role !== user?.full_name && (
                                <span style={{ fontSize: '11px', color: '#64748b' }}>{user?.role || user?.specialty || "Superuser"}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
