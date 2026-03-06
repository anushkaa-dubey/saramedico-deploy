"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Topbar from "../../components/Topbar";
import styles from "../../HospitalDashboard.module.css";
import { motion } from "framer-motion";
import {
    fetchDoctorsByDepartment,
    fetchPendingInvites,
    updateHospitalDoctor,
} from "@/services/hospital";

// Role editing modal
function EditRoleModal({ doctor, onClose, onSaved }) {
    const [role, setRole] = useState(doctor?.department_role || "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSave = async () => {
        if (!role.trim()) { setError("Role cannot be empty."); return; }
        setSaving(true);
        try {
            await updateHospitalDoctor(doctor.id, { department_role: role });
            onSaved();
        } catch (err) {
            setError(err.message || "Failed to update role.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
            <div style={{
                background: "#fff", borderRadius: "16px", padding: "28px",
                minWidth: "340px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)"
            }}>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>
                    Update Role
                </h3>
                <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
                    {doctor?.name || doctor?.full_name}
                </p>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                    NEW ROLE / TITLE
                </label>
                <input
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    placeholder="e.g. Head of Department"
                    style={{
                        width: "100%", padding: "10px 12px", borderRadius: "8px",
                        border: "1px solid #e2e8f0", fontSize: "14px", boxSizing: "border-box"
                    }}
                />
                {error && <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "8px" }}>{error}</div>}
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                    <button onClick={onClose} style={{
                        flex: 1, padding: "10px", border: "1px solid #e2e8f0",
                        borderRadius: "8px", background: "#f8fafc", fontSize: "13px",
                        fontWeight: "600", cursor: "pointer", color: "#64748b"
                    }}>
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving} style={{
                        flex: 1, padding: "10px", border: "none",
                        borderRadius: "8px", background: saving ? "#93c5fd" : "#3b82f6",
                        color: "white", fontSize: "13px", fontWeight: "700", cursor: "pointer"
                    }}>
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function DepartmentPage({ params }) {
    // Unwrap params for Next.js 15+
    const { departmentName } = use(params);

    // Convert slug to display name: "general-surgery" → "General Surgery"
    const displayName = departmentName
        .split("-")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    const router = useRouter();
    const [doctors, setDoctors] = useState([]);
    const [pendingInvites, setPendingInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingDoctor, setEditingDoctor] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const [docs, invites] = await Promise.all([
                fetchDoctorsByDepartment(displayName),
                fetchPendingInvites(),
            ]);
            setDoctors(docs);
            setPendingInvites(invites);
        } catch (err) {
            console.error("DepartmentPage load error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [departmentName]);

    const filtered = doctors.filter(d => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            (d.name || d.full_name || "").toLowerCase().includes(q) ||
            (d.department_role || d.role || "").toLowerCase().includes(q) ||
            (d.specialty || "").toLowerCase().includes(q)
        );
    });

    const getStatusColor = (status) => {
        if (!status || status === "active") return { bg: "#ecfdf5", color: "#059669" };
        if (status === "on_leave" || status === "on leave") return { bg: "#fffbeb", color: "#d97706" };
        return { bg: "#f1f5f9", color: "#64748b" };
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", flexDirection: "column", background: "transparent", padding: 0, minHeight: "100%" }}
        >
            <Topbar title={`${displayName} Department`} />

            {editingDoctor && (
                <EditRoleModal
                    doctor={editingDoctor}
                    onClose={() => setEditingDoctor(null)}
                    onSaved={() => { setEditingDoctor(null); load(); }}
                />
            )}

            <div className={styles.contentWrapper}>
                {/* Page Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
                    <div>
                        <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                            {displayName} Department
                        </h1>
                        <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>
                            Manage roles, permissions, and staff assignments for the {displayName.toLowerCase()} wing.
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <Link href={`/dashboard/hospital/departments/${departmentName}/invite`}>
                            <button style={{
                                display: "flex", alignItems: "center", gap: "6px",
                                padding: "0 18px", height: "38px", border: "none",
                                borderRadius: "10px", background: "#3b82f6", color: "white",
                                fontWeight: "700", fontSize: "13px", cursor: "pointer",
                                boxShadow: "0 2px 8px rgba(59,130,246,0.3)"
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                                    <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                                </svg>
                                Invite Staff
                            </button>
                        </Link>
                    </div>
                </div>

                <div className={styles.dashboardGrid}>
                    {/* LEFT COLUMN – Staff Table */}
                    <div className={styles.leftColMain}>
                        <div className={styles.card}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <div className={styles.cardTitle} style={{ margin: 0 }}>
                                    Roles &amp; Permissions
                                </div>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <input
                                        placeholder="Search staff, reports, notes..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        style={{
                                            padding: "7px 12px", borderRadius: "8px",
                                            border: "1px solid #e2e8f0", fontSize: "13px",
                                            width: "220px", color: "#475569"
                                        }}
                                    />
                                    <select style={{
                                        padding: "7px 12px", borderRadius: "8px",
                                        border: "1px solid #e2e8f0", fontSize: "13px",
                                        color: "#475569", cursor: "pointer"
                                    }}>
                                        <option>All Types</option>
                                        <option>Active</option>
                                        <option>On Leave</option>
                                        <option>Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.tableScrollWrapper}>
                                <table className={styles.activityTable} style={{ width: "100%" }}>
                                    <thead>
                                        <tr className={styles.activityHeader}>
                                            <th style={{ whiteSpace: "nowrap", padding: "12px 16px" }}>USER</th>
                                            <th style={{ whiteSpace: "nowrap" }}>ROLE</th>
                                            <th style={{ whiteSpace: "nowrap" }}>SPECIALTY</th>
                                            <th style={{ whiteSpace: "nowrap" }}>STATUS</th>
                                            <th style={{ textAlign: "right", whiteSpace: "nowrap", paddingRight: "16px" }}>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>Loading staff...</td></tr>
                                        ) : filtered.length === 0 ? (
                                            <tr><td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                                                No doctors found in {displayName} department.
                                            </td></tr>
                                        ) : filtered.map((doc, i) => {
                                            const name = doc.name || doc.full_name || "Dr. Unknown";
                                            const role = doc.department_role || doc.role || "Provider";
                                            const status = doc.status || "active";
                                            const sc = getStatusColor(status);
                                            const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                                            return (
                                                <tr key={doc.id || i} className={styles.activityRow}>
                                                    <td style={{ padding: "14px 16px" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                            {doc.photo_url ? (
                                                                <img src={doc.photo_url} alt={name}
                                                                    style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                                                            ) : (
                                                                <div style={{
                                                                    width: "32px", height: "32px", borderRadius: "50%",
                                                                    background: "#dbeafe", color: "#1e40af",
                                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                                    fontSize: "11px", fontWeight: "800"
                                                                }}>{initials}</div>
                                                            )}
                                                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{name}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>{role}</td>
                                                    <td style={{ fontSize: "12px", color: "#64748b" }}>{doc.specialty || "—"}</td>
                                                    <td>
                                                        <span style={{
                                                            background: sc.bg, color: sc.color,
                                                            padding: "3px 10px", borderRadius: "20px",
                                                            fontWeight: "700", fontSize: "11px"
                                                        }}>
                                                            {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: "right", paddingRight: "16px" }}>
                                                        <button
                                                            onClick={() => setEditingDoctor(doc)}
                                                            className={styles.outlineBtn}
                                                            style={{ height: "30px", fontSize: "12px" }}
                                                        >
                                                            Edit Role
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className={styles.rightColMain}>
                        {/* Statistics Card */}
                        <div className={styles.card} style={{ marginBottom: "20px" }}>
                            <div className={styles.cardTitle}>Statistics</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "16px" }}>
                                <div style={{
                                    width: "48px", height: "48px", borderRadius: "12px",
                                    background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                </div>
                                <div>
                                    <div style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a" }}>
                                        {loading ? "..." : doctors.length}
                                    </div>
                                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        Total Staff Members
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className={styles.card} style={{ marginBottom: "20px" }}>
                            <div className={styles.cardTitle}>Quick Actions</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
                                <Link href={`/dashboard/hospital/departments/${departmentName}/invite`}>
                                    <button className={styles.primaryBtn} style={{ width: "100%", justifyContent: "flex-start", padding: "10px 16px", fontSize: "13px" }}>
                                        + Invite Staff Member
                                    </button>
                                </Link>
                                <button className={styles.outlineBtn} style={{ width: "100%", justifyContent: "flex-start", padding: "10px 16px", fontSize: "13px" }}>
                                    Schedule View
                                </button>
                                <button className={styles.outlineBtn} style={{ width: "100%", justifyContent: "flex-start", padding: "10px 16px", fontSize: "13px" }}>
                                    Export Roster
                                </button>
                            </div>
                        </div>

                        {/* Pending Invites */}
                        {pendingInvites.length > 0 && (
                            <div className={styles.card}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                    <div className={styles.cardTitle} style={{ margin: 0 }}>Pending Invites</div>
                                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#3b82f6", cursor: "pointer" }}>View All</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {pendingInvites.slice(0, 4).map((inv, i) => (
                                        <div key={i} style={{
                                            display: "flex", alignItems: "center", justifyContent: "space-between",
                                            padding: "10px 0", borderBottom: i < pendingInvites.length - 1 ? "1px solid #f1f5f9" : "none"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{
                                                    width: "32px", height: "32px", borderRadius: "50%",
                                                    background: "#f1f5f9", display: "flex", alignItems: "center",
                                                    justifyContent: "center"
                                                }}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                        <circle cx="12" cy="7" r="4" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{inv.name}</div>
                                                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>{inv.email}</div>
                                                </div>
                                            </div>
                                            <span style={{
                                                background: "#fffbeb", color: "#d97706",
                                                padding: "3px 8px", borderRadius: "6px",
                                                fontSize: "10px", fontWeight: "800", textTransform: "uppercase"
                                            }}>
                                                Pending
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
