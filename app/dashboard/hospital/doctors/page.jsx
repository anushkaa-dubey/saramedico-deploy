"use client";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { createHospitalDoctor, fetchHospitalDoctorStatus, updateHospitalDoctor } from "@/services/hospital";
import { fetchOrganizationMembers } from "@/services/hospital";

const DEPT_OPTIONS = [
    "Cardiology", "Neurology", "Pediatrics", "Orthopedics", "Radiology",
    "General Surgery", "Emergency Medicine", "Dermatology", "Psychiatry",
    "Oncology", "Internal Medicine", "Ophthalmology", "ENT", "Urology",
    "Obstetrics & Gynecology",
];

const ROLE_OPTIONS = [
    "Head of Department", "Senior Consultant", "Consultant", "Junior Consultant",
    "Resident Doctor", "Intern", "Specialist", "Visiting Consultant",
    "Surgeon", "Medical Officer"
];

const overlayStyle = {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.5)", display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px",
};
const modalStyle = {
    background: "#fff", borderRadius: "20px", padding: "32px",
    width: "100%", maxWidth: "560px", maxHeight: "90vh",
    overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
};
const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: "10px",
    border: "1.5px solid #e2e8f0", fontSize: "14px",
    color: "#1e293b", background: "#f8fafc", outline: "none",
    fontFamily: "inherit", fontWeight: "500", boxSizing: "border-box",
};
const labelStyle = {
    fontSize: "11px", fontWeight: "800", color: "#94a3b8",
    letterSpacing: "0.06em", textTransform: "uppercase",
    marginBottom: "6px", display: "block",
};

// ── Create Doctor Modal ──────────────────────────────────────────────────────
function CreateDoctorModal({ onClose, onSuccess }) {
    const [form, setForm] = useState({ name: "", email: "", password: "", department: "", department_role: "", license_number: "" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const missing = Object.entries(form).filter(([k, v]) => !v.trim()).map(([k]) => k);
        if (missing.length > 0) { setError(`Missing fields: ${missing.join(", ")}`); return; }
        setSaving(true);
        setError("");
        try {
            await createHospitalDoctor(form);
            onSuccess();
        } catch (err) {
            setError(err?.message || "Failed to create doctor account. Check that the email is not already registered.");
        } finally {
            setSaving(false);
        }
    };

    const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

    return (
        <div style={overlayStyle} onClick={e => e.target === e.currentTarget && onClose()}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={modalStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>Onboard Clinician</h2>
                        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>Create a new professional account</p>
                    </div>
                    <button onClick={onClose} style={{ border: "none", background: "#f1f5f9", width: "36px", height: "36px", borderRadius: "10px", cursor: "pointer", fontSize: "18px", color: "#64748b" }}>×</button>
                </div>

                {error && (
                    <div style={{ background: "#fef2f2", color: "#991b1b", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "13px", fontWeight: "600" }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                        <div style={{ gridColumn: "1 / -1" }}>
                            <label style={labelStyle}>Full Name *</label>
                            <input required value={form.name} onChange={set("name")} placeholder="Dr. John Smith" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Official Email *</label>
                            <input required type="email" value={form.email} onChange={set("email")} placeholder="doctor@hospital.com" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Initial Password *</label>
                            <input required type="password" value={form.password} onChange={set("password")} placeholder="SecurePass123!" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Department *</label>
                            <select required value={form.department} onChange={set("department")} style={{ ...inputStyle, appearance: "auto" }}>
                                <option value="">Select Department</option>
                                {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Department Role *</label>
                            <select required value={form.department_role} onChange={set("department_role")} style={{ ...inputStyle, appearance: "auto" }}>
                                <option value="">Select Role</option>
                                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                            <label style={labelStyle}>Medical License # *</label>
                            <input required value={form.license_number} onChange={set("license_number")} placeholder="MED-12345678" style={inputStyle} />
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
                        <button type="button" onClick={onClose} className={styles.outlineBtn}>Cancel</button>
                        <button type="submit" disabled={saving} className={styles.primaryBtn} style={{ opacity: saving ? 0.7 : 1 }}>
                            {saving ? "Creating..." : "Create Professional Account"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}


// ── View/Edit Doctor Modal — ALL FIELDS PRE-FILLED (mirrors HospitalEditDoctorScreen) ───
function DoctorDetailModal({ doctor, onClose, onUpdate }) {
    const [form, setForm] = useState({
        name: doctor.full_name || doctor.name || "",
        specialty: doctor.specialty || "",
        department: doctor.department || "",
        department_role: doctor.department_role || "",
        license_number: doctor.license_number || "",
        status: doctor.status || "active",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            // Only send changed fields (mirrors mobile behavior)
            const original = {
                name: doctor.full_name || doctor.name || "",
                specialty: doctor.specialty || "",
                department: doctor.department || "",
                department_role: doctor.department_role || "",
                license_number: doctor.license_number || "",
                status: doctor.status || "active",
            };
            const changed = {};
            Object.keys(form).forEach(k => { if (form[k] !== original[k]) changed[k] = form[k]; });
            if (Object.keys(changed).length === 0) {
                setError("No changes detected. Please modify at least one field.");
                setSaving(false);
                return;
            }
            await updateHospitalDoctor(doctor.id, changed);
            onUpdate();
        } catch (err) {
            setError(err?.message || "Failed to update doctor profile.");
        } finally {
            setSaving(false);
        }
    };

    const isActive = (form.status || "active").toLowerCase() === "active";
    const initials = (form.name || "DR").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <div style={overlayStyle} onClick={e => e.target === e.currentTarget && onClose()}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ ...modalStyle, maxWidth: "500px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>Edit Clinician Profile</h2>
                        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "12px" }}>Modifying professional credentials</p>
                    </div>
                    <button onClick={onClose} style={{ border: "none", background: "#f1f5f9", width: "36px", height: "36px", borderRadius: "10px", cursor: "pointer", fontSize: "18px", color: "#64748b" }}>×</button>
                </div>

                {/* Avatar + Name Card */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px", padding: "14px", background: "#f8fafc", borderRadius: "12px" }}>
                    <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "18px", flexShrink: 0 }}>
                        {initials}
                    </div>
                    <div>
                        <div style={{ fontWeight: "800", color: "#0f172a", fontSize: "15px" }}>{form.name || "—"}</div>
                        <div style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>{doctor.email || "—"}</div>
                        <span style={{ display: "inline-block", marginTop: "4px", padding: "2px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: "800", background: isActive ? "#f0fdf4" : "#fef2f2", color: isActive ? "#16a34a" : "#dc2626" }}>
                            {form.status.toUpperCase()}
                        </span>
                    </div>
                </div>

                {error && <div style={{ background: "#fef2f2", color: "#991b1b", padding: "12px", borderRadius: "10px", marginBottom: "16px", fontSize: "13px" }}>⚠️ {error}</div>}

                <form onSubmit={handleSave}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Dr. John Smith" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Clinical Specialty</label>
                            <input value={form.specialty} onChange={e => setForm(p => ({ ...p, specialty: e.target.value }))} placeholder="e.g. Pediatric Surgery" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Department</label>
                            <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} style={{ ...inputStyle, appearance: "auto" }}>
                                <option value="">Select Department</option>
                                {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Department Role</label>
                            <select value={form.department_role} onChange={e => setForm(p => ({ ...p, department_role: e.target.value }))} style={{ ...inputStyle, appearance: "auto" }}>
                                <option value="">Select Role</option>
                                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Medical License #</label>
                            <input value={form.license_number} onChange={e => setForm(p => ({ ...p, license_number: e.target.value }))} placeholder="MED-12345678" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Status</label>
                            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={{ ...inputStyle, appearance: "auto" }}>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="on_leave">On Leave</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                        <button type="button" onClick={onClose} className={styles.outlineBtn}>Cancel</button>
                        <button type="submit" disabled={saving} className={styles.primaryBtn} style={{ opacity: saving ? 0.7 : 1 }}>
                            {saving ? "Saving..." : "Update Profile"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}



// ── Main Doctors Page ────────────────────────────────────────────────────────
export default function DoctorsPage() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [toast, setToast] = useState("");

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3500);
    };

    const load = async () => {
        setLoading(true);
        setError("");
        console.log("Loading doctors directory...");
        try {
            // Prefer status endpoint (gives active/inactive info), fallback to org members
            const data = await fetchHospitalDoctorStatus().catch((err) => {
                console.error("fetchHospitalDoctorStatus failed:", err);
                return [];
            });
            console.log("Doctors fetched from status endpoint:", data?.length || 0);

            if (data && data.length > 0) {
                console.log("First doctor data sample:", data[0]);
                setDoctors(data);
            } else {
                console.log("Falling back to fetchOrganizationMembers...");
                const members = await fetchOrganizationMembers();
                console.log("Members fetched:", members?.length || 0);
                if (members && members.length > 0) {
                    console.log("First member data sample:", members[0]);
                }
                setDoctors(members.filter(m => m.role === "doctor" || m.specialty));
            }
        } catch (err) {
            console.error("Failed to load doctors:", err);
            setError("Could not load doctor directory — backend may be unavailable.");
        } finally {
            console.log("Finished loading doctors.");
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const filtered = doctors.filter(d => {
        const q = search.toLowerCase();
        return (
            (d.full_name || d.name || "").toLowerCase().includes(q) ||
            (d.specialty || d.department || "").toLowerCase().includes(q) ||
            (d.email || "").toLowerCase().includes(q)
        );
    });

    const getStatusStyle = (status) => {
        const s = (status || "active").toLowerCase();
        if (s === "active") return { background: "#ecfdf5", color: "#16a34a" };
        if (s === "inactive") return { background: "#fef2f2", color: "#dc2626" };
        return { background: "#fffbeb", color: "#d97706" };
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", flexDirection: "column", background: "transparent", padding: 0, minHeight: "100%" }}
        >
            <Topbar title="Doctors Directory" />

            <div className={styles.contentWrapper}>
                {/* Header */}
                <div style={{ marginBottom: "24px" }}>
                    <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Doctors Directory</h1>
                    <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>
                        Manage clinical staff and their department assignments.
                    </p>
                </div>

                {/* Filter/Action Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center", flex: 1 }}>
                        <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
                            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>🔍</span>
                            <input
                                type="text"
                                placeholder="Search doctors by name, specialty or email..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ ...inputStyle, paddingLeft: "36px", width: "100%" }}
                            />
                        </div>
                    </div>
                    <button
                        className={styles.primaryBtn}
                        onClick={() => setShowCreate(true)}
                    >
                        + Onboard Doctor
                    </button>
                </div>

                {/* Toast */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            style={{ background: "#f0fdf4", color: "#166534", padding: "12px 18px", borderRadius: "12px", marginBottom: "20px", fontWeight: "600", fontSize: "14px", border: "1px solid #dcfce7" }}
                        >
                            ✅ {toast}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error */}
                {error && (
                    <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "14px", borderRadius: "12px", marginBottom: "20px", fontSize: "13px", fontWeight: "600" }}>
                        {error}
                    </div>
                )}

                {/* Table */}
                <div className={styles.card} style={{ border: "none", borderRadius: "16px", padding: "0", overflow: "hidden" }}>
                    <div className={styles.tableScrollWrapper}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #f1f5f9" }}>
                                    {["DOCTOR", "SPECIALTY / DEPT", "EMAIL", "ROLE", "STATUS", "ACTIONS"].map(h => (
                                        <th key={h} style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: h === "ACTIONS" ? "right" : "left", whiteSpace: "nowrap" }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>Loading doctors...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>
                                            <div style={{ fontSize: "28px", marginBottom: "10px" }}>🩺</div>
                                            {doctors.length === 0 ? "No doctors found in this organization." : "No doctors match your search."}
                                        </td>
                                    </tr>
                                ) : filtered.map((doc, i) => {
                                    const initials = (doc.full_name || doc.name || "D").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                                    return (
                                        <tr key={doc.id || i} style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.1s" }}
                                            onMouseEnter={e => e.currentTarget.style.background = "#fafbfc"}
                                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                            <td style={{ padding: "16px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #3b82f620, #6366f130)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "12px", flexShrink: 0 }}>
                                                        {initials}
                                                    </div>
                                                    <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "14px" }}>
                                                        {doc.name || doc.full_name || "Practitioner"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: "16px", color: "#64748b", fontSize: "13px" }}>
                                                {doc.specialty || doc.department || "General"}
                                            </td>
                                            <td style={{ padding: "16px", color: "#64748b", fontSize: "13px" }}>
                                                {doc.email || "—"}
                                            </td>
                                            <td style={{ padding: "16px", color: "#64748b", fontSize: "12px" }}>
                                                {doc.department_role || doc.role || "Clinician"}
                                            </td>
                                            <td style={{ padding: "16px" }}>
                                                <span style={{ ...getStatusStyle(doc.status || (doc.is_active ? "active" : "inactive")), padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", whiteSpace: "nowrap" }}>
                                                    {doc.status || (doc.is_active ? "Active" : "Inactive")}
                                                </span>
                                            </td>
                                            <td style={{ padding: "16px", textAlign: "right" }}>
                                                <button
                                                    onClick={() => setSelectedDoctor(doc)}
                                                    className={styles.outlineBtn}
                                                    style={{ fontSize: "12px", height: "32px", padding: "0 14px" }}
                                                >
                                                    Manage
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer note */}
                <div style={{ marginTop: "16px", color: "#94a3b8", fontSize: "12px" }}>
                    Showing {filtered.length} of {doctors.length} doctors
                </div>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreate && (
                    <CreateDoctorModal
                        onClose={() => setShowCreate(false)}
                        onSuccess={() => {
                            setShowCreate(false);
                            showToast("Doctor account created successfully. Credentials sent to their email.");
                            load();
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Detail/Edit Modal */}
            <AnimatePresence>
                {selectedDoctor && (
                    <DoctorDetailModal
                        doctor={selectedDoctor}
                        onClose={() => setSelectedDoctor(null)}
                        onUpdate={() => {
                            setSelectedDoctor(null);
                            showToast("Doctor profile updated successfully.");
                            load();
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
