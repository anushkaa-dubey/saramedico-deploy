"use client";

import styles from "./Settings.module.css";
import { useState, useEffect, useRef } from "react";
import {
  fetchAdminSettings,
  updateOrgSettings,
  updateDevSettings,
  updateBackupSettings,
  updateAdminProfile,
  uploadAdminAvatar
} from "@/services/admin";
import { motion } from "framer-motion";
import { Save, Globe, Lock, Server, User, Camera } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ type: "", message: "" });

  // Admin profile state
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  const [formData, setFormData] = useState({
    organizationName: "",
    organizationEmail: "",
    timezone: "UTC+5:30 (IST)",
    dateFormat: "DD/MM/YYYY",
    backupFrequency: "Daily",
    webhookUrl: "",
    apiScope: "Read/Write",
  });

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const data = await fetchAdminSettings();
        if (data) {
          setSettings(data);
          setProfileForm({
            name: data.profile?.name || "",
            email: data.profile?.email || "",
          });
          setAvatarUrl(data.profile?.avatar_url || null);
          setFormData({
            organizationName: data.organization?.name || data.name || "",
            organizationEmail: data.organization?.email || data.email || "",
            timezone: data.organization?.timezone || data.timezone || "UTC+5:30 (IST)",
            dateFormat: data.organization?.date_format || data.date_format || "DD/MM/YYYY",
            backupFrequency: data.backup?.frequency || data.backup_frequency || "Daily",
            webhookUrl: data.developer?.webhook_url || data.webhook_url || "",
            apiScope: data.developer?.api_scope || data.api_scope || "Read/Write",
          });
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateAdminProfile(profileForm);
      setSaveStatus({ type: "success", message: "Profile updated successfully." });
    } catch (err) {
      setSaveStatus({ type: "error", message: "Profile update failed." });
    } finally {
      setSavingProfile(false);
      setTimeout(() => setSaveStatus({ type: "", message: "" }), 4000);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const result = await uploadAdminAvatar(file);
      if (result?.preview_url) setAvatarUrl(result.preview_url);
      setSaveStatus({ type: "success", message: "Avatar updated successfully." });
    } catch (err) {
      setSaveStatus({ type: "error", message: "Avatar upload failed." });
    } finally {
      setUploadingAvatar(false);
      setTimeout(() => setSaveStatus({ type: "", message: "" }), 4000);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus({ type: "", message: "" });
    try {
      await Promise.all([
        updateOrgSettings({
          name: formData.organizationName,
          email: formData.organizationEmail,
          timezone: formData.timezone,
          date_format: formData.dateFormat,
        }),
        updateDevSettings({
          webhook_url: formData.webhookUrl,
          api_scope: formData.apiScope,
        }),
        updateBackupSettings({
          frequency: formData.backupFrequency,
        })
      ]);
      setSaveStatus({ type: "success", message: "All configurations updated successfully." });
    } catch (err) {
      setSaveStatus({ type: "error", message: "Update failed. Please check connectivity." });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus({ type: "", message: "" }), 4000);
    }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Initializing system configuration...</div>;

  const getInitials = (name) => (name || "").split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2) || "A";

  return (
    <div className={styles.settingsPage}>
      <header className={styles.titleRow}>
        <div>
          <h2 className={styles.heading}>System Administration</h2>
          <p className={styles.subtext}>Configure global organization policies and developer interfaces.</p>
        </div>
        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={saving}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Save size={18} />
          {saving ? "Deploying..." : "Apply Changes"}
        </button>
      </header>

      {saveStatus.message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            margin: "20px 32px 0 32px",
            padding: "12px 20px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600",
            background: saveStatus.type === "success" ? "#f0fdf4" : "#fef2f2",
            color: saveStatus.type === "success" ? "#16a34a" : "#ef4444",
            border: `1px solid ${saveStatus.type === "success" ? "#bbf7d0" : "#fecaca"}`
          }}
        >
          {saveStatus.message}
        </motion.div>
      )}

      {/* Admin Profile Card */}
      <div style={{ padding: "24px 32px 0 32px" }}>
        <div className={styles.card} style={{ padding: "24px", display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: avatarUrl ? "transparent" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: "800", fontSize: "24px",
              overflow: "hidden", border: "3px solid #e2e8f0"
            }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : getInitials(profileForm.name)}
            </div>
            <button
              id="upload-avatar-btn"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              style={{
                position: "absolute", bottom: 0, right: 0,
                width: "26px", height: "26px", borderRadius: "50%",
                background: uploadingAvatar ? "#94a3b8" : "#6366f1",
                border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#fff"
              }}
            >
              <Camera size={12} />
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
          </div>

          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", minWidth: "280px" }}>
            <div className={styles.formGroup}>
              <label>Admin Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Master Admin"
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Admin Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                placeholder="admin@system.ai"
                className={styles.input}
              />
            </div>
          </div>

          <button
            id="save-profile-btn"
            onClick={handleSaveProfile}
            disabled={savingProfile}
            style={{
              padding: "10px 20px", background: savingProfile ? "#94a3b8" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "#fff", border: "none", borderRadius: "10px",
              fontWeight: "700", fontSize: "13px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "6px", flexShrink: 0
            }}
          >
            <User size={14} />
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>

      <div className={styles.settingsGrid} style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Organization Settings */}
        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Globe size={20} color="#3b82f6" />
            <h3 className={styles.cardTitle} style={{ margin: 0 }}>Organization Profile</h3>
          </div>

          <div className={styles.formGroup}>
            <label>Legal Entity Name</label>
            <input
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Administrative Email</label>
            <input
              type="email"
              name="organizationEmail"
              value={formData.organizationEmail}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className={styles.formGroup}>
              <label>Default Timezone</label>
              <select name="timezone" value={formData.timezone} onChange={handleChange} className={styles.input}>
                <option>UTC+5:30 (IST)</option>
                <option>UTC+0 (GMT)</option>
                <option>UTC-5 (EST)</option>
                <option>UTC-8 (PST)</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Regional Date Format</label>
              <select name="dateFormat" value={formData.dateFormat} onChange={handleChange} className={styles.input}>
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Developer & API */}
        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Server size={20} color="#8b5cf6" />
            <h3 className={styles.cardTitle} style={{ margin: 0 }}>API & Webhooks</h3>
          </div>

          <div className={styles.formGroup}>
            <label>Webhook Notification URL</label>
            <input
              name="webhookUrl"
              value={formData.webhookUrl}
              onChange={handleChange}
              placeholder="https://hooks.example.com/v1"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Authorization Scope</label>
            <input
              name="apiScope"
              value={formData.apiScope}
              onChange={handleChange}
              placeholder="Read/Write"
              className={styles.input}
            />
          </div>

          <div className={styles.infoBox} style={{ background: '#f8fafc', fontSize: '11px', lineHeight: '1.5' }}>
            Admins can configure endpoints for real-time patient record synchronization and AI processing completion triggers.
          </div>
        </div>

        {/* System Safeguards */}
        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Lock size={20} color="#f59e0b" />
            <h3 className={styles.cardTitle} style={{ margin: 0 }}>System Safeguards</h3>
          </div>

          <div className={styles.formGroup}>
            <label>Automated Backup Frequency</label>
            <select name="backupFrequency" value={formData.backupFrequency} onChange={handleChange} className={styles.input}>
              <option>Hourly</option>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>

          <div className={styles.infoBox} style={{ marginTop: '12px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: '600' }}>Compliance Status</p>
            <p style={{ margin: 0, fontSize: '11px', color: '#16a34a' }}>✓ HIPAA & GDPR Data Persistence Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}
