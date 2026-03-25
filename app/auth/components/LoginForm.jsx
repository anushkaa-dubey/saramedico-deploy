"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
// import { loginUser, getCurrentUser } from "@/services/auth";
import { loginUser, googleLogin, appleLogin } from "@/services/auth";
import { clearTokens, setAccessToken, setRefreshToken, setUser as setStoredUser } from "@/services/tokenService";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Clear any stale auth data first to prevent stale-cache issues
      clearTokens();

      const data = await loginUser({ email, password });
      console.log("[Login] Raw API response:", data);

      const token = data.access_token || data.token;

      if (token) {
        setAccessToken(token);
      }

      if (data.refresh_token) {
        setRefreshToken(data.refresh_token);
      }

      // Support both nested `data.user` and flat response shapes
      const user = data?.user || data;

      if (!user || (!user.role && !user.email)) {
        console.error("[Login] Cannot identify user from response:", data);
        throw new Error("Login succeeded but user data is missing. Please try again.");
      }

      setStoredUser(user);

      // Normalize role — handles "doctor", "UserRole.doctor", "DOCTOR", etc.
      const rawRole = user.role || "";
      const userRole = String(rawRole).split(".").pop().trim().toLowerCase();
      console.log("[Login] Resolved role:", userRole);

      // Use window.location.href for hard redirects — this guarantees
      // tokenService is fully committed before the dashboard layout mounts
      // and runs its own auth/role check.
      if (userRole === "doctor") {
        if (user.onboarding_complete === false) {
          window.location.href = "/auth/signup/onboarding/doctor/step-1";
          return;
        }
        window.location.href = "/dashboard/doctor";
        return;
      }

      if (userRole === "patient") {
        window.location.href = "/dashboard/patient";
        return;
      }

      if (userRole === "admin" || userRole === "administrator") {
        window.location.href = "/dashboard/admin";
        return;
      }

      if (userRole === "hospital") {
        window.location.href = "/dashboard/hospital";
        return;
      }

      // Fallback
      window.location.href = "/dashboard/patient";
    } catch (err) {
      console.error("[Login] Error:", err);
      const errorMessage =
        err.message === "Failed to fetch"
          ? "Network Error: Cannot connect to backend. Check your connection."
          : err.message || "Login failed. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    googleLogin();
  };

  const handleAppleLogin = () => {
    setAppleLoading(true);
    appleLogin();
  };

  if (!isClient) return null;

  return (
    <>
        <div style={{ display: "flex", borderBottom: "1px solid #eee", marginBottom: "24px" }}>
          <div style={{
            flex: 1,
            padding: "14px",
            textAlign: "center",
            fontWeight: "600",
            color: "#4361ee",
            borderBottom: "2px solid #4361ee",
            cursor: "default"
          }}>
            Login
          </div>
          <Link
            href={`/auth/signup`}
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
            Sign Up
          </Link>
        </div>
      <h2>Welcome Back</h2>
      <p className="subtext">Access your workspace.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin(e);
        }}
        autoComplete="on"
      >        <label htmlFor="email" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>Email Address</label>
        <input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="dr.hops@gmail.org"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password" style={{ fontSize: "16px", fontWeight: "600", color: "#374151", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Password
          <a className="forgot" href="/auth/forgot-password" style={{ fontSize: "13px" }}>Forgot Password?</a>
        </label>
        <div style={{ position: "relative" }}>
          <div className="password-wrapper"></div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ paddingRight: "40px" }}
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
              justifyContent: "center",
              height: "100%"
            }}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>


        {error && (
          <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "8px" }}>
            {error}
          </p>
        )}

        <button className="primary-btn" disabled={loading} style={{ fontSize: "15px", fontWeight: "600", padding: "12px", marginTop: "16px" }}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ fontSize: "12px", color: "#6b7280", textAlign: "center", marginTop: "24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          <span style={{ fontSize: "14px" }}>🛡️</span> HIPAA Compliant &amp; Secure Data Processing
        </p>

        <div style={{ textAlign: "center", marginTop: "12px", fontSize: "12px", color: "#6b7280" }}>
          <Link href="/privacy?from=auth" style={{ color: '#4361ee', textDecoration: 'none', fontWeight: 500 }}>Privacy Policy</Link>
          <span style={{ margin: "0 8px" }}>|</span>
          <Link href="/terms?from=auth" style={{ color: '#4361ee', textDecoration: 'none', fontWeight: 500 }}>Terms of Service</Link>
        </div>

        <div className="divider">OR</div>

        <button
          type="button"
          className="social-btn"
          onClick={handleAppleLogin}
          disabled={appleLoading || loading}
          style={appleLoading ? { opacity: 0.7, cursor: "not-allowed" } : {}}
        >
          <img src="/icons/apple.svg" alt="Apple" />
          {appleLoading ? "Redirecting to Apple..." : "Continue with Apple ID"}
        </button>

        <button
          type="button"
          className="social-btn"
          id="google-login-btn"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          style={googleLoading ? { opacity: 0.7, cursor: "not-allowed" } : {}}
        >
          <img src="/icons/google.svg" alt="Google" />
          {googleLoading ? "Redirecting to Google..." : "Continue with Google"}
        </button>

          <div className="bottom-text">
            Don&apos;t have an account? <Link href="/auth/signup">Sign Up</Link>
          </div>
      </form>
    </>
  );
}
