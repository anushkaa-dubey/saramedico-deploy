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
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fff",
            color: "#000",
            padding: "20px",
            fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        }}>
            <div style={{
                width: "100%",
                maxWidth: "900px",
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "24px",
            }}>
                {roles.map((role) => (
                    <div key={role.title} style={{
                        border: "2px solid #000",
                        padding: "40px 24px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#fff",
                        textAlign: "center"
                    }}>
                        <h2 style={{
                            fontSize: "24px",
                            fontWeight: "700",
                            marginBottom: "24px",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            color: "#000"
                        }}>{role.title}</h2>

                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                            width: "100%"
                        }}>
                            <Link href={role.loginUrl} style={{
                                display: "block",
                                padding: "14px",
                                textAlign: "center",
                                backgroundColor: "#000",
                                color: "#fff",
                                textDecoration: "none",
                                fontWeight: "700",
                                fontSize: "14px",
                                border: "2px solid #000",
                                letterSpacing: "0.5px"
                            }}>
                                LOGIN
                            </Link>

                            {role.signupUrl && (
                                <Link href={role.signupUrl} style={{
                                    display: "block",
                                    padding: "14px",
                                    textAlign: "center",
                                    backgroundColor: "#fff",
                                    color: "#000",
                                    textDecoration: "none",
                                    fontWeight: "700",
                                    fontSize: "14px",
                                    border: "2px solid #000",
                                    letterSpacing: "0.5px"
                                }}>
                                    SIGNUP
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
