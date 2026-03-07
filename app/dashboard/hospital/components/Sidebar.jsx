"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "../HospitalDashboard.module.css";
import logo from "@/public/logo.png";
import {
    LayoutDashboard,
    Users,
    Calendar,
    Activity,
    User,
    PlusCircle,
    LogOut,
    Menu,
    Building2,
    ClipboardList, // Keep ClipboardList if it's used elsewhere, otherwise remove. Assuming it's not used based on the snippet.
    Plus, // Keep Plus if it's used elsewhere, otherwise remove.
    ChevronDown, // Keep ChevronDown as it's used for department toggle.
    X // Keep X if it's used elsewhere, otherwise remove.
} from "lucide-react";
import { logoutUser } from "@/services/auth";
import SignoutModal from "../../../auth/components/SignoutModal";
import { fetchHospitalDirectory } from "@/services/hospital";
import { fetchOrganizationDepartments } from "@/services/hospital";


const SPECIALTY_OPTIONS = [
    "Cardiology",
    "Neurology",
    "Pediatrics",
    "Orthopedics",
    "Radiology",
    "General Surgery",
    "Emergency Medicine",
    "Dermatology",
    "Psychiatry",
    "Oncology",
    "Internal Medicine",
    "Ophthalmology",
    "ENT",
    "Urology",
    "Obstetrics & Gynecology",
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isDeptOpen, setIsDeptOpen] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [isSignoutModalOpen, setIsSignoutModalOpen] = useState(false);

    const isActive = (path) => {
        if (path === "/dashboard/hospital") return pathname === path;
        return pathname === path || pathname.startsWith(path + "/");
    };

    const handleLogout = async () => {
        await logoutUser();
        router.push("/auth/login");
    };

    const loadDepartments = async () => {
        try {
            setDepartments(SPECIALTY_OPTIONS);
        } catch (err) {
            console.error("Failed to load departments:", err);
        }
    }; useEffect(() => {
        loadDepartments();
    }, []);


    const navItems = [
        { label: "Dashboard", path: "/dashboard/hospital", icon: <LayoutDashboard size={18} /> },
        { label: "Appointments", path: "/dashboard/hospital/appointments", icon: <Calendar size={18} /> },
        { label: "Patients", path: "/dashboard/hospital/patients", icon: <Users size={18} /> },
    ];

    const deptSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    return (
        <>
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

            {isOpen && (
                <div className={styles.mobileOverlay} onClick={() => setIsOpen(false)} />
            )}

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
                <div>
                    <div className={styles.logoRow} style={{ marginBottom: "32px" }}>
                        <div className={styles.iconPlaceholder}>
                            <img src={logo.src} alt="Logo" style={{ width: "130px" }} />
                        </div>
                    </div>

                    <nav className={styles.navGroup} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`${styles.navItem} ${isActive(item.path) && !pathname.includes("departments") ? styles.active : ""}`}
                                onClick={() => setIsOpen(false)}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        ))}

                        {/* Departments & Roles Section */}
                        <div style={{ marginTop: "8px" }}>
                            {/* Section Header */}
                            <div
                                className={`${styles.navItem} ${pathname.includes("/departments") ? styles.active : ""}`}
                                onClick={() => setIsDeptOpen(!isDeptOpen)}
                                style={{ cursor: "pointer", justifyContent: "space-between", userSelect: "none" }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <Building2 size={18} />
                                    Departments &amp; Roles
                                </div>
                                <ChevronDown
                                    size={14}
                                    style={{
                                        transform: isDeptOpen ? "rotate(180deg)" : "none",
                                        transition: "transform 0.2s",
                                        opacity: 0.5,
                                    }}
                                />
                            </div>

                            {isDeptOpen && (
                                <div style={{ paddingLeft: "40px", paddingBottom: "4px" }}>
                                    {/* Hospital name label */}
                                    <div style={{
                                        fontSize: "11px",
                                        fontWeight: "800",
                                        color: "#94a3b8",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.06em",
                                        padding: "8px 0 4px 8px",
                                    }}>
                                        General Hospital
                                    </div>

                                    {/* Department links */}
                                    {departments.length === 0 ? (
                                        <div style={{ fontSize: "12px", color: "#94a3b8", padding: "6px 8px" }}>
                                            No departments yet
                                        </div>
                                    ) : (
                                        departments.map((dept, i) => {
                                            const slug = deptSlug(typeof dept === "string" ? dept : dept.name || dept.department_name);
                                            const label = typeof dept === "string" ? dept : dept.name || dept.department_name;
                                            const path = `/dashboard/hospital/departments/${slug}`;
                                            const active = pathname === path || pathname.startsWith(path + "/");
                                            return (
                                                <Link
                                                    key={i}
                                                    href={path}
                                                    onClick={() => setIsOpen(false)}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "8px",
                                                        fontSize: "13.5px",
                                                        color: active ? "#1e40af" : "#475569",
                                                        textDecoration: "none",
                                                        padding: "7px 8px",
                                                        borderRadius: "8px",
                                                        fontWeight: active ? "700" : "500",
                                                        background: active ? "#eff6ff" : "transparent",
                                                        transition: "all 0.15s",
                                                    }}
                                                >
                                                    <span style={{
                                                        width: "5px",
                                                        height: "5px",
                                                        borderRadius: "50%",
                                                        background: active ? "#3b82f6" : "#cbd5e1",
                                                        flexShrink: 0,
                                                    }} />
                                                    {label}
                                                </Link>
                                            );
                                        })
                                    )}


                                </div>
                            )}
                        </div>

                        <Link
                            href="/dashboard/hospital/staff-management"
                            className={`${styles.navItem} ${pathname.includes("staff-management") ? styles.active : ""}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <Users size={20} />
                            Staff Management
                        </Link>
                    </nav>
                </div>
                
                <div className={styles.sidebarBottom} style={{ marginTop: "auto", paddingBottom: "20px" }}>
                    <Link
                        href="/dashboard/hospital/settings"
                        className={`${styles.navItem} ${isActive("/dashboard/hospital/settings") ? styles.active : ""}`}
                        style={{ margin: "0 12px 8px", width: "calc(100% - 24px)" }}
                        onClick={() => setIsOpen(false)}
                    >
                        <Building2 size={18} />
                        Settings
                    </Link>

                    <button
                        className={styles.logoutBtn}
                        onClick={() => setIsSignoutModalOpen(true)}
                        style={{
                            margin: "0 12px",
                            width: "calc(100% - 24px)",
                            background: "transparent",
                            border: "1px solid #e2e8f0",
                            color: "#64748b",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <LogOut size={18} style={{ marginRight: "10px" }} />
                        Logout
                    </button>
                </div>
            </aside>

            <SignoutModal 
                isOpen={isSignoutModalOpen}
                onConfirm={handleLogout}
                onCancel={() => setIsSignoutModalOpen(false)}
            />
        </>
    );
}
