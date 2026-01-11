"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

const handleLogin = (e) => {
  e.preventDefault();

  // ADMIN LOGIN
  if (email === "admin@saramedico.com" && password === "admin123") {
    router.push("/auth/2fa/login?role=admin");
    return;
  }

  // PATIENT LOGIN
  if (email === "test@saramedico.com" && password === "123456") {
    router.push("/auth/2fa/login?role=patient");
    return;
  }

  setError("Invalid email or password");
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
          Don’t have an account? <a href="/auth/signup">Sign Up</a>
        </div>
      </form>
    </>
  );
}
