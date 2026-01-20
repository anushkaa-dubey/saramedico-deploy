"use client";

import styles from "./Settings.module.css";

import { useState } from "react";
import notificationIcon from "@/public/icons/notification.svg";
import searchIcon from "@/public/icons/search.svg";
import lockIcon from "@/public/icons/lock.svg";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    organizationName: "SaraMedico Clinic",
    organizationEmail: "admin@saramedico.com",
    emrSystem: "EPIC Systems",
    emrStatus: "Connected",
    apiKey: "sk_prod_1234567890abcdef",
    apiScope: "Read/Write (Full Access)",
    webhookUrl: "https://api.saramedico.com/webhooks",
    timezone: "UTC-5 (EST)",
    dateFormat: "MM/DD/YYYY",
    backupFrequency: "Daily",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    console.log("Settings saved:", formData);
    alert("Settings saved successfully!");
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Sidebar */}


      {/* Main */}
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
                <span>Dr. Sarah Smith</span>
                <small>Admin</small>
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
              Manage system-wide configurations, EMR integration, security policies, and compliance rules for Organization
            </p>
          </div>
        </div>

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
                value={formData.organizationName}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Organization Email</label>
              <input
                type="email"
                name="organizationEmail"
                value={formData.organizationEmail}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Timezone</label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className={styles.input}
              >
                <option>UTC-5 (EST)</option>
                <option>UTC-6 (CST)</option>
                <option>UTC-7 (MST)</option>
                <option>UTC-8 (PST)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Date Format</label>
              <select
                name="dateFormat"
                value={formData.dateFormat}
                onChange={handleChange}
                className={styles.input}
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
            <p className={styles.cardDescription}>Manage active data pipelines with external medical records systems</p>

            <div className={styles.connectionBox}>
              <div className={styles.connectionLock}>
                <img src={lockIcon.src} alt="Secure" width="16" height="16" />
              </div>
              <div className={styles.connectionInfo}>
                <h4>EPIC Systems</h4>
                <p>Last Sync - 2 mins ago · FHIR R4</p>
              </div>
            </div>

            <div className={styles.connectionBox}>
              <div className={styles.connectionLock}>
                <img src={lockIcon.src} alt="Secure" width="16" height="16" />
              </div>
              <div className={styles.connectionInfo}>
                <h4>Oracle Cerner</h4>
                <p>HL7 v2.x Interface</p>
              </div>
            </div>

            <button className={styles.addBtn}>+ Add New EMR Connection</button>
          </div>

          {/* API & Webhooks */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>API & Webhooks</h3>
            <p className={styles.cardDescription}>Configure API keys and webhook endpoints for third-party integrations</p>

            <div className={styles.formGroup}>
              <label>API Key Name</label>
              <input
                type="text"
                name="apiKey"
                className={styles.input}
                placeholder="Production Server 01"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Scope</label>
              <input
                type="text"
                name="apiScope"
                className={styles.input}
                placeholder="Read/Write (Full Access)"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Webhook URL</label>
              <input
                type="url"
                name="webhookUrl"
                className={styles.input}
                placeholder="https://api.saramedico.com/webhooks"
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
              >
                <option>Hourly</option>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>

            <div className={styles.infoBox}>
              <p><strong>Last Backup:</strong> January 12, 2026 at 2:30 AM</p>
              <p><strong>Next Scheduled Backup:</strong> January 13, 2026 at 2:00 AM</p>
              <p><strong>Backup Storage:</strong> 250 GB / 500 GB</p>
            </div>

            <button className={styles.secondaryBtn}>Backup Now</button>
          </div>
        </div>

        {/* Save Button */}
        <div className={styles.saveButtonContainer}>
          <button className={styles.saveBtn} onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </main>
    </motion.div>
  );
}
