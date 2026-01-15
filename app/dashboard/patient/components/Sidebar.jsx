"use client";
import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../PatientDashboard.module.css";
import logo from "@/public/logo.png";
import dashboardIcon from "@/public/icons/dashboard.svg";
import micIcon from "@/public/icons/mic.svg";
import manageIcon from "@/public/icons/manage.svg";
import messagesIcon from "@/public/icons/messages.svg";

export default function Sidebar() {
  const pathname = usePathname();
  const isActive = (path) => pathname === path;

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
              href="/dashboard/patient"
              className={`${styles.navItem} ${isActive("/dashboard/patient") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <img src={dashboardIcon.src} alt="Dashboard" width="18" height="18" />
              Dashboard
            </Link>

            <Link
              href="/dashboard/patient/records"
              className={`${styles.navItem} ${isActive("/dashboard/patient/records") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <img src={micIcon.src} alt="Records" width="18" height="18" />
              My Records
            </Link>

            <Link
              href="/dashboard/patient/appointments"
              className={`${styles.navItem} ${isActive("/dashboard/patient/appointments") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <img src={manageIcon.src} alt="Appointments" width="18" height="18" />
              Appointments
            </Link>

            <Link
              href="/dashboard/patient/messages"
              className={`${styles.navItem} ${isActive("/dashboard/patient/messages") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <img src={messagesIcon.src} alt="Messages" width="18" height="18" />
              Messages
            </Link>
          </div>
        </div>

        <Link href="/dashboard/patient/audio-check" className={styles.joinBtn}>
          + Join Session
        </Link>
      </aside>
    </>
  );
}
