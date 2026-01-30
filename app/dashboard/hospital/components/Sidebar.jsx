"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "../HospitalDashboard.module.css";
import logo from "@/public/logo2.svg";

// Icons
import dashboardIcon from "@/public/icons/dashboard.svg"; // For Doctors
import messagesIcon from "@/public/icons/messages.svg";
import scheduleIcon from "@/public/icons/schedule.svg"; // For Appointments
import manageIcon from "@/public/icons/manage.svg"; // For Analytics

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path) => pathname === path;

    // Mock logout
    const handleLogout = () => {
        router.push("/auth/login");
    };

    return (
        <>
            {!isOpen && (
                <button
                    className={styles.mobileToggleBtn}
                    onClick={() => setIsOpen(true)}
                    aria-label="Toggle Menu"
                >
                    ☰
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
                        <button
                            className={styles.closeBtnHidden}
                            onClick={() => setIsOpen(false)}
                        >
                            ✖
                        </button>
                    </div>

                    <div className={styles.navGroup}>
                        <Link
                            href="/dashboard/hospital"
                            className={`${styles.navItem} ${isActive("/dashboard/hospital") ? styles.active : ""}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <img src={dashboardIcon.src} alt="Dashboard" width="18" height="18" />
                            Dashboard
                        </Link>

                        <Link
                            href="/dashboard/hospital/doctors"
                            className={`${styles.navItem} ${isActive("/dashboard/hospital/doctors") ? styles.active : ""}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <img src={dashboardIcon.src} alt="Doctors" width="18" height="18" />
                            Doctors
                        </Link>

                        <Link
                            href="/dashboard/hospital/messages"
                            className={`${styles.navItem} ${isActive("/dashboard/hospital/messages") ? styles.active : ""}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <img src={messagesIcon.src} alt="Messages" width="18" height="18" />
                            Messages
                        </Link>

                        <Link
                            href="/dashboard/hospital/appointments"
                            className={`${styles.navItem} ${isActive("/dashboard/hospital/appointments") ? styles.active : ""}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <img src={scheduleIcon.src} alt="Appointments" width="18" height="18" />
                            Appointments
                        </Link>

                        <Link
                            href="/dashboard/hospital/analytics"
                            className={`${styles.navItem} ${isActive("/dashboard/hospital/analytics") ? styles.active : ""}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <img src={manageIcon.src} alt="Analytics" width="18" height="18" />
                            Analytics
                        </Link>
                    </div>
                </div>

                <button
                    className={styles.logoutBtn}
                    onClick={handleLogout}
                >
                    <span className={styles.logoutIcon}>→</span>
                    Logout
                </button>
            </aside>
        </>
    );
}
