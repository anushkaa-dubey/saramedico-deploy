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

    // Prepare payload for API integration
    const payload = {
      email,
      password
    };

    // TODO: Replace with actual API call
    // const response = await loginUser(payload);
    // Expected response shape:
    // {
    //   token: "jwt_token_here",
    //   user: {
    //     role: "patient" | "doctor" | "admin" | "hospital",
    //     email: "...",
    //     first_name: "...",
    //     last_name: "..."
    //   }
    // }

    console.log("Login payload ready:", payload);

    // TEMPORARY: Demo credentials for testing (remove when API is connected)
    let userRole = computedRole; // default to URL/session role

    // ADMIN LOGIN
    if (email === "admin@saramedico.com" && password === "admin123") {
      userRole = "admin";
    }
    // DOCTOR LOGIN
    else if (email === "doctor@saramedico.com" && password === "doctor123") {
      userRole = "doctor";
    }
    // PATIENT LOGIN
    else if (email === "test@saramedico.com" && password === "123456") {
      userRole = "patient";
    }
    // HOSPITAL LOGIN
    else if (email === "hospital@saramedico.com" && password === "hospital123") {
      userRole = "hospital";
    }

    // TODO: When API is connected, use response.user.role instead
    // const userRole = response.user.role;

    // TODO: Store token in localStorage/sessionStorage
    // localStorage.setItem("authToken", response.token);
    // localStorage.setItem("user", JSON.stringify(response.user));

    // Role-aware redirect (Bypassing 2FA as per "Skip OTP" requirement prep)
    router.push(`/dashboard/${userRole}`);
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
