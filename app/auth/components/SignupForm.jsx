"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { registerUser, registerHospital, loginUser } from "@/services/auth";
import { Eye, EyeOff } from "lucide-react";

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [role, setRole] = useState("doctor");

  // ── Doctor / default fields ──────────────────────────────────────────────
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    organization_name: ""
  });

  // ── Hospital-only fields ─────────────────────────────────────────────────
  const [hospitalForm, setHospitalForm] = useState({
    organization_name: "",
    admin_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirm_password: ""
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const urlRole = searchParams.get("role");
    const sessionRole = typeof window !== "undefined" ? sessionStorage.getItem("selectedRole") : null;
    const resolvedRole = urlRole || sessionRole || "doctor";

    if (resolvedRole === "patient" || resolvedRole === "admin" || resolvedRole === "administrator") {
      router.push(`/auth/login?role=${resolvedRole === "patient" ? "patient" : "admin"}`);
      return;
    }

    setRole(resolvedRole);
    setFormData(prev => ({ ...prev, role: resolvedRole }));
  }, [searchParams, router]);

  const activePassword = role === "hospital" ? hospitalForm.password : formData.password;
  const hasMinLength = activePassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(activePassword);
  const hasNumber = /[0-9]/.test(activePassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(activePassword);
  const activeConfirm = role === "hospital" ? hospitalForm.confirm_password : formData.confirm_password;
  const passwordsMatch = activePassword && activeConfirm && activePassword === activeConfirm;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    if (apiError) setApiError("");
  };

  const handleHospitalChange = (field, value) => {
    setHospitalForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    if (apiError) setApiError("");
  };

  const validateHospital = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!hospitalForm.organization_name.trim()) newErrors.organization_name = "Organization name is required";
    if (!hospitalForm.admin_name.trim()) newErrors.admin_name = "Admin name is required";
    if (!hospitalForm.email) newErrors.email = "Email is required";
    else if (!emailRegex.test(hospitalForm.email)) newErrors.email = "Invalid email format";
    if (!hospitalForm.phone_number || hospitalForm.phone_number.length < 8) newErrors.phone_number = "Valid phone number is required";
    if (!hospitalForm.password) newErrors.password = "Password is required";
    else if (!hasMinLength || !hasUppercase || !hasNumber || !hasSpecial) newErrors.password = "Password does not meet all requirements";
    if (hospitalForm.password !== hospitalForm.confirm_password) newErrors.confirm_password = "Passwords do not match";
    if (!termsAccepted) newErrors.terms = "You must accept the Privacy Policy and Terms.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDoctor = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!formData.phone || formData.phone.length < 8) newErrors.phone = "Valid phone number is required";
    if (!formData.date_of_birth) newErrors.date_of_birth = "Date of Birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (!hasMinLength || !hasUppercase || !hasNumber || !hasSpecial) newErrors.password = "Password does not meet all requirements";
    if (formData.password !== formData.confirm_password) newErrors.confirm_password = "Passwords do not match";
    if (formData.role !== "patient" && !formData.organization_name.trim()) newErrors.organization_name = "Organization name is required";
    if (!termsAccepted) newErrors.terms = "You must accept the Privacy Policy and Terms.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    setApiError("");

    const isValid = role === "hospital" ? validateHospital() : validateDoctor();
    if (!isValid) return;

    setLoading(true);
    try {
      if (role === "hospital") {
        const cleanPhone = `+${hospitalForm.phone_number.replace(/\D/g, "")}`;
        await registerHospital({
          organization_name: hospitalForm.organization_name,
          admin_name: hospitalForm.admin_name,
          email: hospitalForm.email,
          phone_number: cleanPhone,
          password: hospitalForm.password
        });
        await loginUser({ email: hospitalForm.email, password: hospitalForm.password });
        router.push("/dashboard/hospital");

      } else if (role === "doctor") {
        const cleanPhone = `+${formData.phone.replace(/\D/g, "")}`;
        const payload = {
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirm_password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: cleanPhone,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          role: formData.role,
          organization_name: formData.organization_name
        };
        sessionStorage.setItem("signup_data", JSON.stringify(payload));
        router.push("/auth/signup/onboarding/doctor/step-1");

      } else {
        const cleanPhone = `+${formData.phone.replace(/\D/g, "")}`;
        const payload = {
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirm_password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: cleanPhone,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          role: formData.role,
          organization_name: formData.organization_name
        };
        await registerUser(payload);
        await loginUser({ email: formData.email, password: formData.password });
        router.push(`/dashboard/${role}`);
      }
    } catch (err) {
      console.error("Signup failed:", err);
      setApiError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return null;

  // ═════════════════════════════════════════════════════════════════════════
  // HOSPITAL SIGNUP FORM
  // ═════════════════════════════════════════════════════════════════════════
  if (role === "hospital") {
    return (
      <>
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #eee", marginBottom: "24px" }}>
          <Link
            href={`/auth/login?role=hospital`}
            style={{ flex: 1, padding: "14px", textAlign: "center", textDecoration: "none", color: "#6b7280", fontWeight: "500", borderBottom: "2px solid transparent" }}
          >
            Login
          </Link>
          <div style={{ flex: 1, padding: "14px", textAlign: "center", fontWeight: "600", color: "#4361ee", borderBottom: "2px solid #4361ee", cursor: "default" }}>
            Sign Up
          </div>
        </div>

        <h2>Register Hospital</h2>
        <p className="subtext" style={{ marginBottom: "16px" }}>Set up your hospital organization and admin account.</p>

        {/* Role Badge */}
        <div style={{ background: "#f0f9ff", padding: "12px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #e0f2fe" }}>
          <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#0c4a6e", fontWeight: "600" }}>Role: Hospital</p>
          <p style={{ margin: 0, fontSize: "12px", color: "#0369a1", opacity: 0.9 }}>Role defines access to clinical features.</p>
          <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#64748b", fontStyle: "italic" }}>* Role selection is immutable after signup.</p>
        </div>

        <form onSubmit={handleSignup}>
          {/* Organization Name */}
          <label htmlFor="organization_name" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>Organization Name</label>
          <input
            id="organization_name"
            type="text"
            placeholder="General Hospital"
            value={hospitalForm.organization_name}
            onChange={e => handleHospitalChange("organization_name", e.target.value)}
            style={{ borderColor: errors.organization_name ? "#ef4444" : "#ddd" }}
            required
          />
          {errors.organization_name && (
            <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-8px", marginBottom: "12px" }}>{errors.organization_name}</p>
          )}

          {/* Admin Name */}
          <label htmlFor="admin_name" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>Admin Full Name</label>
          <input
            id="admin_name"
            type="text"
            placeholder="Dr. Sarah Smith"
            value={hospitalForm.admin_name}
            onChange={e => handleHospitalChange("admin_name", e.target.value)}
            style={{ borderColor: errors.admin_name ? "#ef4444" : "#ddd" }}
            required
          />
          {errors.admin_name && (
            <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-8px", marginBottom: "12px" }}>{errors.admin_name}</p>
          )}

          {/* Email */}
          <label htmlFor="h_email" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>Email Address</label>
          <input
            id="h_email"
            type="email"
            placeholder="admin@hospital.com"
            value={hospitalForm.email}
            onChange={e => handleHospitalChange("email", e.target.value)}
            style={{ borderColor: errors.email ? "#ef4444" : "#ddd" }}
            required
          />
          {errors.email && (
            <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-8px", marginBottom: "12px" }}>{errors.email}</p>
          )}

          {/* Phone */}
          <label htmlFor="phone_number" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>Phone Number</label>
          <div style={{ marginBottom: "4px" }}>
            <PhoneInput
              country={"us"}
              value={hospitalForm.phone_number}
              onChange={(phone) => handleHospitalChange("phone_number", phone)}
              inputProps={{ id: "phone_number", name: "phone_number", required: true, autoComplete: "tel" }}
              inputStyle={{ width: "100%", height: "42px", fontSize: "15px", borderRadius: "6px", border: errors.phone_number ? "1px solid #ef4444" : "1px solid #ddd" }}
              buttonStyle={{ border: errors.phone_number ? "1px solid #ef4444" : "1px solid #ddd", borderRight: "none", borderRadius: "6px 0 0 6px", backgroundColor: "#f9fafb" }}
              enableSearch={true}
            />
          </div>
          <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px", marginBottom: "16px" }}>Used only for verification and security.</p>
          {errors.phone_number && (
            <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-12px", marginBottom: "12px" }}>{errors.phone_number}</p>
          )}

          {/* Password Strength */}
          <div style={{ background: "#f3f4f6", padding: "12px", borderRadius: "8px", marginBottom: "16px", border: "1px solid #e5e7eb" }}>
            <p style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: "600", color: "#374151" }}>Password Requirements:</p>
            <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "12px", color: "#4b5563" }}>
              <li style={{ color: hasMinLength ? "#16a34a" : "inherit", transition: "color 0.2s" }}>At least 8 characters</li>
              <li style={{ color: hasUppercase ? "#16a34a" : "inherit", transition: "color 0.2s" }}>One uppercase letter (A-Z)</li>
              <li style={{ color: hasNumber ? "#16a34a" : "inherit", transition: "color 0.2s" }}>One number (0-9)</li>
              <li style={{ color: hasSpecial ? "#16a34a" : "inherit", transition: "color 0.2s" }}>One special character (!@#)</li>
            </ul>
          </div>

          {/* Password */}
          <label htmlFor="h_password" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>Password</label>
          <div style={{ position: "relative" }}>
            <input
              id="h_password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a strong password"
              value={hospitalForm.password}
              onChange={e => handleHospitalChange("password", e.target.value)}
              style={{ borderColor: errors.password ? "#ef4444" : "#ddd", width: "100%", paddingRight: "40px" }}
              required
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

          {errors.password && (
            <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-8px", marginBottom: "12px" }}>{errors.password}</p>
          )}

          {/* Confirm Password */}
          <div style={{ position: "relative" }}>
            <input
              id="h_confirm"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Confirm your password"
              value={hospitalForm.confirm_password}
              onChange={e => handleHospitalChange("confirm_password", e.target.value)}
              style={{
                borderColor: hospitalForm.confirm_password && !passwordsMatch ? "#ef4444" : passwordsMatch ? "#16a34a" : "#ddd",
                paddingRight: "50px",
                width: "100%"
              }}
              required
            />
            <div style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
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
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {hospitalForm.confirm_password && (
                <span style={{ color: passwordsMatch ? "#16a34a" : "#ef4444", fontWeight: "bold", fontSize: "16px" }}>
                  {passwordsMatch ? "✓" : "✗"}
                </span>
              )}
            </div>
          </div>

          {errors.confirm_password && (
            <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-8px", marginBottom: "12px" }}>{errors.confirm_password}</p>
          )}

          {/* Terms */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px", alignItems: "flex-start", marginTop: "12px" }}>
            <input
              type="checkbox"
              id="h_terms"
              checked={termsAccepted}
              onChange={e => { setTermsAccepted(e.target.checked); if (e.target.checked && errors.terms) setErrors(prev => ({ ...prev, terms: "" })); }}
              style={{ width: "18px", height: "18px", marginTop: "2px", cursor: "pointer" }}
            />
            <label htmlFor="h_terms" style={{ fontSize: "14px", fontWeight: "400", lineHeight: "1.4", marginBottom: 0, cursor: "pointer", color: "#374151" }}>
              I agree to the <a href="#" style={{ color: "#4361ee" }}>Privacy Policy</a> and <a href="#" style={{ color: "#4361ee" }}>Terms of Service</a>.
            </label>
          </div>
          {errors.terms && (
            <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-16px", marginBottom: "16px" }}>{errors.terms}</p>
          )}

          {apiError && (
            <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginBottom: "16px" }}>{apiError}</p>
          )}

          <button className="primary-btn" disabled={loading} style={{ fontSize: "15px", fontWeight: "600", padding: "12px" }}>
            {loading ? "Registering Hospital..." : "Register Hospital"}
          </button>

          <p style={{ fontSize: "12px", color: "#6b7280", textAlign: "center", marginTop: "24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <span style={{ fontSize: "14px" }}>🛡️</span> HIPAA Compliant &amp; Secure Data Processing
          </p>

          <div className="bottom-text">
            Already have an account? <Link href="/auth/login?role=hospital">Login</Link>
          </div>
        </form>
      </>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // DOCTOR / DEFAULT SIGNUP FORM (unchanged)
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <>
      {/* Visual Tabs for Login / Sign Up */}
      <div style={{ display: "flex", borderBottom: "1px solid #eee", marginBottom: "24px" }}>
        <Link
          href={`/auth/login?role=${role}`}
          style={{ flex: 1, padding: "14px", textAlign: "center", textDecoration: "none", color: "#6b7280", fontWeight: "500", borderBottom: "2px solid transparent" }}
        >
          Login
        </Link>
        <div style={{ flex: 1, padding: "14px", textAlign: "center", fontWeight: "600", color: "#4361ee", borderBottom: "2px solid #4361ee", cursor: "default" }}>
          Sign Up
        </div>
      </div>

      <h2>Create Account</h2>
      <p className="subtext" style={{ marginBottom: "16px" }}>Create your {role === "doctor" ? "clinician" : "account"} profile.</p>

      {/* Role Messaging */}
      {role && (
        <div style={{ background: "#f0f9ff", padding: "12px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #e0f2fe" }}>
          <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#0c4a6e", fontWeight: "600" }}>
            Role: {role.charAt(0).toUpperCase() + role.slice(1)}
          </p>
          <p style={{ margin: 0, fontSize: "12px", color: "#0369a1", opacity: 0.9 }}>Role defines access to clinical features.</p>
          <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#64748b", fontStyle: "italic" }}>* Role selection is immutable after signup.</p>
        </div>
      )}

      <form onSubmit={handleSignup}>
        {/* First Name */}
        <label htmlFor="first_name" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>First Name</label>
        <input
          id="first_name"
          type="text"
          name="given-name"
          autoComplete="given-name"
          placeholder="John"
          value={formData.first_name}
          onChange={e => handleInputChange("first_name", e.target.value)}
          style={{ borderColor: errors.first_name ? "#ef4444" : "#ddd" }}
          required
        />
        {errors.first_name && <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-8px", marginBottom: "12px" }}>{errors.first_name}</p>}

        {/* Last Name */}
        <label htmlFor="last_name" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>Last Name</label>
        <input
          id="last_name"
          type="text"
          name="family-name"
          autoComplete="family-name"
          placeholder="Doe"
          value={formData.last_name}
          onChange={e => handleInputChange("last_name", e.target.value)}
          style={{ borderColor: errors.last_name ? "#ef4444" : "#ddd" }}
          required
        />
        {errors.last_name && <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-8px", marginBottom: "12px" }}>{errors.last_name}</p>}

        {/* Email */}
        <label htmlFor="email" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>Email Address</label>
        <input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="dr.hops@gmail.org"
          value={formData.email}
          onChange={e => handleInputChange("email", e.target.value)}
          style={{ borderColor: errors.email ? "#ef4444" : "#ddd" }}
          required
        />
        {errors.email && <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-8px", marginBottom: "12px" }}>{errors.email}</p>}

        {/* Phone */}
        <label htmlFor="phone" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>Phone</label>
        <div style={{ marginBottom: "4px" }}>
          <PhoneInput
            country={"us"}
            value={formData.phone}
            onChange={(phone) => handleInputChange("phone", phone)}
            inputProps={{ id: "phone", name: "phone", required: true, autoFocus: false, autoComplete: "tel" }}
            inputStyle={{ width: "100%", height: "42px", fontSize: "15px", borderRadius: "6px", border: errors.phone ? "1px solid #ef4444" : "1px solid #ddd" }}
            buttonStyle={{ border: errors.phone ? "1px solid #ef4444" : "1px solid #ddd", borderRight: "none", borderRadius: "6px 0 0 6px", backgroundColor: "#f9fafb" }}
            enableSearch={true}
          />
        </div>
        <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px", marginBottom: "16px" }}>Used only for verification and security.</p>
        {errors.phone && <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-12px", marginBottom: "12px" }}>{errors.phone}</p>}

        {/* Date of Birth */}
        <label htmlFor="dob" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>Date of Birth</label>
        <input
          id="dob"
          type="date"
          name="bday"
          autoComplete="bday"
          value={formData.date_of_birth}
          onChange={e => handleInputChange("date_of_birth", e.target.value)}
          style={{ borderColor: errors.date_of_birth ? "#ef4444" : "#ddd" }}
          required
        />
        {errors.date_of_birth && <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-8px", marginBottom: "12px" }}>{errors.date_of_birth}</p>}

        {/* Gender */}
        <label htmlFor="gender" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>Gender</label>
        <select
          id="gender"
          name="sex"
          autoComplete="sex"
          value={formData.gender}
          onChange={e => handleInputChange("gender", e.target.value)}
          style={{ width: "100%", height: "42px", fontSize: "15px", borderRadius: "6px", border: errors.gender ? "1px solid #ef4444" : "1px solid #ddd", marginBottom: "16px", padding: "0 10px" }}
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        {errors.gender && <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-16px", marginBottom: "12px" }}>{errors.gender}</p>}

        {/* Organization Name (non-patient) */}
        {role !== "patient" && (
          <>
            <label htmlFor="organization" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>Organization Name</label>
            <input
              id="organization"
              type="text"
              name="organization"
              autoComplete="organization"
              placeholder="Saramedico Clinic"
              value={formData.organization_name}
              onChange={e => handleInputChange("organization_name", e.target.value)}
              style={{ borderColor: errors.organization_name ? "#ef4444" : "#ddd" }}
              required
            />
            {errors.organization_name && <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-8px", marginBottom: "12px" }}>{errors.organization_name}</p>}
          </>
        )}

        {/* Password Requirements */}
        <div style={{ background: "#f3f4f6", padding: "12px", borderRadius: "8px", marginBottom: "16px", border: "1px solid #e5e7eb" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: "600", color: "#374151" }}>Password Requirements:</p>
          <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "12px", color: "#4b5563" }}>
            <li style={{ color: hasMinLength ? "#16a34a" : "inherit", transition: "color 0.2s" }}>At least 8 characters</li>
            <li style={{ color: hasUppercase ? "#16a34a" : "inherit", transition: "color 0.2s" }}>One uppercase letter (A-Z)</li>
            <li style={{ color: hasNumber ? "#16a34a" : "inherit", transition: "color 0.2s" }}>One number (0-9)</li>
            <li style={{ color: hasSpecial ? "#16a34a" : "inherit", transition: "color 0.2s" }}>One special character (!@#)</li>
          </ul>
        </div>

        {/* Password */}
        <label htmlFor="password" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>Password</label>
        <div style={{ position: "relative" }}>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="new-password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={e => handleInputChange("password", e.target.value)}
            style={{ borderColor: errors.password ? "#ef4444" : "#ddd", width: "100%", paddingRight: "40px" }}
            required
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

        {errors.password && <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-8px", marginBottom: "12px" }}>{errors.password}</p>}

        {/* Confirm Password */}
        <label htmlFor="confirm_password" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>Confirm Password</label>
        <div style={{ position: "relative" }}>
          <input
            id="confirm_password"
            type={showConfirmPassword ? "text" : "password"}
            name="new-password-confirm"
            placeholder="Confirm your password"
            value={formData.confirm_password}
            onChange={e => handleInputChange("confirm_password", e.target.value)}
            style={{ 
              borderColor: formData.confirm_password && !passwordsMatch ? "#ef4444" : passwordsMatch ? "#16a34a" : "#ddd", 
              paddingRight: "50px",
              width: "100%"
            }}
            required
          />
          <div style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
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
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {formData.confirm_password && (
              <span style={{ color: passwordsMatch ? "#16a34a" : "#ef4444", fontWeight: "bold", fontSize: "16px" }}>
                {passwordsMatch ? "✓" : "✗"}
              </span>
            )}
          </div>
        </div>

        {errors.confirm_password && <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-8px", marginBottom: "12px" }}>{errors.confirm_password}</p>}

        {/* Terms */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", alignItems: "flex-start" }}>
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={e => { setTermsAccepted(e.target.checked); if (e.target.checked && errors.terms) setErrors(prev => ({ ...prev, terms: "" })); }}
            style={{ width: "18px", height: "18px", marginTop: "2px", cursor: "pointer" }}
          />
          <label htmlFor="terms" style={{ fontSize: "14px", fontWeight: "400", lineHeight: "1.4", marginBottom: 0, cursor: "pointer", color: "#374151" }}>
            I agree to the <a href="#" style={{ color: "#4361ee" }}>Privacy Policy</a> and <a href="#" style={{ color: "#4361ee" }}>Terms of Service</a>.
          </label>
        </div>
        {errors.terms && <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-16px", marginBottom: "16px" }}>{errors.terms}</p>}

        {apiError && <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginBottom: "16px" }}>{apiError}</p>}

        <button className="primary-btn" disabled={loading} style={{ fontSize: "15px", fontWeight: "600", padding: "12px" }}>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <p style={{ fontSize: "12px", color: "#6b7280", textAlign: "center", marginTop: "24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          <span style={{ fontSize: "14px" }}>🛡️</span> HIPAA Compliant &amp; Secure Data Processing
        </p>

        <div className="divider">OR</div>

        <button type="button" className="social-btn">
          <img src="/icons/apple.svg" alt="Apple" />
          Continue with Apple ID
        </button>

        <button type="button" className="social-btn">
          <img src="/icons/google.svg" alt="Google" />
          Continue with Google
        </button>

        <div className="bottom-text">
          Already have an account? <Link href={`/auth/login?role=${role}`}>Login</Link>
        </div>
      </form>
    </>
  );
}
