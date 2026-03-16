"use client";
import { useState, useEffect, useRef } from "react";
import { API_BASE_URL, getAuthHeaders } from "@/services/apiConfig";
import { useRouter } from "next/navigation";
import { Bell, ShieldCheck, Check, X } from "lucide-react";

/**
 * Approve a doctor's access request (Patient action).
 * POST /api/v1/notifications/{notification_id}/approve-ai-access
 */
async function approveAIAccess(notificationId) {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/approve-ai-access`, {
        method: "POST",
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to approve access");
    return response.json();
}

/**
 * Deny a doctor's access request (Patient action).
 * POST /api/v1/notifications/{notification_id}/reject-ai-access
 */
async function rejectAIAccess(notificationId) {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/reject-ai-access`, {
        method: "POST",
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to deny access");
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
            const res = await fetch(`${API_BASE_URL}/notifications?limit=20`, {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                const notifs = data || [];
                setNotifications(notifs);
                setUnreadCount(notifs.filter(n => !n.is_read).length);
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    useEffect(() => {
        fetchNotifications();

        const token = localStorage.getItem("authToken");
        let retryCount = 0;
        const MAX_RETRIES = 5;
        let retryTimeout = null;

        const connectWS = () => {
            if (!token || retryCount >= MAX_RETRIES) return;

            // Check if token is expired before even trying to connect
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
                    // Token expired — don't attempt WS, rely on REST polling
                    return;
                }
            } catch {
                // Invalid token format — skip
                return;
            }

            // WebSocket MUST connect directly to the backend (port 8000), not through Next.js proxy
            // Next.js rewrites do not support WebSocket proxying.
            // 1. Try NEXT_PUBLIC_API_URL (e.g. http://107.20.98.130:8000/api/v1) → convert to ws://
            // 2. Fallback: same hostname as the page but port 8000
            let wsUrl;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
            if (apiUrl && apiUrl.startsWith("http")) {
                wsUrl = apiUrl.replace(/^http/, "ws").replace(/\/api\/v1\/?$/, "");
            } else {
                // Running behind proxy — connect directly with the host's public IP on port 8000
                const pageHost = window.location.hostname;
                wsUrl = `ws://${pageHost}:8000`;
            }
            const ws = new WebSocket(`${wsUrl}/api/v1/ws?token=${token}`);
            wsRef.current = ws;

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === "notification") {
                        const notif = message.data;
                        setNotifications((prev) => [notif, ...prev]);
                        setUnreadCount((prev) => prev + 1);
                        showToast(notif);
                    }
                } catch (e) {
                    // Silently ignore parse errors
                }
            };

            ws.onerror = () => {
                // Silently suppress WS errors — no console spam
            };

            ws.onclose = (event) => {
                // Only reconnect on unexpected close (not user-initiated, not auth failure)
                if (event.code !== 1000 && event.code !== 4001 && retryCount < MAX_RETRIES) {
                    retryCount += 1;
                    const delay = Math.min(1000 * 2 ** retryCount, 30000); // exponential backoff, max 30s
                    retryTimeout = setTimeout(connectWS, delay);
                }
            };
        };

        // Defer WS connection by 2s to let the page fully load first
        retryTimeout = setTimeout(connectWS, 2000);


        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            clearTimeout(retryTimeout);
            if (wsRef.current) {
                wsRef.current.onclose = null; // Prevent reconnect on intentional unmount
                wsRef.current.close(1000, "Component unmounted");
            }
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

    const markAsRead = async (id, action_url, type, title = "", action_metadata = null) => {
        try {
            await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
                method: "PATCH",
                headers: getAuthHeaders(),
            });
            setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount((prev) => Math.max(0, prev - 1));

            let targetUrl = action_url;
            const currentPath = window.location.pathname;
            let role = "doctor";
            if (currentPath.includes("/patient") || currentPath.includes("/p/")) role = "patient";
            else if (currentPath.includes("/hospital")) role = "hospital";
            else if (currentPath.includes("/admin")) role = "admin";
            
            const lowerTitle = title.toLowerCase();

            // 1. Comprehensive URL Normalization for Backend-provided paths
            if (targetUrl) {
                // Remove trailing slashes and normalize to simple path
                targetUrl = targetUrl.split('?')[0]; // strip query for matching

                // Case mapping:
                if (targetUrl.includes("/appointments/")) {
                    const appointmentId = targetUrl.split("/").pop();
                    if (type === "appointment_approved" || lowerTitle.includes("approved")) {
                        targetUrl = `/dashboard/${role}/video-call?appointmentId=${appointmentId}`;
                    } else {
                        targetUrl = `/dashboard/${role}/appointments`;
                    }
                }
                // Handle consultation_started notification - preserve the consultationId and add meet_link from action_metadata
                else if (targetUrl.includes("/video-call") && targetUrl.includes("consultationId")) {
                    // URL already has consultationId, add meet_link if available from action_metadata
                    if (action_metadata?.meet_link) {
                        targetUrl += `&meetLink=${encodeURIComponent(action_metadata.meet_link)}`;
                    }
                }
                else if (targetUrl.includes("/tasks/") || targetUrl.startsWith("/doctor/tasks")) {
                    // Tasks are on the main dashboard home
                    targetUrl = role === "doctor" ? `/dashboard/doctor` : `/dashboard/patient`;
                }
                else if (targetUrl.includes("/calendar") || targetUrl.includes("/events/")) {
                    // Redirect calendar/events to main dashboard home
                    targetUrl = role === "doctor" ? `/dashboard/doctor` : `/dashboard/patient`;
                }
                else if (targetUrl === "/patients" || targetUrl === "/doctor/patients" || targetUrl === "/hospital/patients") {
                    targetUrl = `/dashboard/${role}/patients`;
                }
                else if (targetUrl.startsWith("/notifications/")) {
                    // Internal check — stay here
                    targetUrl = null;
                }
                else if (!targetUrl.startsWith("/dashboard/") && !targetUrl.startsWith("http")) {
                    // If it's a relative path but not dashboard, try to force it into dashboard
                    targetUrl = `/dashboard/${role}/${targetUrl.startsWith('/') ? targetUrl.substring(1) : targetUrl}`;
                }
            }

            // 2. Fallback routing if action_url is missing entirely or still invalid
            if (!targetUrl) {
                if (type === "appointment" || lowerTitle.includes("appointment") || lowerTitle.includes("visit")) {
                    targetUrl = role === "doctor" ? "/dashboard/doctor/appointments" : "/dashboard/patient/appointments";
                } else if (type === "document" || lowerTitle.includes("document") || lowerTitle.includes("report")) {
                    targetUrl = role === "doctor" ? "/dashboard/doctor/patients" : "/dashboard/patient/my-records";
                } else if (lowerTitle.includes("soap")) {
                    targetUrl = "/dashboard/doctor/appointments";
                } else if (lowerTitle.includes("message") || lowerTitle.includes("chat")) {
                    targetUrl = role === "doctor" ? "/dashboard/doctor" : "/dashboard/patient";
                } else if (type === "urgent_task" || lowerTitle.includes("task") || lowerTitle.includes("calendar") || lowerTitle.includes("event")) {
                    targetUrl = role === "doctor" ? "/dashboard/doctor" : "/dashboard/patient";
                }
            }

            // 3. Prevent loop if final target is just dashboard root
            if (targetUrl === currentPath) {
                setDropdownOpen(false);
                return;
            }

            if (targetUrl) {
                router.push(targetUrl);
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
     */
    const handleApprove = async (notif) => {
        setProcessingId(notif.id);
        try {
            await approveAIAccess(notif.id);
            setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
            setUnreadCount((prev) => Math.max(0, prev - 1));

            const successToast = {
                id: Date.now(),
                title: "Access Granted",
                message: "Doctor has been granted secure access to your medical analysis.",
                type: "success"
            };
            setToast(successToast);
            setTimeout(() => setToast(null), 5000);

        } catch (err) {
            console.error("Approve failed:", err);
            alert(err.message || "Failed to process approval.");
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
            await rejectAIAccess(notif.id);
            setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
            setUnreadCount((prev) => Math.max(0, prev - 1));

        } catch (err) {
            console.error("Deny failed:", err);
            // Optionally, we could still hide it on failure so the user isn't stuck.
            // setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
            alert("Failed to reject access.");
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
                onClick={isAccessRequest ? undefined : () => markAsRead(notif.id, notif.action_url, notif.type, notif.title, notif.action_metadata)}
            >
                {/* Notification icon + title row */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    {isAccessRequest && (
                        <div style={{
                            width: "32px", height: "32px", borderRadius: "50%",
                            background: "#eff6ff", display: "flex", alignItems: "center",
                            justifyContent: "center", flexShrink: 0, marginTop: "2px"
                        }}>
                            <ShieldCheck size={16} color="#3b82f6" />
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
                                    {isProcessing ? "..." : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Check size={14} /> Approve</span>}
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
                                    {isProcessing ? "..." : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><X size={14} /> Deny</span>}
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
                <Bell size={24} color="#64748b" />
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
                        position: window.innerWidth <= 768 ? "fixed" : "absolute", top: window.innerWidth <= 768 ? "60px" : "100%",
                        left: window.innerWidth <= 768 ? "10px" : "auto",
                        right: window.innerWidth <= 768 ? "10px" : "0",
                        width: window.innerWidth <= 768 ? "90vw" : "340px", boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                        background: "white",
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
                        markAsRead(toast.id, toast.action_url, toast.type, toast.title);
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
