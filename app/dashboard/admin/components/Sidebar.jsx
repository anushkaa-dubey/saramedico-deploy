"use client";

import { useState, useEffect } from "react";
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
  LogOut,
  Menu
} from "lucide-react";

export default function AdminSidebar() {

  const pathname = usePathname();
  const router = useRouter();

  const [isSignoutModalOpen, setIsSignoutModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
      {/* Mobile Hamburger */}
      {isMobile && !isOpen && (
        <button
          className={styles.mobileToggleBtn}
          onClick={() => setIsOpen(true)}
          aria-label="Toggle Menu"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Overlay */}
      {isMobile && isOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isMobile && isOpen ? styles.open : ""}`}>

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
                className={`${styles.navItem} ${isActive(item.path) ? styles.active : ""}`}
                onClick={() => isMobile && setIsOpen(false)}
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

      {/* Signout Modal */}
      <SignoutModal
        isOpen={isSignoutModalOpen}
        onConfirm={handleLogout}
        onCancel={() => setIsSignoutModalOpen(false)}
      />
    </>
  );
}