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
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  Calendar,
  Hospital,
  UserCircle,
  Layers
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSignoutModalOpen, setIsSignoutModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/auth/login");
  };

  const isActive = (path) => pathname === path || pathname.startsWith(path);

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
      label: "Departments & Roles",
      path: "/dashboard/admin/departments",
      icon: <Layers size={18} />
    },
    {
      label: "Team Management",
      path: "/dashboard/admin/manage-accounts",
      icon: <Users size={18} />
    },
    {
      label: "Audit Logs",
      path: "/dashboard/admin/audit-logs",
      icon: <FileText size={18} />
    },
    {
      label: "Settings",
      path: "/dashboard/admin/settings",
      icon: <Settings size={18} />
    }
  ];

  return (
    <>
      {/* {!isOpen && (
        <button
          className={styles.mobileToggleBtn}
          onClick={() => setIsOpen(true)}
          aria-label="Toggle Menu"
        >
          <Menu size={24} />
        </button>
      )} */}

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
            {/* <button
              className={styles.closeBtnHidden}
              onClick={() => setIsOpen(false)}
            > */}
            {/* <X size={20} />
          </button> */}
          </div>

          <nav className={styles.navGroup}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`${styles.navItem} ${isActive(item.path) && (item.path !== "/dashboard/admin" || pathname === "/dashboard/admin") ? styles.active : ""}`}
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <button
          className={styles.logoutBtn}
          onClick={() => setIsSignoutModalOpen(true)}
        >
          <LogOut size={18} className={styles.logoutIcon} />
          Logout
        </button>
      </aside >

      <SignoutModal
        isOpen={isSignoutModalOpen}
        onConfirm={handleLogout}
        onCancel={() => setIsSignoutModalOpen(false)}
      />
    </>
  );
}
