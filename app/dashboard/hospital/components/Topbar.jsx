"use client";
import styles from "../HospitalDashboard.module.css";
import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchHospitalSettings } from "@/services/hospital";
import NotificationBell from "@/app/dashboard/components/NotificationBell";

export default function Topbar({ title }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getProfile = async () => {
        try {
            const data = await fetchHospitalSettings();
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

    const initials = user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "HA";

    return (
        <header className={styles.topbar}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                   <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{title || "Overview"}</h2>
                </div>

                <div className={styles.topActions} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <NotificationBell />

                    <Link href="/dashboard/hospital/settings" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className={styles.profileInfo} style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'block' }}>
                                {loading ? "..." : (user?.full_name || "Hospital Admin")}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>{user?.role || "Administrator"}</span>
                        </div>
                        
                        <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '50%', 
                            background: '#f1f5f9', 
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid #fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '14px', fontWeight: '800', color: '#3b82f6' }}>{initials}</span>
                            )}
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}
