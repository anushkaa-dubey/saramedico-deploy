"use client";

import React from "react";
import Link from "next/link";

const roles = [
    {
        title: "Patient",
        loginUrl: "/auth/login?role=patient",
    },
    {
        title: "Doctor",
        loginUrl: "/auth/login?role=doctor",
        signupUrl: "/auth/signup?role=doctor",
    },
    {
        title: "Admin",
        loginUrl: "/auth/login?role=admin",
    },
    {
        title: "Hospital",
        loginUrl: "/auth/login?role=hospital",
        signupUrl: "/auth/signup?role=hospital",
    },
];

export default function RolesPage() {
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f8fafc",
                padding: "40px 20px",
                fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
        >
            <div style={{ width: "100%", maxWidth: "1000px" }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <h1
                        style={{
                            fontSize: "32px",
                            fontWeight: "800",
                            color: "#0f172a",
                            marginBottom: "8px",
                        }}
                    >
                        Select Your Role
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "14px" }}>
                        Access the SaraMedico platform according to your role
                    </p>
                </div>

                {/* Role Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "24px",
                    }}
                >
                    {roles.map((role) => (
                        <div
                            key={role.title}
                            style={{
                                background: "#ffffff",
                                borderRadius: "14px",
                                padding: "32px 24px",
                                border: "1px solid #e2e8f0",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                transition: "all 0.2s ease",
                            }}
                        >
                            <h2
                                style={{
                                    fontSize: "20px",
                                    fontWeight: "700",
                                    marginBottom: "20px",
                                    color: "#0f172a",
                                }}
                            >
                                {role.title}
                            </h2>

                            <div
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "10px",
                                }}
                            >
                                <Link
                                    href={role.loginUrl}
                                    style={{
                                        padding: "12px",
                                        textAlign: "center",
                                        borderRadius: "8px",
                                        background: "#3b82f6",
                                        color: "white",
                                        textDecoration: "none",
                                        fontWeight: "600",
                                        fontSize: "14px",
                                    }}
                                >
                                    Login
                                </Link>

                                {role.signupUrl && (
                                    <Link
                                        href={role.signupUrl}
                                        style={{
                                            padding: "12px",
                                            textAlign: "center",
                                            borderRadius: "8px",
                                            background: "#f1f5f9",
                                            color: "#0f172a",
                                            textDecoration: "none",
                                            fontWeight: "600",
                                            fontSize: "14px",
                                        }}
                                    >
                                        Sign Up
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}