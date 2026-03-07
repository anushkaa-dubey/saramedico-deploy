"use client";
import { useState, useEffect } from "react";
import { updateHospitalDoctor } from "@/services/hospital";

export default function DoctorDetailsModal({ doctor, onClose, onSuccess }) {
    const [form, setForm] = useState({
        name: "",
        specialty: "",
        department: "",
        department_role: "",
        license_number: ""
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (doctor) {
            setForm({
                name: doctor?.name || doctor?.full_name || "",
                specialty: doctor?.specialty || "",
                department: doctor?.department || "",
                department_role: doctor?.department_role || doctor?.role || "",
                license_number: doctor?.license_number || ""
            });
        }
    }, [doctor]);

    const handleSave = async () => {
        setSaving(true);
        setError("");
        try {
            const doctorId = doctor?.id || doctor?.doctor_id || doctor?.user_id;
            
            if (!doctorId) {
                setError("Doctor ID not found");
                setSaving(false);
                return;
            }

            await updateHospitalDoctor(doctorId, {
                name: form.name,
                specialty: form.specialty,
                department: form.department,
                department_role: form.department_role,
                license_number: form.license_number
            });
            
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error("Save failed:", err);
            setError(err.message || "Failed to save doctor information");
        } finally {
            setSaving(false);
        }
    };

    if (!doctor) return null;

    return (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "white", borderRadius: "12px", padding: "32px", width: "90%", maxWidth: "500px", boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}>
                <h2 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "800" }}>Edit Doctor Information</h2>
                
                {error && <div style={{ color: "#dc2626", fontSize: "13px", marginBottom: "16px", background: "#fee2e2", padding: "12px", borderRadius: "6px" }}>{error}</div>}
                
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                    <div>
                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "6px" }}>Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "6px" }}>Specialty</label>
                        <input
                            type="text"
                            value={form.specialty}
                            onChange={e => setForm({ ...form, specialty: e.target.value })}
                            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "6px" }}>Department</label>
                        <input
                            type="text"
                            value={form.department}
                            onChange={e => setForm({ ...form, department: e.target.value })}
                            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "6px" }}>Department Role</label>
                        <input
                            type="text"
                            value={form.department_role}
                            onChange={e => setForm({ ...form, department_role: e.target.value })}
                            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "6px" }}>License Number</label>
                        <input
                            type="text"
                            value={form.license_number}
                            onChange={e => setForm({ ...form, license_number: e.target.value })}
                            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
                        />
                    </div>
                </div>

                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                    <button
                        onClick={onClose}
                        style={{ padding: "10px 20px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "white", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{ padding: "10px 20px", borderRadius: "8px", background: "#3b82f6", color: "white", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "14px", opacity: saving ? 0.6 : 1 }}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}