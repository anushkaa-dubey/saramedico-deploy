"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupUser, googleLogin, appleLogin } from "@/services/auth";
import { Eye, EyeOff } from "lucide-react";
import styles from "./SignupForm.module.css";

export default function SignupForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isClient, setIsClient] = useState(false);
  
  // Unified simple state
  const [role, setRole] = useState("doctor");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const activePassword = formData.password;
  const hasMinLength = activePassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(activePassword);
  const hasNumber = /[0-9]/.test(activePassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(activePassword);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    if (apiError) setApiError("");
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";
    
    if (!formData.password) newErrors.password = "Password is required";
    else if (!hasMinLength || !hasUppercase || !hasNumber || !hasSpecial) {
      newErrors.password = "Password does not meet all requirements";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setApiError("");
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role
      };

      // 1. Initial backend account creation logic returning Onboarding token
      const data = await signupUser(payload);
      
      const token = data.access_token || data.token;
      if (token) {
        localStorage.setItem("authToken", token); // AuthToken captures Onboarding Scope token safely
      }

      // 2. Safely capture the password dynamically into SessionStorage so they don't have to rewrite it for Onboarding Endpoints!
      sessionStorage.setItem("signup_data", JSON.stringify(payload));
      
      // 3. Organically transition to Onboarding
      if (role === "doctor") {
        router.push("/auth/signup/onboarding/doctor/step-1");
      } else if (role === "hospital") {
        router.push("/auth/signup/onboarding/hospital");
      }
      
    } catch (err) {
      console.error("Signup failed:", err);
      setApiError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    googleLogin(role);
  };

  const handleAppleSignup = () => {
    appleLogin(role);
  };

  if (!isClient) return null;

  return (
    <>
      <div style={{ display: "flex", borderBottom: "1px solid #eee", marginBottom: "24px" }}>
        <Link
          href="/auth/login"
          style={{
            flex: 1,
            padding: "14px",
            textAlign: "center",
            textDecoration: "none",
            color: "#6b7280",
            fontWeight: "500",
            borderBottom: "2px solid transparent"
          }}
        >
          Login
        </Link>
        <div style={{
          flex: 1,
          padding: "14px",
          textAlign: "center",
          fontWeight: "600",
          color: "#4361ee",
          borderBottom: "2px solid #4361ee",
          cursor: "default"
        }}>
          Sign Up
        </div>
      </div>

      <h2>Create Account</h2>
      <p className="subtext">Set up your profile credentials.</p>

      <form onSubmit={handleSignup}>
      
        <div style={{display: 'flex', gap: '15px', marginBottom: '20px', marginTop: '10px'}}>
            <button 
                type="button" 
                onClick={() => setRole("doctor")}
                style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: role === "doctor" ? '2px solid #4361ee' : '1px solid #e5e7eb',
                    backgroundColor: role === "doctor" ? '#eff6ff' : '#fff',
                    color: role === "doctor" ? '#1e40af' : '#4b5563',
                    fontWeight: role === "doctor" ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                ⚕️ Doctor
            </button>
            <button 
                type="button" 
                onClick={() => setRole("hospital")}
                style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: role === "hospital" ? '2px solid #4361ee' : '1px solid #e5e7eb',
                    backgroundColor: role === "hospital" ? '#eff6ff' : '#fff',
                    color: role === "hospital" ? '#1e40af' : '#4b5563',
                    fontWeight: role === "hospital" ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                🏥 Hospital
            </button>
        </div>

        <label htmlFor="name" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>Full Name</label>
        <input
          id="name" type="text" name="name" autoComplete="name" placeholder="Dr. Sarah / General Hospital Admin"
          value={formData.name} onChange={e => handleInputChange("name", e.target.value)}
          style={{ borderColor: errors.name ? "#ef4444" : "#ddd", width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "12px", marginTop: "4px" }} required
        />
        {errors.name && <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-8px", marginBottom: "12px" }}>{errors.name}</p>}

        <label htmlFor="email" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>Email Address</label>
        <input
          id="email" type="email" name="email" autoComplete="email" placeholder="example@gmail.com"
          value={formData.email} onChange={e => handleInputChange("email", e.target.value)}
          style={{ borderColor: errors.email ? "#ef4444" : "#ddd", width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "12px", marginTop: "4px" }} required
        />
        {errors.email && <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-8px", marginBottom: "12px" }}>{errors.email}</p>}

        <div className={styles.passwordReqs}>
          <p className={styles.passwordReqsTitle}>Password Requirements:</p>
          <ul className={styles.passwordReqsList}>
            <li className={hasMinLength ? styles.reqMet : styles.reqUnmet}>At least 8 characters</li>
            <li className={hasUppercase ? styles.reqMet : styles.reqUnmet}>One uppercase letter (A-Z)</li>
            <li className={hasNumber ? styles.reqMet : styles.reqUnmet}>One number (0-9)</li>
            <li className={hasSpecial ? styles.reqMet : styles.reqUnmet}>One special character (!@#)</li>
          </ul>
        </div>

        <label htmlFor="password" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>Password</label>
        <div style={{ position: "relative", marginBottom: "12px", marginTop: "4px" }}>
          <input
            id="password" type={showPassword ? "text" : "password"}
            name="new-password" autoComplete="new-password" placeholder="Create a strong password"
            value={formData.password} onChange={e => handleInputChange("password", e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: errors.password ? "1px solid #ef4444" : "1px solid #ddd" }} required
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
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
              justifyContent: "center",
              height: "100%"
            }}>
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-8px", marginBottom: "12px" }}>{errors.password}</p>}

        {apiError && <p style={{ color: "#ef4444", fontSize: "14px", fontWeight: "600", marginTop: "12px" }}>{apiError}</p>}

        <button className="primary-btn" disabled={loading} style={{marginTop: "20px"}}>
          {loading ? "Creating Account..." : "Confirm Credentials"}
        </button>

        <p style={{ fontSize: "12px", color: "#6b7280", textAlign: "center", marginTop: "24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          <span style={{ fontSize: "14px" }}>🛡️</span>
          HIPAA Compliant &amp; Secure Data Processing
        </p>

        <div className="divider">OR</div>

        <button type="button" className="social-btn" onClick={handleAppleSignup}>
          <img src="/icons/apple.svg" alt="Apple" />
          Continue with Apple ID
        </button>

        <button type="button" className="social-btn" onClick={handleGoogleSignup}>
          <img src="/icons/google.svg" alt="Google" />
          Continue with Google
        </button>
        
        <div className="bottom-text">
            Already have an account? <Link href="/auth/login">Login</Link>
        </div>

      </form>
    </>
  );
}