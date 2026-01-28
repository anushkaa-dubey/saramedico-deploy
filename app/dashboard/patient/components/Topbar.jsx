import { useState, useEffect } from "react";
import styles from "../PatientDashboard.module.css";
import Link from "next/link";
import notificationIcon from "@/public/icons/notification.svg";

export default function Topbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const displayName = user ? `${user.first_name} ${user.last_name}` : "Patient";

  return (
    <div className={styles.topbar}>
      <input
        className={styles.search}
        placeholder="Search appointments, notes..."
      />

      <div className={styles.topActions}>
        <button className={styles.notificationBtn}>
          <img src={notificationIcon.src} alt="Notifications" width="20" height="20" />
          <span className={styles.notificationBadge}></span>
        </button>
        <Link href="/dashboard/patient/profile" className={styles.profile} style={{ textDecoration: "none", cursor: "pointer" }}>
          <div className={styles.profileInfo}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
              {displayName}
            </span>
            <small style={{ color: "#94a3b8", fontSize: "11px" }}>Patient</small>
          </div>
          <div className={styles.avatar} style={{ backgroundColor: '#e0e7ff', overflow: 'hidden' }}>
            {user?.avatar_url && <img src={user.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
        </Link>
      </div>
    </div>
  );
}
