"use client";
import { Suspense } from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { fetchConsultationById, markConsultationComplete, fetchSoapNote } from "@/services/consultation";
import Topbar from "../../components/Topbar";
import styles from "./SoapNotes.module.css";
import { motion } from "framer-motion";

const POLL_INTERVAL_MS = 10000; // 10 seconds per handbook spec
const MAX_POLL_ATTEMPTS = 40;   // ~4 minutes max

function SoapNotesPage() {
    const searchParams = useSearchParams();
    const consultationId = searchParams.get("consultationId");

    const [consultation, setConsultation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // SOAP state
    const [soap, setSoap] = useState(null);
    const [soapStatus, setSoapStatus] = useState("idle"); // idle | processing | completed | timeout | error
    const [marking, setMarking] = useState(false);
    const [displayAttempt, setDisplayAttempt] = useState(0); // Separate state for UI re-render on each poll

    const pollTimerRef = useRef(null);
    const pollAttemptsRef = useRef(0);

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
                    setSoapStatus("completed");
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
                
                // 1. If SOAP content is already in the main object (unlikely per current schema, but safe)
                // 2. Or if backend says it's already completed
                // 3. Or if hasSoapNote flag is set
                const isAiDone = data?.aiStatus === "completed" || data?.ai_status === "completed";
                const hasSoap = data?.hasSoapNote || !!data?.soap_note;

                if (isAiDone || hasSoap) {
                    setSoapStatus("completed");
                    // Fetch the full SOAP content if not already present
                    if (data?.soap_note) {
                        setSoap(data.soap_note);
                    } else {
                        fetchSoapNote(consultationId).then(res => {
                            if (res.soap_note) setSoap(res.soap_note);
                        });
                    }
                } else if (data?.status === "completed") {
                    // It's marked complete but AI isn't done yet -> start polling automatically
                    startPolling(consultationId);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch consultation:", err);
                setError("Could not load consultation. " + (err.message || ""));
            })
            .finally(() => setLoading(false));
    }, [consultationId, startPolling]);

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
    const visitDate = consultation.scheduled_at
        ? new Date(consultation.scheduled_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
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
                    <span className={styles.pValue}>{consultation.chief_complaint || consultation.reason || "Consultation"}</span>
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
                                background: soapStatus === "completed" ? "#f0fdf4" : (soapStatus === "processing" || (consultation?.status === "completed" && soapStatus === "idle")) ? "#eff6ff" : "#f8fafc",
                                color: soapStatus === "completed" ? "#16a34a" : (soapStatus === "processing" || (consultation?.status === "completed" && soapStatus === "idle")) ? "#2563eb" : "#64748b",
                            }}>
                                {soapStatus === "completed" && "✓ Note Ready"}
                                {(soapStatus === "processing" || (consultation?.status === "completed" && soapStatus === "idle")) && "⟳ Generating..."}
                                {soapStatus === "timeout" && "⚠ Timed Out"}
                                {soapStatus === "error" && "✗ Error"}
                                {soapStatus === "idle" && "Not Started"}
                            </span>
                        </div>

                        {/* ── SOAP sections when completed ── */}
                        {soapStatus === "completed" && soap ? (
                            <>
                                <div className={styles.soapSection}>
                                    <span className={styles.sectionLabel}>SUBJECTIVE</span>
                                    <div className={styles.textBlock}>{soap.subjective || "No subjective data recorded."}</div>
                                </div>
                                <div className={styles.soapSection}>
                                    <span className={styles.sectionLabel}>OBJECTIVE</span>
                                    <div className={styles.textBlock}>{soap.objective || "No objective data recorded."}</div>
                                </div>
                                <div className={styles.soapSection}>
                                    <span className={styles.sectionLabel}>ASSESSMENT</span>
                                    <div className={styles.textBlock}>{soap.assessment || "Assessment pending."}</div>
                                </div>
                                <div className={styles.soapSection}>
                                    <span className={styles.sectionLabel}>PLAN</span>
                                    <div className={styles.textBlock}>{soap.plan || "No plan recorded."}</div>
                                </div>
                            </>
                        ) : (soapStatus === "processing" || (consultation?.status === "completed" && soapStatus === "idle")) ? (
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
                            /* ── Idle: Show "Mark Complete" if not already completed ── */
                            <div style={{ padding: "40px", textAlign: "center" }}>
                                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🩺</div>
                                <p style={{ color: "#475569", fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>
                                    Once the Google Meet consultation ends, click below to trigger AI note generation.
                                </p>
                                <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "24px" }}>
                                    The backend will fetch the transcript and generate a structured SOAP note using AWS Bedrock AI.
                                </p>
                                <button
                                    onClick={handleMarkComplete}
                                    disabled={marking}
                                    style={{
                                        padding: "12px 28px",
                                        background: marking ? "#94a3b8" : "#3b82f6",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "10px",
                                        fontSize: "15px",
                                        fontWeight: "700",
                                        cursor: marking ? "not-allowed" : "pointer",
                                        transition: "background 0.2s",
                                    }}
                                >
                                    {marking ? "Processing..." : "✓ Mark Consultation as Complete"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Session Info Sidebar */}
                <div className={styles.rightCol}>
                    <div className={styles.summaryHeader}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>Session Details</span>
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

                    <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "20px 0" }} />

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
                            1. Doctor completes the Google Meet consultation.<br />
                            2. Click <strong>"Mark Complete"</strong> — backend starts AI processing.<br />
                            3. Google processes the audio transcript (2–4 min).<br />
                            4. AWS Bedrock AI generates the SOAP note.<br />
                            5. Note appears automatically when ready.
                        </p>
                    </div>
                </div>
            </div>
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