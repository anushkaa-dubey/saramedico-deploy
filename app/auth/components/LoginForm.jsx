"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [computedRole, setComputedRole] = useState("patient");

  // Get role from URL or sessionStorage safely
  useEffect(() => {
    const urlRole = searchParams.get("role");
    const sessionRole = typeof window !== "undefined" ? sessionStorage.getItem("selectedRole") : null;
    setComputedRole(urlRole || sessionRole || "patient");
  }, [searchParams]);

  const handleLogin = (e) => {
    e.preventDefault();

    // Demo credentials for testing
    // ADMIN LOGIN
    if (email === "admin@saramedico.com" && password === "admin123") {
      router.push(`/auth/2fa/login?role=admin`);
      return;
    }

    // DOCTOR LOGIN
    if (email === "doctor@saramedico.com" && password === "doctor123") {
      router.push(`/auth/2fa/login?role=doctor`);
      return;
    }

    // PATIENT LOGIN
    if (email === "test@saramedico.com" && password === "123456") {
      router.push(`/auth/2fa/login?role=patient`);
      return;
    }

    // HOSPITAL LOGIN
    if (email === "hospital@saramedico.com" && password === "hospital123") {
      router.push(`/auth/2fa/login?role=hospital`);
      return;
    }

    // If no specific match, use role from URL
    router.push(`/auth/2fa/login?role=${computedRole}`);
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
          <a className="forgot" href="#">Forgot Password?</a>
        </label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p style={{ color: "red", fontSize: "12px" }}>{error}</p>}

        <button className="primary-btn">Login</button>

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
          Don't have an account? <a href={`/auth/signup?role=${computedRole}`}>Sign Up</a>
        </div>
      </form>
    </>
  );
}
