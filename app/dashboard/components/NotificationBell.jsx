"use client";
import { useState, useEffect, useRef } from "react";
import { API_BASE_URL, getAuthHeaders } from "@/services/apiConfig";
import { useRouter } from "next/navigation";

/**
 * Approve a doctor's access request (Patient action).
 * POST /api/v1/permissions/grant-doctor-access
 * { doctor_id, ai_access_permission: true }
 */
async function approveAccessRequest(doctorId) {
    const response = await fetch(`${API_BASE_URL}/permissions/grant-doctor-access`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ doctor_id: doctorId, ai_access_permission: true }),
    });
    if (!response.ok) throw new Error("Failed to approve access");
    return response.json();
}

/**
 * Deny a doctor's access request (Patient action).
 * DELETE /api/v1/permissions/revoke-doctor-access
 * { doctor_id }
 */
async function denyAccessRequest(doctorId) {
    const response = await fetch(`${API_BASE_URL}/permissions/revoke-doctor-access`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({ doctor_id: doctorId }),
    });
    // 404 is fine — means no grant existed yet, which is effectively a denial
    if (!response.ok && response.status !== 404) throw new Error("Failed to deny access");
    return true;
}

export default function NotificationBell() {
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [processingId, setProcessingId] = useState(null); // Track which notif is being acted on
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
                        // Show toast for access_requested with special style
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
        // Only show regular toast for non-permission requests (permission requests need inline buttons)
        if (notif.type !== "access_requested") {
            setToast(notif);
            setTimeout(() => setToast(null), 5000);
        }
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

    /**
     * Handle patient approving a doctor's access request.
     * Extracts doctor_id from the notification data.
     */
    const handleApprove = async (notif) => {
        setProcessingId(notif.id);
        try {
            // doctor_id may be in notif.data, notif.doctor_id, or notif.metadata
            const doctorId = notif.doctor_id || notif.data?.doctor_id || notif.metadata?.doctor_id;
            if (!doctorId) throw new Error("Doctor ID not found in notification");
            await approveAccessRequest(doctorId);
            // Mark the notification as read after action
            await fetch(`${API_BASE_URL}/notifications/${notif.id}/read`, {
                method: "PATCH",
                headers: getAuthHeaders(),
            });
            setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Approve failed:", err);
        } finally {
            setProcessingId(null);
        }
    };

    /**
     * Handle patient denying a doctor's access request.
     */
    const handleDeny = async (notif) => {
        setProcessingId(notif.id);
        try {
            const doctorId = notif.doctor_id || notif.data?.doctor_id || notif.metadata?.doctor_id;
            if (!doctorId) throw new Error("Doctor ID not found in notification");
            await denyAccessRequest(doctorId);
            await fetch(`${API_BASE_URL}/notifications/${notif.id}/read`, {
                method: "PATCH",
                headers: getAuthHeaders(),
            });
            setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Deny failed:", err);
        } finally {
            setProcessingId(null);
        }
    };

    // Render a single notification row, with special treatment for access_requested
    const renderNotification = (notif) => {
        const isAccessRequest = notif.type === "access_requested";
        const isProcessing = processingId === notif.id;

        return (
            <div
                key={notif.id}
                style={{
                    padding: "12px",
                    borderBottom: "1px solid #f1f5f9",
                    background: notif.is_read ? "#fff" : "#f8fafc",
                    cursor: isAccessRequest ? "default" : "pointer",
                }}
                onClick={isAccessRequest ? undefined : () => markAsRead(notif.id, notif.action_url)}
            >
                {/* Notification icon + title row */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    {isAccessRequest && (
                        <div style={{
                            width: "32px", height: "32px", borderRadius: "50%",
                            background: "#eff6ff", display: "flex", alignItems: "center",
                            justifyContent: "center", flexShrink: 0, marginTop: "2px"
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                    )}
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", marginBottom: "3px" }}>
                            {notif.title}
                        </div>
                        <div style={{ fontSize: "12px", color: "#475569" }}>{notif.message}</div>
                        <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>
                            {new Date(notif.created_at).toLocaleString()}
                        </div>

                        {/* Approve / Deny buttons — only for access_requested notifications shown to patients */}
                        {isAccessRequest && (
                            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleApprove(notif); }}
                                    disabled={isProcessing}
                                    style={{
                                        flex: 1,
                                        padding: "6px 12px",
                                        background: "#10b981",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        cursor: isProcessing ? "not-allowed" : "pointer",
                                        opacity: isProcessing ? 0.6 : 1,
                                        transition: "opacity 0.2s",
                                    }}
                                >
                                    {isProcessing ? "..." : "✓ Approve"}
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeny(notif); }}
                                    disabled={isProcessing}
                                    style={{
                                        flex: 1,
                                        padding: "6px 12px",
                                        background: "white",
                                        color: "#ef4444",
                                        border: "1px solid #ef4444",
                                        borderRadius: "6px",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        cursor: isProcessing ? "not-allowed" : "pointer",
                                        opacity: isProcessing ? 0.6 : 1,
                                        transition: "opacity 0.2s",
                                    }}
                                >
                                    {isProcessing ? "..." : "✗ Deny"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
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
                        width: "340px",
                        background: "white",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                        borderRadius: "12px",
                        zIndex: 1000,
                        border: "1px solid #e2e8f0",
                        overflow: "hidden",
                    }}
                >
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Notifications</h4>
                        {notifications.length > 0 && (
                            <span onClick={markAllAsRead} style={{ fontSize: "12px", color: "#3b82f6", cursor: "pointer", fontWeight: "500" }}>
                                Mark all as read
                            </span>
                        )}
                    </div>
                    <div style={{ maxHeight: "380px", overflowY: "auto" }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: "32px", textAlign: "center", color: "#64748b", fontSize: "14px" }}>
                                No new notifications
                            </div>
                        ) : (
                            notifications.map((notif) => renderNotification(notif))
                        )}
                    </div>
                </div>
            )}

            {/* Toast for non-permission notifications */}
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
                        borderRadius: "10px",
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
