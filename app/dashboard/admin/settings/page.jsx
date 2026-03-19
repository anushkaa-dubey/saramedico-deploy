"use client";

import { useState, useEffect } from "react";
import styles from "../AdminDashboard.module.css";
import profileStyles from "./Settings.module.css";
import {
  fetchAdminSettings,
  updateAdminProfile,
  uploadAdminAvatar
} from "@/services/admin";
import { User, Lock, Mail, Camera, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function AdminProfilePage() {
  const [profile, setProfile] = useState({
    name: "", email: "", avatar_url: "", password: "", confirmPassword: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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
    </div>
  );
}