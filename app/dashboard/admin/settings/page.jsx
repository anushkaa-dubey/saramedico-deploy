"use client";

import { useState, useEffect } from "react";
import styles from "../AdminDashboard.module.css";
import {
  fetchAdminSettings,
  updateAdminProfile,
  uploadAdminAvatar
} from "@/services/admin";
import { User, Lock, Mail, Camera, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function AdminProfilePage() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar_url: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await fetchAdminSettings();
      setProfile({
        ...profile,
        name: data.profile?.name || "",
        email: data.profile?.email || "",
        avatar_url: data.profile?.avatar_url || ""
      });
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError("");
    setSuccess(false);
    
    if (profile.password && profile.password !== profile.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: profile.name,
        email: profile.email
      };
      
      if (profile.password) {
        payload.password = profile.password;
      }

      await updateAdminProfile(payload);
      setSuccess(true);
      setProfile(prev => ({ ...prev, password: "", confirmPassword: "" }));
      
      // Notify Topbar to refresh
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
      setProfile(prev => ({
        ...prev,
        avatar_url: res.preview_url
      }));

      // Notify Topbar to refresh
      window.dispatchEvent(new Event("profile-updated"));
    } catch (err) {
      alert("Failed to upload avatar");
    }
  };

  if (loading) return (
    <div className={styles.loadingState}>
      <div className={styles.spinner}></div>
      <p>Fetching your profile...</p>
    </div>
  );

  return (
    <div className={styles.profileContainer}>
      <div className={styles.titleRow}>
        <div>
          <h2 className={styles.heading}>Account Settings</h2>
          <p className={styles.subtext}>
            Manage your personal profile, credentials, and security preferences.
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.sectionTitle}>
          <User size={20} className={styles.accentIcon} />
          Personal Information
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "24px", padding: "20px", background: "#f8fafc", borderRadius: "16px", marginBottom: "32px" }}>
          <div className={styles.avatarLarge}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="Profile" />
              : profile.name?.charAt(0)}
            <label className={styles.avatarOverlay}>
              <Camera size={24} />
              <input type="file" hidden onChange={handleAvatar} />
            </label>
          </div>

          <div>
            <h3 style={{ margin: 0, fontSize: "20px", color: "#1e293b" }}>{profile.name}</h3>
            <p style={{ margin: "4px 0 12px", color: "#64748b", fontSize: "14px" }}>System Administrator</p>
            <label className={styles.uploadTrigger}>
              Change Profile Photo
              <input type="file" hidden onChange={handleAvatar} />
            </label>
          </div>
        </div>

        <div className={styles.profileGrid}>
          <div>
            <label className={styles.label}>
              <User size={14} style={{ marginRight: '6px' }} />
              Full Name
            </label>
            <input
              className={styles.input}
              placeholder="e.g. John Doe"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>

          <div>
            <label className={styles.label}>
              <Mail size={14} style={{ marginRight: '6px' }} />
              Email Address
            </label>
            <input
              className={styles.input}
              placeholder="admin@saramedico.id"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>
        </div>

        <div className={styles.sectionTitle}>
          <Lock size={20} className={styles.accentIcon} />
          Security & Credentials
        </div>

        <div className={styles.profileGrid}>
          <div>
            <label className={styles.label}>New Password</label>
            <input
              type="password"
              className={styles.input}
              placeholder="Leave blank to keep current"
              value={profile.password}
              onChange={(e) => setProfile({ ...profile, password: e.target.value })}
            />
          </div>

          <div>
            <label className={styles.label}>Confirm New Password</label>
            <input
              type="password"
              className={styles.input}
              placeholder="Repeat new password"
              value={profile.confirmPassword}
              onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
            />
          </div>
        </div>

        {error && (
          <div style={{ marginTop: "20px", padding: "12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={16} />
            {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "40px", paddingTop: "24px", borderTop: "1px solid #f1f5f9" }}>
          {success && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#059669", fontSize: "14px", fontWeight: "600" }}>
              <CheckCircle2 size={18} />
              Changes saved successfully!
            </div>
          )}
          
          <button 
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}