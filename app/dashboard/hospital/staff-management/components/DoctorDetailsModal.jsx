"use client";
import { useState, useEffect } from "react";
import { updateHospitalDoctor } from "@/services/hospital";

export default function DoctorDetailsModal({ isOpen, onClose, doctorId }) {
  const [form, setForm] = useState({
    name: "",
    department: "",
    department_role: "",
    specialty: "",
    license_number: ""
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!doctorId) return;
    setForm({
      name: "",
      department: "",
      department_role: "",
      specialty: "",
      license_number: ""
    });
  }, [doctorId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await updateHospitalDoctor(doctorId, {
        name: form.name || undefined,
        department: form.department || undefined,
        department_role: form.department_role || undefined,
        specialty: form.specialty || undefined,
        license_number: form.license_number || undefined
      });

      alert("Doctor updated successfully");
      onClose();

    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update doctor");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "white",
        padding: "28px",
        borderRadius: "16px",
        width: "420px"
      }}>

        <h2 style={{
          fontSize: "18px",
          fontWeight: "800",
          marginBottom: "20px"
        }}>
          Manage Doctor
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

          <input
            name="name"
            placeholder="Doctor Name"
            value={form.name}
            onChange={handleChange}
          />

          <input
            name="department"
            placeholder="Department"
            value={form.department}
            onChange={handleChange}
          />

          <input
            name="department_role"
            placeholder="Department Role"
            value={form.department_role}
            onChange={handleChange}
          />

          <input
            name="specialty"
            placeholder="Specialty"
            value={form.specialty}
            onChange={handleChange}
          />

          <input
            name="license_number"
            placeholder="License Number"
            value={form.license_number}
            onChange={handleChange}
          />

        </div>

        <div style={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px"
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 14px",
              border: "1px solid #ddd",
              borderRadius: "6px"
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "8px 14px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px"
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

      </div>
    </div>
  );
}