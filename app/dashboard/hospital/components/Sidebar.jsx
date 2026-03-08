"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { logoutUser } from "@/services/auth";
import { usePathname, useRouter } from "next/navigation";
import styles from "../HospitalDashboard.module.css";
import logo from "@/public/logo2.svg";
import {
    LayoutDashboard, Calendar, Users, Menu, LogOut,
    Building2, Stethoscope, BarChart2, MessageSquare, Settings
} from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path) => {
        if (path === "/dashboard/hospital") return pathname === path;
        return pathname === path || pathname.startsWith(path + "/");
    };

    const handleLogout = async () => {
        await logoutUser();
        router.push("/auth/login");
    };

    const navItems = [
        { label: "Dashboard", path: "/dashboard/hospital", icon: <LayoutDashboard size={18} /> },
        { label: "Appointments", path: "/dashboard/hospital/appointments", icon: <Calendar size={18} /> },
        { label: "Patients", path: "/dashboard/hospital/patients", icon: <Users size={18} /> },
        { label: "Doctors", path: "/dashboard/hospital/doctors", icon: <Stethoscope size={18} /> },
        { label: "Departments & Roles", path: "/dashboard/hospital/departments", icon: <Building2 size={18} /> },
        { label: "Staff Management", path: "/dashboard/hospital/staff-management", icon: <Users size={18} /> },
        // { label: "Analytics", path: "/dashboard/hospital/analytics", icon: <BarChart2 size={18} /> },
        // { label: "Messages", path: "/dashboard/hospital/messages", icon: <MessageSquare size={18} /> },
        { label: "Settings", path: "/dashboard/hospital/settings", icon: <Settings size={18} /> },
    ];


    return (
        <>
            {/* Mobile hamburger button */}
            {!isOpen && (
                <button
                    className={styles.mobileToggleBtn}
                    onClick={() => setIsOpen(true)}
                    aria-label="Toggle Menu"
                    style={{ background: "white", border: "1px solid #e2e8f0", display: "flex" }}
                >
                    <Menu size={20} color="#64748b" />
                </button>
            )}

            {/* Mobile overlay */}
            {isOpen && (
                <div className={styles.mobileOverlay} onClick={() => setIsOpen(false)} />
            )}

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
                <div style={{ flex: 1 }}>
                    {/* Logo */}
                    <div className={styles.logoRow} style={{ marginBottom: "32px" }}>
                        <div className={styles.iconPlaceholder}>
                            <img src={logo.src} alt="SaraMedico Logo" style={{ width: "130px" }} />
                        </div>
                        {/* Mobile close button */}
                        {isOpen && (
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{ marginLeft: "auto", border: "none", background: "#f1f5f9", width: "30px", height: "30px", borderRadius: "8px", cursor: "pointer", color: "#64748b", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                                ×
                            </button>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`${styles.navItem} ${isActive(item.path) ? styles.active : ""}`}
                                onClick={() => setIsOpen(false)}
                            >
                                {item.icon}
                                <span style={{ flex: 1 }}>{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Logout */}
                <button
                    className={styles.logoutBtn}
                    onClick={handleLogout}
                    style={{
                        margin: "16px 0 8px",
                        background: "transparent",
                        border: "1px solid #e2e8f0",
                        color: "#64748b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <LogOut size={16} style={{ marginRight: "10px" }} />
                    Logout
                </button>
            </aside>
        </>
    );
}
