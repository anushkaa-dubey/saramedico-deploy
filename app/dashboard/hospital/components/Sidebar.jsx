"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "../HospitalDashboard.module.css";
import logo from "@/public/logo2.svg";
import { LayoutDashboard, ClipboardList, Calendar, Users, Menu, LogOut, Building2, Plus, ChevronDown, X } from "lucide-react";
import { fetchOrganizationDepartments, createOrganizationDepartment } from "@/services/hospital";

// Medical specialties from Doctor Step-1 onboarding list
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
    const [showNewDeptDropdown, setShowNewDeptDropdown] = useState(false);
    const [creatingDept, setCreatingDept] = useState(false);
    const dropdownRef = useRef(null);

    const isActive = (path) => {
        if (path === "/dashboard/hospital") return pathname === path;
        return pathname === path || pathname.startsWith(path + "/");
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        router.push("/auth/login");
    };

    const loadDepartments = async () => {
        try {
            const data = await fetchOrganizationDepartments();
            setDepartments(data);
        } catch (err) {
            console.error("Failed to load departments:", err);
        }
    };

    useEffect(() => {
        loadDepartments();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowNewDeptDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCreateDepartment = async (specialtyName) => {
        setCreatingDept(true);
        setShowNewDeptDropdown(false);
        try {
            await createOrganizationDepartment(specialtyName);
            await loadDepartments();
            const slug = specialtyName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            router.push(`/dashboard/hospital/departments/${slug}`);
            setIsOpen(false);
        } catch (err) {
            alert(`Failed to create department: ${err.message || "Unknown error"}`);
        } finally {
            setCreatingDept(false);
        }
    };

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

                                    {/* New Department Button */}
                                    <div ref={dropdownRef} style={{ position: "relative", marginTop: "6px" }}>
                                        <button
                                            onClick={() => setShowNewDeptDropdown((v) => !v)}
                                            disabled={creatingDept}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                fontSize: "12px",
                                                color: creatingDept ? "#94a3b8" : "#3b82f6",
                                                background: "none",
                                                border: "none",
                                                cursor: creatingDept ? "not-allowed" : "pointer",
                                                fontWeight: "700",
                                                padding: "6px 8px",
                                                borderRadius: "6px",
                                                width: "100%",
                                                textAlign: "left",
                                            }}
                                        >
                                            <Plus size={13} />
                                            {creatingDept ? "Creating..." : "New Department"}
                                        </button>

                                        {showNewDeptDropdown && (
                                            <div style={{
                                                position: "absolute",
                                                top: "110%",
                                                left: 0,
                                                zIndex: 999,
                                                background: "#ffffff",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "10px",
                                                boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                                                minWidth: "200px",
                                                maxHeight: "260px",
                                                overflowY: "auto",
                                            }}>
                                                <div style={{
                                                    padding: "8px 12px",
                                                    fontSize: "10px",
                                                    fontWeight: "800",
                                                    color: "#94a3b8",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.06em",
                                                    borderBottom: "1px solid #f1f5f9",
                                                }}>
                                                    Select Specialty
                                                </div>
                                                {SPECIALTY_OPTIONS.map((opt) => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => handleCreateDepartment(opt)}
                                                        style={{
                                                            display: "block",
                                                            width: "100%",
                                                            textAlign: "left",
                                                            padding: "9px 14px",
                                                            fontSize: "13px",
                                                            color: "#1e293b",
                                                            background: "none",
                                                            border: "none",
                                                            cursor: "pointer",
                                                            fontWeight: "500",
                                                            transition: "background 0.15s",
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                                                        onMouseLeave={e => e.currentTarget.style.background = "none"}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
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

                <button
                    className={styles.logoutBtn}
                    onClick={handleLogout}
                    style={{
                        margin: "0 12px 24px",
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
            </aside>
        </>
    );
}
