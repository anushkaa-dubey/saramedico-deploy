"use client";

import { useState, useEffect } from "react";
import styles from "../AdminDashboard.module.css";
import profileStyles from "./Settings.module.css";
import {
  fetchAdminSettings,
  updateAdminProfile,
  uploadAdminAvatar
} from "@/services/admin";
import { deleteMyAccount } from "@/services/auth";
import { useRouter } from "next/navigation";
import { User, Lock, Mail, Camera, ShieldCheck, CheckCircle2, AlertTriangle, Trash2 } from "lucide-react";

export default function AdminProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: "", email: "", avatar_url: "", password: "", confirmPassword: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  // Delete account state
  const [showDeleteZone, setShowDeleteZone] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const data = await fetchAdminSettings();
      setProfile(prev => ({
        ...prev,
        name: data.profile?.name || "",
        email: data.profile?.email || "",
        avatar_url: data.profile?.avatar_url || ""
      }));
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError(""); setSuccess(false);
    if (profile.password && profile.password !== profile.confirmPassword) {
      setError("Passwords do not match"); return;
    }
    setSaving(true);
    try {
      const payload = { name: profile.name, email: profile.email };
      if (profile.password) payload.password = profile.password;
      await updateAdminProfile(payload);
      setSuccess(true);
      setProfile(prev => ({ ...prev, password: "", confirmPassword: "" }));
      window.dispatchEvent(new Event("profile-updated"));
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadAdminAvatar(file);
      setProfile(prev => ({ ...prev, avatar_url: res.preview_url }));
      window.dispatchEvent(new Event("profile-updated"));
    } catch {
      alert("Failed to upload avatar");
    }
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

  if (loading) return (
    <div className={styles.loadingState}>
      <div className={styles.spinner} />
      <p>Fetching your profile...</p>
    </div>
  );

  return (
    <div className={styles.profileContainer}>

      {/* Page title */}
      <div className={styles.titleRow}>
        <div>
          <h2 className={styles.heading}>Account Settings</h2>
          <p className={styles.subtext}>
            Manage your personal profile, credentials, and security preferences.
          </p>
        </div>
      </div>

      <div className={styles.card}>

        {/* ── Avatar row ── */}
        <div className={profileStyles.avatarRow}>
          <div className={styles.avatarLarge}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="Profile" />
              : profile.name?.charAt(0)}
            <label className={styles.avatarOverlay}>
              <Camera size={22} color="#fff" />
              <input type="file" hidden onChange={handleAvatar} accept="image/*" />
            </label>
          </div>
          <div className={profileStyles.avatarMeta}>
            <h3 className={profileStyles.avatarName}>{profile.name}</h3>
            <p className={profileStyles.avatarRole}>System Administrator</p>
            <label className={styles.uploadTrigger}>
              Change Profile Photo
              <input type="file" hidden onChange={handleAvatar} accept="image/*" />
            </label>
          </div>
        </div>

        {/* ── Personal Information ── */}
        <div className={styles.sectionTitle}>
          <User size={20} className={styles.accentIcon} />
          Personal Information
        </div>

        <div className={styles.profileGrid}>
          <div>
            <label className={styles.label}>
              Full Name
            </label>
            <input
              className={styles.input}
              placeholder="e.g. John Doe"
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div>
            <label className={styles.label}>
              Email Address
            </label>
            <input
              className={styles.input}
              placeholder="admin@example.com"
              value={profile.email}
              onChange={e => setProfile({ ...profile, email: e.target.value })}
            />
          </div>
        </div>

        {/* ── Security ── */}
        <div className={styles.sectionTitle}>
          <Lock size={20} className={styles.accentIcon} />
          Security &amp; Credentials
        </div>

        <div className={styles.profileGrid}>
          <div>
            <label className={styles.label}>New Password</label>
            <input
              type="password"
              className={styles.input}
              placeholder="Leave blank to keep current"
              value={profile.password}
              onChange={e => setProfile({ ...profile, password: e.target.value })}
            />
          </div>
          <div>
            <label className={styles.label}>Confirm New Password</label>
            <input
              type="password"
              className={styles.input}
              placeholder="Repeat new password"
              value={profile.confirmPassword}
              onChange={e => setProfile({ ...profile, confirmPassword: e.target.value })}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className={profileStyles.errorBox}>
            <ShieldCheck size={16} /> {error}
          </div>
        )}

        {/* Actions */}
        <div className={profileStyles.saveRow}>
          {success && (
            <div className={profileStyles.successMsg}>
              <CheckCircle2 size={16} /> Changes saved successfully!
            </div>
          )}
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>

      </div>

      {/* ─── Danger Zone ─────────────────────────────────────────────── */}
      <div style={{
        marginTop: "32px",
        border: "1.5px solid #fee2e2",
        borderRadius: "20px",
        background: "#fff",
        overflow: "hidden"
      }}>
        <div style={{
          padding: "18px 24px", background: "#fef2f2",
          borderBottom: "1px solid #fee2e2",
          display: "flex", alignItems: "center", gap: "10px"
        }}>
          <AlertTriangle size={18} color="#dc2626" />
          <span style={{ fontWeight: "800", color: "#dc2626", fontSize: "15px" }}>Danger Zone</span>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "15px", marginBottom: "4px" }}>Delete Account</div>
              <div style={{ color: "#64748b", fontSize: "13px" }}>
                Permanently removes your account and all organization metadata. This action is irreversible.
              </div>
            </div>
            <button
              onClick={() => { setShowDeleteZone(!showDeleteZone); setDeleteConfirmText(""); setDeleteError(""); }}
              style={{
                padding: "10px 20px", borderRadius: "10px",
                border: "1.5px solid #dc2626", background: "transparent",
                color: "#dc2626", fontWeight: "700", fontSize: "14px",
                cursor: "pointer", display: "flex", alignItems: "center", gap: "8px"
              }}
            >
              <Trash2 size={15} /> Delete Account
            </button>
          </div>
          {showDeleteZone && (
            <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px dashed #fca5a5" }}>
              <p style={{ color: "#7f1d1d", fontSize: "13px", fontWeight: "600", marginBottom: "12px" }}>
                Type <strong>DELETE</strong> to confirm permanent account removal.
              </p>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                <input
                  value={deleteConfirmText}
                  onChange={e => { setDeleteConfirmText(e.target.value); setDeleteError(""); }}
                  placeholder="Type DELETE"
                  style={{
                    flex: 1, minWidth: "200px", padding: "10px 14px",
                    borderRadius: "8px", border: "1.5px solid #fca5a5",
                    fontSize: "14px", fontWeight: "600", outline: "none",
                    background: "#fff7f7", color: "#7f1d1d"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
