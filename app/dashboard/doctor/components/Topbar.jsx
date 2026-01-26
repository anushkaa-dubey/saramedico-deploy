"use client";

import styles from "../DoctorDashboard.module.css";
import notificationIcon from "@/public/icons/notification.svg";
import profileIcon from "@/public/icons/profile.svg";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
// import { getCurrentUser } from "@/services/auth";

export default function Topbar() {
  const router = useRouter();

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
        <button
          className={styles.primaryBtn}
          style={{ height: '32px', fontSize: '12px' }}
          onClick={() => router.push("/dashboard/doctor/video-call")}
        >
          Start Session
        </button>

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
          <div className={styles.avatar} style={{ backgroundColor: '#bfdbfe' }}></div>
        </div>
      </div>
    </div>
  );
}
