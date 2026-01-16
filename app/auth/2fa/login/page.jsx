"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function Login2FAContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const code = otp.join("");

    if (code.length !== 6) {
      setLoading(false);
      setError("Please enter the 6-digit code.");
      return;
    }

    try {
      // BACKEND HOOK (to be implemented later)
      // await fetch("/api/auth/verify-otp", {...})

      // temparary 
      if (code !== "123456") {
        throw new Error("Invalid verification code");
      }

      const role = searchParams.get("role") || "patient";

      // Route based on role
      if (role === "admin") {
        router.push("/dashboard/admin");
      } else if (role === "doctor") {
        // Doctor login goes directly to dashboard (no onboarding)
        router.push("/dashboard/doctor");
      } else if (role === "hospital") {
        // Hospital dashboard (can be created later)
        router.push("/dashboard/admin"); // Temporary: redirect to admin
      } else {
        // Patient
        router.push("/dashboard/patient");
      }

    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-2fa-container">
      <div className="auth-2fa-card">
        {/* 🔒 LOCK ICON PLACEHOLDER */}
        <div className="lock-icon-container">
          {/* Replace with your SVG later */}
          LOCK
        </div>

        <h2 style={{ marginBottom: "4px" }}>Check your Inbox</h2>

        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "6px" }}>
          We sent a code to <b>+1 (222) xxx-xx89</b>
        </p>

        {/* 👇 Text on NEW LINE as in UI */}
        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "18px" }}>
          Enter the code below to access the portal.
        </p>

        <form onSubmit={handleVerify}>
          {/* OTP INPUTS */}
          <div className="otp-input-container">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, idx)}
                className="otp-input"
                required
              />
            ))}
          </div>

          {error && (
            <p style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="verify-btn"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>

          <div style={{ marginTop: "14px", fontSize: "12px", color: "#6b7280" }}>
            ⟳ Resend code in 00:50
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Login2FAPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Login2FAContent />
    </Suspense>
  );
}
