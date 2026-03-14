"use client";
import { useState } from "react";
import { createHospitalDoctor } from "@/services/hospital";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { SPECIALTY_LABELS, DEPARTMENTS, DEPARTMENT_ROLES } from "@/constants/medicalData";

export default function InviteStaffModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    department_role: "",
    license_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createHospitalDoctor(formData);
      setFormData({
        name: "", email: "", password: "",
        department: "", department_role: "", license_number: "",
      });
      onSuccess();
    } catch (err) {
      console.error("Create doctor failed:", err);
      setError(err?.message || "Failed to create doctor. Please check the details and try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1.5px solid #e2e8f0",
    fontSize: "14px",
    color: "#1e293b",
    background: "#f8fafc",
    outline: "none",
    fontFamily: "inherit",
    fontWeight: "500",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    fontSize: "11px",
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "6px",
    display: "block",
  };

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.5)", display: "flex",
        alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: "16px",
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "clamp(20px, 4vw, 32px)",
          width: "100%",
          maxWidth: "520px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: "24px",
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>
              Add Doctor
            </h2>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>
              Create a new doctor account for this hospital
            </p>
          </div>
          <button onClick={onClose} style={{
            border: "none", background: "#f1f5f9", width: "36px", height: "36px",
            borderRadius: "10px", cursor: "pointer", fontSize: "18px", color: "#64748b",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>×</button>
        </div>

        {error && (
          <div style={{
            background: "#fef2f2", color: "#991b1b", padding: "12px",
            borderRadius: "10px", marginBottom: "20px",
            fontSize: "13px", fontWeight: "600",
          }}>⚠️ {error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>

            {/* Full Name — full width */}
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Dr. Full Name"
              />
            </div>

            {/* Email — full width */}
            <div>
              <label style={labelStyle}>Email</label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={inputStyle}
                placeholder="doctor@hospital.com"
              />
            </div>

            {/* Password — full width */}
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ ...inputStyle, paddingRight: "42px" }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: "12px", top: "50%",
                    transform: "translateY(-50%)", background: "none",
                    border: "none", cursor: "pointer", color: "#94a3b8",
                    display: "flex", alignItems: "center", padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Department — full width */}
            <div>
              <label style={labelStyle}>Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                style={{ ...inputStyle, appearance: "auto", cursor: "pointer" }}
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Department Role — full width */}
            <div>
              <label style={labelStyle}>Department Role</label>
              <select
                name="department_role"
                value={formData.department_role}
                onChange={handleChange}
                style={{ ...inputStyle, appearance: "auto", cursor: "pointer" }}
              >
                <option value="">Select Role</option>
                {DEPARTMENT_ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* License Number — full width */}
            <div>
              <label style={labelStyle}>License Number</label>
              <input
                name="license_number"
                value={formData.license_number}
                onChange={handleChange}
                style={inputStyle}
                placeholder="MED-00000000"
              />
            </div>

          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px", borderRadius: "10px",
                border: "1.5px solid #e2e8f0", background: "white",
                color: "#64748b", fontWeight: "700",
                cursor: "pointer", fontSize: "14px",
              }}
            >Cancel</button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 24px", borderRadius: "10px", border: "none",
                background: loading ? "#93c5fd" : "#3b82f6",
                color: "white", fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "14px",
                boxShadow: loading ? "none" : "0 4px 12px rgba(59,130,246,0.25)",
                transition: "all 0.2s",
              }}
            >{loading ? "Creating..." : "Create Doctor"}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}