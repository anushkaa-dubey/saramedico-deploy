"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./Step2.module.css";
import logo from "@/public/logo2.svg";
import { onboardDoctor } from "@/services/auth";
import { setAccessToken, setRefreshToken, setUser as setStoredUser, getUser as getStoredUser } from "@/services/tokenService";

export default function DoctorOnboardingStep2() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);
  
  // Additional required fields for backend
  const [profileData, setProfileData] = useState({
    phone: "",
    date_of_birth: "",
    gender: "",
    license_number: ""
  });

  useEffect(() => {
    // Detect if user signed up via Google (no signup_data in session)
    const signupData = JSON.parse(sessionStorage.getItem("signup_data") || "{}");
    const user = getStoredUser() || {};
    if (!signupData.password && user) {
      setIsGoogleAuth(true);
    }
  }, []);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const finishOnboarding = async () => {
    setLoading(true);
    setError("");
    try {
      const signupData = JSON.parse(sessionStorage.getItem("signup_data") || "{}");

      // For Google auth users, password is not required
      const hasPassword = signupData.password;
      
      if (!isGoogleAuth && (!signupData.email || !signupData.password)) {
        throw new Error("Signup credentials missing. Please restart registration.");
      }

      // Backend expects: password, confirm_password, specialty, phone_number, gender, date_of_birth, license_number
      const cleanPhone = profileData.phone ? `+${profileData.phone.replace(/\D/g, "")}` : "";
      
      const onboardingPayload = {
        specialty: signupData.specialty || "general_medicine",
        phone_number: cleanPhone || "+10000000000", // Fallback if skipped
        gender: profileData.gender || "Other",
        date_of_birth: profileData.date_of_birth || "1990-01-01",
        license_number: profileData.license_number || "PENDING"
      };

      // Only include password for email-based signups
      if (hasPassword) {
        onboardingPayload.password = signupData.password;
        onboardingPayload.confirm_password = signupData.password;
      }

      // Calls the onboardDoctor endpoint which consumes the onboarding token and returns the final access token
      const data = await onboardDoctor(onboardingPayload);
      
      const token = data.access_token || data.token;
      if (token) setAccessToken(token);
      if (data.refresh_token) setRefreshToken(data.refresh_token);

      const user = data?.user || data;
      // Mark onboarding as complete in local user object
      user.onboarding_complete = true;
      setStoredUser(user);

      // Clean up session data
      sessionStorage.removeItem("signup_data");

      router.push("/auth/signup/onboarding/doctor/step-3");
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      setError(err.message || "Failed to finalize registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.phone || !profileData.date_of_birth || !profileData.gender) {
      setError("Please fill in all personal details to activate your account.");
      return;
    }
    await finishOnboarding();
  };

  const handleSkip = async () => {
    await finishOnboarding();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src={logo.src} alt="SaraMedico" className={styles.logo} />
      </div>

      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.topBar}>
            <div className={styles.stepInfo}>
              <span className={styles.stepTitle}>STEP 2 OF 3</span>
              <h2 className={styles.mainTitle}>Profile Details</h2>
            </div>
            <div className={styles.progressSection}>
              <span className={styles.progressText}>66% Completed</span>
              <div className={styles.progressBarBg}>
                <div className={styles.progressBarFill} style={{ width: "66%" }}></div>
              </div>
            </div>
          </div>

          <div className={styles.mainContent}>
            <div className={styles.headerBlock}>
              <h1 className={styles.heading}>Finalize your Clinician Profile</h1>
              <p className={styles.subheading}>
                Provide your personal details to complete your profile setup.
              </p>
            </div>

            <div className={styles.cardContent}>
              <form onSubmit={handleSubmit} className={styles.formLayout}>
                {/* Personal Details Input */}
                <div style={{ maxWidth: "560px", margin: "0 auto" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#64748b", marginBottom: "16px", letterSpacing: "0.05em" }}>PERSONAL DETAILS</h4>
                  
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "#374151" }}>Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. 1234567890"
                      value={profileData.phone}
                      onChange={e => handleInputChange("phone", e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "#374151" }}>Date of Birth</label>
                    <input 
                      type="date" 
                      value={profileData.date_of_birth}
                      onChange={e => handleInputChange("date_of_birth", e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "#374151" }}>Gender</label>
                    <select 
                      value={profileData.gender}
                      onChange={e => handleInputChange("gender", e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", backgroundColor: "white" }}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "#374151" }}>License Number (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. MED12345"
                      value={profileData.license_number}
                      onChange={e => handleInputChange("license_number", e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
                    />
                  </div>

                  {error && <div style={{ color: "#ef4444", fontSize: "13px", marginTop: "16px", fontWeight: "600" }}>{error}</div>}
                </div>
              </form>
            </div>

            <div className={styles.footerActions} style={{display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #e2e8f0'}}>
              <button
                type="button"
                style={{ background: "transparent", border: "none", color: "#64748b", fontWeight: "600", cursor: "pointer", padding: "10px" }}
                onClick={() => router.back()}
              >
                Back
              </button>

              <div style={{ display: 'flex', gap: '16px' }}>
                <button
                  type="button"
                  style={{ background: "#f1f5f9", border: "none", color: "#475569", fontWeight: "600", padding: "12px 24px", borderRadius: "8px", cursor: "pointer" }}
                  onClick={handleSkip}
                  disabled={loading}
                >
                  Skip for now
                </button>
                <button
                  type="button"
                  style={{ background: "#3b82f6", border: "none", color: "white", fontWeight: "600", padding: "12px 24px", borderRadius: "8px", cursor: "pointer" }}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Continue →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}