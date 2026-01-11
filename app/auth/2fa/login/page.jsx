"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";


export default function Login2FAPage() {
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

    const role = searchParams.get("role");

    if (role === "admin") {
      router.push("/dashboard/admin");
    } else {
      router.push("/dashboard/patient");
    }

  } catch (err) {
    setError(err.message || "Verification failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#fff",
          borderRadius: "14px",
          padding: "32px 28px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        {/* 🔒 LOCK ICON PLACEHOLDER */}
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#e5e7eb",
            margin: "0 auto 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            color: "#6b7280",
          }}
        >
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
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              marginBottom: "14px",
            }}
          >
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, idx)}
                style={{
                  width: "44px",
                  height: "44px",
                  textAlign: "center",
                  fontSize: "18px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  outline: "none",
                }}
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
            style={{
              width: "100%",
              height: "42px",
              borderRadius: "999px",
              border: "none",
              background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
              color: "#fff",
              fontSize: "14px",
              cursor: "pointer",
            }}
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
