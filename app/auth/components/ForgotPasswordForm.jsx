"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { forgotPassword } from "@/services/auth";

export default function ForgotPasswordForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            await forgotPassword({ email });
            setMessage("If an account exists, a reset link has been sent.");
        } catch (err) {
            console.error(err);
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h2>Forgot Password</h2>
            <p className="subtext">Enter your email to receive a reset link.</p>

            <form onSubmit={handleSubmit}>
                <label>Email Address</label>
                <input
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                {message && (
                    <p style={{ color: "#16a34a", fontSize: "14px", marginTop: "10px", textAlign: "center" }}>
                        {message}
                    </p>
                )}

                {error && (
                    <p style={{ color: "#ef4444", fontSize: "14px", marginTop: "10px", textAlign: "center" }}>
                        {error}
                    </p>
                )}

                <button className="primary-btn" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <div className="bottom-text">
                    Remember your password? <a href="/auth/login">Login</a>
                </div>
            </form>
        </>
    );
}
