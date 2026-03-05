"use client";
import { useState, useEffect } from "react";
import styles from "../DoctorDashboard.module.css";
// import notificationIcon from "@/public/icons/notification.svg";
import { useRouter } from "next/navigation";
import { fetchProfile } from "@/services/doctor";

export default function Topbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const getProfile = async () => {
      try {
        const data = await fetchProfile();
        setUser(data);
        if (data) localStorage.setItem("user", JSON.stringify(data));
      } catch (err) {
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

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      router.push(`/dashboard/doctor/patients?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const displayName =
    user?.full_name
      ? `Dr. ${user.full_name.split(" ")[0]}`
      : user?.first_name
        ? `Dr. ${user.first_name}`
        : loading
          ? "Loading..."
          : "Doctor";

  return (
    <div className={styles.topbar}>
      <input
        className={styles.search}
        placeholder="Search patients, appointments, notes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleSearch}
      />

      <div className={styles.topActions}>
        <div
          className={styles.profile}
          onClick={() => router.push("/dashboard/doctor/settings/profile")}
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.profileInfo}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
              {displayName}
            </span>
          </div>
          <div className={styles.avatar} style={{ marginLeft: '10px' }}>
            {/* Initials fallback */}
            {user?.full_name ? user.full_name.split(" ").map(n => n[0]).join("") : "DR"}
          </div>
        </div>
      </div>
    </div>
  );
}
