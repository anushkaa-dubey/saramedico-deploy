import { useState, useEffect } from "react";
import styles from "../DoctorDashboard.module.css";
import notificationIcon from "@/public/icons/notification.svg";
import { useRouter } from "next/navigation";

export default function Topbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const displayName = user ? `Dr. ${user.first_name} ${user.last_name}` : "Doctor";
  const displayRole = user?.organization_name || user?.role || "Doctor";

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
              {displayName}
            </span>
            <small style={{ color: "#94a3b8", fontSize: "12px" }}>{displayRole}</small>
          </div>
          <div className={styles.avatar} style={{ backgroundColor: '#bfdbfe', overflow: 'hidden' }}>
            {user?.avatar_url && <img src={user.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
        </div>
      </div>
    </div>
  );
}
