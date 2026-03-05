"use client";
import { useState } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "../DoctorDashboard.module.css";
import logo from "@/public/logo.png";
import SignoutModal from "../../../auth/components/SignoutModal";
import { logoutUser } from "@/services/auth";
import { LayoutDashboard, Activity, FileText, Users, Settings, Plus, LogOut, Menu, X } from "lucide-react";


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
          <Menu size={24} />
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
              <X size={20} />
            </button>
          </div>

          <div className={styles.navGroup}>
            <Link
              href="/dashboard/doctor"
              className={`${styles.navItem} ${isActive("/dashboard/doctor") && !pathname.includes("/dashboard/doctor/") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link
              href="/dashboard/doctor/live-consult"
              className={`${styles.navItem} ${isActive("/dashboard/doctor/live-consult") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <Activity size={18} />
              Live Consult
            </Link>
            <Link
              href="/dashboard/doctor/chart-review"
              className={`${styles.navItem} ${isActive("/dashboard/doctor/chart-review") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <FileText size={18} />
              Chart Review
            </Link>
            <Link
              href="/dashboard/doctor/patients"
              className={`${styles.navItem} ${isActive("/dashboard/doctor/patients") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <Users size={18} />
              Patients
            </Link>

            <Link
              href="/dashboard/doctor/settings"
              className={`${styles.navItem} ${isActive("/dashboard/doctor/settings") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <Settings size={18} />
              Settings
            </Link>
          </div>
        </div>

        <button
          className={styles.startBtn}
          onClick={() => router.push("/dashboard/doctor/video-call")}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Plus size={18} /> Start Session
        </button>

        <button
          className={styles.logoutBtn}
          onClick={() => setIsSignoutModalOpen(true)}
        >
          <LogOut size={18} className={styles.logoutIcon} />
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
