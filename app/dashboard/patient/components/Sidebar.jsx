"use client";

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

  return (
    <aside className={styles.sidebar}>
      <div>
            <div className={styles.iconPlaceholder}>
            <img src={logo.src}></img>
         </div>
        <Link
          href="/dashboard/patient"
          className={`${styles.navItem} ${isActive("/dashboard/patient") ? styles.active : ""}`}
        >
          <img src={dashboardIcon.src} alt="Dashboard" width="18" height="18" />
          Dashboard
        </Link>

        <Link
          href="/dashboard/patient/records"
          className={`${styles.navItem} ${isActive("/dashboard/patient/records") ? styles.active : ""}`}
        >
          <img src={micIcon.src} alt="Records" width="18" height="18" />
          My Records
        </Link>

        <Link
          href="/dashboard/patient/appointments"
          className={`${styles.navItem} ${isActive("/dashboard/patient/appointments") ? styles.active : ""}`}
        >
          <img src={manageIcon.src} alt="Appointments" width="18" height="18" />
          Appointments
        </Link>

        <Link
          href="/dashboard/patient/messages"
          className={`${styles.navItem} ${isActive("/dashboard/patient/messages") ? styles.active : ""}`}
        >
          <img src={messagesIcon.src} alt="Messages" width="18" height="18" />
          Messages
        </Link>
      </div>

      {/* <button className={styles.joinBtn}>＋ Join Session</button> */}
     <Link href="/dashboard/patient/audio-check" className={styles.joinBtn}>
      + Join Session
     </Link>

    </aside>
  );
}
