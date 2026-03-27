"use client";

/**
 * Apple OAuth Callback Page
 * ─────────────────────────────────────────────────────────────────────────────
 * This page handles TWO scenarios:
 *
 * Scenario A – Backend redirects here with JSON-encoded token data in
 *   query params (e.g. ?access_token=xxx&refresh_token=yyy&user=<encoded>).
 *   The page reads those params, stores them, and routes the user to their
 *   dashboard.
 *
 * Scenario B – The backend callback returns JSON directly in the browser
 *   (because the backend SSO redirect URL is the backend's own URL, not this
 *   frontend page). In that case, this page would not be visited at all and
 *   the standard flow works as-is once the backend is configured to redirect
 *   here.
 *
 * If this page is visited without any token params (e.g. direct navigation),
 * it politely redirects the user to the login page.
 */

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AppleCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState("processing"); // "processing" | "error"
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        try {
            // ── Try to read token data from query params ──────────────────────────
            const accessToken = searchParams.get("access_token");
            const refreshToken = searchParams.get("refresh_token");
            const userParam = searchParams.get("user");
            const errorParam = searchParams.get("error");

            if (errorParam) {
                setErrorMsg(decodeURIComponent(errorParam));
                setStatus("error");
                return;
            }

            if (!accessToken) {
                // No token data — redirect to login
                router.replace("/auth/login");
                return;
            }

            // Store auth data in localStorage (same pattern as regular login)
            localStorage.setItem("authToken", accessToken);
            if (refreshToken) {
                localStorage.setItem("refreshToken", refreshToken);
            }

            let user = null;
            if (userParam) {
                try {
                    user = JSON.parse(decodeURIComponent(userParam));
                } catch {
                    // Ignore parse errors
                }
            }

            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
            }

            // Resolve role from stored user or the role hint saved before OAuth
            const rawRole = user?.role || "";
            const userRole = String(rawRole).split(".").pop().trim().toLowerCase();

            // Route to the correct dashboard
            if (userRole === "doctor") {
                if (user?.onboarding_complete === false) {
                    window.location.href = "/auth/signup/onboarding/doctor/step-1";
                    return;
                }
                window.location.href = "/dashboard/doctor";
                return;
            }

            if (userRole === "patient") {
                window.location.href = "/dashboard/patient";
                return;
            }

            if (userRole === "admin" || userRole === "administrator") {
                window.location.href = "/dashboard/admin";
                return;
            }

            if (userRole === "hospital") {
                if (user?.onboarding_complete === false) {
                    window.location.href = "/auth/signup/onboarding/hospital";
                    return;
                }
                window.location.href = "/dashboard/hospital";
                return;
            }

            // Fallback — role not determined, go to login
            window.location.href = "/dashboard/patient";
        } catch (err) {
            console.error("[Apple Callback] Unexpected error:", err);
            setErrorMsg("An unexpected error occurred. Please try again.");
            setStatus("error");
        }
    }, [searchParams, router]);

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Inter, system-ui, sans-serif",
                background: "linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)",
            }}
        >
            {status === "processing" && (
                <>
                    {/* Spinner */}
                    <div
                        style={{
                            width: 52,
                            height: 52,
                            borderRadius: "50%",
                            border: "4px solid #e0e7ff",
                            borderTopColor: "#000000", /* Apple uses black/dark themes heavily */
                            animation: "spin 0.85s linear infinite",
                            marginBottom: 24,
                        }}
                    />
                    <h2
                        style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: "#1e293b",
                            marginBottom: 8,
                        }}
                    >
                        Signing you in with Apple…
                    </h2>
                    <p style={{ fontSize: 14, color: "#64748b" }}>
                        Please wait while we complete authentication.
                    </p>
                </>
            )}

            {status === "error" && (
                <>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                    <h2
                        style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: "#dc2626",
                            marginBottom: 8,
                        }}
                    >
                        Apple Sign-In Failed
                    </h2>
                    <p
                        style={{
                            fontSize: 14,
                            color: "#64748b",
                            maxWidth: 360,
                            textAlign: "center",
                            marginBottom: 24,
                        }}
                    >
                        {errorMsg || "An error occurred during Apple authentication."}
                    </p>
                    <button
                        onClick={() => router.replace("/auth/login")}
                        style={{
                            padding: "10px 28px",
                            background: "#000000", /* Apple usually employs black/grey standard buttons */
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            fontSize: 15,
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        Back to Login
                    </button>
                </>
            )}

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}

export default function AppleCallbackPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>}>
            <AppleCallbackContent />
        </Suspense>
    );
}
