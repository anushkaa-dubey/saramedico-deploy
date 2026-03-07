"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Topbar from "../../../components/Topbar";
import "./Invite.css";
import styles from "../../../HospitalDashboard.module.css";
import { motion } from "framer-motion";
import { createHospitalDoctor, fetchPendingInvites, fetchHospitalDirectory } from "@/services/hospital";

const ROLE_OPTIONS = [
    "Head of Department",
    "Senior Consultant",
    "Consultant",
    "Senior Physician",
    "Physician",
    "Resident",
    "Fellow",
    "Nurse Practitioner",
    "Clinical Coordinator",
];

function generatePassword() {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function InviteStaffPage({ params }) {
    const { departmentName } = use(params);

    const displayName = departmentName
        .split("-")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        email: "",
        department: displayName,
        department_role: "",
        license_number: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [pendingInvites, setPendingInvites] = useState([]);
    const [loadingInvites, setLoadingInvites] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoadingInvites(true);
            try {
                const [data, directoryData] = await Promise.all([
                    fetchPendingInvites(),
                    fetchHospitalDirectory()
                ]);
                setPendingInvites(data);

                const docs = [
                    ...(directoryData.active_doctors || []),
                    ...(directoryData.inactive_doctors || [])
                ];
                const uniqueDepts = [...new Set(docs.map(d => d.department || d.specialty).filter(Boolean))];
                if (displayName && !uniqueDepts.includes(displayName)) {
                    uniqueDepts.push(displayName);
                }
                setDepartments(uniqueDepts);
            } catch (err) {
                console.error("fetch data error:", err);
            } finally {
                setLoadingInvites(false);
            }
        };
        load();
    }, [displayName]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim()) {
            setError("Full name and email are required.");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            await createHospitalDoctor({
                email: form.email,
                password: generatePassword(),
                name: form.name,
                department: form.department,
                department_role: form.department_role,
                license_number: form.license_number,
            });
            setSuccess(true);
            // Redirect back after 2 seconds
            setTimeout(() => {
                router.push(`/dashboard/hospital/departments/${departmentName}`);
            }, 2200);
        } catch (err) {
            setError(err.message || "Failed to create doctor account. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", flexDirection: "column", background: "transparent", padding: 0, minHeight: "100%" }}
        >
            <Topbar title={`Invite Staff — ${displayName}`} />

            <div className={styles.contentWrapper}>
                {/* Page Header */}
                <div style={{ marginBottom: "28px" }}>
                    <button
                        onClick={() => router.push(`/dashboard/hospital/departments/${departmentName}`)}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: "6px",
                            background: "none", border: "none", color: "#64748b",
                            fontSize: "13px", fontWeight: "600", cursor: "pointer",
                            marginBottom: "10px", padding: 0
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Back to {displayName}
                    </button>
                    <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                        Invite Staff Member
                    </h1>
                    <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: "14px" }}>
                        Onboard a new medical professional to your department network with secure credential.
                    </p>
                </div>

                {/* Success Banner */}
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            background: "#f0fdf4", border: "1px solid #bbf7d0",
                            borderRadius: "12px", padding: "16px 20px",
                            marginBottom: "20px", color: "#065f46"
                        }}
                    >
                        <div style={{ fontSize: "14px", fontWeight: "700" }}>✓ Doctor account created successfully!</div>
                        <div style={{ fontSize: "13px", marginTop: "4px" }}>
                            Credentials have been sent to their email. Redirecting back...
                        </div>
                    </motion.div>
                )}

                <div className="inviteGrid">
                    {/* Main Form */}
                    <form onSubmit={handleSubmit}>
                        <div className={styles.card}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                                <div style={{
                                    width: "36px", height: "36px", borderRadius: "10px",
                                    background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <line x1="19" y1="8" x2="19" y2="14" />
                                        <line x1="22" y1="11" x2="16" y2="11" />
                                    </svg>
                                </div>
                                <div>
                                    <div style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>Staff Details</div>
                                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>Required fields are marked</div>
                                </div>
                            </div>

                            <div className="staffFormGrid">                                {/* Full Name */}
                                <div>
                                    <label style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        FULL NAME *
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Dr. John Smith"
                                            value={form.name}
                                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                            required
                                            style={{
                                                width: "100%", padding: "10px 12px 10px 34px",
                                                borderRadius: "8px", border: "1px solid #e2e8f0",
                                                fontSize: "13.5px", boxSizing: "border-box", color: "#1e293b"
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        EMAIL ADDRESS *
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        </svg>
                                        <input
                                            type="email"
                                            placeholder="dr.smith@hospital.com"
                                            value={form.email}
                                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                            required
                                            style={{
                                                width: "100%", padding: "10px 12px 10px 34px",
                                                borderRadius: "8px", border: "1px solid #e2e8f0",
                                                fontSize: "13.5px", boxSizing: "border-box", color: "#1e293b"
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Department (auto-filled) */}
                                <div>
                                    <label style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        DEPARTMENT
                                    </label>
                                    <input
                                        value={displayName}
                                        readOnly
                                        style={{
                                            width: "100%", padding: "10px 12px",
                                            borderRadius: "8px", border: "1px solid #e2e8f0",
                                            fontSize: "13.5px", boxSizing: "border-box",
                                            color: "#64748b", background: "#f8fafc"
                                        }}
                                    />
                                </div>

                                {/* Role */}
                                <div>
                                    <label style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        ROLES &amp; PERMISSIONS
                                    </label>
                                    <select
                                        value={form.department_role}
                                        onChange={e => setForm(f => ({ ...f, department_role: e.target.value }))}
                                        style={{
                                            width: "100%", padding: "10px 12px",
                                            borderRadius: "8px", border: "1px solid #e2e8f0",
                                            fontSize: "13.5px", boxSizing: "border-box",
                                            color: form.department_role ? "#1e293b" : "#94a3b8",
                                            background: "#fff"
                                        }}
                                    >
                                        <option value="">Select role...</option>
                                        {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>

                                {/* License Number */}
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        LICENSE NUMBER
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="MED-987654321"
                                        value={form.license_number}
                                        onChange={e => setForm(f => ({ ...f, license_number: e.target.value }))}
                                        style={{
                                            width: "100%", padding: "10px 12px",
                                            borderRadius: "8px", border: "1px solid #e2e8f0",
                                            fontSize: "13.5px", boxSizing: "border-box", color: "#1e293b"
                                        }}
                                    />
                                </div>
                            </div>

                            {/* HIPAA Notice */}
                            <div style={{
                                background: "#f8fafc", border: "1px solid #e2e8f0",
                                borderRadius: "10px", padding: "14px 16px", marginTop: "20px"
                            }}>
                                <div style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>
                                    Security &amp; HIPAA Policy
                                </div>
                                <div style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.6" }}>
                                    Inviting this user will provide access to PHI (Protected Health Information).
                                    An encrypted invitation link will be sent to the email provided, valid for 48 hours.
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div style={{
                                    background: "#fef2f2", border: "1px solid #fecaca",
                                    borderRadius: "8px", padding: "12px 16px",
                                    marginTop: "16px", color: "#dc2626", fontSize: "13px", fontWeight: "600"
                                }}>
                                    {error}
                                </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                                <button
                                    type="button"
                                    onClick={() => router.push(`/dashboard/hospital/departments/${departmentName}`)}
                                    style={{
                                        padding: "0 24px", height: "40px", border: "none",
                                        borderRadius: "10px", background: "none", color: "#64748b",
                                        fontSize: "14px", fontWeight: "600", cursor: "pointer"
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || success}
                                    style={{
                                        display: "flex", alignItems: "center", gap: "7px",
                                        padding: "0 24px", height: "40px", border: "none",
                                        borderRadius: "10px",
                                        background: submitting || success ? "#93c5fd" : "#3b82f6",
                                        color: "white", fontSize: "14px", fontWeight: "700",
                                        cursor: submitting || success ? "not-allowed" : "pointer",
                                        boxShadow: "0 2px 8px rgba(59,130,246,0.3)"
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="22" y1="2" x2="11" y2="13" />
                                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                    </svg>
                                    {submitting ? "Sending..." : success ? "Sent!" : "Send Invite"}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Right Column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {/* Stats */}
                        <div className={styles.card}>
                            <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "16px" }}>Statistics</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                <div style={{
                                    width: "44px", height: "44px", borderRadius: "12px",
                                    background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                </div>
                                <div>
                                    <div style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a" }}>
                                        {loadingInvites ? "..." : pendingInvites.length}
                                    </div>
                                    <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        Total Staff Members
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pending Invites */}
                        <div className={styles.card}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Pending Invites</div>
                                <span style={{ fontSize: "12px", fontWeight: "700", color: "#3b82f6", cursor: "pointer" }}>View All</span>
                            </div>
                            {loadingInvites ? (
                                <div style={{ color: "#94a3b8", fontSize: "12px" }}>Loading...</div>
                            ) : pendingInvites.length === 0 ? (
                                <div style={{ color: "#94a3b8", fontSize: "12px", textAlign: "center", padding: "12px 0" }}>
                                    No pending invites.
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {pendingInvites.slice(0, 5).map((inv, i) => (
                                        <div key={i} style={{
                                            display: "flex", alignItems: "center", justifyContent: "space-between",
                                            padding: "10px 0", borderBottom: i < Math.min(pendingInvites.length, 5) - 1 ? "1px solid #f1f5f9" : "none"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{
                                                    width: "32px", height: "32px", borderRadius: "50%",
                                                    background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center"
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
                                                padding: "2px 8px", borderRadius: "5px",
                                                fontSize: "10px", fontWeight: "800", textTransform: "uppercase"
                                            }}>
                                                Pending
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
