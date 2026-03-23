"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import logo from "@/public/logo2.svg";
import { onboardHospital } from "@/services/auth";

export default function HospitalOnboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    organization_name: "",
    phone_number: "",
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.organization_name || !formData.phone_number) {
      setError("Please fill in all details.");
      return;
    }

    setLoading(true);
    try {
      const signupData = JSON.parse(sessionStorage.getItem("signup_data") || "{}");
      const hasPassword = signupData.password;

      // For Google auth users, password is not required
      if (hasPassword && (!signupData.email || !signupData.password)) {
        throw new Error("Signup credentials missing. Please restart registration.");
      }

      const cleanPhone = `+${formData.phone_number.replace(/\D/g, "")}`;
      
      const payload = {
        organization_name: formData.organization_name,
        phone_number: cleanPhone
      };

      // Only include password for email-based signups
      if (hasPassword) {
        payload.password = signupData.password;
        payload.confirm_password = signupData.password;
      }

      const data = await onboardHospital(payload);
      
      const token = data.access_token || data.token;
      if (token) localStorage.setItem("authToken", token);
      if (data.refresh_token) localStorage.setItem("refreshToken", data.refresh_token);

      const user = data?.user || data;
      // Mark onboarding as complete in local user object
      user.onboarding_complete = true;
      localStorage.setItem("user", JSON.stringify(user));

      // Clean up session data
      sessionStorage.removeItem("signup_data");

      router.push("/dashboard/hospital");
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      setError(err.message || "Failed to finalize registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc", fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      <div style={{ padding: "24px", position: "absolute", top: 0, left: 0 }}>
        <img src={logo.src} alt="SaraMedico" style={{ height: "30px" }} />
      </div>

      <div style={{ margin: "auto", width: "100%", maxWidth: "600px", background: "white", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", padding: "40px" }}>
        
        <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>Complete Hospital Setup</h2>
        <p style={{ color: "#64748b", fontSize: "15px", marginBottom: "32px" }}>
          Provide your organization details to finalize registration.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "#374151" }}>Organization Name</label>
            <input 
              type="text" 
              placeholder="e.g. General Hospital"
              value={formData.organization_name}
              onChange={e => handleInputChange("organization_name", e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "15px" }}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "#374151" }}>Contact Phone</label>
            <PhoneInput
                country={"us"} 
                value={formData.phone_number}
                onChange={(phone) => handleInputChange("phone_number", phone)}
                inputProps={{ required: true, autoComplete: "tel" }}
                inputStyle={{ width: "100%", height: "46px", fontSize: "15px", borderRadius: "8px", border: "1px solid #ddd" }}
                buttonStyle={{ border: "1px solid #ddd", borderRight: "none", borderRadius: "8px 0 0 8px", backgroundColor: "#f9fafb" }}
                enableSearch={true}
            />
          </div>

          {error && <div style={{ color: "#ef4444", fontSize: "14px", fontWeight: "600", marginTop: "8px" }}>{error}</div>}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
            <button
                type="submit"
                style={{ background: "#3b82f6", border: "none", color: "white", fontWeight: "600", padding: "14px 32px", borderRadius: "8px", cursor: "pointer", fontSize: "15px", width: "100%" }}
                disabled={loading}
            >
                {loading ? "Completing setup..." : "Enter Workspace →"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
