"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { registerUser, registerHospital, loginUser, googleLogin, appleLogin } from "@/services/auth";
import { Eye, EyeOff } from "lucide-react";
import styles from "./SignupForm.module.css";

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

  useEffect(() => { setIsClient(true); }, []);

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
        window.location.href = "/dashboard/hospital";

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
        window.location.href = "/auth/signup/onboarding/doctor/step-1";

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
        window.location.href = `/dashboard/${role}`;
      }
    } catch (err) {
      console.error("Signup failed:", err);
      setApiError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // Save the current role to sessionStorage so the callback can use it
    if (role) {
      sessionStorage.setItem("signupRole", role);
    }
    // Initiate Google OAuth flow
    googleLogin(role);
  };

  const handleAppleSignup = () => {
    // Save the current role to sessionStorage so the callback can use it
    if (role) {
      sessionStorage.setItem("signupRole", role);
    }
    // Initiate Apple OAuth flow
    appleLogin(role);
  };

  if (!isClient) return null;

  // ═════════════════════════════════════════════════════════════════════════
  // HOSPITAL SIGNUP FORM
  // ═════════════════════════════════════════════════════════════════════════
  if (role === "hospital") {
    return (
      <>
        <div className={styles.tabs}>
          <Link href="/auth/login?role=hospital" className={styles.tabInactive}>Login</Link>
          <div className={styles.tabActive}>Sign Up</div>
        </div>

        <h2>Register Hospital</h2>
        <p className="subtext">Set up your hospital organization and admin account.</p>

        <div className={styles.roleBadge}>
          <p className={styles.roleBadgeTitle}>Role: Hospital</p>
          <p className={styles.roleBadgeSub}>Role defines access to clinical features.</p>
          <p className={styles.roleBadgeNote}>* Role selection is immutable after signup.</p>
        </div>

        <form onSubmit={handleSignup}>
          <label htmlFor="organization_name" className={styles.label}>Organization Name</label>
          <input
            id="organization_name" type="text" placeholder="General Hospital"
            value={hospitalForm.organization_name}
            onChange={e => handleHospitalChange("organization_name", e.target.value)}
            style={{ borderColor: errors.organization_name ? "#ef4444" : "#ddd" }} required
          />
          {errors.organization_name && <p className={styles.fieldError}>{errors.organization_name}</p>}

          <label htmlFor="admin_name" className={styles.label}>Admin Full Name</label>
          <input
            id="admin_name" type="text" placeholder="Dr. Sarah Smith"
            value={hospitalForm.admin_name}
            onChange={e => handleHospitalChange("admin_name", e.target.value)}
            style={{ borderColor: errors.admin_name ? "#ef4444" : "#ddd" }} required
          />
          {errors.admin_name && <p className={styles.fieldError}>{errors.admin_name}</p>}

          <label htmlFor="h_email" className={styles.label}>Email Address</label>
          <input
            id="h_email" type="email" placeholder="admin@hospital.com"
            value={hospitalForm.email}
            onChange={e => handleHospitalChange("email", e.target.value)}
            style={{ borderColor: errors.email ? "#ef4444" : "#ddd" }} required
          />
          {errors.email && <p className={styles.fieldError}>{errors.email}</p>}

          <label htmlFor="phone_number" className={styles.label}>Phone Number</label>
          <div style={{ marginBottom: "4px" }}>
            <PhoneInput
              country={"us"} value={hospitalForm.phone_number}
              onChange={(phone) => handleHospitalChange("phone_number", phone)}
              inputProps={{ id: "phone_number", name: "phone_number", required: true, autoComplete: "tel" }}
              inputStyle={{ width: "100%", height: "42px", fontSize: "15px", borderRadius: "6px", border: errors.phone_number ? "1px solid #ef4444" : "1px solid #ddd" }}
              buttonStyle={{ border: errors.phone_number ? "1px solid #ef4444" : "1px solid #ddd", borderRight: "none", borderRadius: "6px 0 0 6px", backgroundColor: "#f9fafb" }}
              enableSearch={true}
            />
          </div>
          <p className={styles.phoneHint}>Used only for verification and security.</p>
          {errors.phone_number && <p className={styles.fieldErrorTop}>{errors.phone_number}</p>}

          <div className={styles.passwordReqs}>
            <p className={styles.passwordReqsTitle}>Password Requirements:</p>
            <ul className={styles.passwordReqsList}>
              <li className={hasMinLength ? styles.reqMet : styles.reqUnmet}>At least 8 characters</li>
              <li className={hasUppercase ? styles.reqMet : styles.reqUnmet}>One uppercase letter (A-Z)</li>
              <li className={hasNumber ? styles.reqMet : styles.reqUnmet}>One number (0-9)</li>
              <li className={hasSpecial ? styles.reqMet : styles.reqUnmet}>One special character (!@#)</li>
            </ul>
          </div>

          <label htmlFor="h_password" className={styles.label}>Password</label>
          <div className={styles.passwordWrapper}>
            <input
              id="h_password" type={showPassword ? "text" : "password"}
              autoComplete="new-password" placeholder="Create a strong password"
              value={hospitalForm.password}
              onChange={e => handleHospitalChange("password", e.target.value)}
              style={{ borderColor: errors.password ? "#ef4444" : "#ddd" }} required
            />
            <button type="button" className={styles.passwordToggleBtn} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <p className={styles.fieldError}>{errors.password}</p>}

          <div className={styles.passwordWrapper}>
            <input
              id="h_confirm" type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password" placeholder="Confirm your password"
              value={hospitalForm.confirm_password}
              onChange={e => handleHospitalChange("confirm_password", e.target.value)}
              style={{ borderColor: hospitalForm.confirm_password && !passwordsMatch ? "#ef4444" : passwordsMatch ? "#16a34a" : "#ddd", paddingRight: "56px" }}
              required
            />
            <div className={styles.passwordConfirmActions}>
              <button type="button" className={styles.passwordToggleBtn} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {hospitalForm.confirm_password && (
                <span className={passwordsMatch ? styles.matchIndicator : styles.noMatchIndicator}>
                  {passwordsMatch ? "✓" : "✗"}
                </span>
              )}
            </div>
          </div>
          {errors.confirm_password && <p className={styles.fieldError}>{errors.confirm_password}</p>}

          <div className={styles.termsRow}>
            <input
              type="checkbox" id="h_terms" checked={termsAccepted}
              onChange={e => { setTermsAccepted(e.target.checked); if (e.target.checked && errors.terms) setErrors(prev => ({ ...prev, terms: "" })); }}
              className={styles.termsCheckbox}
            />
            <label htmlFor="h_terms" className={styles.termsLabel}>
              I agree to the <a href="#" className={styles.termsLink}>Privacy Policy</a> and <a href="#" className={styles.termsLink}>Terms of Service</a>.
            </label>
          </div>
          {errors.terms && <p className={styles.fieldErrorTerms}>{errors.terms}</p>}
          {apiError && <p className={styles.apiError}>{apiError}</p>}

          <button className={`primary-btn ${styles.submitBtn}`} disabled={loading}>
            {loading ? "Registering Hospital..." : "Register Hospital"}
          </button>

          <p className={styles.hipaaNote}>
            <span className={styles.hipaaIcon}>🛡️</span>
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
            Already have an account? <Link href="/auth/login?role=hospital">Login</Link>
          </div>
        </form>
      </>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // DOCTOR / DEFAULT SIGNUP FORM
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <>
      <div className={styles.tabs}>
        <Link href={`/auth/login?role=${role}`} className={styles.tabInactive}>Login</Link>
        <div className={styles.tabActive}>Sign Up</div>
      </div>

      <h2>Create Account</h2>
      <p className="subtext">Create your {role === "doctor" ? "clinician" : "account"} profile.</p>

      {role && (
        <div className={styles.roleBadge}>
          <p className={styles.roleBadgeTitle}>Role: {role.charAt(0).toUpperCase() + role.slice(1)}</p>
          <p className={styles.roleBadgeSub}>Role defines access to clinical features.</p>
          <p className={styles.roleBadgeNote}>* Role selection is immutable after signup.</p>
        </div>
      )}

      <form onSubmit={handleSignup}>
        <label htmlFor="first_name" className={styles.label}>First Name</label>
        <input
          id="first_name" type="text" name="given-name" autoComplete="given-name" placeholder="John"
          value={formData.first_name} onChange={e => handleInputChange("first_name", e.target.value)}
          style={{ borderColor: errors.first_name ? "#ef4444" : "#ddd" }} required
        />
        {errors.first_name && <p className={styles.fieldError}>{errors.first_name}</p>}

        <label htmlFor="last_name" className={styles.label}>Last Name</label>
        <input
          id="last_name" type="text" name="family-name" autoComplete="family-name" placeholder="Doe"
          value={formData.last_name} onChange={e => handleInputChange("last_name", e.target.value)}
          style={{ borderColor: errors.last_name ? "#ef4444" : "#ddd" }} required
        />
        {errors.last_name && <p className={styles.fieldError}>{errors.last_name}</p>}

        <label htmlFor="email" className={styles.label}>Email Address</label>
        <input
          id="email" type="email" name="email" autoComplete="email" placeholder="dr.hops@gmail.org"
          value={formData.email} onChange={e => handleInputChange("email", e.target.value)}
          style={{ borderColor: errors.email ? "#ef4444" : "#ddd" }} required
        />
        {errors.email && <p className={styles.fieldError}>{errors.email}</p>}

        <label htmlFor="phone" className={styles.label}>Phone</label>
        <div style={{ marginBottom: "4px" }}>
          <PhoneInput
            country={"us"} value={formData.phone}
            onChange={(phone) => handleInputChange("phone", phone)}
            inputProps={{ id: "phone", name: "phone", required: true, autoFocus: false, autoComplete: "tel" }}
            inputStyle={{ width: "100%", height: "42px", fontSize: "15px", borderRadius: "6px", border: errors.phone ? "1px solid #ef4444" : "1px solid #ddd" }}
            buttonStyle={{ border: errors.phone ? "1px solid #ef4444" : "1px solid #ddd", borderRight: "none", borderRadius: "6px 0 0 6px", backgroundColor: "#f9fafb" }}
            enableSearch={true}
          />
        </div>
        <p className={styles.phoneHint}>Used only for verification and security.</p>
        {errors.phone && <p className={styles.fieldErrorTop}>{errors.phone}</p>}

        <label htmlFor="dob" className={styles.label}>Date of Birth</label>
        <input
          id="dob" type="date" name="bday" autoComplete="bday"
          value={formData.date_of_birth} onChange={e => handleInputChange("date_of_birth", e.target.value)}
          style={{ borderColor: errors.date_of_birth ? "#ef4444" : "#ddd" }} required
        />
        {errors.date_of_birth && <p className={styles.fieldError}>{errors.date_of_birth}</p>}

        <label htmlFor="gender" className={styles.label}>Gender</label>
        <select
          id="gender" name="sex" autoComplete="sex"
          value={formData.gender} onChange={e => handleInputChange("gender", e.target.value)}
          className={styles.genderSelect}
          style={{ borderColor: errors.gender ? "#ef4444" : "#ddd" }} required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        {errors.gender && <p className={styles.fieldErrorTerms}>{errors.gender}</p>}

        {role !== "patient" && (
          <>
            <label htmlFor="organization" className={styles.label}>Organization Name</label>
            <input
              id="organization" type="text" name="organization" autoComplete="organization"
              placeholder="Saramedico Clinic"
              value={formData.organization_name} onChange={e => handleInputChange("organization_name", e.target.value)}
              style={{ borderColor: errors.organization_name ? "#ef4444" : "#ddd" }} required
            />
            {errors.organization_name && <p className={styles.fieldError}>{errors.organization_name}</p>}
          </>
        )}

        <div className={styles.passwordReqs}>
          <p className={styles.passwordReqsTitle}>Password Requirements:</p>
          <ul className={styles.passwordReqsList}>
            <li className={hasMinLength ? styles.reqMet : styles.reqUnmet}>At least 8 characters</li>
            <li className={hasUppercase ? styles.reqMet : styles.reqUnmet}>One uppercase letter (A-Z)</li>
            <li className={hasNumber ? styles.reqMet : styles.reqUnmet}>One number (0-9)</li>
            <li className={hasSpecial ? styles.reqMet : styles.reqUnmet}>One special character (!@#)</li>
          </ul>
        </div>

        <label htmlFor="password" className={styles.label}>Password</label>
        <div className={styles.passwordWrapper}>
          <input
            id="password" type={showPassword ? "text" : "password"}
            name="new-password" autoComplete="new-password" placeholder="Create a strong password"
            value={formData.password} onChange={e => handleInputChange("password", e.target.value)}
            style={{ borderColor: errors.password ? "#ef4444" : "#ddd" }} required
          />
          <button type="button" className={styles.passwordToggleBtn} onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && <p className={styles.fieldError}>{errors.password}</p>}

        <label htmlFor="confirm_password" className={styles.label}>Confirm Password</label>
        <div className={styles.passwordWrapper}>
          <input
            id="confirm_password" type={showConfirmPassword ? "text" : "password"}
            name="new-password-confirm" placeholder="Confirm your password"
            value={formData.confirm_password} onChange={e => handleInputChange("confirm_password", e.target.value)}
            style={{ borderColor: formData.confirm_password && !passwordsMatch ? "#ef4444" : passwordsMatch ? "#16a34a" : "#ddd", paddingRight: "56px" }}
            required
          />
          <div className={styles.passwordConfirmActions}>
            <button type="button" className={styles.passwordToggleBtn} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {formData.confirm_password && (
              <span className={passwordsMatch ? styles.matchIndicator : styles.noMatchIndicator}>
                {passwordsMatch ? "✓" : "✗"}
              </span>
            )}
          </div>
        </div>
        {errors.confirm_password && <p className={styles.fieldError}>{errors.confirm_password}</p>}

        <div className={styles.termsRow}>
          <input
            type="checkbox" id="terms" checked={termsAccepted}
            onChange={e => { setTermsAccepted(e.target.checked); if (e.target.checked && errors.terms) setErrors(prev => ({ ...prev, terms: "" })); }}
            className={styles.termsCheckbox}
          />
          <label htmlFor="terms" className={styles.termsLabel}>
            I agree to the <a href="#" className={styles.termsLink}>Privacy Policy</a> and <a href="#" className={styles.termsLink}>Terms of Service</a>.
          </label>
        </div>
        {errors.terms && <p className={styles.fieldErrorTerms}>{errors.terms}</p>}
        {apiError && <p className={styles.apiError}>{apiError}</p>}

        <button className={`primary-btn ${styles.submitBtn}`} disabled={loading}>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <p className={styles.hipaaNote}>
          <span className={styles.hipaaIcon}>🛡️</span>
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
          Already have an account? <Link href={`/auth/login?role=${role}`}>Login</Link>
        </div>
      </form>
    </>
  );
}