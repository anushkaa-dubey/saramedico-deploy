"use client";
import { useState, useEffect, useRef } from "react";
import styles from "../DoctorDashboard.module.css";
import { useRouter } from "next/navigation";
import { fetchDoctorProfile, fetchPatients } from "@/services/doctor";
import NotificationBell from "../../components/NotificationBell";

export default function Topbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [patients, setPatients] = useState([]);
  const dropdownRef = useRef(null);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const getProfileAndPatients = async () => {
      try {
        const data = await fetchDoctorProfile();
        setUser(data);
        if (data) localStorage.setItem("doctorUser", JSON.stringify(data));
        try {
          const ptList = await fetchPatients();
          setPatients(ptList || []);
        } catch (err) {
          console.error("Failed to fetch patients for search", err);
        }
      } catch (err) {
        const stored = localStorage.getItem("doctorUser");
        if (stored) {
          try { setUser(JSON.parse(stored)); } catch (_) { }
        }
      } finally {
        setLoading(false);
      }
    };
    getProfileAndPatients();

    const handleAvatarUpdate = () => {
      fetchDoctorProfile().then(data => { if (data) setUser(data); });
    };
    window.addEventListener('avatarUpdated', handleAvatarUpdate);

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target))
        setShowSearchDropdown(false);
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
      setShowSearchDropdown(false);
      router.push(`/dashboard/doctor/patients?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const displayName =
    user?.full_name && !user.full_name.toLowerCase().includes('encryp')
      ? `Dr. ${user.full_name.split(" ")[0]}`
      : user?.first_name
        ? `Dr. ${user.first_name}`
        : loading ? "Loading..." : "Doctor";

  const filteredPatients = patients.filter(pt =>
    pt.name?.toLowerCase().includes(search.toLowerCase()) ||
    pt.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    pt.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    pt.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    pt.mrn?.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5);

  const initials = user?.full_name && !user.full_name.toLowerCase().includes('encryp')
    ? user.full_name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    : "DR";

  return (
    <div className={styles.topbar}>

      {/* Search — hidden on mobile via .topbarSearchWrap in DoctorDashboard.module.css */}
      <div style={{ position: "relative" }} ref={searchContainerRef} className={styles.topbarSearchWrap}>
        <input
          className={styles.search}
          placeholder="Search patients, appointments, notes..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setShowSearchDropdown(true); }}
          onFocus={() => setShowSearchDropdown(true)}
          onKeyDown={handleSearch}
        />
        {showSearchDropdown && search.trim().length > 0 && (
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0, marginTop: "6px",
            background: "white", border: "1px solid #e2e8f0", borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", zIndex: 9999, overflow: "hidden",
          }}>
            {filteredPatients.length > 0 ? filteredPatients.map((pt, idx) => (
              <div key={pt.id || idx}
                onClick={() => { setShowSearchDropdown(false); setSearch(""); router.push(`/dashboard/doctor/patients?search=${encodeURIComponent(pt.name || pt.full_name || pt.first_name)}`); }}
                style={{
                  padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px",
                  borderBottom: idx < filteredPatients.length - 1 ? "1px solid #f1f5f9" : "none",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%", background: "#e0e7ff",
                  color: "#3730a3", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: "700", flexShrink: 0,
                }}>
                  {(pt.name || pt.full_name || pt.first_name || "?").substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "500", color: "#0f172a" }}>
                    {pt.name || pt.full_name || `${pt.first_name} ${pt.last_name}`}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>{pt.mrn || "Patient"}</div>
                </div>
              </div>
            )) : (
              <div style={{ padding: "12px 14px", fontSize: "13px", color: "#64748b", textAlign: "center" }}>
                No patients found matching "{search}"
              </div>
            )}
            <div
              onClick={() => { setShowSearchDropdown(false); router.push(`/dashboard/doctor/patients?search=${encodeURIComponent(search.trim())}`); }}
              style={{
                padding: "8px 14px", background: "#f8fafc", color: "#2563eb",
                fontSize: "12px", fontWeight: "600", textAlign: "center", cursor: "pointer", borderTop: "1px solid #e2e8f0",
              }}
            >
              See all results…
            </div>
          </div>
        )}
      </div>

      {/* Right side — marginLeft:auto always pushes avatar to far right */}
      <div className={styles.topActions} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
        <NotificationBell />

        <div style={{ position: "relative" }} ref={dropdownRef}>
          <div
            className={styles.profile}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ cursor: "pointer", display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}
          >
            {/* Name/role — hidden on mobile via .profileInfo CSS */}
            <div className={styles.profileInfo} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap" }}>
                {displayName}
              </span>
              <small style={{ color: "#94a3b8", fontSize: "11px" }}>Clinician</small>
            </div>

            {/* Avatar — always visible, always the rightmost element */}
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#e0e7ff",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", fontSize: "12px", fontWeight: "700", color: "#3730a3",
              flexShrink: 0,
            }}>
              {user?.avatar_url
                ? <img src={user.avatar_url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : initials
              }
            </div>
          </div>

          {dropdownOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              background: "white", border: "1px solid #e2e8f0", borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 9999,
              minWidth: "150px", overflow: "hidden",
            }}>
              <div
                onClick={() => { setDropdownOpen(false); router.push("/dashboard/doctor/settings/profile"); }}
                style={{ padding: "10px 16px", cursor: "pointer", fontSize: "14px", color: "#0f172a", borderBottom: "1px solid #f1f5f9" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background = "white"}
              >View Profile</div>
              <div
                onClick={handleLogout}
                style={{ padding: "10px 16px", cursor: "pointer", fontSize: "14px", color: "#ef4444" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background = "white"}
              >Logout</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}