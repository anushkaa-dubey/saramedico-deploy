"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "../../components/AuthLayout";

function Signup2FAContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

    // BACKEND HOOK
    // fetch("/api/auth/verify-otp", ...)

    if (code === "123456") {
      const role = searchParams.get("role") || "patient";

      if (role === "doctor") {
        // Doctor signup: Redirect to onboarding steps
        router.push("/auth/signup/onboarding/doctor/step-1");
      } else if (role === "admin") {
        // Admin signup: Direct to dashboard
        router.push("/dashboard/admin");
      } else if (role === "hospital") {
        // Hospital signup: Direct to dashboard (or create hospital dashboard later)
        router.push("/dashboard/admin"); // Temporary: redirect to admin
      } else {
        // Patient signup: Direct to dashboard
        router.push("/dashboard/patient");
      }
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
          {/* add timer */}
          ⟳ Resend code in 00:50
        </div>
      </form>
    </AuthLayout>
  );
}

export default function Signup2FAPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Signup2FAContent />
    </Suspense>
  );
}
