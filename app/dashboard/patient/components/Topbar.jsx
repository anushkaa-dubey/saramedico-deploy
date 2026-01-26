import styles from "../PatientDashboard.module.css";
import Link from "next/link";
import notificationIcon from "@/public/icons/notification.svg";
import { useEffect } from "react";
// import { getCurrentUser } from "@/services/auth";

export default function Topbar() {
  useEffect(() => {
    // Section 4: Get Current User (Session Persistence)
    const checkSession = async () => {
      try {
        // TODO: Replace with actual API call
        // const user = await getCurrentUser();
        console.log("Session Check: Requesting /api/v1/auth/me");
      } catch (err) {
        console.error("Session check failed", err);
      }
    };
    checkSession();
  }, []);
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
        <Link href="/dashboard/patient/profile" className={styles.profile} style={{ textDecoration: "none", cursor: "pointer" }}>
          <div className={styles.profileInfo}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
              Benjamin Frank
            </span>
            <small style={{ color: "#94a3b8", fontSize: "11px" }}>Patient</small>
          </div>
          {/* Placeholder or image if available, user didn't specify one for Topbar but I'll add a div/img placeholder structure */}
          <div className={styles.avatar} style={{ backgroundColor: '#e0e7ff' }}></div>
        </Link>
      </div>
    </div>
  );
}
