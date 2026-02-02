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
    const [isStaffOpen, setIsStaffOpen] = useState(false);

    const isActive = (path) => {
        if (path === "/dashboard/hospital") return pathname === path;
        return pathname === path || pathname.startsWith(path + '/');
    };

    // Mock logout
    const handleLogout = () => {
        router.push("/auth/login");
    };

    const navItems = [
        {
            label: "Dashboard", path: "/dashboard/hospital", icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
            )
        },
        {
            label: "Appointments", path: "/dashboard/hospital/appointments", icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            )
        },
        {
            label: "Departments", path: "/dashboard/hospital/departments", icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            )
        },
        {
            label: "Surgery", path: "/dashboard/hospital/surgery", icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z" /></svg>
            )
        },
        {
            label: "Messages", path: "/dashboard/hospital/messages", icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            )
        },
        {
            label: "Analytics", path: "/dashboard/hospital/analytics", icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
            )
        },
    ];

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

                    <nav className={styles.navGroup}>
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`${styles.navItem} ${isActive(item.path) && !item.path.includes('staffs') ? styles.active : ""}`}
                                onClick={() => setIsOpen(false)}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        ))}

                        {/* Staffs Dropdown */}
                        <div className={styles.submenuWrapper}>
                            <div
                                className={`${styles.navItem} ${pathname.includes('/staffs') ? styles.active : ""}`}
                                onClick={() => setIsStaffOpen(!isStaffOpen)}
                                style={{ cursor: 'pointer', justifyContent: 'space-between' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                    Staffs
                                </div>
                                <svg
                                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                    style={{ transform: isStaffOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>

                            {(isStaffOpen || pathname.includes('/staffs')) && (
                                <div className={styles.submenu}>
                                    <Link
                                        href="/dashboard/hospital/staffs/doctors"
                                        className={`${styles.submenuItem} ${isActive("/dashboard/hospital/staffs/doctors") ? styles.subActive : ""}`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Doctors
                                    </Link>
                                    <Link
                                        href="/dashboard/hospital/staffs/nurses"
                                        className={`${styles.submenuItem} ${isActive("/dashboard/hospital/staffs/nurses") ? styles.subActive : ""}`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Nurses
                                    </Link>
                                </div>
                            )}
                        </div>
                    </nav>
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

