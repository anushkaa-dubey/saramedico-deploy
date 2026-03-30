"use client";
import { useState, useEffect, useRef } from "react";
import { createHospitalDoctor } from "@/services/hospital";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { DEPARTMENTS, DEPARTMENT_ROLES } from "@/constants/medicalData";

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
  const [openDropdown, setOpenDropdown] = useState(null); // 'department' | 'department_role' | null
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
    maxWidth: "100%",
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

  const dropdownListStyle = {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1.5px solid #e2e8f0",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    zIndex: 9999,
    maxHeight: "220px",
    overflowY: "auto",
    margin: 0,
    padding: "6px",
    listStyle: "none",
    scrollbarWidth: "thin",
    scrollbarColor: "#e2e8f0 transparent",
  };

  const dropdownItemStyle = (active) => ({
    padding: "10px 12px",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: active ? "700" : "500",
    color: active ? "#2563eb" : "#1e293b",
    background: active ? "#eff6ff" : "transparent",
    transition: "background 0.15s",
  });

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: "20px",
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          background: "#fff",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          // ✅ overflow: "hidden" removed — it was clipping the custom dropdowns
        }}
      >
        {/* Header */}
        <div style={{
          padding: "24px 32px",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(to right, #f8fafc, #ffffff)",
          borderRadius: "24px 24px 0 0",
          flexShrink: 0,
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
            borderRadius: "12px", cursor: "pointer", fontSize: "20px", color: "#64748b",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}>×</button>
        </div>

        {/* Scrollable Content */}
        <div style={{
          padding: "32px",
          overflowY: "auto",
          flex: 1,
          scrollbarWidth: "thin",
          scrollbarColor: "#e2e8f0 transparent",
          borderRadius: "0 0 24px 24px",
        }}>
          {error && (
            <div style={{
              background: "#fef2f2",
              color: "#991b1b",
              padding: "14px",
              borderRadius: "12px",
              marginBottom: "24px",
              fontSize: "13px",
              fontWeight: "600",
              border: "1px solid #fee2e2",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "20px",
              marginBottom: "32px"
            }}>

              {/* Full Name */}
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

              {/* Email */}
              <div>
                <label style={labelStyle}>Email Address</label>
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

              {/* Password */}
              <div>
                <label style={labelStyle}>Temporary Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ ...inputStyle, paddingRight: "48px" }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute", right: "14px", top: "50%",
                      transform: "translateY(-50%)", background: "none",
                      border: "none", cursor: "pointer", color: "#94a3b8",
                      display: "flex", alignItems: "center", padding: 0,
                      transition: "color 0.2s"
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Department & Role */}
              <div
                ref={dropdownRef}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: "20px",
                }}
              >
                {/* Department */}
                <div>
                  <label style={labelStyle}>Department</label>
                  <div style={{ position: "relative" }}>
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(openDropdown === "department" ? null : "department")}
                      style={{
                        ...inputStyle,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        paddingRight: "14px",
                      }}
                    >
                      <span style={{
                        color: formData.department ? "#1e293b" : "#94a3b8",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                      }}>
                        {formData.department || "Select Department"}
                      </span>
                      <ChevronDown size={16} style={{
                        color: "#94a3b8", flexShrink: 0, marginLeft: "8px",
                        transform: openDropdown === "department" ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s"
                      }} />
                    </button>
                    {openDropdown === "department" && (
                      <ul style={dropdownListStyle}>
                        {DEPARTMENTS.map(d => (
                          <li
                            key={d}
                            onClick={() => {
                              handleChange({ target: { name: "department", value: d } });
                              setOpenDropdown(null);
                            }}
                            style={dropdownItemStyle(formData.department === d)}
                          >
                            {d}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Department Role */}
                <div>
                  <label style={labelStyle}>Department Role</label>
                  <div style={{ position: "relative" }}>
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(openDropdown === "department_role" ? null : "department_role")}
                      style={{
                        ...inputStyle,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        paddingRight: "14px",
                      }}
                    >
                      <span style={{
                        color: formData.department_role ? "#1e293b" : "#94a3b8",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                      }}>
                        {formData.department_role || "Select Role"}
                      </span>
                      <ChevronDown size={16} style={{
                        color: "#94a3b8", flexShrink: 0, marginLeft: "8px",
                        transform: openDropdown === "department_role" ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s"
                      }} />
                    </button>
                    {openDropdown === "department_role" && (
                      <ul style={dropdownListStyle}>
                        {DEPARTMENT_ROLES.map(r => (
                          <li
                            key={r}
                            onClick={() => {
                              handleChange({ target: { name: "department_role", value: r } });
                              setOpenDropdown(null);
                            }}
                            style={dropdownItemStyle(formData.department_role === r)}
                          >
                            {r}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* License Number */}
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
            <div style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              marginTop: "16px"
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "12px 24px", borderRadius: "12px",
                  border: "1.5px solid #e2e8f0", background: "white",
                  color: "#64748b", fontWeight: "700",
                  cursor: "pointer", fontSize: "14px",
                  transition: "all 0.2s"
                }}
              >Cancel</button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "12px 32px", borderRadius: "12px", border: "none",
                  background: loading ? "#93c5fd" : "linear-gradient(to right, #3b82f6, #2563eb)",
                  color: "white", fontWeight: "700",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  boxShadow: loading ? "none" : "0 4px 12px rgba(37, 99, 235, 0.2)",
                  transition: "all 0.2s",
                }}
              >{loading ? "Creating..." : "Create Doctor"}</button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}