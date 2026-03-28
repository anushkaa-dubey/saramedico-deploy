"use client";
import styles from "../HospitalDashboard.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser as getStoredUser } from "@/services/tokenService";
import NotificationBell from "../../components/NotificationBell";

export default function Topbar({ title }) {
    const [user, setUser] = useState(null);
    const [loggingOut, setLoggingOut] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const loadFromStorage = () => {
            try {
                const cached = getStoredUser();
                if (cached) {
                    setUser({
                        full_name: cached?.full_name || cached?.name || "Hospital Admin",
                        avatar_url: cached?.avatar_url || null,
                    });
                }
            } catch (_) { }
        };

        loadFromStorage();
        window.addEventListener("profile-updated", loadFromStorage);
        return () => window.removeEventListener("profile-updated", loadFromStorage);
    }, []);

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
                justifyContent: "flex-end",
                gap: "12px",
            }}>
                <NotificationBell />
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", lineHeight: 1, whiteSpace: "nowrap" }}>
                            {displayName}
                        </span>
                        <span style={{ fontSize: "11px", color: "#64748b", lineHeight: 1, whiteSpace: "nowrap" }}>
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
            </div>
        </header>
    );
}