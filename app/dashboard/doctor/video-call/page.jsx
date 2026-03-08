"use client";
import { Suspense } from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Topbar from "../components/Topbar";
import styles from "./VideoCall.module.css";
import { fetchAppointments, fetchAppointmentById } from "@/services/doctor";
import { fetchConsultationById, fetchConsultationByPatientId } from "@/services/consultation";

function DoctorVideoCallPage() {
    const searchParams = useSearchParams();
    const consultationId = searchParams.get("consultationId");
    const appointmentId = searchParams.get("appointmentId");
    const [appointment, setAppointment] = useState(null);
    // The real consultation ID that SOAP notes require
    const [resolvedConsultationId, setResolvedConsultationId] = useState(consultationId || null);
    const router = useRouter();
    const hasMeetLink = useRef(false);

    useEffect(() => {
        if (consultationId) {
            loadConsultation(consultationId);
        } else if (appointmentId) {
            loadAppointment(appointmentId);
        } else {
            loadLatestAppointment();
        }

        // Poll every 5s for meet_link if not yet available
        const interval = setInterval(async () => {
            if (hasMeetLink.current) return;
            if (consultationId) await loadConsultation(consultationId);
            else if (appointmentId) await loadAppointment(appointmentId);
            else await loadLatestAppointment();
        }, 5000);

        return () => clearInterval(interval);
    }, [consultationId, appointmentId]);

    const normalizeAppointment = (data) => {
        if (!data) return null;
        let meet_link = data.meet_link || data.meetLink || data.google_meet_link
            || data.hangout_link || data.join_url || data.start_url || data.url;        // Fallback removed to rely entirely on Google API backend.

        return {
            ...data,
            meet_link
        };
    };

    /**
     * Try to resolve a real consultation ID from:
     * 1. appointment.meeting_id (set during approval)
     * 2. consultation lookup by patient_id
     */
    const resolveConsultationId = async (appt) => {
        if (!appt) return;

        // 1. Direct consultation_id field on the appointment (set during approval)
        if (appt.meeting_id) {
            setResolvedConsultationId(appt.meeting_id);
            return;
        }

        // 2. Fall back: look up by doctor+patient
        if (appt.patient_id) {
            try {
                const consult = await fetchConsultationByPatientId(appt.patient_id);
                if (consult?.id) {
                    setResolvedConsultationId(consult.id);
                }
            } catch {
                // Silently fail — SOAP note button will be hidden if no ID
            }
        }
    };

    const loadConsultation = async (id) => {
        try {
            const data = await fetchConsultationById(id);
            const normalized = normalizeAppointment(data);
            setAppointment(normalized);
            if (normalized?.meet_link) hasMeetLink.current = true;
            // For consultations, the id IS the consultation id
            setResolvedConsultationId(id);
        } catch (err) {
            console.error("Failed to load clinical consultation:", err);
            if (!appointmentId) loadLatestAppointment();
        }
    };

    const loadAppointment = async (id) => {
        try {
            const data = await fetchAppointmentById(id);
            const normalized = normalizeAppointment(data);
            setAppointment(normalized);
            if (normalized?.meet_link) hasMeetLink.current = true;
            await resolveConsultationId(normalized);
        } catch (err) {
            console.error("Failed to load specific appointment:", err);
            loadLatestAppointment();
        }
    };

    const loadLatestAppointment = async () => {
        try {
            const appointmentsData = await fetchAppointments();
            const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
            const next = appointments
                .filter(a => a.status === 'accepted' || a.status === 'scheduled')
                .sort((a, b) => new Date(a.requested_date || a.scheduled_at) - new Date(b.requested_date || b.scheduled_at))[0];

            if (next) {
                const normalized = normalizeAppointment(next);
                setAppointment(normalized);
                if (normalized?.meet_link) hasMeetLink.current = true;
                await resolveConsultationId(normalized);
            }
        } catch (err) {
            console.error("Failed to load appointment for video call:", err);
        }
    };

    const handleJoinMeet = () => {
        const link = appointment?.meet_link;
        if (link) {
            window.open(link, "_blank");
        } else {
            alert("No meeting link available for this session.");
        }
    };

    const handleViewSoap = () => {
        if (resolvedConsultationId) {
            router.push(`/dashboard/doctor/patients/soap?consultationId=${resolvedConsultationId}`);
        } else if (appointment?.patient_id) {
            // Last resort: try to navigate and let SOAP page handle lookup
            fetchConsultationByPatientId(appointment.patient_id)
                .then(c => {
                    if (c?.id) router.push(`/dashboard/doctor/patients/soap?consultationId=${c.id}`);
                    else alert("Could not find a consultation for this appointment yet. Please try again after the doctor approves.");
                })
                .catch(() => alert("Could not find a linked consultation. Please start a consultation from the Live Consult page first."));
        }
    };


    return (
        <div className={styles.sessionContainer}>
            <Topbar />

            {/* ---  ---
            <section className={styles.patientInfoBar}>
                <div className={styles.patientMain}>
                    <span className={styles.patientName}>{appointment?.patientName || appointment?.patient_name || "Benjamin Frank"}</span>
                    <div className={styles.meetTag}>Google Meet</div>
                </div>
                <div className={styles.patientMeta}>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>REASON</span>
                        <span className={styles.metaValue}>{appointment?.reason || appointment?.chief_complaint || "Recurring Migraines"}</span>
                    </div>
                </div>
            </section>

            <main className={styles.mainGrid}>
                <div className={styles.leftColumn}>
                    <div className={styles.videoAreaWrapper}>
                        <div className={styles.meetJoinCard}>
                            <div className={styles.googleIcon}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <path d="M15 8V16H5V8H15M16 6H4C3.45 6 3 6.45 3 7V17C3 17.55 3.45 18 4 18H16C16.55 18 17 17.55 17 17V13.5L21 17.5V6.5L17 10.5V7C17 6.45 16.55 6 16 6Z" fill="#3B82F6" />
                                </svg>
                            </div>
                            <h3>Active Consultation</h3>
                            <p>Launch the session via Google Meet secure link.</p>
                            <button className={styles.joinMeetBtn} onClick={handleJoinMeet}>
                                Join Google Meet
                            </button>
                        </div>
                    </div>
                    <div className={styles.chatAreaWrapper}>
                        <div className={styles.emptyChat}>
                            <p>Internal clinical chat for record synchronization.</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: TRANSCRIPT, SOAP, ASSIST *\/}
                <div className={styles.rightColumn}>
                    <div className={styles.transcriptCard}>
                        <div className={styles.toolHeader}>
                            <span>Real-time Transcript</span>
                            <div className={styles.liveBadge}>LIVE</div>
                        </div>
                        <div className={styles.toolContent}>
                            {transcript.map((msg) => msg && (
                                <div key={msg.id} className={`${styles.bubble} ${msg.speaker === 'doctor' ? styles.bubbleDoctor : styles.bubblePatient}`}>
                                    <strong style={{ fontSize: '10px', opacity: 0.7, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                                        {msg.speaker}
                                    </strong>
                                    {msg.text}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.toolCard}>
                        <div className={styles.toolHeader}>
                            <span>SOAP Notes</span>
                        </div>
                        <div className={styles.toolContent}>
                            <SOAPEditor initialData={{ subjective: "", objective: "", assessment: "", plan: "" }} />
                        </div>
                    </div>

                    <div className={styles.toolCard}>
                        <div className={styles.toolHeader}>
                            <span>AI Assist</span>
                        </div>
                        <div className={styles.toolContent}>
                            <AssistPanel suggestedTags={suggestedTags} />
                        </div>
                    </div>
                </div>
            </main>
            --- */}

            <main style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                background: '#f8fafc',
                height: 'calc(100vh - 72px)'
            }}>
                <div style={{
                    background: '#ffffff',
                    padding: '48px 64px',
                    borderRadius: '24px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.04)',
                    border: '1px solid #eef2f7',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '24px',
                    maxWidth: '480px',
                    width: '100%'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '80px',
                        height: '80px',
                        background: '#eff6ff',
                        borderRadius: '50%',
                        marginBottom: '8px'
                    }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                            <path d="M15 8V16H5V8H15M16 6H4C3.45 6 3 6.45 3 7V17C3 17.55 3.45 18 4 18H16C16.55 18 17 17.55 17 17V13.5L21 17.5V6.5L17 10.5V7C17 6.45 16.55 6 16 6Z" fill="#3B82F6" />
                        </svg>
                    </div>

                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px' }}>
                            Active Consultation
                        </h2>
                        <p style={{ fontSize: '15px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                            {appointment?.patientName && !appointment.patientName.toLowerCase().includes('encryp')
                                ? `Session for: ${appointment.patientName}`
                                : appointment?.patient_name && !appointment.patient_name.toLowerCase().includes('encryp')
                                    ? `Session for: ${appointment.patient_name}`
                                    : "Launch the secure Google Meet session to begin your consultation."}
                        </p>
                    </div>

                    <button
                        className={styles.joinBtn}
                        onClick={() => window.open(appointment?.meet_link, "_blank")}
                        disabled={!appointment?.meet_link}
                        style={{
                            background: !appointment?.meet_link ? '#cbd5e1' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '16px 32px',
                            borderRadius: '12px',
                            fontWeight: '700',
                            fontSize: '16px',
                            cursor: !appointment?.meet_link ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            width: '100%',
                            boxShadow: !appointment?.meet_link ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '12px'
                        }}
                    >
                        {appointment?.meet_link ? "Join Google Meet" : "Meeting Link Unavailable"}
                    </button>

                    {(resolvedConsultationId || appointment?.patient_id) && (
                        <button
                            onClick={handleViewSoap}
                            style={{
                                background: 'white',
                                color: '#0f172a',
                                border: '1px solid #e2e8f0',
                                padding: '14px 32px',
                                borderRadius: '12px',
                                fontWeight: '600',
                                fontSize: '15px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                width: '100%',
                            }}
                        >
                            📋 View / Generate SOAP Note
                        </button>
                    )}

                    {!appointment?.meet_link && (
                        <p style={{ fontSize: '13px', color: '#ef4444', margin: 0, fontWeight: 500 }}>
                            Waiting for the consultation meeting link to be generated.
                        </p>
                    )}

                </div>
            </main>
        </div>
    );
}
export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DoctorVideoCallPage />
        </Suspense>
    );
}