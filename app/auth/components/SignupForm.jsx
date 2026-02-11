"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { registerUser, loginUser } from "@/services/auth";

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Form state matching backend payload
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    role: "doctor",
    organization_name: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get role from URL or sessionStorage
  useEffect(() => {
    const urlRole = searchParams.get("role");
    const sessionRole = typeof window !== "undefined" ? sessionStorage.getItem("selectedRole") : null;
    const role = urlRole || sessionRole || "doctor";

    // Patients cannot sign up
    if (role === "patient") {
      router.push(`/auth/login?role=patient`);
      return;
    }

    setFormData(prev => ({ ...prev, role }));
  }, [searchParams, router]);

  // Password Rules Calculation
  const hasMinLength = formData.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);

  const passwordsMatch = formData.password && formData.confirm_password && formData.password === formData.confirm_password;

  // Frontend validation
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    // Phone validation
    if (!formData.phone || formData.phone.length < 8) {
      newErrors.phone = "Valid phone number is required";
    }

    // DOB validation
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of Birth is required";
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!hasMinLength || !hasUppercase || !hasNumber || !hasSpecial) {
      newErrors.password = "Password does not meet all requirements";
    }

    // Confirm password validation
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    // Organization name validation (required for non-patient roles)
    if (formData.role !== "patient" && !formData.organization_name.trim()) {
      newErrors.organization_name = "Organization name is required";
    }

    // Terms validation
    if (!termsAccepted) {
      newErrors.terms = "You must accept the Privacy Policy and Terms.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    if (apiError) setApiError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        role: formData.role,
        organization_name: formData.organization_name
      };

      // 1. Register User
      await registerUser(payload);

      // 2. Auto-login after registration
      await loginUser({
        email: formData.email,
        password: formData.password
      });

      // 3. Fetch user details to get role
      const { getCurrentUser } = await import("@/services/auth");
      const user = await getCurrentUser();

      if (!user) {
        throw new Error("Failed to fetch user profile after signup.");
      }

      localStorage.setItem("user", JSON.stringify(user));

      // 4. Redirect to dashboard or onboarding
      const userRole = user.role || formData.role;

      if (userRole === "doctor" && !user?.onboarding_complete) {
        router.push("/auth/signup/onboarding/doctor/step-1");
      } else {
        router.push(`/dashboard/${userRole}`);
      }
    } catch (err) {
      console.error("Signup/Login failed:", err);
      setApiError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return null; // Avoid hydration mismatch

  return (
    <>
      {/* Visual Tabs for Login / Sign Up */}
      <div style={{ display: "flex", borderBottom: "1px solid #eee", marginBottom: "24px" }}>
        <Link
          href={`/auth/login?role=${formData.role}`}
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
      <p className="subtext" style={{ marginBottom: "16px" }}>Create your {formData.role === "doctor" ? "clinician" : "account"} profile.</p>

      {/* Role Messaging */}
      {formData.role && (
        <div style={{ background: "#f0f9ff", padding: "12px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #e0f2fe" }}>
          <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#0c4a6e", fontWeight: "600" }}>
            Role: {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
          </p>
          <p style={{ margin: 0, fontSize: "12px", color: "#0369a1", opacity: 0.9 }}>
            Role defines access to clinical features.
          </p>
          <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#64748b", fontStyle: "italic" }}>
            * Role selection is immutable after signup.
          </p>
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
          onChange={(e) => handleInputChange("first_name", e.target.value)}
          style={{ borderColor: errors.first_name ? "#ef4444" : "#ddd" }}
          required
        />
        {errors.first_name && (
          <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-8px", marginBottom: "12px" }}>
            {errors.first_name}
          </p>
        )}

        {/* Last Name */}
        <label htmlFor="last_name" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>Last Name</label>
        <input
          id="last_name"
          type="text"
          name="family-name"
          autoComplete="family-name"
          placeholder="Doe"
          value={formData.last_name}
          onChange={(e) => handleInputChange("last_name", e.target.value)}
          style={{ borderColor: errors.last_name ? "#ef4444" : "#ddd" }}
          required
        />
        {errors.last_name && (
          <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-8px", marginBottom: "12px" }}>
            {errors.last_name}
          </p>
        )}

        {/* Email */}
        <label htmlFor="email" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>Email Address</label>
        <input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="dr.hops@gmail.org"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          style={{ borderColor: errors.email ? "#ef4444" : "#ddd" }}
          required
        />
        {errors.email && (
          <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-8px", marginBottom: "12px" }}>
            {errors.email}
          </p>
        )}

        {/* Phone Input with Country Flags */}
        <label htmlFor="phone" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>Phone</label>
        <div style={{ marginBottom: errors.phone ? "4px" : "4px" }}>
          <PhoneInput
            country={"us"}
            value={formData.phone}
            onChange={(phone) => handleInputChange("phone", phone)}
            inputProps={{
              id: 'phone',
              name: 'phone',
              required: true,
              autoFocus: false,
              autoComplete: 'tel'
            }}
            inputStyle={{
              width: "100%",
              height: "42px",
              fontSize: "15px",
              borderRadius: "6px",
              border: errors.phone ? "1px solid #ef4444" : "1px solid #ddd",
            }}
            buttonStyle={{
              border: errors.phone ? "1px solid #ef4444" : "1px solid #ddd",
              borderRight: "none",
              borderRadius: "6px 0 0 6px",
              backgroundColor: "#f9fafb"
            }}
            enableSearch={true}
            disableSearchIcon={false}
          />
        </div>
        <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px", marginBottom: "16px" }}>Used only for verification and security.</p>
        {errors.phone && (
          <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-12px", marginBottom: "12px" }}>
            {errors.phone}
          </p>
        )}

        {/* Date of Birth */}
        <label htmlFor="dob" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>Date of Birth</label>
        <input
          id="dob"
          type="date"
          name="bday"
          autoComplete="bday"
          value={formData.date_of_birth}
          onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
          style={{ borderColor: errors.date_of_birth ? "#ef4444" : "#ddd" }}
          required
        />
        {errors.date_of_birth && (
          <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-8px", marginBottom: "12px" }}>
            {errors.date_of_birth}
          </p>
        )}

        {/* Gender */}
        <label htmlFor="gender" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>Gender</label>
        <select
          id="gender"
          name="sex"
          autoComplete="sex"
          value={formData.gender}
          onChange={(e) => handleInputChange("gender", e.target.value)}
          style={{
            width: "100%",
            height: "42px",
            fontSize: "15px",
            borderRadius: "6px",
            border: errors.gender ? "1px solid #ef4444" : "1px solid #ddd",
            marginBottom: "16px",
            padding: "0 10px"
          }}
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        {errors.gender && (
          <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-16px", marginBottom: "12px" }}>
            {errors.gender}
          </p>
        )}

        {/* Organization Name */}
        {formData.role !== "patient" && (
          <>
            <label htmlFor="organization" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>Organization Name</label>
            <input
              id="organization"
              type="text"
              name="organization"
              autoComplete="organization"
              placeholder="Saramedico Clinic"
              value={formData.organization_name}
              onChange={(e) => handleInputChange("organization_name", e.target.value)}
              style={{ borderColor: errors.organization_name ? "#ef4444" : "#ddd" }}
              required
            />
            {errors.organization_name && (
              <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-8px", marginBottom: "12px" }}>
                {errors.organization_name}
              </p>
            )}
          </>
        )}

        {/* Password Rules Upfront */}
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
        <input
          id="password"
          type="password"
          name="new-password"
          autoComplete="new-password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          style={{ borderColor: errors.password ? "#ef4444" : "#ddd" }}
          required
        />
        {errors.password && (
          <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-8px", marginBottom: "12px" }}>
            {errors.password}
          </p>
        )}

        {/* Confirm Password */}
        <label htmlFor="confirm_password" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>Confirm Password</label>
        <div style={{ position: "relative" }}>
          <input
            id="confirm_password"
            type="password"
            name="new-password-confirm"
            placeholder="Confirm your password"
            value={formData.confirm_password}
            onChange={(e) => handleInputChange("confirm_password", e.target.value)}
            style={{
              borderColor:
                formData.confirm_password && !passwordsMatch ? "#ef4444" :
                  passwordsMatch ? "#16a34a" : "#ddd",
              paddingRight: "30px"
            }}
            required
          />
          {formData.confirm_password && (
            <span style={{
              position: "absolute",
              right: "10px",
              top: "12px",
              color: passwordsMatch ? "#16a34a" : "#ef4444",
              fontWeight: "bold"
            }}>
              {passwordsMatch ? "✓" : "✗"}
            </span>
          )}
        </div>
        {errors.confirm_password && (
          <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-8px", marginBottom: "12px" }}>
            {errors.confirm_password}
          </p>
        )}

        {/* Terms and Privacy */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", alignItems: "flex-start" }}>
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => {
              setTermsAccepted(e.target.checked);
              if (e.target.checked && errors.terms) {
                setErrors(prev => ({ ...prev, terms: "" }));
              }
            }}
            style={{ width: "18px", height: "18px", marginTop: "2px", cursor: "pointer" }}
          />
          <label htmlFor="terms" style={{ fontSize: "14px", fontWeight: "400", lineHeight: "1.4", marginBottom: 0, cursor: "pointer", color: "#374151" }}>
            I agree to the <a href="#" style={{ color: "#4361ee" }}>Privacy Policy</a> and <a href="#" style={{ color: "#4361ee" }}>Terms of Service</a>.
          </label>
        </div>
        {errors.terms && (
          <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "-16px", marginBottom: "16px" }}>
            {errors.terms}
          </p>
        )}

        {apiError && (
          <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginBottom: "16px" }}>
            {apiError}
          </p>
        )}

        <button className="primary-btn" disabled={loading} style={{ fontSize: "15px", fontWeight: "600", padding: "12px" }}>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <p style={{ fontSize: "12px", color: "#6b7280", textAlign: "center", marginTop: "24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          <span style={{ fontSize: "14px" }}>🛡️</span> HIPAA Compliant & Secure Data Processing
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
          Already have an account? <Link href={`/auth/login?role=${formData.role}`}>Login</Link>
        </div>
      </form>
    </>
  );
}
