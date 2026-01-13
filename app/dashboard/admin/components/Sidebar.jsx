"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../AdminDashboard.module.css";
import logo from "@/public/logo.png";
import dashboardIcon from "@/public/icons/dashboard.svg";
import manageIcon from "@/public/icons/manage.svg";
import settingsIcon from "@/public/icons/settings.svg";

export default function AdminSidebar() {
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
            href="/dashboard/admin"
            className={`${styles.navItem} ${
              isActive("/dashboard/admin") && !pathname.includes("/dashboard/admin/") ? styles.active : ""
            }`}
          >
            <img src={dashboardIcon.src} alt="Dashboard" width="18" height="18" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/admin/manage-accounts"
            className={`${styles.navItem} ${
              isActive("/dashboard/admin/manage-accounts") ? styles.active : ""
            }`}
          >
            <img src={manageIcon.src} alt="Manage" width="18" height="18" />
            Manage Accounts
          </Link>
          <Link
            href="/dashboard/admin/settings"
            className={`${styles.navItem} ${
              isActive("/dashboard/admin/settings") ? styles.active : ""
            }`}
          >
            <img src={settingsIcon.src} alt="Settings" width="18" height="18" />
            Settings
          </Link>
        </div>
      </div>
    </aside>
  );
}
