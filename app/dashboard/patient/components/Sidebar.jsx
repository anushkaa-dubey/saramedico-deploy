"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../PatientDashboard.module.css";

export default function Sidebar() {
  const pathname = usePathname();
  const isActive = (path) => pathname === path;

  return (
    <aside className={styles.sidebar}>
      <div>
        {/* LOGO PLACEHOLDER */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "#e5e7eb" }} />
          <strong>Saramedico</strong>
        </div>
        <Link
          href="/dashboard/patient"
          className={`${styles.navItem} ${isActive("/dashboard/patient") ? styles.active : ""}`}
        >
          Dashboard
        </Link>

        <Link
          href="/dashboard/patient/records"
          className={`${styles.navItem} ${isActive("/dashboard/patient/records") ? styles.active : ""}`}
        >
          My Records
        </Link>

        <Link
          href="/dashboard/patient/appointments"
          className={`${styles.navItem} ${isActive("/dashboard/patient/appointments") ? styles.active : ""}`}
        >
          Appointments
        </Link>

        <Link
          href="/dashboard/patient/messages"
          className={`${styles.navItem} ${isActive("/dashboard/patient/messages") ? styles.active : ""}`}
        >
          Messages
        </Link>
      </div>

      <button className={styles.joinBtn}>＋ Join Session</button>
    </aside>
  );
}
