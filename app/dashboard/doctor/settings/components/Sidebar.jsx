"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../Settings.module.css";
import profileIcon from "@/public/icons/profile.svg";
import billIcon from "@/public/icons/bill.svg";
import manageIcon from "@/public/icons/manage.svg";
import notificationIcon from "@/public/icons/notification.svg";
import { useState } from "react";

export default function SettingsSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path) => pathname === path || pathname.startsWith(path);

    const menuItems = [
        {
            label: "My profile",
            path: "/dashboard/doctor/settings/profile",
            icon: profileIcon
        },
        {
            label: "Billings & Plans",
            path: "/dashboard/doctor/settings/billing",
            icon: billIcon
        },
        {
            label: "Team Members",
            path: "/dashboard/doctor/settings/team",
            icon: manageIcon
        },
        {
            label: "Notifications",
            path: "/dashboard/doctor/settings/notifications",
            icon: notificationIcon
        },
    ];

    return (
        <>
            {/* Mobile Toggle & Back Button */}
            <div className={styles.mobileHeader}>
                {!isOpen && (
                    <button
                        className={styles.mobileToggleBtn}
                        onClick={() => setIsOpen(true)}
                    >
                        ☰
                    </button>
                )}
                <button
                    className={styles.mobileBackBtn}
                    onClick={() => router.push("/dashboard/doctor")}
                >
                    ←
                </button>
            </div>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className={styles.mobileOverlay}
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }} className={styles.sidebarTop}>
                        <button
                            className={styles.backBtn}
                            onClick={() => router.push("/dashboard/doctor")}
                        >
                            ←
                        </button>
                        <button
                            className={styles.closeBtnHidden}
                            onClick={() => setIsOpen(false)}
                        >
                            ✖
                        </button>
                    </div>

                    <div className={styles.navGroup}>
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`${styles.navItem} ${isActive(item.path) ? styles.active : ""
                                    }`}
                            >
                                <img src={item.icon.src} alt={item.label} width="18" height="18" />
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <button className={styles.logoutBtn}>
                    <span>→</span>
                    Log Out
                </button>
            </aside>
        </>
    );
}
