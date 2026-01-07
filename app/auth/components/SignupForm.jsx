"use client";
import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phone, setPhone] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();

    if (password !== confirm) {
      alert("Passwords do not match!");
      return;
    }

    alert("Account created (dummy). You can now login.");
    router.push("/auth/2fa/signup");

  };

  // Password Rules
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

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
        <label>Email Address</label>
        <input
          type="email"
          placeholder="dr.hops@gmail.org"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Phone Input with Country Flags */}
        <label>Phone</label>
        <PhoneInput
          country={"in"}
          value={phone}
          onChange={(phone) => setPhone(phone)}
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

        <label>Password</label>
        <input
          type="password"
          placeholder="Create a strong password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <button className="primary-btn">Sign Up</button>

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
          Already have an account? <a href="/auth/login">Login</a>
        </div>
      </form>
    </>
  );
}
