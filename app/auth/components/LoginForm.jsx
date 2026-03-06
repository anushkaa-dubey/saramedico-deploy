"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginUser, getCurrentUser } from "@/services/auth";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      // Step 1: Login to get tokens stored in localStorage
      await loginUser({ email, password });

      // Step 2: Fetch user profile using the stored token — this always has valid role
      const user = await getCurrentUser();

      if (!user) {
        throw new Error("Could not retrieve user profile after login. Please try again.");
      }

      // Step 3: Persist user to localStorage for dashboard pages
      localStorage.setItem("user", JSON.stringify(user));

      // Step 4: Resolve the dashboard path based on backend-provided role
      const userRole = (user.role || "").toLowerCase();

      if (userRole === "doctor" && !user.onboarding_complete) {
        router.replace("/auth/signup/onboarding/doctor/step-1");
      } else if (userRole === "doctor") {
        router.replace("/dashboard/doctor");
      } else if (userRole === "patient") {
        router.replace("/dashboard/patient");
      } else if (userRole === "admin" || userRole === "administrator") {
        router.replace("/dashboard/admin");
      } else if (userRole === "hospital") {
        router.replace("/dashboard/hospital");
      } else {
        router.replace("/dashboard/patient");
      }
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

      <h2>Welcome Back</h2>
      <p className="subtext">Access your workspace.</p>

      <form onSubmit={handleLogin} autoComplete="on">
        <label htmlFor="email" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>Email Address</label>
        <input
          id="email"
          type="email"
          name="username"
          autoComplete="username"
          placeholder="dr.hops@gmail.org"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password" style={{ fontSize: "16px", fontWeight: "600", color: "#374151", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Password
          <a className="forgot" href="/auth/forgot-password" style={{ fontSize: "13px" }}>Forgot Password?</a>
        </label>
        <input
          id="password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

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

        {computedRole !== "patient" && (
          <div className="bottom-text">
            Don&apos;t have an account? <Link href={`/auth/signup?role=${computedRole}`}>Sign Up</Link>
          </div>
        )}
      </form>
    </>
  );
}
