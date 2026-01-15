"use client";
import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../DoctorDashboard.module.css";
import logo from "@/public/logo.png";
import dashboardIcon from "@/public/icons/dashboard.svg";
import liveIcon from "@/public/icons/dashboard.svg";
import patientsIcon from "@/public/icons/manage.svg";
import appointmentsIcon from "@/public/icons/settings.svg";
import messagesIcon from "@/public/icons/messages.svg";
import settingsIcon from "@/public/icons/settings.svg";

export default function Sidebar() {
  const pathname = usePathname();
  const isActive = (path) => pathname === path || pathname.startsWith(path);

  // State for mobile sidebar toggle
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button - Visible only on mobile */}
      <button
        className={styles.mobileToggleBtn}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Menu"
      >
        {isOpen ? "✖" : "☰"}
      </button>

      {/* Overlay to close on click outside (optional but good UX) */}
      {isOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div>
          <div className={styles.logoRow}>
            <div className={styles.iconPlaceholder}>
              <img src={logo.src} alt="Logo" />
            </div>
            {/* Optional: Close button inside sidebar for mobile */}
            <button
              className={styles.closeBtnHidden}
              onClick={() => setIsOpen(false)}
            >
              ✖
            </button>
          </div>

          <div className={styles.navGroup}>
            <Link
              href="/dashboard/doctor"
              className={`${styles.navItem} ${isActive("/dashboard/doctor") && !pathname.includes("/dashboard/doctor/") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <img src={dashboardIcon.src} alt="Dashboard" width="18" height="18" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/doctor/live-consult"
              className={`${styles.navItem} ${isActive("/dashboard/doctor/live-consult") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <img src={liveIcon.src} alt="Live Consult" width="18" height="18" />
              Live Consult
            </Link>
            <Link
              href="/dashboard/doctor/patients"
              className={`${styles.navItem} ${isActive("/dashboard/doctor/patients") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <img src={patientsIcon.src} alt="Patients" width="18" height="18" />
              Patients
            </Link>
            <Link
              href="/dashboard/doctor/team"
              className={`${styles.navItem} ${isActive("/dashboard/doctor/team") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <img src={appointmentsIcon.src} alt="Team" width="18" height="18" />
              Team
            </Link>
            <Link
              href="/dashboard/doctor/settings"
              className={`${styles.navItem} ${isActive("/dashboard/doctor/settings") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <img src={settingsIcon.src} alt="Settings" width="18" height="18" />
              Settings
            </Link>
          </div>
        </div>

        <button className={styles.startBtn}>+ Start Session</button>
      </aside>
    </>
  );
}
