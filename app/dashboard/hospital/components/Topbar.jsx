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

    const initials = user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "HA";

    return (
        <header className={styles.topbar}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search patient, provider, or session ID..."
                            className={styles.search}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', maxWidth: '300px', fontSize: '13px' }}
                        />
                        <svg style={{ position: 'absolute', right: '12px', top: '48%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                </div>

                <div className={styles.topActions}>
                    <div className={styles.profile}>
                        <div className={styles.profileInfo}>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{user?.full_name || "Hospital Admin"}</span>
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
