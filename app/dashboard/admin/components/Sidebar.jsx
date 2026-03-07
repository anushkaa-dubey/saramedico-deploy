"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "../AdminDashboard.module.css";
import logo from "@/public/logo.png";

import SignoutModal from "../../../auth/components/SignoutModal";
import { logoutUser } from "@/services/auth";

import {
  LayoutDashboard,
  Users,
  Calendar,
  Hospital,
  Settings,
  LogOut
} from "lucide-react";
import path from "path";

export default function AdminSidebar() {

  const pathname = usePathname();
  const router = useRouter();

  const [isSignoutModalOpen, setIsSignoutModalOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/auth/login");
  };
  const isActive = (path) => {
    if (path === "/dashboard/admin") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard/admin",
      icon: <LayoutDashboard size={18} />
    },
    {
      label: "Appointments",
      path: "/dashboard/admin/appointments",
      icon: <Calendar size={18} />
    },
    {
      label: "Clinic Management",
      path: "/dashboard/admin/clinic",
      icon: <Hospital size={18} />
    },
    {
      label: "Manage Accounts",
      path: "/dashboard/admin/manage-accounts",
      icon: <Users size={18} />
    },
    {
      label: "Audit Logs",
      path: "/dashboard/admin/audit-logs",
      icon: <Users size={18} />
    },
    {
      label: "Settings",
      path: "/dashboard/admin/settings",
      icon: <Settings size={18} />
    }
  ];

  return (
    <>
      <aside className={styles.sidebar}>

        {/* Top section */}
        <div className={styles.sidebarTop}>

          {/* Logo */}
          <div className={styles.logoRow}>
            <img src={logo.src} alt="Logo" />
          </div>

          {/* Navigation */}
          <nav className={styles.navGroup}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`${styles.navItem} ${isActive(item.path) ? styles.active : ""
                  }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

        </div>

        {/* Logout */}
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