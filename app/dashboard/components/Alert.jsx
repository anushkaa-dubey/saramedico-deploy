"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle, Info, XCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Alert({ 
    isOpen, 
    onClose, 
    title, 
    message, 
    type = "info", // info, success, warning, error
    children,
    confirmText = "OK",
    onConfirm,
    showCancel = false,
    cancelText = "Cancel"
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isOpen) return null;

    const icons = {
        info: <Info size={28} color="#359AFF" />,
        success: <CheckCircle size={28} color="#22c55e" />,
        warning: <AlertCircle size={28} color="#f59e0b" />,
        error: <XCircle size={28} color="#ef4444" />,
    };

    const colors = {
        info: "#eff6ff",
        success: "#f0fdf4",
        warning: "#fffbeb",
        error: "#fef2f2",
    };

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        } else {
            // Only auto-close if there's no custom onConfirm handler
            onClose();
        }
    };

    return createPortal(
        <AnimatePresence>
            <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999999,
                background: "rgba(15, 23, 42, 0.4)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                padding: "6% 16px",
            }}
                onClick={onClose}
            >
                <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    style={{
                        background: "#ffffff",
                        borderRadius: "16px",
                        width: "100%",
                        maxWidth: "400px",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                        overflow: "hidden",
                        border: "1px solid #eef2f7"
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    <div style={{ padding: "24px" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px", marginBottom: "24px" }}>
                            <div style={{
                                width: "56px", height: "56px",
                                borderRadius: "14px",
                                background: colors[type],
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                            }}>
                                {icons[type]}
                            </div>
                            <div>
                                <h3 style={{
                                    margin: "0 0 8px",
                                    fontSize: "20px",
                                    fontWeight: "700",
                                    color: "#0f172a",
                                }}>
                                    {title}
                                </h3>
                                <p style={{
                                    margin: 0,
                                    fontSize: "14px",
                                    color: "#64748b",
                                    lineHeight: "1.5"
                                }}>
                                    {message}
                                </p>
                            </div>

                        {children && <div style={{ marginBottom: "20px" }}>{children}</div>}
                        </div>

                        <div style={{
                            display: "flex",
                            gap: "12px",
                        }}>
                            {showCancel && (
                                <button
                                    onClick={onClose}
                                    style={{
                                        flex: 1,
                                        padding: "12px 0",
                                        borderRadius: "10px",
                                        border: "1px solid #e2e8f0",
                                        background: "#fff",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                        color: "#475569",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    {cancelText}
                                </button>
                            )}
                            <button
                                onClick={handleConfirm}
                                style={{
                                    flex: 1,
                                    padding: "12px 0",
                                    borderRadius: "10px",
                                    border: "none",
                                    background: type === "error" ? "#ef4444" : "#359AFF",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    color: "#fff",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                }}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
}
