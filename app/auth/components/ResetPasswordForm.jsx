"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/services/auth";

export default function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Password strength checker
    const getStrength = (pw) => {
        let score = 0;
        if (pw.length >= 8) score++;
        if (pw.length >= 12) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        return score; // 0-5
    };

    const strengthLabels = ["", "Weak", "Fair", "Good", "Strong", "Excellent"];
    const strengthColors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];
    const strength = getStrength(newPassword);

    if (!token) {
        return (
            <div className="reset-pw-card">
                <div className="reset-pw-icon" style={{ background: "linear-gradient(135deg, #f87171, #ef4444)" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </div>
                <h2 className="reset-pw-title">Invalid Reset Link</h2>
                <p className="reset-pw-message">
                    No reset token was found. Please request a new password reset link.
                </p>
                <button
                    className="reset-pw-action-btn"
                    onClick={() => router.push("/auth/forgot-password")}
                    style={{ background: "linear-gradient(90deg, #6b7280, #4b5563)" }}
                >
                    Request New Link
                </button>
            </div>
        );
    }

    if (success) {
        return (
            <div className="reset-pw-card">
                <div className="reset-pw-icon" style={{ background: "linear-gradient(135deg, #34d399, #10b981)" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <h2 className="reset-pw-title">Password Reset!</h2>
                <p className="reset-pw-message">
                    {message || "Your password has been reset successfully. You can now log in with your new password."}
                </p>
                <button
                    className="reset-pw-action-btn"
                    onClick={() => router.push("/auth/login")}
                    style={{ background: "linear-gradient(90deg, #4cc9f0, #4361ee)" }}
                >
                    Continue to Login
                </button>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const data = await resetPassword({
                token,
                new_password: newPassword,
                confirm_password: confirmPassword,
            });
            setMessage(data.message || "Password reset successfully!");
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError(err.message || "Something went wrong. The link may have expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h2>Reset Password</h2>
            <p className="subtext">Enter your new password below.</p>

            <form onSubmit={handleSubmit} autoComplete="off">
                <label htmlFor="new-password" style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>
                    New Password
                </label>
                <div className="password-wrapper">
                    <input
                        id="new-password"
                        type={showNew ? "text" : "password"}
                        name="new-password"
                        autoComplete="new-password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                    />
                    <button
                        type="button"
                        className="pw-toggle-btn"
                        onClick={() => setShowNew(!showNew)}
                        aria-label={showNew ? "Hide password" : "Show password"}
                    >
                        {showNew ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                    </button>
                </div>

                {/* Password Strength Bar */}
                {newPassword.length > 0 && (
                    <div className="pw-strength-container">
                        <div className="pw-strength-bar-track">
                            <div
                                className="pw-strength-bar-fill"
                                style={{
                                    width: `${(strength / 5) * 100}%`,
                                    background: strengthColors[strength],
                                }}
                            />
                        </div>
                        <span className="pw-strength-label" style={{ color: strengthColors[strength] }}>
                            {strengthLabels[strength]}
                        </span>
                    </div>
                )}

                <label htmlFor="confirm-password" style={{ fontSize: "16px", fontWeight: "600", color: "#374151", marginTop: "8px" }}>
                    Confirm Password
                </label>
                <div className="password-wrapper">
                    <input
                        id="confirm-password"
                        type={showConfirm ? "text" : "password"}
                        name="confirm-password"
                        autoComplete="new-password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                    />
                    <button
                        type="button"
                        className="pw-toggle-btn"
                        onClick={() => setShowConfirm(!showConfirm)}
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                        {showConfirm ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                    </button>
                </div>

                {/* Password match indicator */}
                {confirmPassword.length > 0 && (
                    <p style={{
                        fontSize: "13px",
                        fontWeight: "500",
                        marginTop: "-8px",
                        marginBottom: "12px",
                        color: newPassword === confirmPassword ? "#22c55e" : "#ef4444"
                    }}>
                        {newPassword === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                    </p>
                )}

                {error && (
                    <p style={{ color: "#ef4444", fontSize: "14px", fontWeight: "600", marginTop: "10px", textAlign: "center" }}>
                        {error}
                    </p>
                )}

                <button
                    className="primary-btn"
                    disabled={loading}
                    style={{ marginTop: "16px" }}
                    id="reset-password-submit"
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </button>

                <div className="bottom-text">
                    Remember your password? <a href="/auth/login">Login</a>
                </div>
            </form>
        </>
    );
}
