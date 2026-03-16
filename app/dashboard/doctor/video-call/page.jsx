"use client";
import { Suspense } from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Topbar from "../components/Topbar";
import styles from "./VideoCall.module.css";
import { fetchAppointments, fetchAppointmentById } from "@/services/doctor";
import { fetchConsultationById, fetchConsultationByPatientId, markConsultationComplete } from "@/services/consultation";

const COOLDOWN_MS = 4 * 60 * 1000; // 4 minutes

function ProgressRing({ radiusPx = 40, strokePx = 5, progress = 1, color = "#3b82f6" }) {
    const circumference = 2 * Math.PI * radiusPx;
    const offset = circumference * (1 - Math.max(0, Math.min(1, progress)));
    return (
        <svg width={radiusPx * 2 + strokePx * 2} height={radiusPx * 2 + strokePx * 2}
            style={{ transform: "rotate(-90deg)" }}>
            <circle cx={radiusPx + strokePx} cy={radiusPx + strokePx} r={radiusPx}
                fill="none" stroke="#e2e8f0" strokeWidth={strokePx} />
            <circle cx={radiusPx + strokePx} cy={radiusPx + strokePx} r={radiusPx}
                fill="none" stroke={color} strokeWidth={strokePx}
                strokeDasharray={circumference} strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s linear" }} />
        </svg>
    );
}

function DoctorVideoCallPage() {
    const searchParams = useSearchParams();
    const consultationId = searchParams.get("consultationId");
    const appointmentId = searchParams.get("appointmentId");
    const [appointment, setAppointment] = useState(null);
    const [resolvedConsultationId, setResolvedConsultationId] = useState(consultationId || null);
    const [now, setNow] = useState(Date.now());
    const [completing, setCompleting] = useState(false);
    const router = useRouter();
    const hasMeetLink = useRef(false);

    useEffect(() => {
        if (consultationId) loadConsultation(consultationId);
        else if (appointmentId) loadAppointment(appointmentId);
        else loadLatestAppointment();

        // Poll every 5s for meet_link if not yet available
        const pollInterval = setInterval(async () => {
            if (hasMeetLink.current) return;
            if (consultationId) await loadConsultation(consultationId);
            else if (appointmentId) await loadAppointment(appointmentId);
            else await loadLatestAppointment();
        }, 5000);

        const tickInterval = setInterval(() => setNow(Date.now()), 1000);

        return () => {
            clearInterval(pollInterval);
            clearInterval(tickInterval);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [consultationId, appointmentId]);

    const normalizeAppointment = (data) => {
        if (!data) return null;
        const meet_link = data.meet_link || data.meetLink || data.google_meet_link
            || data.hangout_link || data.join_url || data.start_url || data.url;
        return { ...data, meet_link };
    };

    const resolveConsultationId = async (appt) => {
        if (!appt) return;
        if (appt.meeting_id) { setResolvedConsultationId(appt.meeting_id); return; }
        if (appt.patient_id) {
            try {
                const consult = await fetchConsultationByPatientId(appt.patient_id);
                if (consult?.id) setResolvedConsultationId(consult.id);
            } catch { /* silent */ }
        }
    };

    const loadConsultation = async (id) => {
        try {
            const data = await fetchConsultationById(id);
            const normalized = normalizeAppointment(data);
            setAppointment(normalized);
            if (normalized?.meet_link) hasMeetLink.current = true;
            setResolvedConsultationId(id);
        } catch (err) {
            console.error("Failed to load consultation:", err);
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
            console.error("Failed to load appointment:", err);
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
            console.error("Failed to load latest appointment:", err);
        }
    };

    const handleCompleteMeeting = async () => {
        if (!resolvedConsultationId) { alert("No active consultation ID found."); return; }
        if (!confirm("Are you sure you want to end this clinical session? This will begin transcript processing.")) return;
        setCompleting(true);
        try {
            await markConsultationComplete(resolvedConsultationId);
            await loadConsultation(resolvedConsultationId);
        } catch (err) {
            console.error("Failed to complete meeting:", err);
            alert("Failed to mark session as complete. Please try again.");
        } finally {
            setCompleting(false);
        }
    };

    const handleViewSoap = () => {
        const id = resolvedConsultationId;
        if (id) {
            router.push(`/dashboard/doctor/patients/soap?consultationId=${id}`);
        } else if (appointment?.patient_id) {
            fetchConsultationByPatientId(appointment.patient_id)
                .then(c => {
                    if (c?.id) router.push(`/dashboard/doctor/patients/soap?consultationId=${c.id}`);
                    else alert("Could not find a linked consultation.");
                })
                .catch(() => alert("Could not find a linked consultation."));
        }
    };

    const isCompleted = appointment?.status === "completed";
    const completedAt = appointment?.completionTime || appointment?.completion_time;
    const diffMs = completedAt ? (new Date(completedAt).getTime() + COOLDOWN_MS) - now : 0;
    const isInCooldown = isCompleted && diffMs > 0;
    const cooldownProgress = completedAt ? Math.max(0, 1 - (diffMs / COOLDOWN_MS)) : 1;
    const minsLeft = Math.floor(Math.max(0, diffMs) / 60000);
    const secsLeft = Math.floor((Math.max(0, diffMs) % 60000) / 1000);

    const patientLabel = (() => {
        const name = appointment?.patientName || appointment?.patient_name || "";
        if (name && !name.toLowerCase().includes("encryp")) return `Session for: ${name}`;
        return "Secure Google Meet consultation session";
    })();

    return (
        <div className={styles.sessionContainer}>
            <Topbar />

            <main style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '40px', background: '#f8fafc', minHeight: 'calc(100vh - 72px)'
            }}>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <div style={{
                    background: '#ffffff', padding: '48px 64px', borderRadius: '24px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.06)', border: '1px solid #eef2f7',
                    textAlign: 'center', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '20px', maxWidth: '520px', width: '100%'
                }}>

                    {/* ── Icon / Progress Ring ── */}
                    {isInCooldown ? (
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ProgressRing radiusPx={44} strokePx={5} progress={cooldownProgress} color="#3b82f6" />
                            <div style={{
                                position: 'absolute', fontSize: '13px', fontWeight: '800',
                                color: '#3b82f6', lineHeight: 1.1, textAlign: 'center'
                            }}>
                                <div>{minsLeft}:{secsLeft.toString().padStart(2, '0')}</div>
                                <div style={{ fontSize: '9px', fontWeight: '600', color: '#64748b', marginTop: '2px' }}>left</div>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: isCompleted ? '#f0fdf4' : '#eff6ff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            {isCompleted ? (
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            ) : (
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <path d="M15 8V16H5V8H15M16 6H4C3.45 6 3 6.45 3 7V17C3 17.55 3.45 18 4 18H16C16.55 18 17 17.55 17 17V13.5L21 17.5V6.5L17 10.5V7C17 6.45 16.55 6 16 6Z" fill="#3B82F6" />
                                </svg>
                            )}
                        </div>
                    )}

                    {/* ── Title / Status ── */}
                    <div>
                        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>
                            {isInCooldown ? "Syncing Transcript…"
                                : isCompleted ? "Session Complete"
                                    : "Active Consultation"}
                        </h2>
                        <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: 1.6, maxWidth: '340px' }}>
                            {isInCooldown
                                ? "Google Meet is uploading the transcript to Google Drive. The SOAP generation button will unlock when the transcript is ready."
                                : isCompleted
                                    ? "The transcript has been synced. You can now generate the SOAP note."
                                    : patientLabel}
                        </p>
                    </div>

                    {/* ── Progress Steps (cooldown) ── */}
                    {isInCooldown && (
                        <div style={{
                            background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px',
                            padding: '16px 20px', width: '100%', textAlign: 'left'
                        }}>
                            {[
                                { label: "Session Ended", done: true },
                                { label: "Google Meet uploading transcript to Drive…", done: false, active: true },
                                { label: "AI Analysis & SOAP Generation", done: false },
                            ].map((step, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: i < 2 ? '12px' : 0 }}>
                                    <div style={{
                                        width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                                        background: step.done ? '#16a34a' : step.active ? '#3b82f6' : '#e2e8f0',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {step.done ? (
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                        ) : step.active ? (
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" style={{ animation: 'spin 1.5s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                        ) : (
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8' }} />
                                        )}
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: step.active ? '600' : '400', color: step.done ? '#16a34a' : step.active ? '#1d4ed8' : '#94a3b8' }}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Join Google Meet Button ── */}
                    {!isCompleted && (
                        <button
                            onClick={() => window.open(appointment?.meet_link, "_blank")}
                            disabled={!appointment?.meet_link}
                            style={{
                                background: !appointment?.meet_link ? '#cbd5e1' : '#3b82f6',
                                color: 'white', border: 'none', padding: '15px 32px',
                                borderRadius: '12px', fontWeight: '700', fontSize: '16px',
                                cursor: !appointment?.meet_link ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s', width: '100%',
                                boxShadow: !appointment?.meet_link ? 'none' : '0 4px 12px rgba(59,130,246,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M15 8V16H5V8H15M16 6H4C3.45 6 3 6.45 3 7V17C3 17.55 3.45 18 4 18H16C16.55 18 17 17.55 17 17V13.5L21 17.5V6.5L17 10.5V7C17 6.45 16.55 6 16 6Z" fill="white" />
                            </svg>
                            {appointment?.meet_link ? "Join Google Meet" : "Meeting Link Unavailable"}
                        </button>
                    )}

                    {/* ── Complete Session / Countdown / View SOAP ── */}
                    {!isCompleted ? (
                        <button
                            onClick={handleCompleteMeeting}
                            disabled={completing || !resolvedConsultationId}
                            style={{
                                background: !resolvedConsultationId || completing ? '#f1f5f9' : '#0f172a',
                                color: !resolvedConsultationId || completing ? '#94a3b8' : 'white',
                                border: '1px solid #e2e8f0', padding: '14px 32px', borderRadius: '12px',
                                fontWeight: '700', fontSize: '15px',
                                cursor: !resolvedConsultationId || completing ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s', width: '100%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                            }}
                        >
                            {completing ? (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: "spin 1.5s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                    Completing Session…
                                </>
                            ) : "✅ Complete Clinical Session"}
                        </button>
                    ) : (
                        <button
                            onClick={handleViewSoap}
                            disabled={isInCooldown}
                            style={{
                                background: isInCooldown
                                    ? 'linear-gradient(135deg, #f1f5f9, #e2e8f0)'
                                    : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                color: isInCooldown ? '#94a3b8' : 'white',
                                border: '1px solid ' + (isInCooldown ? '#e2e8f0' : '#1d4ed8'),
                                padding: '16px 32px', borderRadius: '12px',
                                fontWeight: '700', fontSize: '15px',
                                cursor: isInCooldown ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s', width: '100%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                boxShadow: isInCooldown ? 'none' : '0 4px 12px rgba(59,130,246,0.3)'
                            }}
                        >
                            {isInCooldown ? (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 2s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                    Syncing… {minsLeft}m {secsLeft.toString().padStart(2, '0')}s
                                </>
                            ) : "📄 View & Generate SOAP"}
                        </button>
                    )}

                    {!appointment?.meet_link && !isCompleted && (
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