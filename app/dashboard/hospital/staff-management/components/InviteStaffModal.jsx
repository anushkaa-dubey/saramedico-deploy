"use client";
import { useState } from "react";
import { createHospitalDoctor } from "@/services/hospital";
import { Eye, EyeOff } from "lucide-react";

export default function InviteStaffModal({ isOpen, onClose, onSuccess }) {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    department_role: "",
    license_number: ""
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createHospitalDoctor(formData);

      onSuccess();

      setFormData({
        name: "",
        email: "",
        password: "",
        department: "",
        department_role: "",
        license_number: ""
      });

    } catch (err) {
      console.error("Create doctor failed:", err);
      alert("Failed to create doctor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position:'fixed',
      inset:0,
      background:'rgba(0,0,0,0.5)',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      zIndex:1000
    }}>

      <div style={{
        background:'white',
        padding:'30px',
        borderRadius:'16px',
        width:'100%',
        maxWidth:'420px'
      }}>

        <h2 style={{fontWeight:800, marginBottom:"20px"}}>
          Add Doctor
        </h2>

        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'14px'}}>

          <input
            required
            placeholder="Doctor Name"
            value={formData.name}
            onChange={(e)=>setFormData({...formData,name:e.target.value})}
          />

          <input
            required
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e)=>setFormData({...formData,email:e.target.value})}
          />

          <div style={{ position: "relative" }}>
            <input
              required
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={(e)=>setFormData({...formData,password:e.target.value})}
              style={{ width: "100%", paddingRight: "40px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#9ca3af",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>


          <input
            placeholder="Department"
            value={formData.department}
            onChange={(e)=>setFormData({...formData,department:e.target.value})}
          />

          <input
            placeholder="Department Role"
            value={formData.department_role}
            onChange={(e)=>setFormData({...formData,department_role:e.target.value})}
          />

          <input
            placeholder="License Number"
            value={formData.license_number}
            onChange={(e)=>setFormData({...formData,license_number:e.target.value})}
          />

          <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>

            <button
              type="button"
              onClick={onClose}
              style={{flex:1}}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{flex:1}}
            >
              {loading ? "Creating..." : "Create Doctor"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}