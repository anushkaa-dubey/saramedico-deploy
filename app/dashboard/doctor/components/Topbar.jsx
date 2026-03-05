"use client";
import { useState, useEffect, useRef } from "react";
import styles from "../DoctorDashboard.module.css";
// import notificationIcon from "@/public/icons/notification.svg";
import { useRouter } from "next/navigation";
import { fetchDoctorProfile } from "@/services/doctor";
import NotificationBell from "../../components/NotificationBell"; export default function Topbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const data = await fetchDoctorProfile();
        setUser(data);
        if (data) localStorage.setItem("doctorUser", JSON.stringify(data));
      } catch (err) {
        const stored = localStorage.getItem("doctorUser");
        if (stored) {
          try { setUser(JSON.parse(stored)); } catch (_) { }
        }
      } finally {
        setLoading(false);
      }
    };
    getProfile();

    // Listen for avatar updates
    const handleAvatarUpdate = () => {
      getProfile();
    };
    window.addEventListener('avatarUpdated', handleAvatarUpdate);

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("doctorUser");
    localStorage.removeItem("user");
    router.push("/auth/login/doctor");
  };

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

      <div className={styles.topActions} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <NotificationBell />
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <div
            className={styles.profile}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'row', alignItems: 'center' }}
          >
            <div className={styles.profileInfo} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
                {displayName}
              </span>
              <small style={{ color: "#94a3b8", fontSize: "11px" }}>Clinician</small>
            </div>
            <div
              className={styles.avatar}
              style={{
                marginLeft: '12px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#e0e7ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                fontSize: '12px',
                fontWeight: '700',
                color: '#3730a3'
              }}
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.full_name ? user.full_name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "DR"
              )}
            </div>
          </div>
          {dropdownOpen && (
            <div style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "8px",
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              zIndex: 50,
              minWidth: "150px",
              overflow: "hidden"
            }}>
              <div
                onClick={() => { setDropdownOpen(false); router.push("/dashboard/doctor/settings/profile"); }}
                style={{ padding: "10px 16px", cursor: "pointer", fontSize: "14px", color: "#0f172a", borderBottom: "1px solid #f1f5f9" }}
                onMouseEnter={(e) => e.target.style.background = "#f8fafc"}
                onMouseLeave={(e) => e.target.style.background = "white"}
              >
                View Profile
              </div>
              <div
                onClick={handleLogout}
                style={{ padding: "10px 16px", cursor: "pointer", fontSize: "14px", color: "#ef4444" }}
                onMouseEnter={(e) => e.target.style.background = "#f8fafc"}
                onMouseLeave={(e) => e.target.style.background = "white"}
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
