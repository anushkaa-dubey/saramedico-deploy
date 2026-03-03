"use client";
import { useState, useEffect } from "react";
import styles from "../DoctorDashboard.module.css";
import notificationIcon from "@/public/icons/notification.svg";
import { useRouter } from "next/navigation";
import { fetchProfile } from "@/services/doctor";

export default function Topbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const data = await fetchProfile();
        setUser(data);
        // Cache it for faster subsequent loads
        if (data) localStorage.setItem("user", JSON.stringify(data));
      } catch (err) {
        // Fallback to cached localStorage
        const stored = localStorage.getItem("user");
        if (stored) {
          try { setUser(JSON.parse(stored)); } catch (_) { }
        }
      } finally {
        setLoading(false);
      }
    };
    getProfile();
  }, []);

  const displayName = user?.full_name
    ? user.full_name
    : user?.first_name
      ? `Dr. ${user.first_name} ${user.last_name || ""}`
      : loading
        ? "Loading..."
        : "Doctor";

  const displayRole = user?.specialty || user?.role || "Doctor";

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    : "DR";

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
          <div
            className={styles.avatar}
            style={{
              backgroundColor: user?.avatar_url ? "transparent" : "#bfdbfe",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "700",
              fontSize: "12px",
              color: "#1e40af"
            }}
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              initials
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
