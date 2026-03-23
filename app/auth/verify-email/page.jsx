"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/services/apiConfig";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`
        );

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Your email has been verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.detail || "Invalid or expired verification token.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Something went wrong. Please try again later.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="verify-email-card">
      {/* Icon */}
      <div
        className="verify-email-icon"
        style={{
          background:
            status === "success"
              ? "linear-gradient(135deg, #34d399, #10b981)"
              : status === "error"
              ? "linear-gradient(135deg, #f87171, #ef4444)"
              : "linear-gradient(135deg, #60a5fa, #3b82f6)",
        }}
      >
        {status === "verifying" && (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        )}
        {status === "success" && (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        {status === "error" && (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        )}
      </div>

      {/* Title */}
      <h2 className="verify-email-title">
        {status === "verifying" && "Verifying your email…"}
        {status === "success" && "Email Verified!"}
        {status === "error" && "Verification Failed"}
      </h2>

      {/* Message */}
      <p className="verify-email-message">{message || "Please wait while we verify your email address."}</p>

      {/* Action Button */}
      {status !== "verifying" && (
        <button
          className="verify-email-btn"
          onClick={() => router.push("/auth/login")}
          style={{
            background:
              status === "success"
                ? "linear-gradient(90deg, #4cc9f0, #4361ee)"
                : "linear-gradient(90deg, #6b7280, #4b5563)",
          }}
        >
          {status === "success" ? "Continue to Login" : "Back to Login"}
        </button>
      )}

      {/* Spinner for verifying state */}
      {status === "verifying" && <div className="verify-email-spinner" />}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="verify-email-container">
      <Suspense
        fallback={
          <div className="verify-email-card">
            <div className="verify-email-spinner" />
            <p className="verify-email-message">Loading…</p>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
