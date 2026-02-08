"use client";
import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../PatientDashboard.module.css";
import logo from "@/public/logo2.svg";
// Icons replaced with inline SVGs as requested
import SignoutModal from "../../../auth/components/SignoutModal";
import { logoutUser } from "@/services/auth";
import { useRouter } from "next/navigation";


export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSignoutModalOpen, setIsSignoutModalOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/auth/login");
  };

  const isActive = (path) => pathname === path;

  // State for mobile sidebar toggle
  const [isOpen, setIsOpen] = useState(false);


  return (
    <>
      {/* Mobile Toggle Button - Visible only on mobile */}
      {!isOpen && (
        <button
          className={styles.mobileToggleBtn}
          onClick={() => setIsOpen(true)}
          aria-label="Toggle Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        </button>
      )}

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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>

          <div className={styles.navGroup}>
            <Link
              href="/dashboard/patient"
              className={`${styles.navItem} ${isActive("/dashboard/patient") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
              Dashboard
            </Link>

            <Link
              href="/dashboard/patient/records"
              className={`${styles.navItem} ${isActive("/dashboard/patient/records") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              My Records
            </Link>

            <Link
              href="/dashboard/patient/appointments"
              className={`${styles.navItem} ${isActive("/dashboard/patient/appointments") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              Appointments
            </Link>

            <Link
              href="/dashboard/patient/messages"
              className={`${styles.navItem} ${isActive("/dashboard/patient/messages") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              Messages
            </Link>
          </div>
        </div>

        <Link
          href="/dashboard/patient/audio-check"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 16px",
            margin: "0 0 10px 0",
            background: "#3b82f6",
            color: "white",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "14px",
            marginTop: "auto"
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
          Join Session
        </Link>

        <button
          className={styles.logoutBtn}
          onClick={() => setIsSignoutModalOpen(true)}
          style={{ marginTop: "0" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.logoutIcon}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          Logout
        </button>

      </aside>

      <SignoutModal
        isOpen={isSignoutModalOpen}
        onConfirm={handleLogout}
        onCancel={() => setIsSignoutModalOpen(false)}
      />
    </>
  );
}
