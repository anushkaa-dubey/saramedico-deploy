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
                    {/* <button className={styles.notificationBtn}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        <span className={styles.notificationBadge}></span>
                    </button> */}

                    <div className={styles.profile}>
                        <div className={styles.profileInfo}>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{user?.full_name || "Hospital Admin"}</span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>{user?.role || user?.specialty || "Superuser"}</span>
                        </div>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#359aff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px' }}>{initials}</div>
                    </div>
                </div>
            </div>
        </header>
    );
}
