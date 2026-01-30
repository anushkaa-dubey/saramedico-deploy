"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser } from "@/services/auth";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [computedRole, setComputedRole] = useState("patient");

  // Get role from URL or sessionStorage safely
  useEffect(() => {
    const urlRole = searchParams.get("role");
    const sessionRole = typeof window !== "undefined" ? sessionStorage.getItem("selectedRole") : null;
    setComputedRole(urlRole || sessionRole || "patient");
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        email,
        password
      };

      // 1. Login to get token
      const authData = await loginUser(payload); // Returns { access_token, ... }

      // Token is already stored in localStorage by loginUser service

      // 2. Fetch user details to get role
      const { getCurrentUser } = await import("@/services/auth");
      const user = await getCurrentUser();

      if (!user) {
        throw new Error("Failed to fetch user profile.");
      }

      localStorage.setItem("user", JSON.stringify(user));
      const userRole = user.role || computedRole;

      if (userRole === "doctor") {
        router.push("/dashboard/doctor");
      } else if (userRole === "patient") {
        router.push("/dashboard/patient");
      } else {
        router.push(`/dashboard/${userRole}`);
      }
    } catch (err) {
      console.error("Login Error:", err);
      const errorMessage = err.message === "Failed to fetch"
        ? "Network Error: Unable to connect to backend. Please check your connection."
        : err.message || "Login failed. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2>Welcome Back</h2>
      <p className="subtext">Access your workspace.</p>

      <form onSubmit={handleLogin}>
        <label>Email Address</label>
        <input
          type="email"
          placeholder="dr.hops@gmail.org"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>
          Password
          <a className="forgot" href="/auth/forgot-password">Forgot Password?</a>
        </label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p style={{ color: "red", fontSize: "12px" }}>{error}</p>}

        <button className="primary-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
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

        {computedRole !== "patient" && (
          <div className="bottom-text">
            Don't have an account? <a href={`/auth/signup?role=${computedRole}`}>Sign Up</a>
          </div>
        )}
      </form>
    </>
  );
}
