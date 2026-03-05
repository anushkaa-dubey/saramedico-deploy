"use client";

import styles from "./InvitePage.module.css";

import Link from "next/link";
import notificationIcon from "@/public/icons/notification.svg";

import lockIcon from "@/public/icons/lock.svg";
import manageIcon from "@/public/icons/manage.svg";
import personIcon from "@/public/icons/person.svg";
import { useState, useEffect } from "react";
import { fetchProfile } from "@/services/doctor";
import { adminInviteMember } from "@/services/admin";
import { useRouter } from "next/navigation";

export default function InviteTeamPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("admin");
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: ""
  });

  useEffect(() => {
    fetchProfile()
      .then(p => setAdminUser(p))
      .catch(() => { });
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await adminInviteMember({
        ...formData,
        role: selectedRole
      });
      setSuccess("Invitation sent successfully!");
      setTimeout(() => router.push("/dashboard/admin/manage-accounts"), 2000);
    } catch (err) {
      setError(err.message || "Failed to send invitation. Backend not connected.");
    } finally {
      setLoading(true); // Keep loading state if redirecting
    }
  };

  const adminName = adminUser?.full_name || adminUser?.first_name || "Admin";
  return (
    <>
      {/* Mobile Header */}
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
        <div className={styles.topActions} style={{ marginLeft: "auto" }}>
          <button className={styles.iconBtn}>
            <img src={notificationIcon.src} alt="Notifications" width="20" height="20" />
          </button>

          <div className={styles.profile}>
            <div className={styles.profileInfo}>
              <span>{adminName}</span>
              <small>{adminUser?.role || "Admin"}</small>
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
              Grant access to your clinic&apos;s workspace securely
            </p>
          </div>

          <div className={styles.formContent}>
            {error && <div style={{ color: "#ef4444", marginBottom: "12px", fontSize: "13px" }}>{error}</div>}
            {success && <div style={{ color: "#10b981", marginBottom: "12px", fontSize: "13px" }}>{success}</div>}

            <div className={styles.formGroup}>
              <label className={styles.label}>FULL NAME</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Employee Name"
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>EMAIL ADDRESS</label>
              <input
                type="email"
                className={styles.input}
                placeholder="user@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className={styles.roleSection}>
            <h3 className={styles.roleTitle}>User Role</h3>
            <div className={styles.roleGrid}>
              {/* Administrator */}
              <div
                className={`${styles.roleCard} ${selectedRole === "admin" ? styles.roleCardActive : ""}`}
                onClick={() => setSelectedRole("admin")}
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

              {/* Doctor */}
              <div
                className={`${styles.roleCard} ${selectedRole === "doctor" ? styles.roleCardActive : ""}`}
                onClick={() => setSelectedRole("doctor")}
              >
                <div className={styles.roleCardHeader}>
                  <div className={styles.roleIcon}>
                    <img src={manageIcon.src} alt="Doctor" width="20" height="20" />
                  </div>
                  <div>
                    <h4 className={styles.roleName}>Doctor</h4>
                    <p className={styles.roleAccess}>Clinician Access</p>
                  </div>
                </div>
                <ul className={styles.roleFeatures}>
                  <li><span className={styles.checkmark}>✓</span> View assigned patients</li>
                  <li><span className={styles.checkmark}>✓</span> Use AI diagnostic tools</li>
                  <li><span className={styles.checkmarkDisabled}>✗</span> <span className={styles.disabled}>No billing access</span></li>
                </ul>
              </div>

              {/* Staff */}
              <div
                className={`${styles.roleCard} ${selectedRole === "staff" ? styles.roleCardActive : ""}`}
                onClick={() => setSelectedRole("staff")}
              >
                <div className={styles.roleCardHeader}>
                  <div className={styles.roleIcon}>
                    <img src={personIcon.src} alt="Staff" width="20" height="20" />
                  </div>
                  <div>
                    <h4 className={styles.roleName}>Other Staff</h4>
                    <p className={styles.roleAccess}>Clerks & Admins</p>
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
          {/* MFA Security Notice Commented Out */}
          {/*
            <div className={styles.securityNotice}>
              ...
            </div>
            */}

          {/* Modal Footer */}
          <div className={styles.modalFooter}>
            <Link href="/dashboard/admin/manage-accounts" className={styles.cancelBtn}>
              Cancel
            </Link>
            <button
              className={styles.submitBtn}
              onClick={handleInvite}
              disabled={loading}
            >
              {loading ? "Sending..." : "Save Invite"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
