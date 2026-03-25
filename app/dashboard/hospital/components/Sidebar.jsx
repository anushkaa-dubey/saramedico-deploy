"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "../HospitalDashboard.module.css";
import logo from "@/public/logo2.svg";
import { logoutUser } from "@/services/auth";
import { getUser as getStoredUser } from "@/services/tokenService";
import {
    LayoutDashboard, Calendar, Users, Menu, LogOut,
    Building2, Stethoscope, Settings
} from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const isActive = (path) => {
        if (path === "/dashboard/hospital") return pathname === path;
        return pathname === path || pathname.startsWith(path + "/");
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await logoutUser();
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            router.replace("/auth/login");
        }
    };

    const navItems = [
        { label: "Dashboard", path: "/dashboard/hospital", icon: <LayoutDashboard size={18} /> },
        { label: "Appointments", path: "/dashboard/hospital/appointments", icon: <Calendar size={18} /> },
        { label: "Patients", path: "/dashboard/hospital/patients", icon: <Users size={18} /> },
        { label: "Doctors", path: "/dashboard/hospital/doctors", icon: <Stethoscope size={18} /> },
        { label: "Departments & Roles", path: "/dashboard/hospital/departments", icon: <Building2 size={18} /> },
        { label: "Staff Management", path: "/dashboard/hospital/staff-management", icon: <Users size={18} /> },
        { label: "Settings", path: "/dashboard/hospital/settings", icon: <Settings size={18} /> },
    ];

    // Load user for profile section
    const [user, setUser] = useState(null);
    useEffect(() => {
        const load = () => {
            try {
                const cached = getStoredUser();
                if (cached) setUser(cached);
            } catch (_) {}
        };
        load();
        window.addEventListener("profile-updated", load);
        return () => window.removeEventListener("profile-updated", load);
    }, []);

    const displayName = user?.full_name || user?.name || "Hospital Admin";
    const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <>
            {/* Mobile hamburger */}
            {!isOpen && (
                <button
                    className={styles.mobileToggleBtn}
                    onClick={() => setIsOpen(true)}
                    aria-label="Toggle Menu"
                    style={{ background: "white", border: "1px solid #e2e8f0" }}
                >
                    <Menu size={20} color="#64748b" />
                </button>
            )}

            {/* Mobile overlay */}
            {isOpen && (
                <div className={styles.mobileOverlay} onClick={() => setIsOpen(false)} />
            )}

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
                {/* Top: Logo + Nav */}
                <div style={{ flex: 1 }}>
                    {/* Logo */}
                    <div className={styles.logoRow} style={{ marginBottom: "32px" }}>
                        <div className={styles.iconPlaceholder}>
                            <img src={logo.src} alt="SaraMedico Logo" style={{ width: "130px" }} />
                        </div>
                        {isOpen && (
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    marginLeft: "auto",
                                    border: "none",
                                    background: "#f1f5f9",
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    color: "#64748b",
                                    fontSize: "16px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
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

                {/* Bottom: Profile + Logout */}
                <div style={{ marginTop: "auto", padding: "20px 0" }}>
                    {/* Profile Summary */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px",
                        background: "#f8fafc",
                        borderRadius: "12px",
                        marginBottom: "8px",
                        border: "1px solid #f1f5f9"
                    }}>
                        <div style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: "700",
                            overflow: "hidden"
                        }}>
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="User" />
                            ) : initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {displayName}
                            </div>
                            <div style={{ fontSize: "10px", color: "#64748b" }}>Administrator</div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className={styles.logoutBtn}
                        style={{
                            width: "100%",
                            background: "transparent",
                            border: "1px solid #e2e8f0",
                            color: "#64748b",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: loggingOut ? 0.6 : 1,
                            cursor: loggingOut ? "not-allowed" : "pointer",
                        }}
                    >
                        <LogOut size={16} style={{ marginRight: "10px" }} />
                        {loggingOut ? "Logging out..." : "Logout"}
                    </button>
                </div>
            </aside>
        </>
    );
}