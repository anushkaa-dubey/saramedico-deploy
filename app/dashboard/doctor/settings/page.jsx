"use client";

import { usePathname } from "next/navigation";
import styles from "./Settings.module.css";

export default function DoctorSettings() {
  const pathname = usePathname();

  const isActive = (section) =>
    pathname === `/dashboard/doctor/settings` || pathname.includes(section);

  const menuItems = [
    { label: "My Profile", id: "profile" },
    { label: "Billings & Plans", id: "billing" },
    { label: "Team Members", id: "team" },
    { label: "Notifications", id: "notifications" },
  ];

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.sidebarItem} ${
              isActive(item.id) ? styles.active : ""
            }`}
          >
            {item.label}
          </button>
        ))}
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.description}>
            Manage your account details, billing subscription, team permissions.
          </p>
        </div>

        <div className={styles.content}>
          <div className={styles.profileSection}>
            {/* Profile Header */}
            <div className={styles.profileHeader}>
              <div className={styles.profileAvatar}></div>
              <div className={styles.profileInfo}>
                <h2 className={styles.profileName}>Dr. Sarah Smith</h2>
                <p className={styles.profileRole}>MD, CARDIOLOGY</p>
              </div>
            </div>

            {/* My Profile Form */}
            <div className={styles.formSection}>
              <h3 className={styles.formTitle}>My Profile</h3>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Your name"
                    defaultValue="Dr. Sarah Smith"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address</label>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="@hospital.gmail.com"
                    defaultValue="drsarah@hospital.gmail.com"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Credential</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="MD, MBBS"
                    defaultValue="MD, CARDIOLOGY"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Speciality</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Cardiology"
                    defaultValue="Cardiology"
                  />
                </div>
              </div>

              <div className={styles.buttonGroup}>
                <button className={styles.cancelBtn}>Cancel</button>
                <button className={styles.saveBtn}>Save Changes</button>
              </div>
            </div>

            {/* Additional Settings Cards */}
            <div className={styles.cardsGrid}>
              {/* Password Card */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon}>🔒</div>
                  <h3 className={styles.cardTitle}>Password</h3>
                </div>
                <p className={styles.cardDescription}>
                  Last changed 3 months ago. We recommend changing every 90 days
                </p>
                <button className={styles.cardButton}>Change Password</button>
              </div>

              {/* MFA Setup Card */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon}>🔐</div>
                  <h3 className={styles.cardTitle}>MFA Setup</h3>
                  <span className={styles.cardBadge}>Enabled</span>
                </div>
                <p className={styles.cardDescription}>
                  Multi-factor authentication is currently active via authenticator
                  App.
                </p>
                <button className={styles.cardButton}>Manage</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
