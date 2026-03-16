"use client";
import { Suspense } from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { fetchConsultationById, markConsultationComplete, fetchSoapNote, fetchTranscriptStatus, triggerSoapGeneration, updateConsultation } from "@/services/consultation";
import Topbar from "../../components/Topbar";
import styles from "./SoapNotes.module.css";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import VisitSummary from "@/app/dashboard/patient/records/components/VisitSummary";

const POLL_INTERVAL_MS = 10000; // 10 seconds per handbook spec
const MAX_POLL_ATTEMPTS = 40;   // ~4 minutes max

function SoapNotesPage() {
    const searchParams = useSearchParams();
    const consultationId = searchParams.get("consultationId");

    const [consultation, setConsultation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [now, setNow] = useState(Date.now());

    // SOAP state
    const [soap, setSoap] = useState(null);
    const [soapStatus, setSoapStatus] = useState("idle"); // idle | processing | completed | timeout | error | no_transcript
    const [marking, setMarking] = useState(false);
    const [displayAttempt, setDisplayAttempt] = useState(0);

    // Transcript status state
    const [transcriptStatus, setTranscriptStatus] = useState(null); // null | 'processing' | 'available' | 'not_found'
    const [transcriptMsg, setTranscriptMsg] = useState("");
    const [checkingTranscript, setCheckingTranscript] = useState(false);
    const [generatingSoap, setGeneratingSoap] = useState(false);
    const [showPatientPreview, setShowPatientPreview] = useState(false);

    const [isEditingSummary, setIsEditingSummary] = useState(false);
    const [editedPatientSummary, setEditedPatientSummary] = useState("");

    const pollTimerRef = useRef(null);
    const pollAttemptsRef = useRef(0);

    // ── PDF Export Function ────────────────────────────────────────────────
    const handleDownloadPDF = () => {
        if (!soap || !consultation) return;

        const doc = new jsPDF();
        
        // Add Header
        doc.setFontSize(22);
        doc.setTextColor(30, 64, 175); // #1e40af
        doc.text("SaraMedico SOAP Note", 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // #64748b
        const date = new Date().toLocaleDateString();
        doc.text(`Generated on: ${date}`, 14, 30);
        
        doc.setLineWidth(0.5);
        doc.setDrawColor(226, 232, 240); // #e2e8f0
        doc.line(14, 35, 196, 35);

        // Patient & Provider Info
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42); // #0f172a
        doc.setFont("helvetica", "bold");
        doc.text("Patient Information", 14, 45);
        doc.setFont("helvetica", "normal");
        doc.text(`Name: ${consultation.patient_name || consultation.patientName || "N/A"}`, 14, 52);
        doc.text(`MRN: ${consultation.mrn || "N/A"}`, 14, 58);
        
        doc.setFont("helvetica", "bold");
        doc.text("Provider Information", 110, 45);
        doc.setFont("helvetica", "normal");
        const drName = consultation.doctorName || consultation.doctor_name || "N/A";
        doc.text(`Physician: ${drName.startsWith("Dr.") ? drName : "Dr. " + drName}`, 110, 52);
        doc.text(`Specialty: ${consultation.doctorSpecialty || "General Practitioner"}`, 110, 58);

        doc.line(14, 65, 196, 65);

        // SOAP Sections
        const sections = [
            { label: "SUBJECTIVE", content: soap.subjective },
            { label: "OBJECTIVE", content: soap.objective },
            { label: "ASSESSMENT", content: soap.assessment },
            { label: "PLAN", content: soap.plan }
        ];

        let cursorY = 75;

        sections.forEach(section => {
            if (section.content) {
                // Check for new page before starting section head
                if (cursorY > 260) {
                    doc.addPage();
                    cursorY = 20;
                }

                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(59, 130, 246); // #3b82f6
                doc.text(section.label, 14, cursorY);
                cursorY += 7;

                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(51, 65, 85); // #334155
                
                // Helper to format text/objects safely with recursion
                const formatData = (data, depth = 0) => {
                    if (!data) return "";
                    if (typeof data === "string") return data;
                    if (Array.isArray(data)) return data.map(item => `- ${formatData(item)}`).join("\n");
                    if (typeof data === "object") {
                        const indent = "  ".repeat(depth);
                        return Object.entries(data).map(([k, v]) => {
                            const formattedKey = k.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
                            return typeof v === "object" ? `${indent}${formattedKey}:\n${formatData(v, depth + 1)}` : `${indent}${formattedKey}: ${v}`;
                        }).join("\n");
                    }
                    return String(data);
                };

                const textContent = formatData(section.content);
                const splitText = doc.splitTextToSize(textContent, 175);
                
                // If the block is too long for current page, move to next
                if (cursorY + (splitText.length * 5) > 280) {
                    doc.addPage();
                    cursorY = 20;
                    // Redraw label on new page if header was moved
                    doc.setFontSize(11);
                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(59, 130, 246);
                    doc.text(`${section.label} (cont.)`, 14, cursorY);
                    cursorY += 7;
                    doc.setFontSize(10);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(51, 65, 85);
                }

                doc.text(splitText, 14, cursorY);
                cursorY += (splitText.length * 5) + 12;
            }
        });

        const fileName = `SOAP_Note_${consultation.patient_name || "Record"}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    };

    // ── Polling function ────────────────────────────────────────────────────
    const startPolling = useCallback((consultationId) => {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        pollAttemptsRef.current = 0;
        setDisplayAttempt(0);   // Reset display counter
        setSoapStatus("processing");

        pollTimerRef.current = setInterval(async () => {
            pollAttemptsRef.current += 1;
            setDisplayAttempt(pollAttemptsRef.current); // Trigger re-render so counter updates

            if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
                clearInterval(pollTimerRef.current);
                setSoapStatus("timeout");
                return;
            }

            try {
                const result = await fetchSoapNote(consultationId);

                if (result.httpStatus === 200 && result.soap_note) {
                    clearInterval(pollTimerRef.current);
                    setSoap(result.soap_note);
                    setEditedPatientSummary(result.soap_note.patient_summary || "");
                    setSoapStatus("completed");
                } else if (
                    result.ai_status === "no_transcript" ||
                    result.status === "no_transcript"
                ) {
                    // Terminal state: no speech was detected in the meeting
                    clearInterval(pollTimerRef.current);
                    setSoapStatus("no_transcript");
                }
                // On 202 — stay in "processing", poll resumes on next tick
            } catch (err) {
                console.error("Poll error:", err);
                clearInterval(pollTimerRef.current);
                setSoapStatus("error");
            }
        }, POLL_INTERVAL_MS);
    }, []);

    // ── Load consultation on mount ──────────────────────────────────────────
    useEffect(() => {
        if (!consultationId) {
            setLoading(false);
            setError("No consultation selected. Please open the SOAP note from a valid appointment.");
            return;
        }
        fetchConsultationById(consultationId)
            .then((data) => {
                setConsultation(data);

                const aiStatus = data?.aiStatus || data?.ai_status;
                const isAwaitingTranscript = data?.ai_status === "awaiting_transcript" || data?.ai_status === "pending";
                
                if (data?.soap_note) {
                    setSoap(data.soap_note);
                    setEditedPatientSummary(data.soap_note.patient_summary || "");
                    setSoapStatus("completed");
                } else if (data?.status === "completed") {
                    // Consultation is complete — if AI status is already processing, start polling
                    if (data?.ai_status === "processing") {
                        startPolling(consultationId);
                    }
                }
            })
            .catch((err) => {
                console.error("Failed to fetch consultation:", err);
                setError("Could not load consultation. " + (err.message || ""));
            })
            .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [consultationId, startPolling]);

     // ── Countdown Timer Tick ───────────────────────────────────────────────
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    // ── Cleanup polling on unmount ──────────────────────────────────────────
    useEffect(() => () => { if (pollTimerRef.current) clearInterval(pollTimerRef.current); }, []);

    // ── Mark consultation complete → trigger AI ─────────────────────────────
    const handleMarkComplete = async () => {
        if (!consultationId || marking) return;
        setMarking(true);
        try {
            await markConsultationComplete(consultationId);
            startPolling(consultationId);
        } catch (err) {
            console.error("Mark complete failed:", err);
            setSoapStatus("error");
        } finally {
            setMarking(false);
        }
    };

    // ── Retry polling manually ──────────────────────────────────────────────
    const handleRetryPoll = () => {
        if (consultationId) startPolling(consultationId);
    };

    // ── Check Google Drive for transcript ──────────────────────────────────
    const handleCheckTranscript = async () => {
        if (!consultationId || checkingTranscript) return;
        setCheckingTranscript(true);
        try {
            const result = await fetchTranscriptStatus(consultationId);
            setTranscriptStatus(result.status);
            setTranscriptMsg(result.message || "");
            // If the transcript is already in DB, we can start polling right away
            if (result.status === "available" && result.transcript_in_db) {
                startPolling(consultationId);
            }
        } catch (err) {
            console.error("Transcript status check failed:", err);
            setTranscriptStatus("not_found");
            setTranscriptMsg("Could not check transcript status.");
        } finally {
            setCheckingTranscript(false);
        }
    };

    // ── Trigger SOAP generation from available transcript ──────────────────
    const handleGenerateSoap = async () => {
        if (!consultationId || generatingSoap) return;
        setGeneratingSoap(true);
        setSoapStatus("processing");
        try {
            await triggerSoapGeneration(consultationId);
            startPolling(consultationId);
        } catch (err) {
            console.error("SOAP generation trigger failed:", err);
            setSoapStatus("error");
        } finally {
            setGeneratingSoap(false);
        }
    };


    // ── Render states ───────────────────────────────────────────────────────
    if (loading) return (
        <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", color: "#64748b", flexDirection: "column", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", border: "3px solid #e2e8f0", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Loading clinical encounter...
        </div>
    );

    if (error) return (
        <>
            <Topbar />
            <div style={{ padding: "60px 40px", textAlign: "center", color: "#64748b" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>⚠️</div>
                <h2 style={{ color: "#0f172a" }}>Could Not Load Encounter</h2>
                <p>{error}</p>
            </div>
        </>
    );

    if (!consultation) return (
        <>
            <Topbar />
            <div style={{ padding: "60px 40px", textAlign: "center", color: "#64748b" }}>
                <h2>Consultation Not Found</h2>
                <p>No consultation record found for ID: <code>{consultationId}</code></p>
                <button
                    onClick={() => window.history.back()}
                    style={{ marginTop: "16px", padding: "8px 20px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer" }}
                >
                    Go Back
                </button>
            </div>
        </>
    );

    const patient = consultation.patient || {};
    const patientName = consultation.patientName || consultation.patient_name || patient.full_name || "Patient Record";
    const visitDate = (consultation.scheduled_at || consultation.scheduledAt)
        ? new Date(consultation.scheduled_at || consultation.scheduledAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : "Today";

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Topbar />

            {/* ── Patient Header ── */}
            <div className={styles.patientHeader}>
                <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
                    color: "#0284c7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    fontWeight: "bold",
                    flexShrink: 0
                }}>
                    {patientName ? patientName.charAt(0).toUpperCase() : "P"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div className={styles.pName}>{patientName}</div>
                    <div style={{ display: "flex", gap: "16px" }}>
                        <div className={styles.pMeta}>DOB: {consultation.patientDob || patient.date_of_birth || patient.dob || "N/A"}</div>
                        <div className={styles.pMeta}>MRN: {consultation.patientMrn || patient.mrn || "N/A"}</div>
                    </div>
                </div>

                <div className={styles.pDetailGroup} style={{ marginLeft: "auto" }}>
                    <span className={styles.pLabel}>REASON FOR VISIT</span>
                    <span className={styles.pValue}>
                        {typeof (consultation.chief_complaint || consultation.reason) === 'object' 
                          ? ((consultation.chief_complaint || consultation.reason)?.chief_complaint || "Consultation") 
                          : (consultation.chief_complaint || consultation.reason || "Consultation")}
                    </span>
                </div>
                <div className={styles.pDetailGroup}>
                    <span className={styles.pLabel}>VISIT TYPE</span>
                    <span className={styles.pValue}>{consultation.visit_type || "Follow Up"}</span>
                </div>
                <div className={styles.pDetailGroup}>
                    <span className={styles.pLabel}>VISIT DATE</span>
                    <span className={styles.pValue}>{visitDate}</span>
                </div>
            </div>

            {/* ── Main Content Grid ── */}
            <div className={styles.contentGrid}>

                {/* LEFT: SOAP Notes */}
                <div className={styles.leftCol}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.headerTitle}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                                AI-Generated SOAP Note
                            </div>

                            {/* Status badge */}
                            <span style={{
                                padding: "4px 10px",
                                borderRadius: "20px",
                                fontSize: "11px",
                                fontWeight: "700",
                                background:
                                    soapStatus === "completed" ? "#f0fdf4" :
                                    soapStatus === "no_transcript" ? "#fefce8" :
                                    soapStatus === "processing" ? "#eff6ff" : 
                                    (consultation?.status === "completed" && soapStatus === "idle") ? "#fef9c3" : "#f8fafc",
                                color:
                                    soapStatus === "completed" ? "#16a34a" :
                                    soapStatus === "no_transcript" ? "#a16207" :
                                    soapStatus === "processing" ? "#2563eb" : 
                                    (consultation?.status === "completed" && soapStatus === "idle") ? "#854d0e" : "#64748b",
                            }}>
                                {soapStatus === "completed" && "✓ Note Ready"}
                                {soapStatus === "no_transcript" && "⚠ No Transcript"}
                                {soapStatus === "processing" && "⟳ AI Generating Note..."}
                                {(consultation?.status === "completed" && soapStatus === "idle") && "⏳ Awaiting Verification"}
                                {soapStatus === "timeout" && "⚠ Timed Out"}
                                {soapStatus === "error" && "✗ Error"}
                                {soapStatus === "idle" && consultation?.status !== "completed" && "Not Started"}
                            </span>
                        </div>

                        {/* ── SOAP sections when completed ── */}
                        {soapStatus === "completed" && soap ? (
                            (() => {
                                const renderSoapContent = (content, fallback) => {
                                    if (!content) return fallback;
                                    
                                    let parsedContent = content;
                                    if (typeof content === 'string') {
                                        try {
                                            // Strip formatting if the AI enclosed it in markdown codeblocks
                                            let cleanedString = content.replace(/```json/gi, '').replace(/```/g, '').trim();
                                            // Extract just the JSON map if the AI prefixed it with text
                                            const firstBrace = cleanedString.indexOf('{');
                                            const lastBrace = cleanedString.lastIndexOf('}');
                                            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
                                                cleanedString = cleanedString.substring(firstBrace, lastBrace + 1);
                                            }
                                            parsedContent = JSON.parse(cleanedString);
                                        } catch (e) {
                                            // It's just a regular string, but let's map normal newlines just in case
                                            return <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>;
                                        }
                                    }
                                    
                                    const formatObject = (obj) => {
                                        if (Array.isArray(obj)) {
                                            return (
                                                <ul style={{ margin: "4px 0", paddingLeft: "20px" }}>
                                                    {obj.map((item, i) => <li key={i}>{typeof item === 'object' ? formatObject(item) : item}</li>)}
                                                </ul>
                                            );
                                        }
                                        return (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                {Object.entries(obj).map(([k, v]) => (
                                                    <div key={k}>
                                                        <strong style={{ textTransform: "capitalize", color: "#334155" }}>{k.replace(/_/g, ' ')}: </strong>
                                                        {typeof v === 'object' && v !== null ? (
                                                            <div style={{ paddingLeft: "12px", marginTop: "4px" }}>{formatObject(v)}</div>
                                                        ) : (
                                                            <span style={{ color: "#475569" }}>{v}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    };

                                    try {
                                        return typeof parsedContent === 'object' ? formatObject(parsedContent) : String(parsedContent);
                                    } catch (e) {
                                        return <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{JSON.stringify(parsedContent, null, 2)}</pre>;
                                    }
                                };
                                return (
                                    <>
                                <div className={styles.soapSection}>
                                    <span className={styles.sectionLabel}>SUBJECTIVE</span>
                                    <div className={styles.textBlock}>{renderSoapContent(soap.subjective, "No subjective data recorded.")}</div>
                                </div>
                                <div className={styles.soapSection}>
                                    <span className={styles.sectionLabel}>OBJECTIVE</span>
                                    <div className={styles.textBlock}>{renderSoapContent(soap.objective, "No objective data recorded.")}</div>
                                </div>
                                <div className={styles.soapSection}>
                                    <span className={styles.sectionLabel}>ASSESSMENT</span>
                                    <div className={styles.textBlock}>{renderSoapContent(soap.assessment, "Assessment pending.")}</div>
                                </div>
                                <div className={styles.soapSection}>
                                    <span className={styles.sectionLabel}>PLAN</span>
                                    <div className={styles.textBlock}>{renderSoapContent(soap.plan, "No plan recorded.")}</div>
                                </div>
                                 <div className={styles.soapSection}>
                                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                         <span className={styles.sectionLabel} style={{ color: "#0891b2", margin: 0 }}>PATIENT SUMMARY (SIMPLIFIED)</span>
                                         <button 
                                            onClick={() => setIsEditingSummary(!isEditingSummary)}
                                            style={{ 
                                                background: "none", border: "none", color: "#0891b2", 
                                                fontSize: "11px", fontWeight: "700", cursor: "pointer",
                                                textDecoration: "underline"
                                            }}
                                         >
                                             {isEditingSummary ? "CANCEL EDIT" : "EDIT SUMMARY"}
                                         </button>
                                     </div>
                                     <div className={styles.textBlock} style={{ background: "#f0f9ff", borderLeft: "3px solid #0ea5e9", position: "relative" }}>
                                         {isEditingSummary ? (
                                             <textarea 
                                                value={editedPatientSummary}
                                                onChange={(e) => setEditedPatientSummary(e.target.value)}
                                                style={{
                                                    width: "100%", minHeight: "120px", background: "white",
                                                    border: "1px solid #bae6fd", borderRadius: "8px",
                                                    padding: "12px", fontSize: "14px", color: "#334155",
                                                    fontFamily: "inherit", lineHeight: "1.6", outline: "none"
                                                }}
                                                placeholder="Modify the summary for the patient..."
                                             />
                                         ) : (
                                             renderSoapContent(soap.patient_summary || "No patient summary available.")
                                         )}
                                     </div>
                                 </div>
                                    </>
                                );
                            })()
                         ) : soapStatus === "processing" ? (
                            /* ── Processing / Polling state ── */
                            <div style={{ padding: "40px", textAlign: "center" }}>
                                <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                                    <div style={{ width: "40px", height: "40px", border: "3px solid #e2e8f0", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                                </div>
                                <p style={{ color: "#475569", fontSize: "14px", fontWeight: "500" }}>
                                    AI is generating the SOAP note from the meeting transcript.
                                </p>
                                <p style={{ color: "#94a3b8", fontSize: "12px" }}>
                                    Google Meet takes 2–4 minutes to process the audio. Checking every 10 seconds...
                                </p>
                                <p style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "600" }}>
                                    Attempt {displayAttempt} / {MAX_POLL_ATTEMPTS}
                                </p>
                            </div>
                        ) : soapStatus === "no_transcript" ? (
                            /* ── No Transcript: Meeting had no speech ── */
                            <div style={{ padding: "40px", textAlign: "center" }}>
                                <div style={{ fontSize: "40px", marginBottom: "16px" }}>🎙️</div>
                                <h3 style={{ color: "#92400e", marginBottom: "8px", fontSize: "16px" }}>
                                    No Transcript Captured
                                </h3>
                                <p style={{ color: "#78350f", fontSize: "13px", lineHeight: "1.6", maxWidth: "380px", margin: "0 auto 16px" }}>
                                    No speech was detected in this meeting session. A SOAP note cannot be generated
                                    without a recorded conversation.
                                </p>
                                <div style={{
                                    padding: "12px 16px",
                                    background: "#fef9c3",
                                    border: "1px solid #fde047",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    color: "#713f12",
                                    textAlign: "left",
                                    maxWidth: "400px",
                                    margin: "0 auto 20px",
                                    lineHeight: "1.6"
                                }}>
                                    <strong>To generate a SOAP note:</strong>
                                    <ul style={{ margin: "6px 0 0", paddingLeft: "18px" }}>
                                        <li>Conduct the consultation with voice conversation in Google Meet</li>
                                        <li>Ensure Google Meet transcription is enabled for your account</li>
                                        <li>Mark the consultation complete only after the meeting ends</li>
                                    </ul>
                                </div>
                            </div>
                        ) : soapStatus === "timeout" ? (
                            <div style={{ padding: "40px", textAlign: "center" }}>
                                <div style={{ fontSize: "36px", marginBottom: "12px" }}>⏱️</div>
                                <p style={{ color: "#475569", fontSize: "14px" }}>Note generation timed out. Google is still processing the transcript.</p>
                                <button
                                    onClick={handleRetryPoll}
                                    style={{ marginTop: "16px", padding: "8px 20px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                                >
                                    Retry Checking
                                </button>
                            </div>
                        ) : soapStatus === "error" ? (
                            <div style={{ padding: "40px", textAlign: "center" }}>
                                <div style={{ fontSize: "36px", marginBottom: "12px" }}>❌</div>
                                <p style={{ color: "#ef4444", fontSize: "14px" }}>Failed to generate SOAP note. Please try again.</p>
                                <button
                                    onClick={handleMarkComplete}
                                    style={{ marginTop: "16px", padding: "8px 20px", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                                >
                                    Retry
                                </button>
                            </div>
                        ) : (
                            /* ── Idle: Consultation not yet generating SOAP ── */
                            <div style={{ padding: "60px 40px", textAlign: "center" }}>
                                <div style={{ 
                                    width: "80px", height: "80px", borderRadius: "50%", background: "#eff6ff",
                                    display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px"
                                }}>
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "12px" }}>
                                    Ready for SOAP Generation
                                </h3>
                                <p style={{ color: "#64748b", fontSize: "15px", lineHeight: "1.6", maxWidth: "360px", margin: "0 auto 24px" }}>
                                    The consultation is complete. Once the Google Meet transcript is confirmed as available, you can generate the AI SOAP note.
                                </p>
                                
                                {transcriptStatus !== "available" && (
                                    <div style={{
                                        background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px",
                                        padding: "16px", marginBottom: "24px", textAlign: "left"
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#64748b", fontSize: "13px" }}>
                                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#cbd5e1" }} />
                                            <span>Waiting for Google Drive transcript sync...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Session Info Sidebar */}
                <div className={styles.rightCol}>
                    <div className={styles.summaryHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", paddingRight: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span>Session Details</span>
                        </div>
                        {soapStatus === "completed" && (
                            <motion.button 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05, boxShadow: "0 6px 15px rgba(59, 130, 246, 0.4)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleDownloadPDF}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "6px 12px",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    boxShadow: "0 4px 10px rgba(59, 130, 246, 0.25)",
                                    whiteSpace: "nowrap",
                                    transition: "box-shadow 0.2s"
                                }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                EXPORT PDF
                            </motion.button>
                        )}
                    </div>

                    <div className={styles.subHeader}>STATUS</div>
                    <div className={styles.tagsRow}>
                        <span className={`${styles.tag} ${consultation.status === "completed" ? styles.tagYellow : styles.tagRed}`}>
                            • {(consultation.status || "Unknown").toUpperCase()}
                        </span>
                        {consultation.urgency_level === "High" && (
                            <span className={`${styles.tag} ${styles.tagRed}`}>• High Urgency</span>
                        )}
                    </div>

                    {/* Quick Access Actions */}
                    <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowPatientPreview(true)}
                            disabled={soapStatus !== "completed"}
                            style={{
                                width: "100%", padding: "12px", borderRadius: "10px",
                                background: soapStatus === "completed" ? "#ffffff" : "#f1f5f9",
                                border: "1px solid #e2e8f0", color: "#1e293b",
                                fontSize: "13px", fontWeight: "700", cursor: soapStatus === "completed" ? "pointer" : "not-allowed",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                                transition: "all 0.2s"
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                            VIEW PATIENT SUMMARY
                        </motion.button>


                    </div>

                    <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "20px 0" }} />

                     <div className={styles.subHeader}>GOOGLE DRIVE TRANSCRIPT STATUS</div>
                    <div style={{
                        background: transcriptStatus === "available" ? "#f0fdf4" : (transcriptStatus === "not_found" ? "#fff1f2" : "#f8fafc"),
                        border: "1px solid " + (transcriptStatus === "available" ? "#bcf0da" : (transcriptStatus === "not_found" ? "#fecaca" : "#e2e8f0")),
                        borderRadius: "12px", padding: "16px", marginBottom: "20px"
                    }}>
                        {(() => {
                            const completedAt = consultation?.completionTime || consultation?.completion_time;
                            const COOLDOWN_MS = 4 * 60 * 1000;
                            const diffMs = completedAt ? (new Date(completedAt).getTime() + COOLDOWN_MS) - now : 0;
                            const isInCooldown = diffMs > 0;
                            const minsLeft = Math.floor(Math.max(0, diffMs) / 60000);
                            const secsLeft = Math.floor((Math.max(0, diffMs) % 60000) / 1000);

                            if (isInCooldown) {
                                return (
                                    <div style={{ textAlign: "center", padding: "10px 0" }}>
                                        <div style={{ fontSize: "24px", fontWeight: "800", color: "#3b82f6", marginBottom: "4px" }}>
                                            {minsLeft}:{secsLeft.toString().padStart(2, '0')}
                                        </div>
                                        <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                                            Awaiting Google Meet processing...
                                        </p>
                                        <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "8px" }}>
                                            The Verify button will appear when time expires.
                                        </p>
                                    </div>
                                );
                            }

                            return (
                                <>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                                        <motion.div 
                                            animate={checkingTranscript ? { scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] } : {}}
                                            transition={{ duration: 1.5, repeat: checkingTranscript ? Infinity : 0, ease: "easeInOut" }}
                                            style={{
                                                width: "28px", height: "28px", borderRadius: "50%",
                                                background: transcriptStatus === "available" ? "#16a34a" : (transcriptStatus === "not_found" ? "#ef4444" : "#3b82f6"),
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                boxShadow: checkingTranscript ? "0 0 10px rgba(59,130,246,0.5)" : "none"
                                            }}
                                        >
                                            {transcriptStatus === "available" ? (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                            ) : checkingTranscript ? (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" style={{ animation: "spin 1.5s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                                            )}
                                        </motion.div>
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            <span style={{ 
                                                fontWeight: "700", fontSize: "14px", 
                                                color: transcriptStatus === "available" ? "#16a34a" : (transcriptStatus === "not_found" ? "#dc2626" : "#2563eb")
                                            }}>
                                                {transcriptStatus === "available" ? "Found & Available" : (transcriptStatus === "not_found" ? "Not Found / Unavailable" : checkingTranscript ? "Scanning Google Drive..." : "Pending Verification")}
                                            </span>
                                            {checkingTranscript && (
                                                <span style={{ fontSize: "11px", color: "#64748b" }}>Looking for Google Meet recording...</span>
                                            )}
                                        </div>
                                    </div>
                                    <p style={{ fontSize: "13px", color: (transcriptStatus === "not_found" ? "#ef4444" : "#475569"), lineHeight: "1.5", margin: 0, marginTop: "8px" }}>
                                        {transcriptMsg || "Click the button below to check Google Drive."}
                                    </p>
                                    
                                    {transcriptStatus !== "available" && (
                                        <motion.button 
                                            onClick={handleCheckTranscript}
                                            disabled={checkingTranscript}
                                            whileHover={!checkingTranscript ? { scale: 1.01, backgroundColor: "#2563eb" } : {}}
                                            whileTap={!checkingTranscript ? { scale: 0.98 } : {}}
                                            animate={checkingTranscript ? {
                                                boxShadow: ["0px 0px 0px rgba(59,130,246,0)", "0px 0px 14px rgba(59,130,246,0.6)", "0px 0px 0px rgba(59,130,246,0)"],
                                                backgroundColor: ["#3b82f6", "#60a5fa", "#3b82f6"]
                                            } : {
                                                backgroundColor: "#3b82f6"
                                            }}
                                            transition={{ duration: 1.8, repeat: checkingTranscript ? Infinity : 0, ease: "easeInOut" }}
                                            style={{ 
                                                marginTop: "16px", width: "100%", padding: "12px", 
                                                color: "white", border: "none", 
                                                borderRadius: "8px", fontWeight: "600", fontSize: "14px", 
                                                cursor: checkingTranscript ? "not-allowed" : "pointer"
                                            }}
                                        >
                                            {checkingTranscript ? (
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                                    <span>Searching...</span>
                                                </div>
                                            ) : "Verify Transcript in Drive"}
                                        </motion.button>
                                    )}
                                </>
                            );
                        })()}
                    </div>

                    {soapStatus !== "completed" && (
                        <button
                            onClick={handleGenerateSoap}
                            disabled={transcriptStatus !== "available" || generatingSoap || soapStatus === "processing"}
                            style={{
                                width: "100%", padding: "14px", borderRadius: "12px", border: "none",
                                background: (transcriptStatus !== "available" || generatingSoap || soapStatus === "processing") ? "#cbd5e1" : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                                color: "white", fontWeight: "700", fontSize: "14px", cursor: (transcriptStatus !== "available" || generatingSoap || soapStatus === "processing") ? "not-allowed" : "pointer",
                                boxShadow: (transcriptStatus !== "available" || generatingSoap || soapStatus === "processing") ? "none" : "0 4px 12px rgba(59,130,246,0.3)",
                                transition: "all 0.2s", marginBottom: "24px"
                            }}
                        >
                            {generatingSoap || soapStatus === "processing" ? "⟳ Generating SOAP..." : "✨ Generate SOAP"}
                        </button>
                    )}

                    <div className={styles.subHeader}>CONSULTATION DETAILS</div>
                    <div className={styles.infoCard}>
                        <div className={styles.infoCardHeader}>
                            <span className={styles.infoTitle}>Record ID</span>
                        </div>
                        <p className={styles.infoText} style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                            {consultation.id || consultationId}
                        </p>
                    </div>

                    {consultation.summary && (
                        <>
                            <div className={styles.subHeader} style={{ marginTop: "16px" }}>AI SESSION SUMMARY</div>
                            <div className={styles.infoCard}>
                                <p className={styles.infoText}>{consultation.summary}</p>
                            </div>
                        </>
                    )}

                    <div className={styles.subHeader} style={{ marginTop: "16px" }}>HOW IT WORKS</div>
                    <div className={styles.infoCard}>
                        <p className={styles.infoText}>
                            1. Consultation ends via Google Meet.<br />
                            2. Google processes and uploads the transcript (2–4 min).<br />
                            3. System verifies transcript availability in Drive.<br />
                            4. Click <strong>"Generate SOAP"</strong> to initiate AI analysis.<br />
                            5. Structured Note appears on the left when ready.
                        </p>
                    </div>
                </div>
            </div>

            {/* Patient View Preview Modal */}
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
        <Suspense fallback={<div>Loading...</div>}>
            <SoapNotesPage />
        </Suspense>
    );
}