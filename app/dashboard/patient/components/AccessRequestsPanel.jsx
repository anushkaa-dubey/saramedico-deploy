"use client";
import { useState, useEffect, useRef } from "react";
import { fetchPendingAccessRequests, grantDoctorAccess, revokeDoctorAccess } from "@/services/patient";

/**
 * AccessRequestsPanel
 * Renders the notification bell with a dropdown showing pending doctor access requests.
 * Patients can Approve (with AI access) or Deny each request.
 */
export default function AccessRequestsPanel({ notificationIconSrc }) {
    const [open, setOpen] = useState(false);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [toasts, setToasts] = useState([]);
    const panelRef = useRef(null);

    // Load pending requests on mount
    useEffect(() => {
        loadRequests();
    }, []);

    // Close panel when clicking outside
    useEffect(() => {
        const handleClick = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const data = await fetchPendingAccessRequests();
            setRequests(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load access requests:", err);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg, type = "success") => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };

    const handleApprove = async (req) => {
        const doctorId = req.doctor_id || req.doctorId;
        if (!doctorId) return;
        setProcessingId(doctorId + "_approve");
        try {
            await grantDoctorAccess(doctorId, true); // true = include AI access
            setRequests(prev => prev.filter(r => (r.doctor_id || r.doctorId) !== doctorId));
            showToast(`✅ Access granted to ${req.doctor_name || req.doctorName || "Doctor"}`);
        } catch (err) {
            showToast(`❌ Failed: ${err.message}`, "error");
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeny = async (req) => {
        const doctorId = req.doctor_id || req.doctorId;
        if (!doctorId) return;
        setProcessingId(doctorId + "_deny");
        try {
            await revokeDoctorAccess(doctorId);
            setRequests(prev => prev.filter(r => (r.doctor_id || r.doctorId) !== doctorId));
            showToast(`Access request from ${req.doctor_name || req.doctorName || "Doctor"} denied.`, "info");
        } catch (err) {
            // Even if revoke fails (no active grant), remove from UI
            setRequests(prev => prev.filter(r => (r.doctor_id || r.doctorId) !== doctorId));
            showToast(`Request dismissed.`, "info");
        } finally {
            setProcessingId(null);
        }
    };

    const pendingCount = requests.length;

    return (
        <div style={{ position: "relative" }} ref={panelRef}>
            {/* Bell Button */}
            <button
                id="notification-bell-btn"
                onClick={() => setOpen(o => !o)}
                style={{
                    position: "relative",
                    background: open ? "rgba(99,102,241,0.08)" : "transparent",
                    border: "none",
                    borderRadius: "10px",
                    width: "38px",
                    height: "38px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "background 0.2s",
                }}
                aria-label={`Notifications${pendingCount > 0 ? ` (${pendingCount} pending)` : ""}`}
            >
                <img src={notificationIconSrc} alt="Notifications" width="20" height="20" />
                {pendingCount > 0 && (
                    <span style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        minWidth: "17px",
                        height: "17px",
                        background: "#ef4444",
                        color: "#fff",
                        borderRadius: "99px",
                        fontSize: "10px",
                        fontWeight: "700",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 3px",
                        lineHeight: 1,
                        boxShadow: "0 0 0 2px #fff",
                        animation: "pulse 1.5s infinite",
                    }}>
                        {pendingCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    right: 0,
                    width: "360px",
                    background: "#fff",
                    borderRadius: "16px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)",
                    zIndex: 9999,
                    overflow: "hidden",
                    border: "1px solid rgba(226,232,240,0.8)",
                }}>
                    {/* Header */}
                    <div style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid #f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>
                                Notifications
                            </h3>
                            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                                {pendingCount > 0 ? `${pendingCount} pending request${pendingCount > 1 ? "s" : ""}` : "All caught up!"}
                            </p>
                        </div>
                        {pendingCount > 0 && (
                            <span style={{
                                background: "rgba(239,68,68,0.1)",
                                color: "#ef4444",
                                fontSize: "11px",
                                fontWeight: "700",
                                padding: "3px 10px",
                                borderRadius: "99px",
                            }}>
                                {pendingCount} NEW
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    <div style={{ maxHeight: "420px", overflowY: "auto" }}>
                        {loading ? (
                            <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
                                <div style={{
                                    width: "32px", height: "32px",
                                    border: "3px solid #f1f5f9",
                                    borderTop: "3px solid #6366f1",
                                    borderRadius: "50%",
                                    animation: "spin 0.8s linear infinite",
                                    margin: "0 auto 12px",
                                }} />
                                Loading...
                            </div>
                        ) : requests.length === 0 ? (
                            <div style={{ padding: "40px 20px", textAlign: "center" }}>
                                <div style={{ fontSize: "36px", marginBottom: "8px" }}>🔔</div>
                                <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                                    No pending access requests
                                </p>
                            </div>
                        ) : (
                            requests.map((req) => {
                                const doctorId = req.doctor_id || req.doctorId;
                                const doctorName = req.doctor_name || req.doctorName || `Dr. ${doctorId?.slice(0, 8)}`;
                                const reason = req.reason || "AI Chart Review and Analysis";
                                const requestedAt = req.requested_at || req.requestedAt;
                                const isProcessing = processingId?.startsWith(doctorId);

                                return (
                                    <div key={doctorId} style={{
                                        padding: "16px 20px",
                                        borderBottom: "1px solid #f8fafc",
                                        background: isProcessing ? "#fafbff" : "#fff",
                                        transition: "background 0.2s",
                                    }}>
                                        {/* Request Header */}
                                        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                            {/* Doctor Avatar */}
                                            <div style={{
                                                width: "40px", height: "40px", borderRadius: "50%",
                                                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                flexShrink: 0, color: "#fff", fontWeight: "700", fontSize: "14px"
                                            }}>
                                                {doctorName.replace("Dr.", "").trim()[0]?.toUpperCase() || "D"}
                                            </div>

                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                                                    {doctorName}
                                                </p>
                                                <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#64748b", lineHeight: 1.4 }}>
                                                    Requesting access to your medical records and AI analysis
                                                </p>

                                                {/* Reason chip */}
                                                {reason && (
                                                    <div style={{
                                                        display: "inline-flex", alignItems: "center",
                                                        gap: "4px", background: "#f1f5f9",
                                                        borderRadius: "6px", padding: "3px 8px",
                                                        fontSize: "11px", color: "#64748b",
                                                        marginBottom: "4px",
                                                    }}>
                                                        <span>📋</span>
                                                        <span style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                            {reason}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Timestamp */}
                                                {requestedAt && (
                                                    <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#94a3b8" }}>
                                                        {new Date(requestedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                                            <button
                                                id={`approve-access-${doctorId}`}
                                                onClick={() => handleApprove(req)}
                                                disabled={isProcessing}
                                                style={{
                                                    flex: 1, padding: "8px",
                                                    background: isProcessing ? "#e2e8f0" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                                    color: "#fff", border: "none", borderRadius: "8px",
                                                    fontSize: "12px", fontWeight: "600", cursor: isProcessing ? "not-allowed" : "pointer",
                                                    transition: "all 0.2s", letterSpacing: "0.02em",
                                                }}
                                            >
                                                {processingId === doctorId + "_approve" ? "Approving..." : "✓ Approve & Allow AI"}
                                            </button>
                                            <button
                                                id={`deny-access-${doctorId}`}
                                                onClick={() => handleDeny(req)}
                                                disabled={isProcessing}
                                                style={{
                                                    flex: 1, padding: "8px",
                                                    background: isProcessing ? "#e2e8f0" : "#fff",
                                                    color: isProcessing ? "#94a3b8" : "#ef4444",
                                                    border: "1.5px solid",
                                                    borderColor: isProcessing ? "#e2e8f0" : "#fecaca",
                                                    borderRadius: "8px",
                                                    fontSize: "12px", fontWeight: "600", cursor: isProcessing ? "not-allowed" : "pointer",
                                                    transition: "all 0.2s",
                                                }}
                                            >
                                                {processingId === doctorId + "_deny" ? "Denying..." : "✗ Deny"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: "12px 20px",
                        borderTop: "1px solid #f1f5f9",
                        textAlign: "center",
                    }}>
                        <button
                            onClick={loadRequests}
                            style={{ background: "none", border: "none", color: "#6366f1", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}
                        >
                            ↻ Refresh
                        </button>
                    </div>
                </div>
            )}

            {/* Toast Notifications */}
            <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 99999, display: "flex", flexDirection: "column", gap: "8px" }}>
                {toasts.map(t => (
                    <div key={t.id} style={{
                        background: t.type === "error" ? "#fee2e2" : t.type === "info" ? "#f0f9ff" : "#f0fdf4",
                        color: t.type === "error" ? "#dc2626" : t.type === "info" ? "#0369a1" : "#16a34a",
                        border: `1px solid ${t.type === "error" ? "#fecaca" : t.type === "info" ? "#bae6fd" : "#bbf7d0"}`,
                        padding: "10px 16px", borderRadius: "10px",
                        fontSize: "13px", fontWeight: "600",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        animation: "slideIn 0.3s ease",
                        maxWidth: "280px",
                    }}>
                        {t.msg}
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.7; } }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes slideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
            `}</style>
        </div>
    );
}
