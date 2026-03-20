"use client";
import { Suspense } from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
    fetchConsultationById, markConsultationComplete, fetchSoapNote,
    fetchTranscriptStatus, triggerSoapGeneration, patchSoapNote
} from "@/services/consultation";
import Topbar from "../../components/Topbar";
import styles from "./SoapNotes.module.css";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import VisitSummary from "@/app/dashboard/patient/records/components/VisitSummary";
import {
    FileText, Info, Eye, Download, RefreshCw,
    CheckCircle, Clock, AlertTriangle, Mic, XCircle,
} from "lucide-react";

const POLL_INTERVAL_MS = 10000;
const MAX_POLL_ATTEMPTS = 40;

function SoapNotesPage() {
    const searchParams = useSearchParams();
    const consultationId = searchParams.get("consultationId");

    const [consultation, setConsultation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [now, setNow] = useState(Date.now());

    const [soap, setSoap] = useState(null);
    const [soapStatus, setSoapStatus] = useState("idle");
    const [marking, setMarking] = useState(false);
    const [displayAttempt, setDisplayAttempt] = useState(0);

    const [transcriptStatus, setTranscriptStatus] = useState(null);
    const [transcriptMsg, setTranscriptMsg] = useState("");
    const [checkingTranscript, setCheckingTranscript] = useState(false);
    const [generatingSoap, setGeneratingSoap] = useState(false);
    const [showPatientPreview, setShowPatientPreview] = useState(false);

    const [isEditingSummary, setIsEditingSummary] = useState(false);
    const [editedPatientSummary, setEditedPatientSummary] = useState("");
    const [isSavingSummary, setIsSavingSummary] = useState(false);

    const pollTimerRef = useRef(null);
    const pollAttemptsRef = useRef(0);

    // ── Save Summary ──────────────────────────────────────────────────────
    const handleSaveSummary = async () => {
        if (!soap || !consultationId) return;
        setIsSavingSummary(true);
        try {
            await patchSoapNote(consultationId, { patient_summary: editedPatientSummary });
            setSoap(prev => ({ ...prev, patient_summary: editedPatientSummary }));
            setIsEditingSummary(false);
        } catch (err) {
            alert("Failed to save summary.");
        } finally { setIsSavingSummary(false); }
    };

    // ── PDF Export ────────────────────────────────────────────────────────
    const handleDownloadPDF = () => {
        if (!soap || !consultation) return;
        const doc = new jsPDF();
        doc.setFontSize(22); doc.setTextColor(30, 64, 175); doc.text("SaraMedico SOAP Note", 14, 22);
        doc.setFontSize(10); doc.setTextColor(100, 116, 139);
        const date = new Date().toLocaleDateString();
        doc.text(`Generated on: ${date}`, 14, 30);
        doc.setLineWidth(0.5); doc.setDrawColor(226, 232, 240); doc.line(14, 35, 196, 35);
        doc.setFontSize(12); doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold");
        doc.text("Patient Information", 14, 45); doc.setFont("helvetica", "normal");
        doc.text(`Name: ${consultation.patient_name || consultation.patientName || "N/A"}`, 14, 52);
        doc.text(`MRN: ${consultation.mrn || "N/A"}`, 14, 58);
        doc.setFont("helvetica", "bold"); doc.text("Provider Information", 110, 45); doc.setFont("helvetica", "normal");
        const drName = consultation.doctorName || consultation.doctor_name || "N/A";
        doc.text(`Physician: ${drName.startsWith("Dr.") ? drName : "Dr. " + drName}`, 110, 52);
        doc.text(`Specialty: ${consultation.doctorSpecialty || "General Practitioner"}`, 110, 58);
        doc.line(14, 65, 196, 65);
        const sections = [
            { label: "SUBJECTIVE", content: soap.subjective },
            { label: "OBJECTIVE", content: soap.objective },
            { label: "ASSESSMENT", content: soap.assessment },
            { label: "PLAN", content: soap.plan },
        ];
        let cursorY = 75;
        const formatData = (data, depth = 0) => {
            if (!data) return "";
            if (typeof data === "string") return data;
            if (Array.isArray(data)) return data.map(item => `- ${formatData(item)}`).join("\n");
            if (typeof data === "object") { const indent = "  ".repeat(depth); return Object.entries(data).map(([k, v]) => { const fk = k.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()); return typeof v === "object" ? `${indent}${fk}:\n${formatData(v, depth + 1)}` : `${indent}${fk}: ${v}`; }).join("\n"); }
            return String(data);
        };
        sections.forEach(section => {
            if (!section.content) return;
            if (cursorY > 260) { doc.addPage(); cursorY = 20; }
            doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(59, 130, 246); doc.text(section.label, 14, cursorY); cursorY += 7;
            doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(51, 65, 85);
            const textContent = formatData(section.content);
            const splitText = doc.splitTextToSize(textContent, 175);
            if (cursorY + splitText.length * 5 > 280) { doc.addPage(); cursorY = 20; doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(59, 130, 246); doc.text(`${section.label} (cont.)`, 14, cursorY); cursorY += 7; doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(51, 65, 85); }
            doc.text(splitText, 14, cursorY); cursorY += splitText.length * 5 + 12;
        });
        doc.save(`SOAP_Note_${consultation.patient_name || "Record"}_${new Date().toISOString().split("T")[0]}.pdf`);
    };

    // ── Polling ───────────────────────────────────────────────────────────
    const startPolling = useCallback((id) => {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        pollAttemptsRef.current = 0;
        setDisplayAttempt(0);
        setSoapStatus("processing");
        pollTimerRef.current = setInterval(async () => {
            pollAttemptsRef.current += 1;
            setDisplayAttempt(pollAttemptsRef.current);
            if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) { clearInterval(pollTimerRef.current); setSoapStatus("timeout"); return; }
            try {
                const result = await fetchSoapNote(id);
                if (result.httpStatus === 200 && result.soap_note) { clearInterval(pollTimerRef.current); setSoap(result.soap_note); setEditedPatientSummary(result.soap_note.patient_summary || ""); setSoapStatus("completed"); }
                else if (result.ai_status === "no_transcript" || result.status === "no_transcript") { clearInterval(pollTimerRef.current); setSoapStatus("no_transcript"); }
            } catch (err) { clearInterval(pollTimerRef.current); setSoapStatus("error"); }
        }, POLL_INTERVAL_MS);
    }, []);

    // ── Load on mount ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!consultationId) { setLoading(false); setError("No consultation selected."); return; }
        const loadData = async () => {
            try {
                const data = await fetchConsultationById(consultationId);
                setConsultation(data);
                try {
                    const soapResult = await fetchSoapNote(consultationId);
                    if (soapResult.httpStatus === 200 && soapResult.soap_note) { setSoap(soapResult.soap_note); setEditedPatientSummary(soapResult.soap_note.patient_summary || ""); setSoapStatus("completed"); setLoading(false); return; }
                    if (soapResult.ai_status === "no_transcript" || soapResult.status === "no_transcript") { setSoapStatus("no_transcript"); setLoading(false); return; }
                    if (soapResult.httpStatus === 202) { setSoapStatus("processing"); startPolling(consultationId); setLoading(false); return; }
                } catch (soapErr) { /* silent */ }
                if (data?.soap_note) { setSoap(data.soap_note); setEditedPatientSummary(data.soap_note.patient_summary || ""); setSoapStatus("completed"); }
                else if (data?.status === "completed" && data?.ai_status === "processing") { startPolling(consultationId); }
                setLoading(false);
            } catch (err) { setError("Could not load consultation. " + (err.message || "")); setLoading(false); }
        };
        loadData();
    }, [consultationId, startPolling]);

    useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);
    useEffect(() => () => { if (pollTimerRef.current) clearInterval(pollTimerRef.current); }, []);

    const handleMarkComplete = async () => { if (!consultationId || marking) return; setMarking(true); try { await markConsultationComplete(consultationId); startPolling(consultationId); } catch { setSoapStatus("error"); } finally { setMarking(false); } };
    const handleRetryPoll = () => { if (consultationId) startPolling(consultationId); };

    const handleCheckTranscript = async () => {
        if (!consultationId || checkingTranscript) return;
        setCheckingTranscript(true);
        try {
            const result = await fetchTranscriptStatus(consultationId);
            setTranscriptStatus(result.status); setTranscriptMsg(result.message || "");
            if (result.status === "available" && result.transcript_in_db) startPolling(consultationId);
        } catch { setTranscriptStatus("not_found"); setTranscriptMsg("Could not check transcript status."); }
        finally { setCheckingTranscript(false); }
    };

    const handleGenerateSoap = async () => {
        if (!consultationId || generatingSoap) return;
        setGeneratingSoap(true); setSoapStatus("processing");
        try { await triggerSoapGeneration(consultationId); startPolling(consultationId); }
        catch { setSoapStatus("error"); }
        finally { setGeneratingSoap(false); }
    };

    // ── Render helpers ────────────────────────────────────────────────────
    const renderSoapContent = (content, fallback) => {
        if (!content) return <span style={{ color: "#94a3b8" }}>{fallback}</span>;
        let parsed = content;
        if (typeof content === "string") {
            try {
                let clean = content.replace(/```json/gi, "").replace(/```/g, "").trim();
                const fb = clean.indexOf("{"); const lb = clean.lastIndexOf("}");
                if (fb !== -1 && lb !== -1 && lb >= fb) clean = clean.substring(fb, lb + 1);
                parsed = JSON.parse(clean);
            } catch { return <div style={{ whiteSpace: "pre-wrap" }}>{content}</div>; }
        }
        const fmt = (obj) => {
            if (Array.isArray(obj)) return <ul style={{ margin: "4px 0", paddingLeft: "18px" }}>{obj.map((item, i) => <li key={i}>{typeof item === "object" ? fmt(item) : item}</li>)}</ul>;
            return <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>{Object.entries(obj).map(([k, v]) => <div key={k}><strong style={{ textTransform: "capitalize", color: "#334155" }}>{k.replace(/_/g, " ")}: </strong>{typeof v === "object" && v !== null ? <div style={{ paddingLeft: "12px", marginTop: "2px" }}>{fmt(v)}</div> : <span style={{ color: "#475569" }}>{v}</span>}</div>)}</div>;
        };
        try { return typeof parsed === "object" ? fmt(parsed) : String(parsed); }
        catch { return <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0 }}>{JSON.stringify(parsed, null, 2)}</pre>; }
    };

    // ── Loading / Error states ────────────────────────────────────────────
    if (loading) return (
        <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px", color: "#64748b" }}>
            <div style={{ width: "36px", height: "36px", border: "3px solid #DFF2FF", borderTop: "3px solid #359AFF", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Loading clinical encounter...
        </div>
    );

    if (error) return (
        <>
            <Topbar />
            <div style={{ padding: "60px 24px", textAlign: "center", color: "#64748b" }}>
                <AlertTriangle size={40} color="#f59e0b" style={{ marginBottom: "12px" }} />
                <h2 style={{ color: "#0f172a", marginBottom: "8px" }}>Could Not Load Encounter</h2>
                <p>{error}</p>
            </div>
        </>
    );

    if (!consultation) return (
        <>
            <Topbar />
            <div style={{ padding: "60px 24px", textAlign: "center", color: "#64748b" }}>
                <h2>Consultation Not Found</h2>
                <p>No consultation record found for ID: <code>{consultationId}</code></p>
                <button onClick={() => window.history.back()} style={{ marginTop: "16px", padding: "8px 20px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer" }}>Go Back</button>
            </div>
        </>
    );

    const patient = consultation.patient || {};
    const patientName = consultation.patientName || consultation.patient_name || patient.full_name || "Patient Record";
    const visitDate = (consultation.scheduled_at || consultation.scheduledAt)
        ? new Date(consultation.scheduled_at || consultation.scheduledAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : "Today";

    // Status badge config
    const statusConfig = {
        completed: { bg: "#f0fdf4", color: "#16a34a", label: "Note Ready" },
        no_transcript: { bg: "#fefce8", color: "#a16207", label: "No Transcript" },
        processing: { bg: "#eff6ff", color: "#2563eb", label: "AI Generating..." },
        timeout: { bg: "#fef2f2", color: "#dc2626", label: "Timed Out" },
        error: { bg: "#fef2f2", color: "#dc2626", label: "Error" },
        idle: { bg: "#f8fafc", color: "#64748b", label: consultation?.status === "completed" ? "Awaiting Verification" : "Not Started" },
    };
    const badge = statusConfig[soapStatus] || statusConfig.idle;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Topbar />

            {/* ── Patient Header ── */}
            <div className={styles.patientHeader}>
                {/* Avatar */}
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg, #DFF2FF, #9CCDFF)", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "bold", flexShrink: 0 }}>
                    {patientName ? patientName.charAt(0).toUpperCase() : "P"}
                </div>

                {/* Name + meta */}
                <div style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1, minWidth: 0 }}>
                    <div className={styles.pName}>{patientName}</div>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <span className={styles.pMeta}>DOB: {consultation.patientDob || patient.date_of_birth || patient.dob || "N/A"}</span>
                        <span className={styles.pMeta}>MRN: {consultation.patientMrn || patient.mrn || "N/A"}</span>
                    </div>
                </div>

                {/* Detail groups — wrap on mobile */}
                <div className={styles.pDetailGroup}>
                    <span className={styles.pLabel}>Reason for Visit</span>
                    <span className={styles.pValue}>
                        {typeof (consultation.chief_complaint || consultation.reason) === "object"
                            ? (consultation.chief_complaint || consultation.reason)?.chief_complaint || "Consultation"
                            : consultation.chief_complaint || consultation.reason || "Consultation"}
                    </span>
                </div>
                <div className={styles.pDetailGroup}>
                    <span className={styles.pLabel}>Visit Type</span>
                    <span className={styles.pValue}>{consultation.visit_type || "Follow Up"}</span>
                </div>
                <div className={styles.pDetailGroup}>
                    <span className={styles.pLabel}>Visit Date</span>
                    <span className={styles.pValue}>{visitDate}</span>
                </div>
            </div>

            {/* ── Main Grid ── */}
            <div className={styles.contentGrid}>

                {/* LEFT: SOAP Notes */}
                <div className={styles.leftCol}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.headerTitle}>
                                <FileText size={16} color="#359AFF" />
                                AI-Generated SOAP Note
                            </div>
                            <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", background: badge.bg, color: badge.color }}>
                                {badge.label}
                            </span>
                        </div>

                        {/* SOAP completed */}
                        {soapStatus === "completed" && soap ? (
                            <>
                                {[
                                    { key: "subjective", label: "Subjective" },
                                    { key: "objective", label: "Objective" },
                                    { key: "assessment", label: "Assessment" },
                                    { key: "plan", label: "Plan" },
                                ].map(({ key, label }) => (
                                    <div key={key} className={styles.soapSection}>
                                        <span className={styles.sectionLabel}>{label}</span>
                                        <div className={styles.textBlock}>{renderSoapContent(soap[key], `No ${label.toLowerCase()} data recorded.`)}</div>
                                    </div>
                                ))}

                                {/* Patient Summary */}
                                <div className={styles.soapSection}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                                        <span className={styles.sectionLabel} style={{ color: "#0891b2", margin: 0 }}>Patient Summary (Simplified)</span>
                                        {isEditingSummary ? (
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                <button onClick={handleSaveSummary} disabled={isSavingSummary} style={{ background: "#0891b2", border: "none", color: "white", fontSize: "11px", fontWeight: "700", cursor: "pointer", padding: "5px 12px", borderRadius: "6px", opacity: isSavingSummary ? 0.7 : 1, display: "flex", alignItems: "center", gap: "4px" }}>
                                                    {isSavingSummary ? <RefreshCw size={10} style={{ animation: "spin 0.8s linear infinite" }} /> : <CheckCircle size={10} />}
                                                    {isSavingSummary ? "Saving..." : "Save"}
                                                </button>
                                                <button onClick={() => { setIsEditingSummary(false); setEditedPatientSummary(soap.patient_summary || ""); }} style={{ background: "none", border: "1px solid #cbd5e1", color: "#64748b", fontSize: "11px", fontWeight: "700", cursor: "pointer", padding: "4px 10px", borderRadius: "6px" }}>
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setIsEditingSummary(true)} style={{ background: "none", border: "none", color: "#0891b2", fontSize: "11px", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}>
                                                Edit Summary
                                            </button>
                                        )}
                                    </div>
                                    <div className={styles.textBlock} style={{ background: "#f0f9ff", borderLeft: "3px solid #0ea5e9" }}>
                                        {isEditingSummary ? (
                                            <textarea value={editedPatientSummary} onChange={e => setEditedPatientSummary(e.target.value)} style={{ width: "100%", minHeight: "110px", background: "white", border: "1px solid #bae6fd", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#334155", fontFamily: "inherit", lineHeight: "1.6", outline: "none", resize: "vertical", boxSizing: "border-box" }} placeholder="Modify the summary for the patient..." />
                                        ) : (
                                            renderSoapContent(soap.patient_summary || "No patient summary available.")
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : soapStatus === "processing" ? (
                            <div style={{ padding: "48px 24px", textAlign: "center" }}>
                                <div style={{ width: "40px", height: "40px", border: "3px solid #DFF2FF", borderTop: "3px solid #359AFF", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
                                <p style={{ color: "#475569", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>AI is generating the SOAP note</p>
                                <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}>Google Meet takes 2–4 minutes to process audio. Checking every 10s...</p>
                                <p style={{ color: "#cbd5e1", fontSize: "11px", fontWeight: "700" }}>Attempt {displayAttempt} / {MAX_POLL_ATTEMPTS}</p>
                            </div>
                        ) : soapStatus === "no_transcript" ? (
                            <div style={{ padding: "40px 24px", textAlign: "center" }}>
                                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#fef9c3", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                                    <Mic size={24} color="#d97706" />
                                </div>
                                <h3 style={{ color: "#92400e", marginBottom: "8px", fontSize: "15px", fontWeight: "700" }}>No Transcript Captured</h3>
                                <p style={{ color: "#78350f", fontSize: "13px", lineHeight: "1.6", maxWidth: "360px", margin: "0 auto 16px" }}>No speech was detected in this session. A SOAP note cannot be generated without a recorded conversation.</p>
                                <div style={{ padding: "12px 16px", background: "#fef9c3", border: "1px solid #fde047", borderRadius: "8px", fontSize: "12px", color: "#713f12", textAlign: "left", maxWidth: "380px", margin: "0 auto", lineHeight: "1.6" }}>
                                    <strong>To generate a SOAP note:</strong>
                                    <ul style={{ margin: "6px 0 0", paddingLeft: "18px" }}>
                                        <li>Conduct the consultation with voice in Google Meet</li>
                                        <li>Ensure Google Meet transcription is enabled</li>
                                        <li>Mark complete only after the meeting ends</li>
                                    </ul>
                                </div>
                            </div>
                        ) : soapStatus === "timeout" ? (
                            <div style={{ padding: "48px 24px", textAlign: "center" }}>
                                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                                    <Clock size={24} color="#ef4444" />
                                </div>
                                <p style={{ color: "#475569", fontSize: "14px", marginBottom: "16px" }}>Note generation timed out. Google is still processing the transcript.</p>
                                <button onClick={handleRetryPoll} style={{ padding: "8px 20px", background: "linear-gradient(90deg,#359AFF,#9CCDFF)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                    <RefreshCw size={14} /> Retry Checking
                                </button>
                            </div>
                        ) : soapStatus === "error" ? (
                            <div style={{ padding: "48px 24px", textAlign: "center" }}>
                                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                                    <XCircle size={24} color="#ef4444" />
                                </div>
                                <p style={{ color: "#ef4444", fontSize: "14px", marginBottom: "16px" }}>Failed to generate SOAP note. Please try again.</p>
                                <button onClick={handleMarkComplete} style={{ padding: "8px 20px", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                    <RefreshCw size={14} /> Retry
                                </button>
                            </div>
                        ) : (
                            /* Idle */
                            <div style={{ padding: "48px 24px", textAlign: "center" }}>
                                <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#DFF2FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                                    <FileText size={32} color="#359AFF" />
                                </div>
                                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", marginBottom: "10px" }}>Ready for SOAP Generation</h3>
                                <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.6", maxWidth: "340px", margin: "0 auto 20px" }}>
                                    Once the Google Meet transcript is confirmed, click Generate SOAP.
                                </p>
                                {transcriptStatus !== "available" && (
                                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px 16px", textAlign: "left", maxWidth: "360px", margin: "0 auto" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "13px" }}>
                                            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#cbd5e1", flexShrink: 0 }} />
                                            Waiting for Google Drive transcript sync...
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Sidebar */}
                <div className={styles.rightCol}>
                    {/* Session Details header */}
                    <div className={styles.summaryHeader}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                            <Info size={16} color="#359AFF" />
                            <span>Session Details</span>
                        </div>
                        {soapStatus === "completed" && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={handleDownloadPDF}
                                style={{ display: "flex", alignItems: "center", gap: "6px", background: "linear-gradient(90deg,#359AFF,#9CCDFF)", color: "white", border: "none", borderRadius: "8px", padding: "7px 12px", fontSize: "11px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }}
                            >
                                <Download size={12} />
                                Export PDF
                            </motion.button>
                        )}
                    </div>

                    {/* Status */}
                    <div className={styles.subHeader}>Status</div>
                    <div className={styles.tagsRow}>
                        <span className={`${styles.tag} ${consultation.status === "completed" ? styles.tagYellow : styles.tagRed}`}>
                            {(consultation.status || "Unknown").toUpperCase()}
                        </span>
                        {consultation.urgency_level === "High" && (
                            <span className={`${styles.tag} ${styles.tagRed}`}>High Urgency</span>
                        )}
                    </div>

                    {/* View Patient Summary */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowPatientPreview(true)}
                        disabled={soapStatus !== "completed"}
                        style={{ width: "100%", padding: "12px", borderRadius: "10px", background: soapStatus === "completed" ? "#ffffff" : "#f1f5f9", border: "1px solid #e2e8f0", color: soapStatus === "completed" ? "#1e293b" : "#94a3b8", fontSize: "13px", fontWeight: "700", cursor: soapStatus === "completed" ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s" }}
                    >
                        <Eye size={15} />
                        View Patient Summary
                    </motion.button>

                    <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "4px 0" }} />

                    {/* Transcript Status */}
                    <div className={styles.subHeader}>Google Drive Transcript</div>
                    <div style={{ background: transcriptStatus === "available" ? "#f0fdf4" : transcriptStatus === "not_found" ? "#fff1f2" : "#f8fafc", border: `1px solid ${transcriptStatus === "available" ? "#bcf0da" : transcriptStatus === "not_found" ? "#fecaca" : "#e2e8f0"}`, borderRadius: "12px", padding: "14px", marginBottom: "12px" }}>
                        {(() => {
                            const completedAt = consultation?.completionTime || consultation?.completion_time;
                            const COOLDOWN_MS = 4 * 60 * 1000;
                            const diffMs = completedAt ? (new Date(completedAt).getTime() + COOLDOWN_MS) - now : 0;
                            const isInCooldown = diffMs > 0;
                            if (isInCooldown) {
                                const minsLeft = Math.floor(Math.max(0, diffMs) / 60000);
                                const secsLeft = Math.floor((Math.max(0, diffMs) % 60000) / 1000);
                                return (
                                    <div style={{ textAlign: "center", padding: "8px 0" }}>
                                        <div style={{ fontSize: "22px", fontWeight: "800", color: "#359AFF", marginBottom: "4px" }}>{minsLeft}:{secsLeft.toString().padStart(2, "0")}</div>
                                        <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 4px" }}>Awaiting Google Meet processing...</p>
                                        <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>Verify button appears when time expires.</p>
                                    </div>
                                );
                            }
                            return (
                                <>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                                        <motion.div
                                            animate={checkingTranscript ? { scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] } : {}}
                                            transition={{ duration: 1.5, repeat: checkingTranscript ? Infinity : 0 }}
                                            style={{ width: "26px", height: "26px", borderRadius: "50%", background: transcriptStatus === "available" ? "#16a34a" : transcriptStatus === "not_found" ? "#ef4444" : "#359AFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                                        >
                                            {transcriptStatus === "available"
                                                ? <CheckCircle size={14} color="white" />
                                                : checkingTranscript
                                                    ? <RefreshCw size={12} color="white" style={{ animation: "spin 1.2s linear infinite" }} />
                                                    : <Info size={12} color="white" />}
                                        </motion.div>
                                        <span style={{ fontWeight: "700", fontSize: "13px", color: transcriptStatus === "available" ? "#16a34a" : transcriptStatus === "not_found" ? "#dc2626" : "#2563eb" }}>
                                            {transcriptStatus === "available" ? "Found & Available" : transcriptStatus === "not_found" ? "Not Found" : checkingTranscript ? "Scanning Drive..." : "Pending Verification"}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: "12px", color: transcriptStatus === "not_found" ? "#ef4444" : "#64748b", lineHeight: "1.5", margin: "0 0 10px" }}>
                                        {transcriptMsg || "Click below to check Google Drive."}
                                    </p>
                                    {transcriptStatus !== "available" && (
                                        <motion.button
                                            onClick={handleCheckTranscript}
                                            disabled={checkingTranscript}
                                            whileHover={!checkingTranscript ? { scale: 1.01 } : {}}
                                            whileTap={!checkingTranscript ? { scale: 0.98 } : {}}
                                            style={{ width: "100%", padding: "10px", background: "linear-gradient(90deg,#359AFF,#9CCDFF)", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "13px", cursor: checkingTranscript ? "not-allowed" : "pointer", opacity: checkingTranscript ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                                        >
                                            {checkingTranscript ? <><RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} />Searching...</> : "Verify Transcript in Drive"}
                                        </motion.button>
                                    )}
                                </>
                            );
                        })()}
                    </div>

                    {/* Generate SOAP button */}
                    {soapStatus !== "completed" && (
                        <button
                            onClick={handleGenerateSoap}
                            disabled={transcriptStatus !== "available" || generatingSoap || soapStatus === "processing"}
                            style={{ width: "100%", padding: "13px", borderRadius: "10px", border: "none", background: transcriptStatus !== "available" || generatingSoap || soapStatus === "processing" ? "#e2e8f0" : "linear-gradient(90deg,#359AFF,#9CCDFF)", color: transcriptStatus !== "available" || generatingSoap || soapStatus === "processing" ? "#94a3b8" : "white", fontWeight: "700", fontSize: "14px", cursor: transcriptStatus !== "available" || generatingSoap || soapStatus === "processing" ? "not-allowed" : "pointer", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "all 0.2s" }}
                        >
                            {generatingSoap || soapStatus === "processing"
                                ? <><RefreshCw size={14} style={{ animation: "spin 0.8s linear infinite" }} />Generating SOAP...</>
                                : "Generate SOAP"}
                        </button>
                    )}

                    {/* Consultation Details */}
                    <div className={styles.subHeader}>Consultation Details</div>
                    <div className={styles.infoCard}>
                        <div className={styles.infoCardHeader}><span className={styles.infoTitle}>Record ID</span></div>
                        <p className={styles.infoText} style={{ fontFamily: "monospace", wordBreak: "break-all" }}>{consultation.id || consultationId}</p>
                    </div>

                    {consultation.summary && (
                        <>
                            <div className={styles.subHeader}>AI Session Summary</div>
                            <div className={styles.infoCard}><p className={styles.infoText}>{consultation.summary}</p></div>
                        </>
                    )}

                    <div className={styles.subHeader}>How It Works</div>
                    <div className={styles.infoCard}>
                        <p className={styles.infoText}>
                            1. Consultation ends via Google Meet.<br />
                            2. Google processes the transcript (2–4 min).<br />
                            3. Verify transcript availability in Drive.<br />
                            4. Click <strong>Generate SOAP</strong> to start AI analysis.<br />
                            5. Structured note appears on the left when ready.
                        </p>
                    </div>
                </div>
            </div>

            {/* Patient Preview Modal */}
            {showPatientPreview && (
                <VisitSummary
                    consultationId={consultationId}
                    onClose={() => setShowPatientPreview(false)}
                    isDoctor={true}
                />
            )}
        </motion.div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div style={{ padding: "24px", textAlign: "center", color: "#64748b" }}>Loading...</div>}>
            <SoapNotesPage />
        </Suspense>
    );
}