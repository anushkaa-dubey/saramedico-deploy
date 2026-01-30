"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { registerUser, loginUser } from "@/services/auth";

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

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
    role: "patient",
    organization_name: ""
  });

  const [errors, setErrors] = useState({});

  // Get role from URL or sessionStorage
  useEffect(() => {
    const urlRole = searchParams.get("role");
    const sessionRole = typeof window !== "undefined" ? sessionStorage.getItem("selectedRole") : null;
    const role = urlRole || sessionRole || "patient";

    // Patients cannot sign up
    if (role === "patient") {
      router.push(`/auth/login?role=patient`);
      return;
    }

    setFormData(prev => ({ ...prev, role }));
  }, [searchParams, router]);

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
    if (!formData.phone || formData.phone.length < 10) {
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
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Confirm password validation
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    // Organization name validation (required for non-patient roles)
    if (formData.role !== "patient" && !formData.organization_name.trim()) {
      newErrors.organization_name = "Organization name is required";
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

  // Password Rules
  const hasMinLength = formData.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);

  const strengthCount = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;

  // Single-line rule text
  let ruleText = "Use at least 8 characters";
  if (hasMinLength) ruleText = "Add one uppercase letter";
  if (hasMinLength && hasUppercase) ruleText = "Add one number";
  if (hasMinLength && hasUppercase && hasNumber) ruleText = "Add one special character";
  if (strengthCount === 4) ruleText = "Strong password";

  return (
    <>
      <h2>Sign Up</h2>
      <p className="subtext">Create an account to get started.</p>

      <form onSubmit={handleSignup}>
        {/* First Name */}
        <label>First Name</label>
        <input
          type="text"
          placeholder="John"
          value={formData.first_name}
          onChange={(e) => handleInputChange("first_name", e.target.value)}
          required
        />
        {errors.first_name && <p style={{ color: "red", fontSize: "12px", marginTop: "-8px" }}>{errors.first_name}</p>}

        {/* Last Name */}
        <label>Last Name</label>
        <input
          type="text"
          placeholder="Doe"
          value={formData.last_name}
          onChange={(e) => handleInputChange("last_name", e.target.value)}
          required
        />
        {errors.last_name && <p style={{ color: "red", fontSize: "12px", marginTop: "-8px" }}>{errors.last_name}</p>}

        {/* Email */}
        <label>Email Address</label>
        <input
          type="email"
          placeholder="dr.hops@gmail.org"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          required
        />
        {errors.email && <p style={{ color: "red", fontSize: "12px", marginTop: "-8px" }}>{errors.email}</p>}

        {/* Phone Input with Country Flags */}
        <label>Phone</label>
        <PhoneInput
          country={"in"}
          value={formData.phone}
          onChange={(phone) => handleInputChange("phone", phone)}
          inputStyle={{
            width: "100%",
            height: "40px",
            fontSize: "14px",
            borderRadius: "6px",
            border: "1px solid #ddd",
          }}
          buttonStyle={{
            border: "1px solid #ddd",
            borderRadius: "6px 0 0 6px",
          }}
          containerStyle={{ marginBottom: "16px" }}
          enableSearch={true}
        />
        {errors.phone && <p style={{ color: "red", fontSize: "12px", marginTop: "-16px", marginBottom: "12px" }}>{errors.phone}</p>}

        {/* Date of Birth */}
        <label>Date of Birth</label>
        <input
          type="date"
          value={formData.date_of_birth}
          onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
          required
        />
        {errors.date_of_birth && <p style={{ color: "red", fontSize: "12px", marginTop: "-8px" }}>{errors.date_of_birth}</p>}

        {/* Gender */}
        <label>Gender</label>
        <select
          value={formData.gender}
          onChange={(e) => handleInputChange("gender", e.target.value)}
          style={{
            width: "100%",
            height: "40px",
            fontSize: "14px",
            borderRadius: "6px",
            border: "1px solid #ddd",
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
        {errors.gender && <p style={{ color: "red", fontSize: "12px", marginTop: "-16px", marginBottom: "12px" }}>{errors.gender}</p>}

        {/* Organization Name - Only for non-patient roles */}
        {formData.role !== "patient" && (
          <>
            <label>Organization Name</label>
            <input
              type="text"
              placeholder="Saramedico Clinic"
              value={formData.organization_name}
              onChange={(e) => handleInputChange("organization_name", e.target.value)}
              required
            />
            {errors.organization_name && <p style={{ color: "red", fontSize: "12px", marginTop: "-8px" }}>{errors.organization_name}</p>}
          </>
        )}

        {/* Password */}
        <label>Password</label>
        <input
          type="password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          required
        />

        {/* Strength Bar */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
          <div style={{ height: "4px", flex: 1, background: strengthCount >= 1 ? "#22c55e" : "#e5e7eb", borderRadius: "2px" }} />
          <div style={{ height: "4px", flex: 1, background: strengthCount >= 2 ? "#22c55e" : "#e5e7eb", borderRadius: "2px" }} />
          <div style={{ height: "4px", flex: 1, background: strengthCount >= 3 ? "#22c55e" : "#e5e7eb", borderRadius: "2px" }} />
          <div style={{ height: "4px", flex: 1, background: strengthCount >= 4 ? "#22c55e" : "#e5e7eb", borderRadius: "2px" }} />
        </div>

        {/* Single Line Rule */}
        <div
          style={{
            fontSize: "12px",
            color: strengthCount === 4 ? "#16a34a" : "#6b7280",
            marginBottom: "16px",
          }}
        >
          {ruleText}
        </div>

        <label>Confirm Password</label>
        <input
          type="password"
          placeholder="Confirm your password"
          value={formData.confirm_password}
          onChange={(e) => handleInputChange("confirm_password", e.target.value)}
          required
        />
        {errors.confirm_password && <p style={{ color: "red", fontSize: "12px", marginTop: "-8px" }}>{errors.confirm_password}</p>}

        {apiError && <p style={{ color: "red", fontSize: "12px", marginBottom: "16px" }}>{apiError}</p>}

        <button className="primary-btn" disabled={loading}>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

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
          Already have an account? <a href={`/auth/login?role=${formData.role}`}>Login</a>
        </div>
      </form>
    </>
  );
}
