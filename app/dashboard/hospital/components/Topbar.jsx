"use client";
import styles from "../HospitalDashboard.module.css";
import notificationIcon from "@/public/icons/notification.svg";
import personIcon from "@/public/icons/person.svg";

export default function Topbar({ title }) {
    return (
        <div className={styles.topbar}>
            {/* Use a simple header or search */}
            <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#0f172a' }}>{title}</h2>
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
                    <div className={styles.avatar} style={{ background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={personIcon.src} alt="Profile" width="20" height="20" />
                    </div>
                </div>
            </div>
        </div>
    );
}
