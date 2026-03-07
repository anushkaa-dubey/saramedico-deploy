"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
// import { loginUser, getCurrentUser } from "@/services/auth";
import { loginUser } from "@/services/auth";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [computedRole, setComputedRole] = useState("doctor");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get role from URL or sessionStorage safely (used only for UI hints, not routing)
  useEffect(() => {
    const urlRole = searchParams.get("role");
    const sessionRole = typeof window !== "undefined" ? sessionStorage.getItem("selectedRole") : null;
    setComputedRole(urlRole || sessionRole || "doctor");
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser({ email, password });

      const token = data.access_token || data.token;

      if (token) {
        localStorage.setItem("authToken", token);
      }

      if (data.refresh_token) {
        localStorage.setItem("refreshToken", data.refresh_token);
      }

      if (!data?.user) {
        throw new Error("Login succeeded but user data missing.");
      }

      const user = data?.user;

      if (!user) {
        console.error("Login response missing user:", data);
        throw new Error("User data missing from login response");
      }

      localStorage.setItem("user", JSON.stringify(user));

      const userRole = String(user.role || "").trim().toLowerCase();
      console.log("ROLE:", userRole); if (userRole === "doctor") {
        if (user.onboarding_complete === false) {
          router.push("/auth/signup/onboarding/doctor/step-1");
          return;
        }
        router.push("/dashboard/doctor");
        return;
      }

      if (userRole === "patient") {
        window.location.href = "/dashboard/patient";
        return;
      }
      if (userRole === "admin" || userRole === "administrator") {
        router.push("/dashboard/admin");
        return;
      }

      if (userRole === "hospital") {
        router.push("/dashboard/hospital");
        return;
      }

      router.push("/dashboard/patient");
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

  if (!isClient) return null;

  return (
    <>
      {(computedRole !== "patient" && computedRole !== "admin" && computedRole !== "administrator") && (
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
            href={`/auth/signup?role=${computedRole}`}
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
      )}


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
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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

        <div className="divider">OR</div>

        <button type="button" className="social-btn">
          <img src="/icons/apple.svg" alt="Apple" />
          Continue with Apple ID
        </button>

        <button type="button" className="social-btn">
          <img src="/icons/google.svg" alt="Google" />
          Continue with Google
        </button>

        {(computedRole !== "patient" && computedRole !== "admin" && computedRole !== "administrator") && (
          <div className="bottom-text">
            Don&apos;t have an account? <Link href={`/auth/signup?role=${computedRole}`}>Sign Up</Link>
          </div>
        )}

      </form>
    </>
  );
}
