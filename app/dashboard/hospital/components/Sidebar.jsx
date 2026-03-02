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
            label: "Approval Queue", path: "/dashboard/hospital/approval-queue", icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            )
        },
        {
            label: "Appointments", path: "/dashboard/hospital/appointments", icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            )
        }
    ];

    const [isDeptOpen, setIsDeptOpen] = useState(true);

    return (
        <>
            {!isOpen && (
                <button
                    className={styles.mobileToggleBtn}
                    onClick={() => setIsOpen(true)}
                    aria-label="Toggle Menu"
                    style={{ background: 'white', border: '1px solid #e2e8f0' }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
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
                    <div className={styles.logoRow} style={{ marginBottom: '32px' }}>
                        <div className={styles.iconPlaceholder}>
                            <img src={logo.src} alt="Logo" style={{ width: '130px' }} />
                        </div>
                    </div>

                    <nav className={styles.navGroup} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`${styles.navItem} ${isActive(item.path) && !pathname.includes('departments') ? styles.active : ""}`}
                                onClick={() => setIsOpen(false)}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        ))}

                        <div className={styles.submenuWrapper}>
                            <div
                                className={`${styles.navItem} ${pathname.includes('/departments') ? styles.active : ""}`}
                                onClick={() => setIsDeptOpen(!isDeptOpen)}
                                style={{ cursor: 'pointer', justifyContent: 'space-between' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><path d="M9 3v18" /><path d="m3 9 6-6" /><path d="m3 15 6 6" /></svg>
                                    Departments
                                </div>
                                <svg
                                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                    style={{ transform: isDeptOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.5 }}
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>

                            {isDeptOpen && (
                                <div className={styles.submenu} style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '4px 0 8px 48px' }}>
                                    {[
                                        { label: "Cardiology", path: "/dashboard/hospital/departments/cardiology" },
                                        { label: "Emergency (ER)", path: "/dashboard/hospital/departments/emergency" }
                                    ].map((dept, i) => (
                                        <Link
                                            key={i}
                                            href={dept.path}
                                            className={styles.submenuItem}
                                            onClick={() => setIsOpen(false)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontSize: '14px',
                                                color: pathname.includes(dept.path) ? '#0f172a' : '#64748b',
                                                textDecoration: 'none',
                                                padding: '8px 0',
                                                fontWeight: pathname.includes(dept.path) ? '700' : '500'
                                            }}
                                        >
                                            <svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.4 }}><circle cx="12" cy="12" r="10" /></svg>
                                            {dept.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link
                            href="/dashboard/hospital/staff-management"
                            className={`${styles.navItem} ${pathname.includes('staff-management') ? styles.active : ""}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                            Staff Management
                        </Link>

                        <Link
                            href="/dashboard/hospital/settings"
                            className={`${styles.navItem} ${pathname.includes('settings') ? styles.active : ""}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                            Settings
                        </Link>

                        <Link
                            href="/dashboard/hospital/audit-logs"
                            className={`${styles.navItem} ${pathname.includes('audit-logs') ? styles.active : ""}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            Audit Logs
                        </Link>
                    </nav>
                </div>

                <button
                    className={styles.logoutBtn}
                    onClick={handleLogout}
                    style={{ margin: '0 12px 24px', width: 'calc(100% - 24px)', background: 'transparent', border: '1px solid #e2e8f0', color: '#64748b' }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '10px' }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    Logout
                </button>
            </aside>
        </>
    );
}
