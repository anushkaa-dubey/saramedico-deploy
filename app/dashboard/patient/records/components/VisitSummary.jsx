"use client";

import { useState, useEffect } from "react";
import { fetchSoapNote, fetchConsultationDetails } from "@/services/patient";
import { patchSoapNote } from "@/services/consultation";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";

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

// Converts any value to a human-readable string for textarea editing
function toDisplayString(val) {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (Array.isArray(val)) {
        return val.map((item) =>
            typeof item === "object" ? JSON.stringify(item, null, 2) : String(item)
        ).join("\n");
    }
    if (typeof val === "object") {
        // Format key: value pairs nicely
        return Object.entries(val)
            .map(([k, v]) => {
                const key = k.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
                if (typeof v === "object" && v !== null) {
                    return `${key}:\n  ${toDisplayString(v).replace(/\n/g, "\n  ")}`;
                }
                return `${key}: ${v}`;
            })
            .join("\n");
    }
    return String(val);
}

// Render content for read-only display (recursive)
function renderContent(data, depth = 0) {
    if (!data) return "";
    if (typeof data === "string") return data;
    if (Array.isArray(data))
        return data.map((item) => `• ${renderContent(item)}`).join("\n");
    if (typeof data === "object") {
        const indent = "  ".repeat(depth);
        return Object.entries(data)
            .map(([k, v]) => {
                const key = k.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
                const val =
                    typeof v === "object"
                        ? `\n${renderContent(v, depth + 1)}`
                        : ` ${v}`;
                return `${indent}${key}:${val}`;
            })
            .join("\n");
    }
    return String(data);
}

export default function VisitSummary({ consultationId, onClose, isDoctor = false }) {
    const [consultation, setConsultation] = useState(null);
    const [soapNote, setSoapNote] = useState(null); // the soap_note object from DB
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ── Edit state (doctor only) ───────────────────────────────────────────
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedFields, setEditedFields] = useState({}); // { patient_summary, subjective, ... } as plain strings
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        if (consultationId) loadDetails();
    }, [consultationId]);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
        };
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
            // soap can be { soap_note: {...}, ai_status, ... }  OR  null
            const note = soap?.soap_note || null;
            setSoapNote(note);
        } catch (err) {
            console.error("Failed to load visit summary:", err);
            setError("Unable to load this visit's details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const hasSoap = soapNote && typeof soapNote === "object";
    const isProcessing =
        !hasSoap && (consultation?.aiStatus === "processing" || consultation?.aiStatus === "awaiting_transcript");
    const noSoap = !hasSoap && !isProcessing;

    // ── Start editing ─────────────────────────────────────────────────────
    const handleStartEdit = () => {
        setEditedFields({
            patient_summary: soapNote?.patient_summary || "",
            subjective: toDisplayString(soapNote?.subjective),
            objective: toDisplayString(soapNote?.objective),
            assessment: toDisplayString(soapNote?.assessment),
            plan: toDisplayString(soapNote?.plan),
        });
        setIsEditMode(true);
        setSaveSuccess(false);
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        setEditedFields({});
        setSaveSuccess(false);
    };

    // ── Save edits via PATCH /soap-note ───────────────────────────────────
    const handleSaveEdit = async () => {
        if (!consultationId || saving) return;
        setSaving(true);
        try {
            // Send the plain-string fields directly — the backend stores them as-is
            // inside the JSONB soap_note column. The patient view will display them
            // via renderContent which handles both string and structured values.
            const payload = {
                patient_summary: editedFields.patient_summary,
                subjective: editedFields.subjective,
                objective: editedFields.objective,
                assessment: editedFields.assessment,
                plan: editedFields.plan,
            };

            const result = await patchSoapNote(consultationId, payload);

            // Use the server-returned soap_note so local state matches DB exactly
            const savedNote = result?.soap_note || { ...soapNote, ...payload };
            setSoapNote(savedNote);
            setIsEditMode(false);
            setEditedFields({});
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3500);
        } catch (err) {
            console.error("Save failed:", err);
            alert("Failed to save changes: " + (err?.message || "Unknown error"));
        } finally {
            setSaving(false);
        }
    };

    // ── Helpers ───────────────────────────────────────────────────────────
    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getDoctorName = () => {
        const name =
            consultation?.doctorName ||
            consultation?.doctor_name ||
            "Your Doctor";
        if (!name || name === "Unknown Doctor") return "Your Doctor";
        return name.startsWith("Dr.") ? name : `Dr. ${name}`;
    };

    // ── PDF Export ────────────────────────────────────────────────────────
    const handleDownloadPDF = () => {
        if (!soapNote || !consultation) return;
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.setTextColor(30, 64, 175);
        doc.text("SaraMedico Visit Summary", 14, 22);
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        const dateNow = new Date().toLocaleDateString();
        doc.text(`Generated on: ${dateNow}`, 14, 30);
        doc.setLineWidth(0.5);
        doc.setDrawColor(226, 232, 240);
        doc.line(14, 35, 196, 35);

        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "bold");
        doc.text("Personal Information", 14, 45);
        doc.setFont("helvetica", "normal");
        doc.text(`Patient: ${consultation.patientName || consultation.patient_name || "N/A"}`, 14, 52);
        doc.setFont("helvetica", "bold");
        doc.text("Visit Information", 110, 45);
        doc.setFont("helvetica", "normal");
        const dr = getDoctorName();
        doc.text(`Physician: ${dr}`, 110, 52);
        doc.text(
            `Date: ${formatDate(consultation.scheduled_at || consultation.scheduledAt)}`,
            110,
            58
        );
        doc.line(14, 65, 196, 65);

        let cursorY = 75;
        if (soapNote.patient_summary) {
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(22, 163, 74);
            doc.text("QUICK SUMMARY", 14, cursorY);
            cursorY += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(20, 83, 45);
            const splitSummary = doc.splitTextToSize(String(soapNote.patient_summary), 175);
            doc.text(splitSummary, 14, cursorY);
            cursorY += splitSummary.length * 5 + 12;
        }

        const sections = [
            { label: "WHAT YOU TOLD US", content: soapNote.subjective },
            { label: "WHAT WE OBSERVED", content: soapNote.objective },
            { label: "DIAGNOSIS & FINDINGS", content: soapNote.assessment },
            { label: "YOUR TREATMENT PLAN", content: soapNote.plan },
        ];
        sections.forEach((section) => {
            if (!section.content) return;
            if (cursorY > 260) { doc.addPage(); cursorY = 20; }
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(59, 130, 246);
            doc.text(section.label, 14, cursorY);
            cursorY += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(51, 65, 85);
            const text = renderContent(section.content);
            const splitText = doc.splitTextToSize(text, 175);
            if (cursorY + splitText.length * 5 > 280) {
                doc.addPage(); cursorY = 20;
            }
            doc.text(splitText, 14, cursorY);
            cursorY += splitText.length * 5 + 12;
        });

        doc.save(`Visit_Summary_${dateNow.replace(/\//g, "-")}.pdf`);
    };

    // ── Shared textarea style ─────────────────────────────────────────────
    const textAreaStyle = {
        width: "100%",
        minHeight: "110px",
        background: "white",
        border: "1.5px solid #bfdbfe",
        borderRadius: "8px",
        padding: "10px 12px",
        fontSize: "13px",
        color: "#334155",
        fontFamily: "inherit",
        lineHeight: "1.7",
        outline: "none",
        resize: "vertical",
        boxSizing: "border-box",
    };

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0,
                    background: "rgba(15,23,42,0.65)",
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
                        maxWidth: "680px",
                        maxHeight: "92vh",
                        overflowY: "auto",
                        boxShadow: "0 25px 60px rgba(0,0,0,0.22)",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* ── Header ── */}
                    <div
                        style={{
                            background: isEditMode
                                ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)"
                                : "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                            padding: "22px 24px 18px",
                            borderRadius: "20px 20px 0 0",
                            position: "sticky", top: 0, zIndex: 10,
                            transition: "background 0.4s",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                            {/* Title */}
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: "1px", marginBottom: "4px", textTransform: "uppercase" }}>
                                    {isDoctor
                                        ? (isEditMode ? "✏️ Editing Visit Summary" : "Patient Visit Summary — Doctor View")
                                        : "Visit Summary"}
                                </div>
                                <h2 style={{ margin: 0, fontSize: "19px", fontWeight: 700, color: "#fff" }}>
                                    {loading ? "Loading..." : getDoctorName()}
                                </h2>
                                {consultation && (
                                    <p style={{ margin: "3px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.75)" }}>
                                        {formatDate(consultation.scheduled_at || consultation.scheduledAt)} · {consultation.status?.toUpperCase()}
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                                {/* Doctor Edit / Save controls */}
                                {isDoctor && hasSoap && !loading && (
                                    isEditMode ? (
                                        <>
                                            <motion.button
                                                whileHover={{ scale: 1.04 }}
                                                whileTap={{ scale: 0.96 }}
                                                onClick={handleCancelEdit}
                                                disabled={saving}
                                                style={{
                                                    background: "rgba(255,255,255,0.15)",
                                                    border: "1px solid rgba(255,255,255,0.3)",
                                                    borderRadius: "10px", color: "#fff", fontSize: "11px",
                                                    padding: "7px 12px", cursor: "pointer",
                                                    fontWeight: 700, opacity: saving ? 0.5 : 1,
                                                }}
                                            >
                                                ✕ CANCEL
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.04 }}
                                                whileTap={{ scale: 0.96 }}
                                                onClick={handleSaveEdit}
                                                disabled={saving}
                                                style={{
                                                    background: saving ? "rgba(34,197,94,0.55)" : "rgba(34,197,94,0.85)",
                                                    border: "1px solid rgba(34,197,94,0.5)",
                                                    borderRadius: "10px", color: "#fff", fontSize: "11px",
                                                    padding: "7px 14px", cursor: saving ? "not-allowed" : "pointer",
                                                    fontWeight: 700, display: "flex", alignItems: "center", gap: "6px",
                                                    transition: "all 0.2s",
                                                }}
                                            >
                                                {saving ? (
                                                    <>
                                                        <div style={{ width: "11px", height: "11px", border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "vspin 0.8s linear infinite" }} />
                                                        SAVING...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                                        SAVE CHANGES
                                                    </>
                                                )}
                                            </motion.button>
                                        </>
                                    ) : (
                                        <motion.button
                                            whileHover={{ scale: 1.04, background: "rgba(255,255,255,0.25)" }}
                                            whileTap={{ scale: 0.96 }}
                                            onClick={handleStartEdit}
                                            style={{
                                                background: "rgba(255,255,255,0.15)",
                                                border: "1px solid rgba(255,255,255,0.3)",
                                                borderRadius: "10px", color: "#fff", fontSize: "11px",
                                                padding: "7px 13px", cursor: "pointer",
                                                fontWeight: 700, display: "flex", alignItems: "center", gap: "6px",
                                                transition: "all 0.2s",
                                            }}
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                            EDIT SUMMARY
                                        </motion.button>
                                    )
                                )}

                                {/* Export PDF — only in view mode */}
                                {hasSoap && !loading && !isEditMode && (
                                    <motion.button
                                        whileHover={{ scale: 1.04, background: "rgba(255,255,255,0.25)" }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={handleDownloadPDF}
                                        style={{
                                            background: "rgba(255,255,255,0.15)",
                                            border: "1px solid rgba(255,255,255,0.3)",
                                            borderRadius: "10px", color: "#fff", fontSize: "11px",
                                            padding: "7px 13px", cursor: "pointer",
                                            fontWeight: 700, display: "flex", alignItems: "center", gap: "6px",
                                            transition: "all 0.2s",
                                        }}
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7 10 12 15 17 10" />
                                            <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                        EXPORT PDF
                                    </motion.button>
                                )}

                                {/* Close */}
                                <button
                                    onClick={onClose}
                                    aria-label="Close"
                                    style={{
                                        background: "rgba(255,255,255,0.15)", border: "none",
                                        borderRadius: "10px", color: "#fff", fontSize: "20px",
                                        width: "34px", height: "34px", cursor: "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        transition: "background 0.2s", flexShrink: 0,
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Edit mode warning banner ── */}
                    {isEditMode && (
                        <div style={{
                            background: "linear-gradient(90deg,#fef3c7,#fef9c3)",
                            borderBottom: "1px solid #fde68a",
                            padding: "9px 24px",
                            display: "flex", alignItems: "center", gap: "9px",
                            fontSize: "12px", color: "#92400e", fontWeight: 600,
                        }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            You are editing the patient-visible summary. Changes will be saved to the record immediately.
                        </div>
                    )}

                    {/* ── Save success banner ── */}
                    <AnimatePresence>
                        {saveSuccess && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                style={{
                                    background: "#dcfce7", borderBottom: "1px solid #bbf7d0",
                                    padding: "9px 24px", display: "flex", alignItems: "center", gap: "9px",
                                    fontSize: "12px", color: "#166534", fontWeight: 600,
                                }}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                Changes saved — patients will see the updated summary immediately.
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Body ── */}
                    <div style={{ padding: "22px 24px", flex: 1, overflowY: "auto" }}>
                        {/* Loading */}
                        {loading && (
                            <div style={{ textAlign: "center", padding: "48px 0" }}>
                                <div style={{
                                    width: "42px", height: "42px", borderRadius: "50%",
                                    border: "3px solid #e2e8f0", borderTopColor: "#3b82f6",
                                    margin: "0 auto 14px", animation: "vspin 0.8s linear infinite",
                                }} />
                                <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>Loading visit summary...</p>
                            </div>
                        )}

                        {/* Error */}
                        {!loading && error && (
                            <div style={{
                                background: "#fef2f2", border: "1px solid #fecaca",
                                borderRadius: "12px", padding: "20px", textAlign: "center",
                            }}>
                                <div style={{ fontSize: "32px", marginBottom: "8px" }}>⚠️</div>
                                <p style={{ color: "#dc2626", margin: "0 0 12px", fontSize: "14px" }}>{error}</p>
                                <button
                                    onClick={loadDetails}
                                    style={{
                                        background: "#dc2626", color: "#fff", border: "none",
                                        borderRadius: "8px", padding: "8px 20px",
                                        fontSize: "13px", cursor: "pointer", fontWeight: 600,
                                    }}
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* Main content */}
                        {!loading && !error && consultation && (
                            <>
                                {/* Section heading */}
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
                                    <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                                        AI Visit Summary
                                    </h3>
                                    {hasSoap && (
                                        <span style={{
                                            background: "#dcfce7", color: "#16a34a",
                                            fontSize: "11px", fontWeight: 700,
                                            padding: "2px 9px", borderRadius: "20px",
                                        }}>✓ Ready</span>
                                    )}
                                    {isEditMode && (
                                        <span style={{
                                            background: "#fef3c7", color: "#92400e",
                                            fontSize: "11px", fontWeight: 700,
                                            padding: "2px 9px", borderRadius: "20px",
                                        }}>✏️ Edit Mode</span>
                                    )}
                                </div>

                                {/* Processing state */}
                                {isProcessing && (
                                    <div style={{
                                        background: "linear-gradient(135deg,#f0f9ff,#e0f2fe)",
                                        border: "1px solid #bae6fd", borderRadius: "14px",
                                        padding: "28px", textAlign: "center", marginBottom: "16px",
                                    }}>
                                        <div style={{ fontSize: "36px", marginBottom: "10px" }}>⏳</div>
                                        <p style={{ fontWeight: 700, color: "#0369a1", margin: "0 0 5px", fontSize: "15px" }}>
                                            Summary Being Prepared
                                        </p>
                                        <p style={{ color: "#0284c7", margin: 0, fontSize: "13px", lineHeight: 1.5 }}>
                                            Our AI is reviewing your consultation. This usually takes 1–2 minutes.
                                        </p>
                                    </div>
                                )}

                                {/* No SOAP state */}
                                {noSoap && (
                                    <div style={{
                                        background: "#f8fafc", border: "1px dashed #cbd5e1",
                                        borderRadius: "14px", padding: "28px", textAlign: "center", marginBottom: "16px",
                                    }}>
                                        <div style={{ fontSize: "36px", marginBottom: "10px" }}>📄</div>
                                        <p style={{ fontWeight: 700, color: "#475569", margin: "0 0 5px", fontSize: "15px" }}>
                                            No Summary Generated
                                        </p>
                                        <p style={{ color: "#64748b", margin: 0, fontSize: "13px", lineHeight: 1.5 }}>
                                            No AI summary is available for this visit yet.
                                        </p>
                                    </div>
                                )}

                                {/* ── Quick Summary (patient_summary) ── */}
                                {hasSoap && (soapNote.patient_summary || isEditMode) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            background: isEditMode
                                                ? "linear-gradient(135deg,#f0f9ff,#e0f2fe)"
                                                : "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                                            border: isEditMode ? "1.5px solid #bae6fd" : "1px solid #bbf7d0",
                                            borderRadius: "14px",
                                            padding: "18px 20px",
                                            marginBottom: "14px",
                                            boxShadow: "0 2px 10px rgba(22,163,74,0.07)",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                                            <span style={{ fontSize: "22px" }}>✨</span>
                                            <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: isEditMode ? "#1e40af" : "#166534" }}>
                                                Quick Summary
                                                {isEditMode && (
                                                    <span style={{ fontSize: "11px", fontWeight: 500, color: "#64748b", marginLeft: "8px" }}>
                                                        (patient-visible plain text)
                                                    </span>
                                                )}
                                            </h4>
                                        </div>
                                        {isEditMode ? (
                                            <textarea
                                                value={editedFields.patient_summary || ""}
                                                onChange={(e) =>
                                                    setEditedFields((prev) => ({ ...prev, patient_summary: e.target.value }))
                                                }
                                                placeholder="Write a short, patient-friendly summary of this visit..."
                                                style={{ ...textAreaStyle, minHeight: "80px", borderColor: "#bae6fd" }}
                                            />
                                        ) : (
                                            <p style={{
                                                margin: 0, fontSize: "15px", color: "#14532d",
                                                lineHeight: 1.65, fontWeight: 500, whiteSpace: "pre-wrap",
                                            }}>
                                                {soapNote.patient_summary}
                                            </p>
                                        )}
                                    </motion.div>
                                )}

                                {/* ── SOAP sections ── */}
                                {hasSoap && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                        {SOAP_SECTIONS.map((section, i) => {
                                            const rawData = soapNote[section.key];
                                            if (!rawData && !isEditMode) return null;

                                            const displayText = renderContent(rawData);

                                            return (
                                                <motion.div
                                                    key={section.key}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.06, ease: "easeOut" }}
                                                    style={{
                                                        background: "#fff",
                                                        borderTop: isEditMode
                                                            ? `1.5px solid ${section.color}35`
                                                            : "1px solid #e2e8f0",
                                                        borderRight: isEditMode
                                                            ? `1.5px solid ${section.color}35`
                                                            : "1px solid #e2e8f0",
                                                        borderBottom: isEditMode
                                                            ? `1.5px solid ${section.color}35`
                                                            : "1px solid #e2e8f0",
                                                        borderLeft: `5px solid ${section.color}`,
                                                        borderRadius: "14px",
                                                        padding: "18px 20px",
                                                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                                                        transition: "border 0.2s",
                                                    }}
                                                >
                                                    {/* Section header */}
                                                    <div style={{
                                                        display: "flex", alignItems: "center",
                                                        justifyContent: "space-between",
                                                        marginBottom: "13px", paddingBottom: "11px",
                                                        borderBottom: "1px solid #f1f5f9",
                                                    }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                                                            <div style={{
                                                                background: section.bg, width: "34px", height: "34px",
                                                                borderRadius: "9px", display: "flex",
                                                                alignItems: "center", justifyContent: "center",
                                                                fontSize: "19px",
                                                            }}>
                                                                {section.icon}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: "14px", fontWeight: 800, color: "#1e293b" }}>
                                                                    {section.label}
                                                                </div>
                                                                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>
                                                                    {section.description}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {isEditMode && isDoctor && (
                                                            <span style={{
                                                                fontSize: "10px", fontWeight: 700, color: section.color,
                                                                background: section.bg, padding: "2px 8px",
                                                                borderRadius: "20px", border: `1px solid ${section.border}`,
                                                            }}>
                                                                EDITING
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Section body */}
                                                    {isEditMode ? (
                                                        <textarea
                                                            value={editedFields[section.key] || ""}
                                                            onChange={(e) =>
                                                                setEditedFields((prev) => ({
                                                                    ...prev,
                                                                    [section.key]: e.target.value,
                                                                }))
                                                            }
                                                            placeholder={`Edit ${section.label.toLowerCase()}...`}
                                                            style={{
                                                                ...textAreaStyle,
                                                                minHeight: "110px",
                                                                borderColor: `${section.color}55`,
                                                            }}
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            fontSize: "13.5px", color: "#334155",
                                                            lineHeight: 1.75, whiteSpace: "pre-wrap",
                                                        }}>
                                                            {displayText}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* ── Footer ── */}
                    {!loading && !error && (
                        <div style={{
                            padding: "14px 24px",
                            borderTop: "1px solid #e2e8f0",
                            background: "#f8fafc",
                            borderRadius: "0 0 20px 20px",
                            display: "flex",
                            justifyContent: isEditMode && isDoctor ? "space-between" : "flex-end",
                            alignItems: "center",
                        }}>
                            {isEditMode && isDoctor && (
                                <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>
                                    💡 Plain-text edits are supported. Both structured and plain content display correctly.
                                </p>
                            )}
                            <button
                                onClick={isEditMode ? handleCancelEdit : onClose}
                                style={{
                                    background: isEditMode ? "#f1f5f9" : "#1e40af",
                                    color: isEditMode ? "#475569" : "#fff",
                                    border: isEditMode ? "1px solid #e2e8f0" : "none",
                                    borderRadius: "10px",
                                    padding: "9px 22px", fontSize: "13px",
                                    fontWeight: 600, cursor: "pointer",
                                    transition: "background 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = isEditMode ? "#e2e8f0" : "#1d4ed8";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = isEditMode ? "#f1f5f9" : "#1e40af";
                                }}
                            >
                                {isEditMode ? "Cancel Editing" : "Close"}
                            </button>
                        </div>
                    )}

                    <style>{`
                        @keyframes vspin { to { transform: rotate(360deg); } }
                    `}</style>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
