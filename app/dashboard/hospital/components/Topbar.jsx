"use client";
import styles from "../HospitalDashboard.module.css";
import { useState, useEffect } from "react";
import { fetchProfile } from "@/services/doctor";

export default function Topbar({ title, onSearch }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [user, setUser] = useState(null);

    useEffect(() => {
        const getProfile = async () => {
            try {
                const data = await fetchProfile();
                setUser(data);
            } catch (err) {
                console.error("Failed to fetch profile in Topbar", err);
            }
        };
        getProfile();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (onSearch) onSearch(searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, onSearch]);

    const displayName = user?.name || user?.full_name || "";
    const initials = displayName ? displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "HA";

    return (
        <header className={styles.topbar}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        {/* Global search removed per requirements */}
                    </div>
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
