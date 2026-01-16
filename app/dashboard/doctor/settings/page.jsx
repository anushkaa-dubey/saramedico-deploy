"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./Settings.module.css";
import profileIcon from "@/public/icons/profile.svg";
import billIcon from "@/public/icons/bill.svg";
import manageIcon from "@/public/icons/manage.svg";
import notificationIcon from "@/public/icons/notification.svg";
import lock from "@/public/icons/lock.svg";
import notification from "@/public/icons/notification.svg";
import mfa from "@/public/icons/MFA.svg";
import { useState } from "react";

export default function DoctorSettings() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => pathname === path || pathname.startsWith(path);

  const menuItems = [
    {
      label: "My profile",
      path: "/dashboard/doctor/settings/profile",
      icon: profileIcon
    },
    {
      label: "Billings & Plans",
      path: "/dashboard/doctor/settings/billing",
      icon: billIcon
    },
    {
      label: "Team Members",
      path: "/dashboard/doctor/settings/team",
      icon: manageIcon
    },
    {
      label: "Notifications",
      path: "/dashboard/doctor/settings/notifications",
      icon: notificationIcon
    },
  ];

  return (
    <div className={styles.container}>
      {/* Mobile Toggle & Back Button */}
      <div className={styles.mobileHeader}>
        {!isOpen && (
          <button
            className={styles.mobileToggleBtn}
            onClick={() => setIsOpen(true)}
          >
            ☰
          </button>
        )}
        <button
          className={styles.mobileBackBtn}
          onClick={() => router.push("/dashboard/doctor")}
        >
          ←
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }} className={styles.sidebarTop}>
            <button
              className={styles.backBtn}
              onClick={() => router.push("/dashboard/doctor")}
            >
              ←
            </button>
            <button
              className={styles.closeBtnHidden}
              onClick={() => setIsOpen(false)}
            >
              ✖
            </button>
          </div>

          <div className={styles.navGroup}>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`${styles.navItem} ${isActive(item.path) ? styles.active : ""
                  }`}
              >
                <img src={item.icon.src} alt={item.label} width="18" height="18" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <button className={styles.logoutBtn}>
          <span>→</span>
          Log Out
        </button>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {/* Topbar */}
        <div className={styles.topbar}>
          <input
            className={styles.search}
            placeholder="Search settings, reports, notes..."
          />
          <div className={styles.topActions}>
            <button className={styles.iconBtn}><Image src={notification.src} alt="Notification" width="18" height="18" /> </button>
            <div className={styles.profile}>
              <div className={styles.avatar}></div>
              <div>
                <strong>Dr. Sarah Smith</strong>
                <p>Cardiology</p>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.description}>
            Manage your account details, billing subscription, team permissions.
          </p>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Profile Card */}
          <div className={styles.profileCard}>
            <h2 className={styles.profileCardTitle}>My Profile</h2>
            <div className={styles.profileCardContent}>
              <div className={styles.profileAvatar}></div>
              <div className={styles.profileInfo}>
                <h3>Dr. Sarah Smith</h3>
                <p>MD, CARDIOLOGY</p>
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label className={styles.label}>FULL NAME</label>
                <input className={styles.input} placeholder="Your name" />
              </div>
              <div className={styles.formField}>
                <label className={styles.label}>EMAIL ADDRESS</label>
                <input className={styles.input} placeholder="drhospital@gmail.com" />
              </div>
              <div className={styles.formField}>
                <label className={styles.label}>CREDENTIAL</label>
                <input className={styles.input} placeholder="MD, MBBS" />
              </div>
              <div className={styles.formField}>
                <label className={styles.label}>SPECIALITY</label>
                <input className={styles.input} placeholder="Cardiology" />
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button className={styles.cancelBtn}>Cancel</button>
              <button className={styles.saveBtn}>Save Changes</button>
            </div>
          </div>

          {/* Bottom Cards */}
          <div className={styles.cardsGrid}>
            <div className={styles.card}>
              <div className={styles.cardTitleRow}>
                <span className={styles.cardIcon}><Image src={lock.src} alt="Lock" width="18" height="18" /></span>
                <h3>Password</h3>
              </div>
              <p>Last changed 3 months ago. We recommend changing every 90 days.</p>
              <button className={styles.cardButton}>Change Password</button>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitleRow}>
                <span className={styles.cardIcon}><Image src={mfa.src} alt="MFA" width="18" height="18" /></span>
                <h3>MFA Setup</h3>
                <span className={styles.badge}>Enabled</span>
              </div>
              <p>
                Multi-factor authentication is currently active via authenticator
                App.
              </p>
              <button className={styles.cardButton}>Manage</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
