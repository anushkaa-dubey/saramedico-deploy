"use client";
import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { fetchOrganizationDepartments, fetchDoctorsByDepartment, fetchHospitalDoctorStatus, createHospitalDoctor, updateHospitalDoctor } from "@/services/hospital";

// ── Department Color Palette (mirrors mobile) ─────────────────────────────
const DEPT_COLORS = [
    { bg: "#E3F2FD", icon: "#2196F3" },
    { bg: "#E8F5E9", icon: "#4CAF50" },
    { bg: "#FFF3E0", icon: "#FF9800" },
    { bg: "#F3E5F5", icon: "#9C27B0" },
    { bg: "#FFEBEE", icon: "#F44336" },
    { bg: "#E0F2F1", icon: "#009688" },
    { bg: "#FFF8E1", icon: "#FFC107" },
    { bg: "#E8EAF6", icon: "#5C6BC0" },
];

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

// ─────────────────────────────────────────────────────────────────────────────
// Modal styles
const overlayStyle = {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.5)", display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px",
};
const modalStyle = {
    background: "#fff", borderRadius: "20px", padding: "32px",
    width: "100%", maxWidth: "560px", maxHeight: "90vh",
    overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
};
const labelStyle = {
    fontSize: "11px", fontWeight: "800", color: "#94a3b8",
    letterSpacing: "0.06em", textTransform: "uppercase",
    marginBottom: "6px", display: "block",
};
const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: "10px",
    border: "1.5px solid #e2e8f0", fontSize: "14px",
    color: "#1e293b", background: "#f8fafc", outline: "none",
    fontFamily: "inherit", fontWeight: "500", boxSizing: "border-box",
};

// ── Onboard Doctor Modal ──────────────────────────────────────────────────
function CreateDoctorModal({ defaultDept, onClose, onSuccess }) {
    const [form, setForm] = useState({
        name: "", email: "", password: "",
        department: defaultDept || "", department_role: "",
        specialty: "", license_number: ""
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const missing = Object.entries(form).filter(([k, v]) => !v.trim()).map(([k]) => k);
        if (missing.length > 0) { setError(`Missing fields: ${missing.join(", ")}`); return; }
        setSaving(true); setError("");
        try {
            await createHospitalDoctor(form);
            onSuccess();
        } catch (err) {
            setError(err?.message || "Failed to create doctor account. Check that the email is not already registered.");
        } finally { setSaving(false); }
    };
    const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

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
                {error && <div style={{ background: "#fef2f2", color: "#991b1b", padding: "12px", borderRadius: "10px", marginBottom: "20px", fontSize: "13px", fontWeight: "600" }}>⚠️ {error}</div>}
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
                            <label style={labelStyle}>Clinical Specialty *</label>
                            <input required value={form.specialty} onChange={set("specialty")} placeholder="e.g. Pediatric Surgery" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Department Role *</label>
                            <select required value={form.department_role} onChange={set("department_role")} style={{ ...inputStyle, appearance: "auto" }}>
                                <option value="">Select Role</option>
                                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Medical License # *</label>
                            <input required value={form.license_number} onChange={set("license_number")} placeholder="MED-12345678" style={inputStyle} />
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
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

// ── Edit Doctor Modal — All fields pre-filled ─────────────────────────────
function EditDoctorModal({ doctor, onClose, onUpdate }) {
    const [form, setForm] = useState({
        name: doctor.name || doctor.full_name || "",
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
        setSaving(true); setError("");
        try {
            // Only send changed fields
            const changed = {};
            const original = {
                name: doctor.name || doctor.full_name || "",
                specialty: doctor.specialty || "",
                department: doctor.department || "",
                department_role: doctor.department_role || "",
                license_number: doctor.license_number || "",
                status: doctor.status || "active",
            };
            Object.keys(form).forEach(k => { if (form[k] !== original[k]) changed[k] = form[k]; });
            if (Object.keys(changed).length === 0) { setError("No changes detected."); setSaving(false); return; }
            await updateHospitalDoctor(doctor.id, changed);
            onUpdate();
        } catch (err) {
            setError(err?.message || "Failed to update doctor profile.");
        } finally { setSaving(false); }
    };

    const isActive = (form.status || "active").toLowerCase() === "active";
    const initials = (form.name || "DR").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <div style={overlayStyle} onClick={e => e.target === e.currentTarget && onClose()}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ ...modalStyle, maxWidth: "500px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>Edit Clinician Profile</h2>
                    <button onClick={onClose} style={{ border: "none", background: "#f1f5f9", width: "36px", height: "36px", borderRadius: "10px", cursor: "pointer", fontSize: "18px", color: "#64748b" }}>×</button>
                </div>

                {/* Avatar Card */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px", padding: "14px", background: "#f8fafc", borderRadius: "12px" }}>
                    <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "18px", flexShrink: 0 }}>
                        {initials}
                    </div>
                    <div>
                        <div style={{ fontWeight: "800", color: "#0f172a", fontSize: "15px" }}>{form.name || "—"}</div>
                        <div style={{ color: "#64748b", fontSize: "12px" }}>{doctor.email || "—"}</div>
                        <span style={{ display: "inline-block", marginTop: "4px", padding: "2px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: "800", background: isActive ? "#f0fdf4" : "#fef2f2", color: isActive ? "#16a34a" : "#dc2626" }}>
                            {form.status?.toUpperCase() || "ACTIVE"}
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

// ── Doctors List Sub-Panel ────────────────────────────────────────────────
function DeptDoctorsList({ department, onClose, allDoctors, onEdit }) {
    const [deptDoctors, setDeptDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [localDoctors, setLocalDoctors] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        setLoading(true);
        // Filter from all doctors first (fastest)
        const key = (department || "").toLowerCase().trim();
        const filtered = allDoctors.filter(d => {
            return (d.department || "").toLowerCase().trim() === key ||
                (d.specialty || "").toLowerCase().trim() === key;
        });
        setLocalDoctors(filtered);

        // Also try direct dept endpoint as fallback
        fetchDoctorsByDepartment(department)
            .then(data => {
                if (data && data.length > 0) setDeptDoctors(data);
                else setDeptDoctors(filtered);
            })
            .catch(() => setDeptDoctors(filtered))
            .finally(() => setLoading(false));
    }, [department, allDoctors, refreshKey]);

    const doctors = deptDoctors.length > 0 ? deptDoctors : localDoctors;
    const getInitials = name => (name || "DR").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            style={{ background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9", overflow: "hidden" }}
        >
            {/* Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <div style={{ fontWeight: "800", fontSize: "16px", color: "#0f172a" }}>{department}</div>
                    <div style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>{doctors.length} doctor{doctors.length !== 1 ? "s" : ""} assigned</div>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => setShowCreate(true)} className={styles.primaryBtn} style={{ fontSize: "12px" }}>
                        + Onboard Doctor
                    </button>
                    <button onClick={onClose} style={{ border: "none", background: "#f1f5f9", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", color: "#64748b", fontSize: "16px" }}>×</button>
                </div>
            </div>

            {/* Doctor Cards */}
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {loading ? (
                    <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>Fetching clinicians...</div>
                ) : doctors.length === 0 ? (
                    <div style={{ padding: "48px 24px", textAlign: "center", color: "#94a3b8" }}>
                        <div style={{ fontSize: "36px", marginBottom: "12px" }}>🩺</div>
                        <div style={{ fontWeight: "700", marginBottom: "6px" }}>No doctors in {department}</div>
                        <div style={{ fontSize: "12px" }}>Click "Onboard Doctor" to add the first clinician.</div>
                    </div>
                ) : doctors.map((doc, i) => {
                    const initials = getInitials(doc.name || doc.full_name);
                    const isActive = (doc.status || "active").toLowerCase() === "active";
                    return (
                        <div key={doc.id || i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", background: "#f8fafc", borderRadius: "14px", border: "1px solid #f1f5f9" }}>
                            {/* Avatar with status dot */}
                            <div style={{ position: "relative", flexShrink: 0 }}>
                                <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "16px" }}>
                                    {initials}
                                </div>
                                <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "14px", height: "14px", borderRadius: "50%", background: isActive ? "#10b981" : "#94a3b8", border: "2px solid white" }} />
                            </div>
                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                                    <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "15px" }}>{doc.name || doc.full_name || "Practitioner"}</div>
                                    <span style={{ padding: "2px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "800", background: isActive ? "#ecfdf5" : "#f1f5f9", color: isActive ? "#059669" : "#64748b" }}>
                                        {isActive ? "ACTIVE" : "INACTIVE"}
                                    </span>
                                </div>
                                <div style={{ color: "#64748b", fontSize: "12px", fontWeight: "500" }}>{doc.department_role || "Staff Physician"}</div>
                                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                                    <span style={{ fontSize: "12px", color: "#3b82f6", fontWeight: "600" }}>🩺 {doc.specialty || "General Practitioner"}</span>
                                </div>
                            </div>
                            {/* Edit button */}
                            <button
                                onClick={() => onEdit(doc)}
                                style={{ padding: "8px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "white", color: "#3b82f6", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}
                            >
                                ✏️ Edit
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Create modal */}
            <AnimatePresence>
                {showCreate && (
                    <CreateDoctorModal
                        defaultDept={department}
                        onClose={() => setShowCreate(false)}
                        onSuccess={() => { setShowCreate(false); setRefreshKey(k => k + 1); }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ── Main Departments Page ─────────────────────────────────────────────────
export default function DepartmentsPage() {
    const [departments, setDepartments] = useState([]);
    const [allDoctors, setAllDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDept, setSelectedDept] = useState(null);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [toast, setToast] = useState("");
    const [staffCount, setStaffCount] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);


    const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 3500); };

    const load = async () => {
        setLoading(true);
        try {
            const [deptData, statusData] = await Promise.allSettled([
                fetchOrganizationDepartments(),
                fetchHospitalDoctorStatus(),
            ]);

            // Departments
            let depts = [];
            if (deptData.status === "fulfilled" && deptData.value?.length > 0) {
                depts = deptData.value;
            }

            // Doctors
            let docs = [];
            if (statusData.status === "fulfilled") {
                docs = Array.isArray(statusData.value) ? statusData.value : [];
            }

            // If no API departments, derive from doctors' specialty / department
            if (depts.length === 0 && docs.length > 0) {
                const unique = [...new Set(docs.map(d => d.department || d.specialty).filter(Boolean))];
                depts = unique;
            }

            // If still nothing, use fallback (mirrors mobile)
            if (depts.length === 0) {
                depts = ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "General Surgery", "Emergency Medicine", "Dermatology"];
            }

            setDepartments(depts);
            setAllDoctors(docs);
            setStaffCount(docs.length);
        } catch (err) {
            console.error("Failed to load departments:", err);
            setDepartments(["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "General Surgery"]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const getDeptColor = idx => DEPT_COLORS[idx % DEPT_COLORS.length];
    const getDeptName = d => typeof d === "string" ? d : (d.name || d.department_name || d);

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: "flex", flexDirection: "column", background: "transparent", padding: 0, minHeight: "100%" }}
        >
            <Topbar title="Departments & Roles" />

            <div className={styles.contentWrapper}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                        <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                            Medical Departments
                        </h1>
                        <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>
                            {selectedDept ? `Managing personnel for ${selectedDept}` : "Select a department to view and manage its clinical staff."}
                        </p>
                    </div>

                    <div style={{ minWidth: "240px" }}>
                        <label style={{ ...labelStyle, marginBottom: "8px" }}>Quick Switch Department</label>
                        <select
                            value={selectedDept || ""}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            style={{ ...inputStyle, appearance: "auto", border: "2px solid #3b82f620" }}
                        >
                            <option value="">All Departments</option>
                            {departments.map(d => (
                                <option key={getDeptName(d)} value={getDeptName(d)}>{getDeptName(d)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Toast */}
                <AnimatePresence>
                    {toast && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            style={{ background: "#f0fdf4", color: "#166534", padding: "12px 18px", borderRadius: "12px", marginBottom: "20px", fontWeight: "600", fontSize: "13px", border: "1px solid #dcfce7" }}>
                            ✅ {toast}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats Row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "28px", maxWidth: "400px" }}>
                    <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", border: "1px solid #f1f5f9", textAlign: "center" }}>
                        <div style={{ fontSize: "32px", fontWeight: "800", color: "#3b82f6" }}>{loading ? "—" : departments.length}</div>
                        <div style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", marginTop: "4px" }}>Total Units</div>
                    </div>
                    <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", border: "1px solid #f1f5f9", textAlign: "center" }}>
                        <div style={{ fontSize: "32px", fontWeight: "800", color: "#10b981" }}>{loading ? "—" : staffCount}</div>
                        <div style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", marginTop: "4px" }}>Active Staffing</div>
                    </div>
                </div>

                {/* Main Layout */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: (isMobile || !selectedDept) ? "1fr" : "340px 1fr",
                    gap: "20px",
                    transition: "all 0.3s"
                }}>
                    {/* Departments List */}
                    {(!isMobile || !selectedDept) && (
                        <div>
                            <div style={{ fontWeight: "800", fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
                                Select Department
                            </div>
                            {loading ? (
                                <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>Loading departments...</div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {departments.map((dept, i) => {
                                        const name = getDeptName(dept);
                                        const colors = getDeptColor(i);
                                        const isSelected = selectedDept === name;

                                        // Count how many doctors in this dept
                                        const count = allDoctors.filter(d =>
                                            (d.department || "").toLowerCase() === name.toLowerCase() ||
                                            (d.specialty || "").toLowerCase() === name.toLowerCase()
                                        ).length;

                                        return (
                                            <motion.div
                                                key={name}
                                                whileHover={{ x: 4 }}
                                                onClick={() => setSelectedDept(name)}
                                                style={{
                                                    display: "flex", alignItems: "center", gap: "14px",
                                                    background: isSelected ? "#eff6ff" : "#fff",
                                                    padding: "14px 18px", borderRadius: "16px",
                                                    border: isSelected ? "1.5px solid #3b82f6" : "1px solid #f1f5f9",
                                                    cursor: "pointer", transition: "all 0.15s",
                                                }}
                                            >
                                                <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: colors.bg, color: colors.icon, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
                                                    🏥
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: "700", color: isSelected ? "#1d4ed8" : "#334155", fontSize: "14px" }}>{name}</div>
                                                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                                                        {count} doctor{count !== 1 ? "s" : ""} · View Doctors →
                                                    </div>
                                                </div>
                                                <div style={{ color: isSelected ? "#3b82f6" : "#cbd5e1", fontSize: "18px" }}>›</div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Doctors Panel */}
                    <AnimatePresence>
                        {selectedDept && (
                            <div style={{ width: "100%" }}>
                                {isMobile && (
                                    <button
                                        onClick={() => setSelectedDept(null)}
                                        style={{
                                            marginBottom: "16px", padding: "8px 16px", borderRadius: "10px",
                                            background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#64748b",
                                            fontWeight: "700", display: "flex", alignItems: "center", gap: "8px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        ← Back to Departments
                                    </button>
                                )}
                                <DeptDoctorsList
                                    department={selectedDept}
                                    allDoctors={allDoctors}
                                    onClose={() => setSelectedDept(null)}
                                    onEdit={doc => setEditingDoctor(doc)}
                                />
                            </div>
                        )}
                    </AnimatePresence>
                </div>

            </div>

            {/* Edit Doctor Modal */}
            <AnimatePresence>
                {editingDoctor && (
                    <EditDoctorModal
                        doctor={editingDoctor}
                        onClose={() => setEditingDoctor(null)}
                        onUpdate={() => {
                            setEditingDoctor(null);
                            showToast("Doctor profile updated successfully.");
                            load();
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}