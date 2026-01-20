"use client";

import styles from "./InvitePage.module.css";

import Link from "next/link";
import notificationIcon from "@/public/icons/notification.svg";
import searchIcon from "@/public/icons/search.svg";
import lockIcon from "@/public/icons/lock.svg";
import manageIcon from "@/public/icons/manage.svg";
import personIcon from "@/public/icons/person.svg";
import { useState } from "react";

export default function InviteTeamPage() {
  const [selectedRole, setSelectedRole] = useState("Member");
  return (
    <div className={styles.container}>
      {/* Sidebar */}
      

      {/* Main */}
      <main className={styles.main}>
        {/* Mobile Header */}
        <div className={styles.mobileHeader}>
          <Link href="/dashboard/admin/manage-accounts" className={styles.backArrow}>
            ←
          </Link>
          <div className={styles.mobileTitle}>Invite Members</div>
          <div className={styles.headerPlaceholder}></div>
        </div>

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

        {/* Modal Content */}
        <div className={styles.modalContainer}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Invite Team Members</h2>
              <p className={styles.modalSubtitle}>
                Grant access to your clinic's workspace securely
              </p>
            </div>

            <div className={styles.formContent}>
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
            </div>

            {/* Role Selection */}
            <div className={styles.roleSection}>
              <h3 className={styles.roleTitle}>User Role</h3>
              <div className={styles.roleGrid}>
                {/* Administrator */}
                <div
                  className={`${styles.roleCard} ${selectedRole === "Administrator" ? styles.roleCardActive : ""}`}
                  onClick={() => setSelectedRole("Administrator")}
                >
                  <div className={styles.roleCardHeader}>
                    <div className={styles.roleIcon}>
                      <img src={lockIcon.src} alt="Admin" width="20" height="20" />
                    </div>
                    <div>
                      <h4 className={styles.roleName}>Administrator</h4>
                      <p className={styles.roleAccess}>Full Platform Access</p>
                    </div>
                  </div>
                  <ul className={styles.roleFeatures}>
                    <li><span className={styles.checkmark}>✓</span> Manage team & billing</li>
                    <li><span className={styles.checkmark}>✓</span> Full patient record access</li>
                    <li><span className={styles.checkmark}>✓</span> Configure AI settings</li>
                  </ul>
                </div>

                {/* Member */}
                <div
                  className={`${styles.roleCard} ${selectedRole === "Member" ? styles.roleCardActive : ""}`}
                  onClick={() => setSelectedRole("Member")}
                >
                  <div className={styles.roleCardHeader}>
                    <div className={styles.roleIcon}>
                      <img src={manageIcon.src} alt="Member" width="20" height="20" />
                    </div>
                    <div>
                      <h4 className={styles.roleName}>Member</h4>
                      <p className={styles.roleAccess}>Clinician & Staff</p>
                    </div>
                  </div>
                  <ul className={styles.roleFeatures}>
                    <li><span className={styles.checkmark}>✓</span> View assigned patients</li>
                    <li><span className={styles.checkmark}>✓</span> Use AI diagnostic tools</li>
                    <li><span className={styles.checkmarkDisabled}>✗</span> <span className={styles.disabled}>No billing access</span></li>
                  </ul>
                </div>

                {/* Patient */}
                <div
                  className={`${styles.roleCard} ${selectedRole === "Patient" ? styles.roleCardActive : ""}`}
                  onClick={() => setSelectedRole("Patient")}
                >
                  <div className={styles.roleCardHeader}>
                    <div className={styles.roleIcon}>
                      <img src={personIcon.src} alt="Patient" width="20" height="20" />
                    </div>
                    <div>
                      <h4 className={styles.roleName}>Patient</h4>
                      <p className={styles.roleAccess}>Read Only Access</p>
                    </div>
                  </div>
                  <ul className={styles.roleFeatures}>
                    <li><span className={styles.checkmark}>✓</span> Check-in appointments</li>
                    <li><span className={styles.checkmark}>✓</span> Access Records</li>
                    <li><span className={styles.checkmarkDisabled}>✗</span> <span className={styles.disabled}>No billing access</span></li>
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
                  link expired in 48hours. They will be required to set up
                  Two-Factor Authentication (2FA) upon their first login.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={styles.modalFooter}>
              <Link href="/dashboard/admin/manage-accounts" className={styles.cancelBtn}>
                Cancel
              </Link>
              <button className={styles.submitBtn}>Save Invite</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
