"use client";
import { useState, useEffect, useRef } from "react";
import { API_BASE_URL, getAuthHeaders } from "@/services/apiConfig";
import { useRouter } from "next/navigation";

export default function NotificationBell() {
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const wsRef = useRef(null);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/notifications?is_read=false&limit=20`, {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data || []);
                setUnreadCount((data || []).length);
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    useEffect(() => {
        fetchNotifications();

        const token = localStorage.getItem("authToken");
        if (token) {
            const host = API_BASE_URL.replace(/^http/, "ws");
            wsRef.current = new WebSocket(`${host}/ws?token=${token}`);

            wsRef.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === "notification") {
                        const notif = message.data;
                        setNotifications((prev) => [notif, ...prev]);
                        setUnreadCount((prev) => prev + 1);
                        showToast(notif);
                    }
                } catch (e) {
                    console.error("WS parse error", e);
                }
            };
        }

        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            if (wsRef.current) wsRef.current.close();
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const showToast = (notif) => {
        setToast(notif);
        setTimeout(() => setToast(null), 5000);
    };

    const markAsRead = async (id, action_url) => {
        try {
            await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
                method: "PATCH",
                headers: getAuthHeaders(),
            });
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            setUnreadCount((prev) => Math.max(0, prev - 1));
            if (action_url) {
                router.push(action_url);
                setDropdownOpen(false);
            }
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch(`${API_BASE_URL}/notifications/read-all`, {
                method: "PATCH",
                headers: getAuthHeaders(),
            });
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    return (
        <div style={{ position: "relative" }} ref={dropdownRef}>
            <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                    cursor: "pointer",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px",
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                    <span
                        style={{
                            position: "absolute",
                            top: "4px",
                            right: "6px",
                            background: "#ef4444",
                            color: "white",
                            fontSize: "10px",
                            fontWeight: "bold",
                            padding: "2px 6px",
                            borderRadius: "10px",
                        }}
                    >
                        {unreadCount}
                    </span>
                )}
            </div>

            {dropdownOpen && (
                <div
                    style={{
                        position: "absolute",
                        top: "100%",
                        right: "0",
                        width: "320px",
                        background: "white",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        borderRadius: "8px",
                        zIndex: 1000,
                        border: "1px solid #e2e8f0",
                        overflow: "hidden",
                    }}
                >
                    <div style={{ padding: "12px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Notifications</h4>
                        {notifications.length > 0 && (
                            <span onClick={markAllAsRead} style={{ fontSize: "12px", color: "#3b82f6", cursor: "pointer" }}>Mark all as read</span>
                        )}
                    </div>
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: "24px", textAlign: "center", color: "#64748b", fontSize: "14px" }}>No new notifications</div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => markAsRead(notif.id, notif.action_url)}
                                    style={{
                                        padding: "12px",
                                        borderBottom: "1px solid #f1f5f9",
                                        cursor: "pointer",
                                        background: notif.is_read ? "#fff" : "#f8fafc",
                                    }}
                                >
                                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", marginBottom: "4px" }}>{notif.title}</div>
                                    <div style={{ fontSize: "12px", color: "#475569" }}>{notif.message}</div>
                                    <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>{new Date(notif.created_at).toLocaleString()}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {toast && (
                <div
                    onClick={() => {
                        if (toast.action_url) {
                            markAsRead(toast.id, toast.action_url);
                        } else {
                            setToast(null);
                        }
                    }}
                    style={{
                        position: "fixed",
                        bottom: "24px",
                        right: "24px",
                        background: "white",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                        borderRadius: "8px",
                        padding: "16px",
                        zIndex: 10000,
                        width: "300px",
                        borderLeft: "4px solid #3b82f6",
                        cursor: "pointer",
                    }}
                >
                    <div style={{ fontSize: "14px", fontWeight: "bold", color: "#0f172a", marginBottom: "4px" }}>{toast.title}</div>
                    <div style={{ fontSize: "13px", color: "#475569" }}>{toast.message}</div>
                </div>
            )}
        </div>
    );
}
