"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "../HospitalDashboard.module.css";
import logo from "@/public/logo.png";
import dashboardIcon from "@/public/icons/dashboard.svg";
import manageIcon from "@/public/icons/manage.svg";
import settingsIcon from "@/public/icons/settings.svg";
import docIcon from "@/public/icons/docs.svg";
import SignoutModal from "../../../auth/components/SignoutModal";
import { logoutUser } from "@/services/auth";

export default function HospitalSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isSignoutModalOpen, setIsSignoutModalOpen] = useState(false);
    const [isDeptOpen, setIsDeptOpen] = useState(true);

    const handleLogout = async () => {
        await logoutUser();
        router.push("/auth/login");
    };

    const isActive = (path) => pathname === path || pathname.startsWith(path);

    return (
        <>
            {!isOpen && (
                <button className={styles.mobileToggleBtn} onClick={() => setIsOpen(true)}>
                    ☰
                </button>
            )}

            {isOpen && <div className={styles.mobileOverlay} onClick={() => setIsOpen(false)} />}

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
                <div>
                    <div className={styles.logoRow}>
                        <div className={styles.iconPlaceholder}>
                            <img src={logo.src} alt="Logo" />
                        </div>
                        <button className={styles.closeBtnHidden} onClick={() => setIsOpen(false)}>
                            ✖
                        </button>
                    </div>

                    <div className={styles.navGroup}>
                        <Link href="/dashboard/hospital" className={`${styles.navItem} ${isActive("/dashboard/hospital") && pathname === "/dashboard/hospital" ? styles.active : ""}`}>
                            <img src={dashboardIcon.src} alt="Dashboard" width="18" height="18" />
                            Dashboard
                        </Link>

                        <div className={styles.navSection}>
                            <button className={styles.navItem} onClick={() => setIsDeptOpen(!isDeptOpen)}>
                                <img src={manageIcon.src} alt="Departments" width="18" height="18" />
                                Departments & Roles
                            </button>

                            {isDeptOpen && (
                                <div className={styles.subDept}>
                                    <div className={styles.deptMain}>
                                        <img src={manageIcon.src} alt="" width="14" height="14" />
                                        General Hospital
                                    </div>
                                    <div className={styles.subItems}>
                                        <Link href="/dashboard/hospital/cardiology" className={`${styles.subItem} ${isActive("/dashboard/hospital/cardiology") ? styles.activeSub : ""}`}>
                                            Cardiology
                                        </Link>
                                        <Link href="/dashboard/hospital/emergency" className={`${styles.subItem}`}>
                                            Emergency (ER)
                                        </Link>
                                        <Link href="/dashboard/hospital/radiology" className={`${styles.subItem}`}>
                                            Radiology
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link href="/dashboard/hospital/audit-logs" className={styles.navItem}>
                            <img src={docIcon.src} alt="Audit Logs" width="18" height="18" />
                            Audit Logs
                        </Link>
                        <Link href="/dashboard/hospital/settings" className={styles.navItem}>
                            <img src={settingsIcon.src} alt="Settings" width="18" height="18" />
                            Settings
                        </Link>
                    </div>
                </div>

                <button className={styles.logoutBtn} onClick={() => setIsSignoutModalOpen(true)}>
                    <span className={styles.logoutIcon}>→</span>
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
