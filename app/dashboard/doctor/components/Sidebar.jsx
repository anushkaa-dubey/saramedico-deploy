"use client";
import { useState } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "../DoctorDashboard.module.css";
import logo from "@/public/logo.png";
// Icons replaced with inline SVGs
import SignoutModal from "../../../auth/components/SignoutModal";
import { logoutUser } from "@/services/auth";


export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSignoutModalOpen, setIsSignoutModalOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/auth/login");
  };

  const isActive = (path) => pathname === path || pathname.startsWith(path);

  // State for mobile sidebar toggle
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {!isOpen && (
        <button
          className={styles.mobileToggleBtn}
          onClick={() => setIsOpen(true)}
          aria-label="Toggle Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        </button>
      )}

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
              href="/dashboard/doctor"
              className={`${styles.navItem} ${isActive("/dashboard/doctor") && !pathname.includes("/dashboard/doctor/") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
              Dashboard
            </Link>
            <Link
              href="/dashboard/doctor/live-consult"
              className={`${styles.navItem} ${isActive("/dashboard/doctor/live-consult") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z" /></svg>
              Live Consult
            </Link>
            <Link
              href="/dashboard/doctor/chart-review"
              className={`${styles.navItem} ${isActive("/dashboard/doctor/chart-review") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              Chart Review
            </Link>
            <Link
              href="/dashboard/doctor/patients"
              className={`${styles.navItem} ${isActive("/dashboard/doctor/patients") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              Patients
            </Link>
            <Link
              href="/dashboard/doctor/team"
              className={`${styles.navItem} ${isActive("/dashboard/doctor/team") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
              Team
            </Link>
            <Link
              href="/dashboard/doctor/settings"
              className={`${styles.navItem} ${isActive("/dashboard/doctor/settings") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
              Settings
            </Link>
          </div>
        </div>

        <button
          className={styles.startBtn}
          onClick={() => router.push("/dashboard/doctor/video-call")}
        >
          + Start Session
        </button>

        <button
          className={styles.logoutBtn}
          onClick={() => setIsSignoutModalOpen(true)}
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
