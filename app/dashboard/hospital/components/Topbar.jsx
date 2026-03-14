"use client";
import styles from "../HospitalDashboard.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL, getAuthHeaders } from "@/services/apiConfig";

export default function Topbar({ title }) {
    const [user, setUser] = useState(null);
    const [loggingOut, setLoggingOut] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const loadFromStorage = () => {
            try {
                const cached = localStorage.getItem("user");
                if (cached) {
                    const parsed = JSON.parse(cached);
                    setUser({
                        full_name: parsed?.full_name || parsed?.name || "Hospital Admin",
                        avatar_url: parsed?.avatar_url || null,
                    });
                }
            } catch (_) { }
        };

        loadFromStorage();
        window.addEventListener("profile-updated", loadFromStorage);
        return () => window.removeEventListener("profile-updated", loadFromStorage);
    }, []);

    // const handleLogout = async () => {
    //     setLoggingOut(true);
    //     try {
    //         const refreshToken = localStorage.getItem("refreshToken") || localStorage.getItem("refresh_token");
    //         await fetch(`${API_BASE_URL}/auth/logout`, {
    //             method: "POST",
    //             headers: getAuthHeaders(),
    //             body: JSON.stringify({ refresh_token: refreshToken || "" }),
    //         });
    //     } catch (err) {
    //         console.error("Logout error:", err);
    //     } finally {
    //         // Always clear local storage and redirect regardless of API response
    //         localStorage.removeItem("authToken");
    //         localStorage.removeItem("refreshToken");
    //         localStorage.removeItem("refresh_token");
    //         localStorage.removeItem("user");
    //         router.replace("/auth/login");
    //     }
    // };

    const displayName = user?.full_name || "Hospital Admin";
    const initials = displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    return (
        <header className={styles.topbar}>
            <div style={{
                maxWidth: "1400px",
                margin: "0 auto",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }}>
                <div>
                    <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                        {title || "Overview"}
                    </h2>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                            <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", lineHeight: 1 }}>
                                {displayName}
                            </span>
                            <span style={{ fontSize: "11px", color: "#64748b", lineHeight: 1 }}>
                                Hospital Administrator
                            </span>
                        </div>

                        {/* Avatar */}
                        <div style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #359AFF, #9CCDFF)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "#fff",
                            flexShrink: 0,
                            overflow: "hidden",
                        }}>
                            {user?.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt={displayName}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            ) : (
                                initials
                            )}
                        </div>
                    </div>

                    {/* Logout Button
                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        title="Logout"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 14px",
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0",
                            background: "transparent",
                            color: "#64748b",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: loggingOut ? "not-allowed" : "pointer",
                            opacity: loggingOut ? 0.6 : 1,
                            transition: "all 0.2s",
                            whiteSpace: "nowrap",
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = "#fee2e2";
                            e.currentTarget.style.borderColor = "#fecaca";
                            e.currentTarget.style.color = "#991b1b";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.borderColor = "#e2e8f0";
                            e.currentTarget.style.color = "#64748b";
                        }}
                    >
                        <LogOut size={15} />
                        {loggingOut ? "Logging out..." : "Logout"}
                    </button> */}
                </div>
            </div>
        </header>
    );
}