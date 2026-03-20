"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { fetchSoapNote, fetchConsultationDetails } from "@/services/patient";
import { patchSoapNote } from "@/services/consultation";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import {
    X, Download, Edit3, Check, AlertTriangle, Clock,
    FileText, Stethoscope, ClipboardList, Pill,
    MessageSquare, Microscope, RefreshCw, Sparkles,
} from "lucide-react";
import styles from "./VisitSummary.module.css";

const SOAP_SECTIONS = [
    { key: "subjective", Icon: MessageSquare, label: "What You Told Us", description: "Your symptoms and concerns as you described them", color: "#359AFF", bg: "#DFF2FF", border: "#bfdbfe" },
    { key: "objective", Icon: Microscope, label: "What We Observed", description: "Clinical findings, vitals, and examination results", color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe" },
    { key: "assessment", Icon: ClipboardList, label: "Diagnosis & Findings", description: "Our medical assessment based on your visit", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
    { key: "plan", Icon: Pill, label: "Your Treatment Plan", description: "Recommended next steps and medications", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
];

function toDisplayString(val) {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (Array.isArray(val)) return val.map(item => typeof item === "object" ? JSON.stringify(item, null, 2) : String(item)).join("\n");
    if (typeof val === "object") return Object.entries(val).map(([k, v]) => {
        const key = k.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        if (typeof v === "object" && v !== null) return `${key}:\n  ${toDisplayString(v).replace(/\n/g, "\n  ")}`;
        return `${key}: ${v}`;
    }).join("\n");
    return String(val);
}

function renderContent(data, depth = 0) {
    if (!data) return "";
    if (typeof data === "string") return data;
    if (Array.isArray(data)) return data.map(item => `• ${renderContent(item)}`).join("\n");
    if (typeof data === "object") {
        const indent = "  ".repeat(depth);
        return Object.entries(data).map(([k, v]) => {
            const key = k.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
            const val = typeof v === "object" ? `\n${renderContent(v, depth + 1)}` : ` ${v}`;
            return `${indent}${key}:${val}`;
        }).join("\n");
    }
    return String(data);
}

export default function VisitSummary({ consultationId, onClose, isDoctor = false }) {
    const [mounted, setMounted] = useState(false);
    const [consultation, setConsultation] = useState(null);
    const [soapNote, setSoapNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedFields, setEditedFields] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // ── Portal mount (client-only) ────────────────────────────────────────
    useEffect(() => { setMounted(true); }, []);

    useEffect(() => { if (consultationId) loadDetails(); }, [consultationId]);

    // Lock body scroll — critical on mobile to prevent background scroll
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        // iOS Safari also needs this on html element
        document.documentElement.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
            document.documentElement.style.overflow = "";
        };
    }, []);

    useEffect(() => {
        const fn = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", fn);
        return () => window.removeEventListener("keydown", fn);
    }, [onClose]);

    const loadDetails = async () => {
        setLoading(true); setError("");
        try {
            const [details, soap] = await Promise.all([
                fetchConsultationDetails(consultationId),
                fetchSoapNote(consultationId).catch(() => null),
            ]);
            setConsultation(details);
            setSoapNote(soap?.soap_note || null);
        } catch (err) {
            setError("Unable to load this visit's details. Please try again.");
        } finally { setLoading(false); }
    };

    const hasSoap = soapNote && typeof soapNote === "object";
    const isProcessing = !hasSoap && (consultation?.aiStatus === "processing" || consultation?.aiStatus === "awaiting_transcript");
    const noSoap = !hasSoap && !isProcessing;

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
    const handleCancelEdit = () => { setIsEditMode(false); setEditedFields({}); setSaveSuccess(false); };

    const handleSaveEdit = async () => {
        if (!consultationId || saving) return;
        setSaving(true);
        try {
            const payload = {
                patient_summary: editedFields.patient_summary,
                subjective: editedFields.subjective,
                objective: editedFields.objective,
                assessment: editedFields.assessment,
                plan: editedFields.plan,
            };
            const result = await patchSoapNote(consultationId, payload);
            setSoapNote(result?.soap_note || { ...soapNote, ...payload });
            setIsEditMode(false); setEditedFields({}); setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3500);
        } catch (err) {
            alert("Failed to save: " + (err?.message || "Unknown error"));
        } finally { setSaving(false); }
    };

    const formatDate = (d) => !d ? "—" : new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const getDoctorName = () => {
        const n = consultation?.doctorName || consultation?.doctor_name || "Your Doctor";
        return (!n || n === "Unknown Doctor") ? "Your Doctor" : n.startsWith("Dr.") ? n : `Dr. ${n}`;
    };

    const handleDownloadPDF = () => {
        if (!soapNote || !consultation) return;
        const doc = new jsPDF();
        doc.setFontSize(22); doc.setTextColor(30, 64, 175); doc.text("SaraMedico Visit Summary", 14, 22);
        doc.setFontSize(10); doc.setTextColor(100, 116, 139);
        const dateNow = new Date().toLocaleDateString();
        doc.text(`Generated on: ${dateNow}`, 14, 30);
        doc.setLineWidth(0.5); doc.setDrawColor(226, 232, 240); doc.line(14, 35, 196, 35);
        doc.setFontSize(12); doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold");
        doc.text("Personal Information", 14, 45); doc.setFont("helvetica", "normal");
        doc.text(`Patient: ${consultation.patientName || consultation.patient_name || "N/A"}`, 14, 52);
        doc.setFont("helvetica", "bold"); doc.text("Visit Information", 110, 45); doc.setFont("helvetica", "normal");
        doc.text(`Physician: ${getDoctorName()}`, 110, 52);
        doc.text(`Date: ${formatDate(consultation.scheduled_at || consultation.scheduledAt)}`, 110, 58);
        doc.line(14, 65, 196, 65);
        let y = 75;
        if (soapNote.patient_summary) {
            doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(22, 163, 74); doc.text("QUICK SUMMARY", 14, y); y += 7;
            doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(20, 83, 45);
            const s = doc.splitTextToSize(String(soapNote.patient_summary), 175);
            doc.text(s, 14, y); y += s.length * 5 + 12;
        }
        [
            { label: "WHAT YOU TOLD US", content: soapNote.subjective },
            { label: "WHAT WE OBSERVED", content: soapNote.objective },
            { label: "DIAGNOSIS & FINDINGS", content: soapNote.assessment },
            { label: "YOUR TREATMENT PLAN", content: soapNote.plan },
        ].forEach(sec => {
            if (!sec.content) return;
            if (y > 260) { doc.addPage(); y = 20; }
            doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(59, 130, 246); doc.text(sec.label, 14, y); y += 7;
            doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(51, 65, 85);
            const t = doc.splitTextToSize(renderContent(sec.content), 175);
            if (y + t.length * 5 > 280) { doc.addPage(); y = 20; }
            doc.text(t, 14, y); y += t.length * 5 + 12;
        });
        doc.save(`Visit_Summary_${dateNow.replace(/\//g, "-")}.pdf`);
    };

    // ── Modal JSX ─────────────────────────────────────────────────────────
    const modalContent = (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.overlay}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.96, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.96, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 24, stiffness: 320 }}
                    className={styles.modal}
                    onClick={e => e.stopPropagation()}
                >
                    {/* ── Header ── */}
                    <div className={styles.header}>
                        <div className={styles.headerTopRow}>
                            <div className={styles.headerLeft}>
                                <div className={styles.headerLabel}>
                                    {isDoctor ? (isEditMode ? "Editing Visit Summary" : "Patient Visit Summary — Doctor View") : "Visit Summary"}
                                </div>
                                <h2 className={styles.headerTitle}>{loading ? "Loading..." : getDoctorName()}</h2>
                                {consultation && (
                                    <p className={styles.headerMeta}>
                                        <Clock size={11} />
                                        {formatDate(consultation.scheduled_at || consultation.scheduledAt)}
                                        {" · "}{(consultation.status || "").toUpperCase()}
                                    </p>
                                )}
                            </div>

                            <div className={styles.headerActions}>
                                {isDoctor && hasSoap && !loading && (
                                    isEditMode ? (
                                        <>
                                            <button className={styles.glassBtn} onClick={handleCancelEdit} disabled={saving} style={{ opacity: saving ? 0.5 : 1 }}>
                                                <X size={11} /><span>CANCEL</span>
                                            </button>
                                            <button className={styles.glassBtnSave} onClick={handleSaveEdit} disabled={saving}>
                                                {saving ? <RefreshCw size={11} style={{ animation: "vs-spin 0.8s linear infinite" }} /> : <Check size={11} />}
                                                <span>{saving ? "SAVING..." : "SAVE"}</span>
                                            </button>
                                        </>
                                    ) : (
                                        <button className={styles.glassBtn} onClick={handleStartEdit}>
                                            <Edit3 size={11} /><span>EDIT</span>
                                        </button>
                                    )
                                )}
                                {hasSoap && !loading && !isEditMode && (
                                    <button className={styles.glassBtn} onClick={handleDownloadPDF}>
                                        <Download size={11} /><span>PDF</span>
                                    </button>
                                )}
                                <button className={styles.closeBtn} onClick={onClose} aria-label="Close"><X size={15} /></button>
                            </div>
                        </div>
                    </div>

                    {/* ── Edit banner ── */}
                    {isEditMode && (
                        <div className={styles.editBanner}>
                            <AlertTriangle size={13} color="#d97706" />
                            You are editing the patient-visible summary. Changes save immediately.
                        </div>
                    )}

                    {/* ── Success banner ── */}
                    <AnimatePresence>
                        {saveSuccess && (
                            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className={styles.successBanner}>
                                <Check size={13} color="#16a34a" />
                                Changes saved — patients will see the updated summary immediately.
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Scrollable body ── */}
                    <div className={styles.body}>
                        {loading && (
                            <div className={styles.stateCard}>
                                <div className={styles.spinner} />
                                <p className={styles.stateText} style={{ color: "#64748b" }}>Loading visit summary...</p>
                            </div>
                        )}

                        {!loading && error && (
                            <div className={styles.stateCard}>
                                <div className={styles.stateIcon} style={{ background: "#fef2f2" }}><AlertTriangle size={22} color="#ef4444" /></div>
                                <p className={styles.stateTitle} style={{ color: "#dc2626" }}>{error}</p>
                                <button className={styles.primaryBtn} onClick={loadDetails} style={{ margin: "0 auto" }}>
                                    <RefreshCw size={13} />Try Again
                                </button>
                            </div>
                        )}

                        {!loading && !error && consultation && (
                            <>
                                <div className={styles.sectionHeading}>
                                    <Stethoscope size={15} color="#359AFF" />
                                    <h3 className={styles.sectionTitle}>AI Visit Summary</h3>
                                    {hasSoap && !isEditMode && <span className={styles.readyBadge}>Ready</span>}
                                    {isEditMode && <span className={styles.editBadge}>Edit Mode</span>}
                                </div>

                                {isProcessing && (
                                    <div className={styles.stateCard}>
                                        <div className={styles.stateIcon} style={{ background: "#DFF2FF" }}><Clock size={22} color="#359AFF" /></div>
                                        <p className={styles.stateTitle} style={{ color: "#0f172a" }}>Summary Being Prepared</p>
                                        <p className={styles.stateText} style={{ color: "#64748b" }}>Our AI is reviewing your consultation. This usually takes 1–2 minutes.</p>
                                    </div>
                                )}

                                {noSoap && (
                                    <div className={styles.stateCard}>
                                        <div className={styles.stateIcon} style={{ background: "#f1f5f9" }}><FileText size={22} color="#94a3b8" /></div>
                                        <p className={styles.stateTitle} style={{ color: "#475569" }}>No Summary Generated</p>
                                        <p className={styles.stateText} style={{ color: "#94a3b8" }}>No AI summary is available for this visit yet.</p>
                                    </div>
                                )}

                                {hasSoap && (soapNote.patient_summary || isEditMode) && (
                                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={isEditMode ? styles.summaryCardEdit : styles.summaryCard}>
                                        <div className={styles.summaryCardHeader}>
                                            <div className={styles.summaryIconWrap}><Sparkles size={14} color="#359AFF" /></div>
                                            <h4 className={styles.summaryCardTitle}>
                                                Quick Summary
                                                {isEditMode && <span className={styles.summaryHint}>patient-visible</span>}
                                            </h4>
                                        </div>
                                        {isEditMode ? (
                                            <textarea className={styles.textarea} value={editedFields.patient_summary || ""} onChange={e => setEditedFields(p => ({ ...p, patient_summary: e.target.value }))} placeholder="Write a short, patient-friendly summary..." style={{ minHeight: "72px" }} />
                                        ) : (
                                            <p className={styles.summaryText}>{soapNote.patient_summary}</p>
                                        )}
                                    </motion.div>
                                )}

                                {hasSoap && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                        {SOAP_SECTIONS.map((section, i) => {
                                            const rawData = soapNote[section.key];
                                            if (!rawData && !isEditMode) return null;
                                            const { Icon } = section;
                                            return (
                                                <motion.div
                                                    key={section.key}
                                                    initial={{ opacity: 0, y: 6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className={styles.soapCard}
                                                    style={{
                                                        borderLeft: `4px solid ${section.color}`,
                                                        border: isEditMode ? `1.5px solid ${section.color}30` : "1px solid #e2e8f0",
                                                        borderLeft: `4px solid ${section.color}`,
                                                    }}
                                                >
                                                    <div className={styles.soapCardHeader}>
                                                        <div className={styles.soapCardLeft}>
                                                            <div className={styles.soapIconWrap} style={{ background: section.bg }}>
                                                                <Icon size={15} color={section.color} />
                                                            </div>
                                                            <div>
                                                                <div className={styles.soapLabel}>{section.label}</div>
                                                                <div className={styles.soapDesc}>{section.description}</div>
                                                            </div>
                                                        </div>
                                                        {isEditMode && isDoctor && (
                                                            <span className={styles.editingTag} style={{ color: section.color, background: section.bg, border: `1px solid ${section.border}` }}>
                                                                EDITING
                                                            </span>
                                                        )}
                                                    </div>
                                                    {isEditMode ? (
                                                        <textarea className={styles.textarea} value={editedFields[section.key] || ""} onChange={e => setEditedFields(p => ({ ...p, [section.key]: e.target.value }))} placeholder={`Edit ${section.label.toLowerCase()}...`} style={{ borderColor: `${section.color}40` }} />
                                                    ) : (
                                                        <div className={styles.soapContent}>{renderContent(rawData)}</div>
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
                        <div className={styles.footer}>
                            {isEditMode && isDoctor && (
                                <p className={styles.footerHint}>Plain-text edits are supported. Both structured and plain content display correctly.</p>
                            )}
                            {isEditMode
                                ? <button className={styles.cancelBtn} onClick={handleCancelEdit}>Cancel</button>
                                : <button className={styles.primaryBtn} onClick={onClose}>Close</button>
                            }
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );

    // ── Render via portal so it escapes any parent overflow/z-index ───────
    if (!mounted) return null;
    return createPortal(modalContent, document.body);
}