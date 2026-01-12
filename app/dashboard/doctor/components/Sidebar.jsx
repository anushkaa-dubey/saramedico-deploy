"use client";

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

  return (
    <aside className={styles.sidebar}>
      <div>
        <div className={styles.logoRow}>
          <div className={styles.iconPlaceholder}>
            <img src={logo.src} alt="Logo" />
          </div>
        </div>

        <div className={styles.navGroup}>
          <Link
            href="/dashboard/doctor"
            className={`${styles.navItem} ${isActive("/dashboard/doctor") && !pathname.includes("/dashboard/doctor/") ? styles.active : ""}`}
          >
            <img src={dashboardIcon.src} alt="Dashboard" width="18" height="18" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/doctor/live-consult"
            className={`${styles.navItem} ${isActive("/dashboard/doctor/live-consult") ? styles.active : ""}`}
          >
            <img src={liveIcon.src} alt="Live Consult" width="18" height="18" />
            Live Consult
          </Link>
          <Link
            href="/dashboard/doctor/patients"
            className={`${styles.navItem} ${isActive("/dashboard/doctor/patients") ? styles.active : ""}`}
          >
            <img src={patientsIcon.src} alt="Patients" width="18" height="18" />
            Patients
          </Link>
          <Link
            href="/dashboard/doctor/appointments"
            className={`${styles.navItem} ${isActive("/dashboard/doctor/appointments") ? styles.active : ""}`}
          >
            <img src={appointmentsIcon.src} alt="Appointments" width="18" height="18" />
            Appointments
          </Link>
          <Link
            href="/dashboard/doctor/messages"
            className={`${styles.navItem} ${isActive("/dashboard/doctor/messages") ? styles.active : ""}`}
          >
            <img src={messagesIcon.src} alt="Messages" width="18" height="18" />
            Messages
          </Link>
          <Link
            href="/dashboard/doctor/settings"
            className={`${styles.navItem} ${isActive("/dashboard/doctor/settings") ? styles.active : ""}`}
          >
            <img src={settingsIcon.src} alt="Settings" width="18" height="18" />
            Settings
          </Link>
        </div>
      </div>

      <button className={styles.startBtn}>+ Start Session</button>
    </aside>
  );
}
