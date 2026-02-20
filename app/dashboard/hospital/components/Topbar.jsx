"use client";
import styles from "../HospitalDashboard.module.css";
import notificationIcon from "@/public/icons/notification.svg";
import personIcon from "@/public/icons/person.svg";
import { useState, useEffect } from "react";

export default function Topbar({ title, onSearch }) {
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (onSearch) onSearch(searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, onSearch]);

    return (
        <div className={styles.topbar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#0f172a' }}>{title}</h2>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search patient, provider, or session ID..."
                        className={styles.search}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '300px', fontSize: '13px' }}
                    />
                    <svg style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
            </div>

            <div className={styles.topActions}>
                <button className={styles.notificationBtn}>
                    <img src={notificationIcon.src} alt="Notifications" width="20" height="20" />
                    <span className={styles.notificationBadge}></span>
                </button>
                <div className={styles.profile}>
                    <div className={styles.profileInfo}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>Hospital Admin</span>
                        <small style={{ color: '#64748b' }}>General Hospital</small>
                    </div>
                    <div className={styles.avatar} style={{ background: '#359aff15', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: '36px', height: '36px' }}>
                        <img src={personIcon.src} alt="Profile" width="20" height="20" />
                    </div>
                </div>
            </div>
        </div>
    );
}
