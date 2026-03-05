"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Topbar from "../components/Topbar";
import SOAPEditor from "./components/SOAPEditor";
import AssistPanel from "./components/AssistPanel";
import styles from "./VideoCall.module.css";
import contactIcon from "@/public/icons/contact.svg";
import { motion } from "framer-motion";
import { fetchAppointments } from "@/services/doctor";

const FULL_TRANSCRIPT = [
    {
        id: 1,
        speaker: 'patient',
        text: "I've been facing discomfort in breathing, and severe headaches in uncontrollable frequency, my eyes go blur sometimes, sometimes they see a flash"
    },
    {
        id: 2,
        speaker: 'doctor',
        text: "What else do you think you do when it happens?"
    },
    {
        id: 3,
        speaker: 'patient',
        text: "I usually try to rest in a dark room. The headaches are worse with light and noise."
    },
    {
        id: 4,
        speaker: 'doctor',
        text: "How long have you been experiencing these symptoms?"
    }
];

export default function DoctorVideoCallPage() {
    const [transcript, setTranscript] = useState([]);
    const [appointment, setAppointment] = useState(null);
    const router = useRouter();

    const suggestedTags = ["Migraine", "Nausea", "Photophobia", "Acrophobia"];

    useEffect(() => {
        loadLatestAppointment();
    }, []);

    const loadLatestAppointment = async () => {
        try {
            const appointments = await fetchAppointments();
            const next = appointments
                .filter(a => a.status === 'accepted' || a.status === 'scheduled')
                .sort((a, b) => new Date(a.requested_date || a.scheduled_at) - new Date(b.requested_date || b.scheduled_at))[0];

            if (next) setAppointment(next);
        } catch (err) {
            console.error("Failed to load appointment for video call:", err);
        }
    };

    useEffect(() => {
        setTranscript([FULL_TRANSCRIPT[0]]);
        let index = 1;
        const interval = setInterval(() => {
            if (index < FULL_TRANSCRIPT.length) {
                setTranscript(prev => [...prev, FULL_TRANSCRIPT[index]]);
                index++;
            } else {
                clearInterval(interval);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleJoinMeet = () => {
        const link = appointment?.meet_link;
        if (link) {
            window.open(link, "_blank");
        } else {
            alert("No meeting link available for this session.");
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
                            {appointment?.patientName || appointment?.patient_name ? `Session for: ${appointment?.patientName || appointment?.patient_name}` : "Launch the secure Google Meet session to begin your consultation."}
                        </p>
                    </div>

                    <button
                        onClick={handleJoinMeet}
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

                    {appointment?.id && (
                        <button
                            onClick={() => router.push(`/dashboard/doctor/patients/soap?consultationId=${appointment.id}`)}
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
