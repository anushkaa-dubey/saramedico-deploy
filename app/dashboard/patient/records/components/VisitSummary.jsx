"use client";

import { useState, useEffect } from "react";
import { fetchSoapNote, fetchConsultationDetails, fetchDoctors } from "@/services/patient";
import { motion, AnimatePresence } from "framer-motion";

// Patient-friendly translations of SOAP fields
const SOAP_SECTIONS = [
    {
        key: "subjective",
        icon: "💬",
        label: "What You Told Us",
        description: "Your symptoms and concerns as you described them",
        color: "#3b82f6",
        bg: "#eff6ff",
        border: "#bfdbfe",
    },
    {
        key: "objective",
        icon: "🔬",
        label: "What We Observed",
        description: "Clinical findings, vitals, and examination results",
        color: "#8b5cf6",
        bg: "#f5f3ff",
        border: "#ddd6fe",
    },
    {
        key: "assessment",
        icon: "📋",
        label: "Diagnosis & Findings",
        description: "Our medical assessment based on your visit",
        color: "#059669",
        bg: "#ecfdf5",
        border: "#a7f3d0",
    },
    {
        key: "plan",
        icon: "💊",
        label: "Your Treatment Plan",
        description: "Recommended next steps and medications",
        color: "#d97706",
        bg: "#fffbeb",
        border: "#fde68a",
    },
];

export default function VisitSummary({ consultationId, onClose }) {
    const [consultation, setConsultation] = useState(null);
    const [soapData, setSoapData] = useState(null); // full soap response
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (consultationId) loadDetails();
    }, [consultationId]);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    const loadDetails = async () => {
        setLoading(true);
        setError("");
        try {
            const [details, soap] = await Promise.all([
                fetchConsultationDetails(consultationId),
                fetchSoapNote(consultationId).catch(() => null),
            ]);
            setConsultation(details);
            setSoapData(soap);
        } catch (err) {
            console.error("Failed to load visit summary:", err);
            setError("Unable to load this visit's details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const hasSoap = soapData?.soap_note && typeof soapData.soap_note === "object";
    const isProcessing = soapData?.ai_status === "processing" || soapData?.ai_status === "awaiting_transcript";
    const noSoap = !hasSoap && !isProcessing;

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric",
        });
    };

    const getDoctorName = () => {
        const name = consultation?.doctorName || consultation?.doctor_name || "Your Doctor";
        if (!name || name === "Unknown Doctor") return "Your Doctor";
        return name.startsWith("Dr.") ? name : `Dr. ${name}`;
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0,
                    background: "rgba(15,23,42,0.6)",
                    backdropFilter: "blur(4px)",
                    zIndex: 1000,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "16px",
                }}
            >
                <motion.div
                    initial={{ scale: 0.92, opacity: 0, y: 24 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.92, opacity: 0, y: 24 }}
                    transition={{ type: "spring", damping: 22, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: "#fff",
                        borderRadius: "20px",
                        width: "100%",
                        maxWidth: "620px",
                        maxHeight: "88vh",
                        overflowY: "auto",
                        boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
                    }}
                >
                    {/* Header */}
                    <div style={{
                        background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                        padding: "24px 24px 20px",
                        borderRadius: "20px 20px 0 0",
                        position: "sticky", top: 0, zIndex: 10,
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "1px", marginBottom: "4px", textTransform: "uppercase" }}>
                                    Visit Summary
                                </div>
                                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#fff" }}>
                                    {loading ? "Loading..." : getDoctorName()}
                                </h2>
                                {consultation && (
                                    <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>
                                        {formatDate(consultation.scheduledAt)} · {consultation.status?.toUpperCase()}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                aria-label="Close"
                                style={{
                                    background: "rgba(255,255,255,0.15)", border: "none",
                                    borderRadius: "10px", color: "#fff", fontSize: "20px",
                                    width: "36px", height: "36px", cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    transition: "background 0.2s",
                                    flexShrink: 0,
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div style={{ padding: "24px" }}>
                        {/* Loading State */}
                        {loading && (
                            <div style={{ textAlign: "center", padding: "48px 0" }}>
                                <div style={{
                                    width: "44px", height: "44px", borderRadius: "50%",
                                    border: "3px solid #e2e8f0", borderTopColor: "#3b82f6",
                                    margin: "0 auto 16px",
                                    animation: "spin 0.8s linear infinite",
                                }} />
                                <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>Loading your visit summary...</p>
                                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                            </div>
                        )}

                        {/* Error State */}
                        {!loading && error && (
                            <div style={{
                                background: "#fef2f2", border: "1px solid #fecaca",
                                borderRadius: "12px", padding: "20px", textAlign: "center",
                            }}>
                                <div style={{ fontSize: "32px", marginBottom: "8px" }}>⚠️</div>
                                <p style={{ color: "#dc2626", margin: 0, fontSize: "14px" }}>{error}</p>
                                <button
                                    onClick={loadDetails}
                                    style={{
                                        marginTop: "12px", background: "#dc2626", color: "#fff",
                                        border: "none", borderRadius: "8px", padding: "8px 20px",
                                        fontSize: "13px", cursor: "pointer", fontWeight: 600,
                                    }}
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* Main Content */}
                        {!loading && !error && consultation && (
                            <>
                                {/* Basic Visit Info */}
                                <div style={{
                                    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px",
                                    marginBottom: "24px",
                                }}>
                                    {[
                                        { label: "Diagnosis", value: consultation.diagnosis || "—" },
                                        { label: "Duration", value: consultation.durationMinutes ? `${consultation.durationMinutes} min` : "—" },
                                    ].map(item => (
                                        <div key={item.label} style={{
                                            background: "#f8fafc", borderRadius: "12px",
                                            padding: "14px 16px", border: "1px solid #e2e8f0",
                                        }}>
                                            <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "4px" }}>
                                                {item.label}
                                            </div>
                                            <div style={{ fontSize: "14px", color: "#1e293b", fontWeight: 500 }}>{item.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* AI Summary Section */}
                                <div style={{ marginBottom: "8px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                                        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                                            AI Visit Summary
                                        </h3>
                                        {hasSoap && (
                                            <span style={{
                                                background: "#dcfce7", color: "#16a34a",
                                                fontSize: "11px", fontWeight: 700, padding: "2px 8px",
                                                borderRadius: "20px",
                                            }}>✓ Ready</span>
                                        )}
                                    </div>

                                    {/* Processing State */}
                                    {isProcessing && (
                                        <div style={{
                                            background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
                                            border: "1px solid #bae6fd", borderRadius: "14px",
                                            padding: "28px", textAlign: "center",
                                        }}>
                                            <div style={{ fontSize: "36px", marginBottom: "12px" }}>⏳</div>
                                            <p style={{ fontWeight: 700, color: "#0369a1", margin: "0 0 6px", fontSize: "15px" }}>
                                                Your Summary is Being Prepared
                                            </p>
                                            <p style={{ color: "#0284c7", margin: 0, fontSize: "13px", lineHeight: 1.5 }}>
                                                Our AI is reviewing your consultation. This usually takes 1–2 minutes.
                                                Please check back shortly.
                                            </p>
                                        </div>
                                    )}

                                    {/* No SOAP State */}
                                    {noSoap && (
                                        <div style={{
                                            background: "#f8fafc", border: "1px dashed #cbd5e1",
                                            borderRadius: "14px", padding: "28px", textAlign: "center",
                                        }}>
                                            <div style={{ fontSize: "36px", marginBottom: "12px" }}>📄</div>
                                            <p style={{ fontWeight: 700, color: "#475569", margin: "0 0 6px", fontSize: "15px" }}>
                                                No Summary Generated
                                            </p>
                                            <p style={{ color: "#64748b", margin: 0, fontSize: "13px", lineHeight: 1.5 }}>
                                                No AI summary was generated for this visit.
                                                This may happen if the session had no recorded audio.
                                            </p>
                                        </div>
                                    )}

                                    {/* SOAP Sections */}
                                    {hasSoap && (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                            {SOAP_SECTIONS.map((section, i) => {
                                                const text = soapData.soap_note[section.key];
                                                if (!text) return null;
                                                return (
                                                    <motion.div
                                                        key={section.key}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.07 }}
                                                        style={{
                                                            background: section.bg,
                                                            border: `1px solid ${section.border}`,
                                                            borderRadius: "14px",
                                                            padding: "16px 18px",
                                                            borderLeft: `4px solid ${section.color}`,
                                                        }}
                                                    >
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                                            <span style={{ fontSize: "18px" }}>{section.icon}</span>
                                                            <div>
                                                                <div style={{ fontSize: "13px", fontWeight: 700, color: section.color }}>
                                                                    {section.label}
                                                                </div>
                                                                <div style={{ fontSize: "11px", color: "#64748b" }}>
                                                                    {section.description}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p style={{
                                                            margin: 0, fontSize: "14px", color: "#334155",
                                                            lineHeight: 1.65, whiteSpace: "pre-wrap",
                                                        }}>
                                                            {text}
                                                        </p>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Notes / Prescription */}
                                {(consultation.notes || consultation.prescription) && (
                                    <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #e2e8f0" }}>
                                        <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                                            Doctor's Notes
                                        </h3>
                                        {consultation.prescription && (
                                            <div style={{
                                                background: "#fefce8", border: "1px solid #fde68a",
                                                borderRadius: "12px", padding: "14px 16px", marginBottom: "10px",
                                                borderLeft: "4px solid #f59e0b",
                                            }}>
                                                <div style={{ fontSize: "11px", fontWeight: 700, color: "#b45309", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "6px" }}>
                                                    Prescription
                                                </div>
                                                <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                                                    {consultation.prescription}
                                                </p>
                                            </div>
                                        )}
                                        {consultation.notes && (
                                            <div style={{
                                                background: "#f8fafc", border: "1px solid #e2e8f0",
                                                borderRadius: "12px", padding: "14px 16px",
                                            }}>
                                                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "6px" }}>
                                                    Additional Notes
                                                </div>
                                                <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                                                    {consultation.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    {!loading && !error && (
                        <div style={{
                            padding: "16px 24px",
                            borderTop: "1px solid #e2e8f0",
                            background: "#f8fafc",
                            borderRadius: "0 0 20px 20px",
                            display: "flex", justifyContent: "flex-end",
                        }}>
                            <button
                                onClick={onClose}
                                style={{
                                    background: "#1e40af", color: "#fff",
                                    border: "none", borderRadius: "10px",
                                    padding: "10px 24px", fontSize: "14px",
                                    fontWeight: 600, cursor: "pointer",
                                    transition: "background 0.2s",
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "#1d4ed8"}
                                onMouseLeave={e => e.currentTarget.style.background = "#1e40af"}
                            >
                                Close
                            </button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
