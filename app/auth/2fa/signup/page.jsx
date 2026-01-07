"use client";
import { useState } from "react";
import AuthLayout from "../../components/AuthLayout";

export default function Signup2FAPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-s-${index + 1}`)?.focus();
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) return setError("Enter the 6-digit code");

    // 🔒 BACKEND HOOK
    // fetch("/api/auth/verify-otp", ...)

    if (code === "123456") {
      alert("Signup 2FA Verified (demo)");
      router.push("/dashboard/patient");

    } else {
      setError("Invalid code");
    }
  };

  return (
    <AuthLayout>
      <h2>Two-Factor Authentication</h2>
      <p className="subtext">
        We sent a code to <b>+1(222) xxx-xx89</b>. Enter it below to complete sign up.
      </p>

      <form onSubmit={handleVerify}>
        {/* OTP */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
          {otp.map((d, i) => (
            <input
              key={i}
              id={`otp-s-${i}`}
              value={d}
              onChange={(e) => handleChange(e.target.value, i)}
              maxLength={1}
              inputMode="numeric"
              style={{
                width: "44px",
                height: "44px",
                textAlign: "center",
                fontSize: "18px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                outline: "none",
              }}
            />
          ))}
        </div>

        {error && <p style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}>{error}</p>}

        <button className="primary-btn">Verify</button>

        <div style={{ marginTop: "12px", fontSize: "12px", color: "#6b7280" }}>
          ⟳ Resend code in 00:50
        </div>
      </form>
    </AuthLayout>
  );
}
