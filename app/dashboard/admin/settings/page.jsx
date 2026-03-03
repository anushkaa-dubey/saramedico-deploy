"use client";

import styles from "./Settings.module.css";
import { useState, useEffect } from "react";
import notificationIcon from "@/public/icons/notification.svg";
import searchIcon from "@/public/icons/search.svg";
import lockIcon from "@/public/icons/lock.svg";
import { motion } from "framer-motion";
import {
  fetchAdminSettings,
  updateOrgSettings,
  updateDevSettings,
  updateBackupSettings,
} from "@/services/admin";
import { fetchProfile } from "@/services/doctor";

export default function SettingsPage() {
  const [adminUser, setAdminUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    organizationName: "",
    organizationEmail: "",
    timezone: "UTC-5 (EST)",
    dateFormat: "MM/DD/YYYY",
    backupFrequency: "Daily",
    webhookUrl: "",
    apiScope: "",
  });

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [profile, settingsData] = await Promise.all([
          fetchProfile(),
          fetchAdminSettings(),
        ]);
        setAdminUser(profile);
        if (settingsData) {
          setSettings(settingsData);
          setFormData({
            organizationName:
              settingsData.organization?.name ||
              settingsData.name ||
              "Backend not connected",
            organizationEmail:
              settingsData.organization?.email ||
              settingsData.email ||
              "",
            timezone:
              settingsData.organization?.timezone ||
              settingsData.timezone ||
              "UTC-5 (EST)",
            dateFormat:
              settingsData.organization?.date_format ||
              settingsData.date_format ||
              "MM/DD/YYYY",
            backupFrequency:
              settingsData.backup?.frequency ||
              settingsData.backup_frequency ||
              "Daily",
            webhookUrl:
              settingsData.developer?.webhook_url ||
              settingsData.webhook_url ||
              "",
            apiScope:
              settingsData.developer?.api_scope ||
              settingsData.api_scope ||
              "",
          });
        }
      } catch (err) {
        console.error("Settings init error:", err);
        setError("Backend not connected — settings could not be loaded.");
        setFormData((prev) => ({
          ...prev,
          organizationName: "Backend not connected",
          organizationEmail: "Backend not connected",
        }));
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      await Promise.allSettled([
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
        }),
      ]);
      setSaveMsg("Settings saved successfully!");
    } catch (err) {
      setSaveMsg("Failed to save — backend not connected.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 5000);
    }
  };

  const adminName = adminUser?.full_name || "Admin";

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <main className={styles.main}>
        {/* Topbar */}
        <div className={styles.topbar}>
          <div className={styles.searchWrapper}>
            <img src={searchIcon.src} alt="Search" className={styles.searchIcon} />
            <input
              className={styles.search}
              placeholder="Search settings, reports, notes..."
            />
          </div>

          <div className={styles.topActions}>
            <button className={styles.iconBtn}>
              <img src={notificationIcon.src} alt="Notifications" width="20" height="20" />
            </button>

            <div className={styles.profile}>
              <div className={styles.profileInfo}>
                <span>{loading ? "Loading..." : adminName}</span>
                <small>{adminUser?.role || "Admin"}</small>
              </div>
              <div className={styles.avatar}></div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className={styles.titleRow}>
          <div>
            <h2 className={styles.heading}>System Settings</h2>
            <p className={styles.subtext}>
              Manage system-wide configurations, EMR integration, security policies, and compliance rules for{" "}
              {settings?.organization?.name || settings?.name || "your organization"}.
            </p>
          </div>
        </div>

        {/* Error / Status banners */}
        {error && (
          <div style={{ padding: "14px 20px", background: "#fef2f2", color: "#b91c1c", borderRadius: "10px", marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>
            {error}
          </div>
        )}

        {saveMsg && (
          <div style={{
            padding: "14px 20px",
            background: saveMsg.includes("Failed") ? "#fef2f2" : "#f0fdf4",
            color: saveMsg.includes("Failed") ? "#b91c1c" : "#166534",
            borderRadius: "10px",
            marginBottom: "16px",
            fontSize: "14px",
            fontWeight: "600"
          }}>
            {saveMsg}
          </div>
        )}

        {/* Settings Content */}
        <div className={styles.settingsGrid}>
          {/* Organization Settings */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Organization Settings</h3>
            <p className={styles.cardDescription}>Basic organization information and configuration</p>

            <div className={styles.formGroup}>
              <label>Organization Name</label>
              <input
                type="text"
                name="organizationName"
                value={loading ? "Loading..." : formData.organizationName}
                onChange={handleChange}
                className={styles.input}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Organization Email</label>
              <input
                type="email"
                name="organizationEmail"
                value={loading ? "Loading..." : formData.organizationEmail}
                onChange={handleChange}
                className={styles.input}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Timezone</label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className={styles.input}
                disabled={loading}
              >
                <option>UTC-5 (EST)</option>
                <option>UTC-6 (CST)</option>
                <option>UTC-7 (MST)</option>
                <option>UTC-8 (PST)</option>
                <option>UTC+0 (GMT)</option>
                <option>UTC+5:30 (IST)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Date Format</label>
              <select
                name="dateFormat"
                value={formData.dateFormat}
                onChange={handleChange}
                className={styles.input}
                disabled={loading}
              >
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
          </div>

          {/* EMR & EHR Connections */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>EMR & EHR Connections</h3>
            <p className={styles.cardDescription}>
              Manage active data pipelines with external medical records systems
            </p>

            {loading ? (
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>Loading EMR connections...</p>
            ) : settings?.emr_connections?.length > 0 ? (
              settings.emr_connections.map((conn, i) => (
                <div key={i} className={styles.connectionBox}>
                  <div className={styles.connectionLock}>
                    <img src={lockIcon.src} alt="Secure" width="16" height="16" />
                  </div>
                  <div className={styles.connectionInfo}>
                    <h4>{conn.name || "EMR System"}</h4>
                    <p>{conn.last_sync ? `Last Sync — ${new Date(conn.last_sync).toLocaleString()}` : conn.interface || "Connected"}</p>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: "#94a3b8", padding: "12px", background: "#f8fafc", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                Backend not connected — EMR integrations unavailable.
              </div>
            )}

            <button className={styles.addBtn}>+ Add New EMR Connection</button>
          </div>

          {/* API & Webhooks */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>API & Webhooks</h3>
            <p className={styles.cardDescription}>
              Configure API keys and webhook endpoints for third-party integrations
            </p>

            <div className={styles.formGroup}>
              <label>API Key Name</label>
              <input
                type="text"
                name="apiKey"
                className={styles.input}
                placeholder={loading ? "Loading..." : "Production Server 01"}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Scope</label>
              <input
                type="text"
                name="apiScope"
                className={styles.input}
                value={formData.apiScope}
                onChange={handleChange}
                placeholder="Read/Write (Full Access)"
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Webhook URL</label>
              <input
                type="url"
                name="webhookUrl"
                className={styles.input}
                value={formData.webhookUrl}
                onChange={handleChange}
                placeholder="https://api.saramedico.com/webhooks"
                disabled={loading}
              />
            </div>
          </div>

          {/* Backup & Security */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Backup & Security</h3>
            <p className={styles.cardDescription}>Configure automated backups and security protocols</p>

            <div className={styles.formGroup}>
              <label>Backup Frequency</label>
              <select
                name="backupFrequency"
                value={formData.backupFrequency}
                onChange={handleChange}
                className={styles.input}
                disabled={loading}
              >
                <option>Hourly</option>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>

            <div className={styles.infoBox}>
              {loading ? (
                <p>Loading backup info...</p>
              ) : settings?.backup ? (
                <>
                  <p><strong>Last Backup:</strong> {settings.backup.last_backup ? new Date(settings.backup.last_backup).toLocaleString() : "Backend not connected"}</p>
                  <p><strong>Next Scheduled Backup:</strong> {settings.backup.next_backup ? new Date(settings.backup.next_backup).toLocaleString() : "—"}</p>
                  <p><strong>Backup Storage:</strong> {settings.backup.storage_used || "—"} / {settings.backup.storage_limit || "—"}</p>
                </>
              ) : (
                <>
                  <p><strong>Last Backup:</strong> Backend not connected</p>
                  <p><strong>Next Scheduled Backup:</strong> —</p>
                  <p><strong>Backup Storage:</strong> —</p>
                </>
              )}
            </div>

            <button className={styles.secondaryBtn}>Backup Now</button>
          </div>
        </div>

        {/* Save Button */}
        <div className={styles.saveButtonContainer}>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </main>
    </motion.div>
  );
}
