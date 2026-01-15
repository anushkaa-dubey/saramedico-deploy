"use client";

import styles from "../DoctorDashboard.module.css";
import notificationIcon from "@/public/icons/notification.svg";
import profileIcon from "@/public/icons/profile.svg";

export default function Topbar() {
  return (
    <div className={styles.topbar}>
      <input
        className={styles.search}
        placeholder="Search patients, appointments, notes..."
      />

      <div className={styles.topActions}>
        <button className={styles.notificationBtn}>
          <img src={notificationIcon.src} alt="Notifications" width="20" height="20" />
          <span className={styles.notificationBadge}></span>
        </button>
        <div className={styles.profile}>
          <div className={styles.profileInfo}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
              Dr. Sarah Smith
            </span>
            <small style={{ color: "#94a3b8", fontSize: "12px" }}>Cardiology</small>
          </div>
          {/* Avatar placeholder matching style */}
          <div className={styles.avatar} style={{ backgroundColor: '#bfdbfe' }}></div>
        </div>
      </div>
    </div>
  );
}
