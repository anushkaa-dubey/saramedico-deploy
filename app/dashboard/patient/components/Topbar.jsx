import styles from "../PatientDashboard.module.css";
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
              Benjamin Frank
            </span>
            <small style={{ color: "#94a3b8", fontSize: "11px" }}>Patient</small>
          </div>
          {/* Placeholder or image if available, user didn't specify one for Topbar but I'll add a div/img placeholder structure */}
          <div className={styles.avatar} style={{ backgroundColor: '#e0e7ff' }}></div>
        </div>
      </div>
    </div>
  );
}
