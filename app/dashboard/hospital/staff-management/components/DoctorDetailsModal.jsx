"use client";
import { useState, useEffect } from "react";
import { updateHospitalDoctor } from "@/services/hospital";
import { motion } from "framer-motion";
import { SPECIALTY_LABELS, DEPARTMENTS, DEPARTMENT_ROLES } from "@/constants/medicalData";

export default function DoctorDetailsModal({ isOpen, onClose, doctor }) {
  const [form, setForm] = useState({
    name: "",
    department: "",
    department_role: "",
    specialty: "",
    license_number: "",
    status: "active",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (doctor) {
      setError("");
      setSuccess(false);
      setForm({
        name: doctor.name || doctor.full_name || "",
        department: doctor.department || "",
        department_role: doctor.department_role || "",
        specialty: doctor.specialty || doctor.specialization || "",
        license_number: doctor.license_number || "",
        status: doctor.status || "active",
      });
    }
  }, [doctor]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!doctor?.id) {
      setError("Doctor ID is missing. Cannot update.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      // Send all fields — backend ignores unchanged ones
      // NOTE FOR BACKEND TEAM: 'status' needs to be added to
      // PATCH /api/v1/hospital/doctor/{doctor_id} endpoint
      const updates = {
        name: form.name,
        department: form.department,
        department_role: form.department_role,
        specialty: form.specialty,
        license_number: form.license_number,
        status: form.status,
      };

      // Remove empty strings to avoid overwriting with blank
      Object.keys(updates).forEach(k => {
        if (updates[k] === "") delete updates[k];
      });

      await updateHospitalDoctor(doctor.id, updates);
      setSuccess(true);
      setTimeout(() => onClose(), 900);
    } catch (err) {
      console.error("Update failed:", err);
      setError("Failed to update doctor profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: "10px",
    border: "1.5px solid #e2e8f0", fontSize: "14px", color: "#1e293b",
    background: "#f8fafc", outline: "none", fontFamily: "inherit",
    fontWeight: "500", boxSizing: "border-box", transition: "border-color 0.2s",
    cursor: "pointer",
  };

  const labelStyle = {
    fontSize: "11px", fontWeight: "800", color: "#94a3b8",
    letterSpacing: "0.06em", textTransform: "uppercase",
    marginBottom: "6px", display: "block",
  };

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.5)", display: "flex",
        alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: "20px",
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "#fff", borderRadius: "20px", padding: "32px",
          width: "100%", maxWidth: "500px", maxHeight: "90vh",
          overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>
              Manage Doctor
            </h2>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>
              Update professional roles and availability
            </p>
          </div>
          <button onClick={onClose} style={{
            border: "none", background: "#f1f5f9", width: "36px", height: "36px",
            borderRadius: "10px", cursor: "pointer", fontSize: "18px", color: "#64748b",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>

        {error && (
          <div style={{
            background: "#fef2f2", color: "#991b1b", padding: "12px",
            borderRadius: "10px", marginBottom: "20px", fontSize: "13px", fontWeight: "600",
          }}>⚠️ {error}</div>
        )}

        {success && (
          <div style={{
            background: "#f0fdf4", color: "#166534", padding: "12px",
            borderRadius: "10px", marginBottom: "20px", fontSize: "13px", fontWeight: "600",
          }}>✓ Doctor updated successfully!</div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>

            {/* Full Name */}
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                style={{ ...inputStyle, cursor: "text" }}
                placeholder="Dr. Full Name"
              />
            </div>

            {/* Department + Status */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Department</label>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  style={{ ...inputStyle, appearance: "auto" }}
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  style={{ ...inputStyle, appearance: "auto" }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
            </div>

            {/* Department Role */}
            <div>
              <label style={labelStyle}>Department Role</label>
              <select
                name="department_role"
                value={form.department_role}
                onChange={handleChange}
                style={{ ...inputStyle, appearance: "auto" }}
              >
                <option value="">Select Role</option>
                {DEPARTMENT_ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Clinical Specialty — dropdown from shared constants */}
            <div>
              <label style={labelStyle}>Clinical Specialty</label>
              <select
                name="specialty"
                value={form.specialty}
                onChange={handleChange}
                style={{ ...inputStyle, appearance: "auto" }}
              >
                <option value="">Select Specialty</option>
                {SPECIALTY_LABELS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* License */}
            <div>
              <label style={labelStyle}>Medical License #</label>
              <input
                name="license_number"
                value={form.license_number}
                onChange={handleChange}
                style={{ ...inputStyle, cursor: "text" }}
                placeholder="MED-00000000"
              />
            </div>

          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{
              padding: "10px 20px", borderRadius: "10px",
              border: "1.5px solid #e2e8f0", background: "white",
              color: "#64748b", fontWeight: "700", cursor: "pointer", fontSize: "14px",
            }}>Cancel</button>
            <button type="submit" disabled={saving} style={{
              padding: "10px 24px", borderRadius: "10px", border: "none",
              background: saving ? "#93c5fd" : "#3b82f6",
              color: "white", fontWeight: "700",
              cursor: saving ? "not-allowed" : "pointer", fontSize: "14px",
              boxShadow: saving ? "none" : "0 4px 12px rgba(59,130,246,0.25)",
              transition: "all 0.2s",
            }}>{saving ? "Updating..." : "Update Doctor"}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}