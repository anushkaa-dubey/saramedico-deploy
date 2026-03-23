"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import {
  fetchHospitalSettingsData,
  updateHospitalOrgSettings,
  updateHospitalAdminProfile,
  uploadHospitalAvatar
} from "@/services/hospital";
import { fetchProfile } from "@/services/doctor";
import { logoutUser } from "@/services/auth";
import { deleteMyAccount } from "@/services/auth";
import { useRouter } from "next/navigation";
import {
  Building2,
  Shield,
  HelpCircle,
  Info,
  LogOut,
  CheckCircle,
  AlertTriangle,
  Camera,
  Trash2
} from "lucide-react";
// ── Component ──────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("profile");
  const [userRole, setUserRole] = useState(null);
  // Delete state
  const [showDeleteZone, setShowDeleteZone] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [hospitalInfo, setHospitalInfo] = useState({
    name: "",
    org_email: "",
    email: "", // Admin email
    timezone: "UTC",
    date_format: "MM/DD/YYYY",
    avatar_url: null,
  });

  const [notifications, setNotifications] = useState({
    appointments: true,
    teamUpdates: true,
    patientAlerts: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await fetchHospitalSettingsData();
      // Backend /hospital/settings returns: { profile: {...}, organization: {...} }
      const profile = data.profile || {};
      const org = data.organization || {};

      setUserRole("hospital"); // We are always hospital role on this page
      setHospitalInfo({
        name: org.name || profile.name || "",
        org_email: org.org_email || "",
        email: profile.email || "",
        timezone: org.timezone || "UTC",
        date_format: org.date_format || "MM/DD/YYYY",
        avatar_url: profile.avatar_url || org.logo_url || null,
      });

      // Update localStorage for Topbar/Sidebar sync
      const cached = localStorage.getItem("user");
      let userData = {};
      try { userData = cached ? JSON.parse(cached) : {}; } catch(_) {}
      
      const newUserData = {
        ...userData,
        full_name: profile.full_name || profile.name || org.name || userData.full_name,
        avatar_url: profile.avatar_url || org.logo_url || userData.avatar_url,
        organization_name: org.name || userData.organization_name
      };
      
      localStorage.setItem("user", JSON.stringify(newUserData));
      window.dispatchEvent(new Event("profile-updated"));

    } catch (err) {
      console.error("Failed to load settings:", err);
      // Fallback: try auth/me if settings fails
      try {
        const profile = await fetchProfile();
        setUserRole(profile?.role);
        setHospitalInfo(prev => ({
          ...prev,
          name: profile.full_name || profile.name || prev.name,
          email: profile.email || prev.email,
        }));
      } catch (e) { }
    } finally {
      setLoading(false);
    }
  };

  const canEdit = userRole === "admin" || userRole === "hospital";

  const showMsg = (type, text) => {
    setMessage({ type, text });
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!hospitalInfo.name.trim()) {
      showMsg("error", "Organization name is required.");
      return;
    }
    setSaving(true);
    try {
      // Unify updates: update both org and profile info for 100% sync
      await Promise.allSettled([
        updateHospitalOrgSettings({
          name: hospitalInfo.name,
          org_email: hospitalInfo.org_email,
          timezone: hospitalInfo.timezone,
          date_format: hospitalInfo.date_format,
        }),
        updateHospitalAdminProfile({
          name: hospitalInfo.name, // Usually org name or admin name
          email: hospitalInfo.email,
        })
      ]);

      showMsg("success", "System settings synchronized successfully.");
      loadSettings();
    } catch (err) {
      showMsg("error", err?.message || "Failed to update settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSaving(true);
    try {
      await uploadHospitalAvatar(file);
      showMsg("success", "Logo updated successfully.");
      // Reload everything to get the fresh presigned URL and sync localStorage
      loadSettings();
    } catch (err) {
      showMsg("error", "Failed to upload logo.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (!window.confirm("Are you sure you want to sign out?")) return;
    await logoutUser();
    router.push("/auth/login");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      setDeleteError("Please type DELETE exactly to confirm.");
      return;
    }
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteMyAccount();
      router.push("/auth/login");
    } catch (err) {
      setDeleteError(err.message || "Failed to delete account. Please try again.");
      setDeleting(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Institutional Profile", icon: Building2 },
  ];

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1.5px solid #e2e8f0",
    fontSize: "14px",
    color: "#1e293b",
    outline: "none",
    background: "#f8fafc",
    fontFamily: "inherit",
    fontWeight: "500",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontSize: "11px",
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "6px",
    display: "block",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: "flex", flexDirection: "column", background: "transparent", padding: 0, minHeight: "100%" }}
    >
      <Topbar title="System Settings" />

      <div className={styles.contentWrapper}>
        {/* Page Header */}
        <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
              System Settings
            </h1>
            <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>
              Configure organization profile and administrative preferences.
            </p>
          </div>
          {canEdit && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className={styles.primaryBtn}
              style={{
                opacity: (saving || loading) ? 0.7 : 1,
                padding: "12px 24px",
                height: "44px",
                boxShadow: "0 4px 12px rgba(53, 154, 255, 0.2)"
              }}
            >
              {saving ? "Processing..." : "Sync Changes"}
            </button>
          )}
        </div>

        {/* Alert Banner */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "14px 18px",
              borderRadius: "12px",
              marginBottom: "24px",
              background: message.type === "success" ? "#f0fdf4" : "#fef2f2",
              color: message.type === "success" ? "#166534" : "#991b1b",
              border: `1px solid ${message.type === "success" ? "#dcfce7" : "#fee2e2"}`,
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {message.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertTriangle size={18} />
            )}            {message.text}
          </motion.div>
        )}

        {/* Responsive Grid Layout */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "32px",
          alignItems: "flex-start"
        }}>

          {/* Left Column: Profile Card + Tabs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Institution Card */}
            <div style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "24px",
              border: "1px solid #f1f5f9",
              textAlign: "center",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)"
            }}>
              <div
                onClick={() => {
                  if (canEdit) fileInputRef.current?.click();
                }}
                style={{
                  width: "100px", height: "100px", borderRadius: "30px",
                  background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                  margin: "0 auto 16px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "40px",
                  cursor: canEdit ? "pointer" : "default",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {hospitalInfo.avatar_url ? (
                  <img src={hospitalInfo.avatar_url} alt="logo"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : <Building2 size={40} color="white" />}
                {canEdit && (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        bottom: "8px",
                        right: "8px",
                        background: "#3b82f6",
                        borderRadius: "50%",
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
                      }}
                    >
                      <Camera size={16} color="white" />
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      style={{ display: "none" }}
                      accept="image/*"
                    />
                  </>
                )}
              </div>
              <div style={{ fontWeight: "800", color: "#0f172a", fontSize: "18px" }}>
                {hospitalInfo.name || "Hospital Admin"}
              </div>
              <div style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
                {hospitalInfo.email || "admin@saramedico.com"}
              </div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                background: "#eff6ff", color: "#3b82f6",
                padding: "4px 12px", borderRadius: "20px",
                fontSize: "11px", fontWeight: "800", marginTop: "12px",
              }}>
                ✓ Verified Institution
              </div>
            </div>

            {/* Tab Navigation (Horizontal on mobile, vertical on desktop) */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              background: "#fff",
              padding: "8px",
              borderRadius: "16px",
              border: "1px solid #f1f5f9"
            }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px 16px", borderRadius: "10px",
                    border: "none",
                    background: activeTab === tab.id ? "#3b82f6" : "transparent",
                    color: activeTab === tab.id ? "white" : "#64748b",
                    fontSize: "14px", fontWeight: "700",
                    textAlign: "left", cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <tab.icon size={18} />                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Active Tab Content */}
          <div style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "32px",
            border: "1px solid #f1f5f9",
            minHeight: "400px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)"
          }}>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "300px", color: "#94a3b8" }}>
                <div className={styles.loadingSpinner} style={{ borderTopColor: "#3b82f6", marginBottom: "16px" }}></div>
                Loading Configurations...
              </div>
            ) : activeTab === "profile" ? (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", marginBottom: "8px", marginTop: 0 }}>
                  Institutional Profile
                </h3>
                <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "32px", marginTop: 0 }}>
                  Update organizational identification and public contact details.
                </p>
                <form onSubmit={handleSave}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px", marginBottom: "32px" }}>
                    <div>
                      <label style={labelStyle}>Organization Name</label>
                      <input
                        required
                        value={hospitalInfo.name}
                        onChange={e => setHospitalInfo(p => ({ ...p, name: e.target.value }))}
                        placeholder="e.g. General Hospital"
                        style={{ ...inputStyle, ...(canEdit ? {} : { color: "#94a3b8", cursor: "not-allowed", background: "#f1f5f9" }) }}
                        readOnly={!canEdit}
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
                      <div>
                        <label style={labelStyle}>Official Organization Email</label>
                        <input
                          value={hospitalInfo.org_email}
                          onChange={e => setHospitalInfo(p => ({ ...p, org_email: e.target.value }))}
                          placeholder="admin@hospital.com"
                          style={{ ...inputStyle, ...(canEdit ? {} : { color: "#94a3b8", cursor: "not-allowed", background: "#f1f5f9" }) }}
                          readOnly={!canEdit}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Administrator Account Email (Read-only)</label>
                        <input
                          value={hospitalInfo.email}
                          readOnly
                          style={{ ...inputStyle, color: "#94a3b8", cursor: "not-allowed", background: "#f1f5f9" }}
                        />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
                      <div>
                        <label style={labelStyle}>System Timezone</label>
                        <select
                          value={hospitalInfo.timezone}
                          onChange={e => setHospitalInfo(p => ({ ...p, timezone: e.target.value }))}
                          style={{ ...inputStyle, appearance: "auto", ...(canEdit ? {} : { color: "#94a3b8", cursor: "not-allowed", background: "#f1f5f9" }) }}
                          disabled={!canEdit}
                        >
                          <option value="UTC">Universal Coordinated Time (UTC)</option>
                          <option value="Asia/Kolkata">IST (UTC+5:30)</option>
                          <option value="America/New_York">EST (UTC-5:00)</option>
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Preferred Date Format</label>
                        <select
                          value={hospitalInfo.date_format}
                          onChange={e => setHospitalInfo(p => ({ ...p, date_format: e.target.value }))}
                          style={{ ...inputStyle, appearance: "auto", ...(canEdit ? {} : { color: "#94a3b8", cursor: "not-allowed", background: "#f1f5f9" }) }}
                          disabled={!canEdit}
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", marginBottom: "8px", marginTop: 0 }}>
                  Security & Access
                </h3>
                <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "32px", marginTop: 0 }}>
                  Manage institutional security protocols and active sessions.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { label: "Security & Privacy", sub: "Manage data encryption and privacy policies", icon: Shield },
                    { label: "Help Center", sub: "Search documentation and FAQs", icon: HelpCircle },
                    { label: "About SaraMedico", sub: "Operating on Core v1.4.2 (Production)", icon: Info }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex", alignItems: "center", gap: "16px",
                        padding: "20px",
                        borderRadius: "14px",
                        background: "#f8fafc",
                        border: "1px solid #f1f5f9",
                        cursor: "pointer",
                      }}
                    >
                      <item.icon size={22} color="#64748b" />                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "800", color: "#1e293b", fontSize: "15px" }}>{item.label}</div>
                        <div style={{ color: "#64748b", fontSize: "13px", marginTop: "2px" }}>{item.sub}</div>
                      </div>
                      <span style={{ color: "#cbd5e1", fontSize: "20px" }}>›</span>
                    </div>
                  ))}

                  <div style={{ marginTop: "24px" }}>
                    <button
                      onClick={handleSignOut}
                      style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        width: "100%", padding: "16px", borderRadius: "14px",
                        border: "1.5px solid #fee2e2", background: "#fef2f2",
                        color: "#ef4444", fontSize: "15px", fontWeight: "800",
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                    >
                      <LogOut size={18} />                      Sign Out from System
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className={styles.contentWrapper} style={{ paddingTop: 0 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            border: "1.5px solid #fee2e2",
            borderRadius: "20px",
            background: "#fff",
            overflow: "hidden",
            marginBottom: "32px"
          }}
        >
          <div style={{
            padding: "20px 24px", background: "#fef2f2",
            borderBottom: "1px solid #fee2e2",
            display: "flex", alignItems: "center", gap: "10px"
          }}>
            <AlertTriangle size={18} color="#dc2626" />
            <span style={{ fontWeight: "800", color: "#dc2626", fontSize: "15px" }}>Danger Zone</span>
          </div>
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "15px", marginBottom: "4px" }}>Delete Hospital Account</div>
                <div style={{ color: "#64748b", fontSize: "13px" }}>
                  Permanently removes this hospital account and all its organization data. This action cannot be undone.
                </div>
              </div>
              <button
                onClick={() => { setShowDeleteZone(!showDeleteZone); setDeleteConfirmText(""); setDeleteError(""); }}
                style={{
                  padding: "10px 20px", borderRadius: "10px",
                  border: "1.5px solid #dc2626", background: "transparent",
                  color: "#dc2626", fontWeight: "700", fontSize: "14px",
                  cursor: "pointer", display: "flex", alignItems: "center",
                  gap: "8px"
                }}
              >
                <Trash2 size={15} /> Delete Account
              </button>
            </div>
            {showDeleteZone && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px dashed #fca5a5" }}
              >
                <p style={{ color: "#7f1d1d", fontSize: "13px", fontWeight: "600", marginBottom: "12px" }}>
                  ⚠️ This will permanently delete the hospital account and all organization data. Type <strong>DELETE</strong> to confirm.
                </p>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    value={deleteConfirmText}
                    onChange={e => { setDeleteConfirmText(e.target.value); setDeleteError(""); }}
                    placeholder="Type DELETE here"
                    style={{
                      flex: 1, minWidth: "200px", padding: "10px 14px",
                      borderRadius: "8px", border: "1.5px solid #fca5a5",
                      fontSize: "14px", fontWeight: "600",
                      background: "#fff7f7", color: "#7f1d1d", outline: "none"
                    }}
                  />
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteConfirmText !== "DELETE"}
                    style={{
                      padding: "10px 20px", borderRadius: "8px", border: "none",
                      background: deleteConfirmText === "DELETE" ? "#dc2626" : "#fca5a5",
                      color: "white", fontWeight: "700", fontSize: "14px",
                      cursor: deleteConfirmText === "DELETE" ? "pointer" : "not-allowed"
                    }}
                  >
                    {deleting ? "Deleting..." : "Confirm Delete"}
                  </button>
                </div>
                {deleteError && (
                  <p style={{ color: "#dc2626", fontSize: "13px", fontWeight: "600", marginTop: "10px" }}>{deleteError}</p>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Mobile spacing */}
      <div style={{ height: "60px" }} className={styles.mobileOnly}></div>
    </motion.div>
  );
}
