"use client";

import React from "react";
import Link from "next/link";
import { UserPlus, LogIn } from "lucide-react";

export default function AuthSelectionPage() {
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
            <div style={{ width: "100%", maxWidth: "800px" }}>
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <h1
                        style={{
                            fontSize: "32px",
                            fontWeight: "800",
                            color: "#0f172a",
                            marginBottom: "8px",
                        }}
                    >
                        Welcome to SaraMedico
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "16px" }}>
                        Choose an option to continue
                    </p>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "24px",
                    }}
                >
                    <Link href="/auth/login" style={{ textDecoration: 'none' }}>
                        <div
                            style={{
                                background: "#ffffff",
                                borderRadius: "14px",
                                padding: "40px 24px",
                                border: "1px solid #e2e8f0",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                transition: "all 0.2s ease",
                                cursor: "pointer",
                                height: "100%"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%',
                                background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '24px', color: '#3b82f6'
                            }}>
                                <LogIn size={32} />
                            </div>
                            <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "12px", color: "#0f172a" }}>
                                Sign In
                            </h2>
                            <p style={{ color: "#64748b", textAlign: "center", fontSize: "15px" }}>
                                Log in to your existing account to access your dashboard.
                            </p>
                        </div>
                    </Link>

                    <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
                        <div
                            style={{
                                background: "#ffffff",
                                borderRadius: "14px",
                                padding: "40px 24px",
                                border: "1px solid #e2e8f0",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                transition: "all 0.2s ease",
                                cursor: "pointer",
                                height: "100%"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%',
                                background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '24px', color: '#16a34a'
                            }}>
                                <UserPlus size={32} />
                            </div>
                            <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "12px", color: "#0f172a" }}>
                                Sign Up
                            </h2>
                            <p style={{ color: "#64748b", textAlign: "center", fontSize: "15px" }}>
                                Create a new account and set up your healthcare organization profile.
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}