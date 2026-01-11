"use client";

import styles from "./InviteModal.module.css";
import { useState } from "react";

export default function InviteModal({ isOpen, onClose }) {
  const [selectedRole, setSelectedRole] = useState("member");

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Invite Team Members</h2>
          <p className={styles.modalSubtitle}>
            Grant access to your clinic's workspace securely
          </p>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalContent}>
          {/* Form Fields */}
          <div className={styles.formGroup}>
            <label className={styles.label}>FULL NAME</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Your name"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>EMAIL ADDRESS</label>
            <input
              type="email"
              className={styles.input}
              placeholder="drhospital@gmail.com"
            />
          </div>

          {/* Role Selection */}
          <div className={styles.roleSection}>
            <h3 className={styles.roleTitle}>Select Role</h3>
            <div className={styles.roleGrid}>
              {/* Administrator */}
              <div
                className={`${styles.roleCard} ${
                  selectedRole === "admin" ? styles.roleCardActive : ""
                }`}
                onClick={() => setSelectedRole("admin")}
              >
                <div className={styles.roleCardHeader}>
                  <div className={styles.roleIcon}>🔐</div>
                  <div>
                    <h4 className={styles.roleName}>Administrator</h4>
                    <p className={styles.roleAccess}>Full Platform Access</p>
                  </div>
                </div>
                <ul className={styles.roleFeatures}>
                  <li>
                    <span className={styles.checkmark}>✓</span>
                    Manage team & billing
                  </li>
                  <li>
                    <span className={styles.checkmark}>✓</span>
                    Full patient record access
                  </li>
                  <li>
                    <span className={styles.checkmark}>✓</span>
                    Configure AI settings
                  </li>
                </ul>
              </div>

              {/* Member */}
              <div
                className={`${styles.roleCard} ${
                  selectedRole === "member" ? styles.roleCardActive : ""
                }`}
                onClick={() => setSelectedRole("member")}
              >
                <div className={styles.roleCardHeader}>
                  <div className={styles.roleIcon}>👥</div>
                  <div>
                    <h4 className={styles.roleName}>Member</h4>
                    <p className={styles.roleAccess}>Clinician & Staff</p>
                  </div>
                </div>
                <ul className={styles.roleFeatures}>
                  <li>
                    <span className={styles.checkmark}>✓</span>
                    View assigned patients
                  </li>
                  <li>
                    <span className={styles.checkmark}>✓</span>
                    Use AI diagnostic tools
                  </li>
                  <li>
                    <span className={styles.checkmarkDisabled}>✗</span>
                    <span className={styles.disabled}>No billing access</span>
                  </li>
                </ul>
              </div>

              {/* Patient */}
              <div
                className={`${styles.roleCard} ${
                  selectedRole === "patient" ? styles.roleCardActive : ""
                }`}
                onClick={() => setSelectedRole("patient")}
              >
                <div className={styles.roleCardHeader}>
                  <div className={styles.roleIcon}>👤</div>
                  <div>
                    <h4 className={styles.roleName}>Patient</h4>
                    <p className={styles.roleAccess}>Read Only Access</p>
                  </div>
                </div>
                <ul className={styles.roleFeatures}>
                  <li>
                    <span className={styles.checkmark}>✓</span>
                    Check-in appointments
                  </li>
                  <li>
                    <span className={styles.checkmark}>✓</span>
                    Access Records
                  </li>
                  <li>
                    <span className={styles.checkmarkDisabled}>✗</span>
                    <span className={styles.disabled}>No billing access</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className={styles.securityNotice}>
            <div className={styles.noticeIcon}>ℹ</div>
            <div>
              <strong>Security Notice</strong>
              <p>
                The user will receive an email to join the Team. The invitation
                link expired in 4Hours. They will be required to set up
                Two-Factor Authentication (2FA) upon their first login.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.submitBtn}>Save Invite</button>
        </div>
      </div>
    </div>
  );
}
