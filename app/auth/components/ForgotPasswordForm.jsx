"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        // Prepare payload
        const payload = { email };

        // TODO: Replace with actual API call
        // await forgotPassword(payload);

        console.log("Forgot Password payload ready:", payload);

        // Simulate API response
        setTimeout(() => {
            setMessage("If an account exists, a reset link has been sent.");
            setLoading(false);
        }, 1000);
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
