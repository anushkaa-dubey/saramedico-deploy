"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Topbar from "../components/Topbar";
import styles from "./VideoCall.module.css";
import contactIcon from "@/public/icons/contact.svg";
import { motion } from "framer-motion";
import { fetchAppointments, fetchConsultationDetails, fetchAppointmentById } from "@/services/patient";

function VideoCallContent() {
    const [appointment, setAppointment] = useState(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const consultationId = searchParams.get("consultationId");
    const appointmentId = searchParams.get("appointmentId");

    useEffect(() => {
        loadSession();
        // Poll for link if not yet available
        const interval = setInterval(async () => {
            if (!appointment?.meet_link) {
                await loadSession();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [consultationId, appointmentId, !!appointment?.meet_link]);

    const normalizeAppointment = (data) => {
        if (!data) return null;
        return {
            ...data,
            doctor_name: data.doctorName || data.doctor_name || "Doctor",
            meet_link: data.meetLink || data.meet_link || data.google_meet_link || data.hangout_link || data.join_url || data.start_url || data.url
        };
    };

    const loadSession = async () => {
        try {
            if (consultationId) {
                const detail = await fetchConsultationDetails(consultationId);
                if (detail) {
                    setAppointment(normalizeAppointment(detail));
                    return;
                }
            }

            if (appointmentId) {
                const appt = await fetchAppointmentById(appointmentId);
                if (appt) {
                    setAppointment(normalizeAppointment(appt));
                    return;
                }
            }

            // Fallback: search for active consultations
            try {
                const consultations = await fetchMyConsultations();
                const activeConsultRaw = Array.isArray(consultations) ? consultations.find(c => c.status === 'scheduled' || c.status === 'active') : null;
                if (activeConsultRaw) {
                    setAppointment(normalizeAppointment(activeConsultRaw));
                    return;
                }
            } catch (cErr) {
                console.warn("Consultation fetch failed:", cErr);
            }

            const appointments = await fetchAppointments();
            // Get most recent next 'accepted' appointment
            const next = appointments
                .filter(a => a.status === 'accepted')
                .sort((a, b) => new Date(a.requested_date) - new Date(b.requested_date))[0];

            if (next) {
                setAppointment(normalizeAppointment(next));
            }
        } catch (err) {
            console.error("Failed to load session link:", err);
        }
    };

    const handleJoinMeet = () => {
        const link = appointment?.meet_link;

        if (link) {
            window.open(link, "_blank");
        } else {
            alert("Meeting link not available yet. Please wait for the doctor.");
        }
    };

    return (
        <div className={styles.sessionContainer}>
            <Topbar />

            <div className={styles.patientHeader}>
                <h2 className={styles.sessionTitle}>
                    Consultation with {appointment?.doctor_name || appointment?.doctorName || "your doctor"}
                </h2>
                <div className={styles.sessionStatus}>
                    <div className={styles.pulseDot}></div>
                    <span>Provider is preparing session</span>
                </div>
            </div>

            <main className={styles.meetJoinArea}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.joinCard}
                >
                    <div className={styles.meetIcon}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                            <path d="M15 8V16H5V8H15M16 6H4C3.45 6 3 6.45 3 7V17C3 17.55 3.45 18 4 18H16C16.55 18 17 17.55 17 17V13.5L21 17.5V6.5L17 10.5V7C17 6.45 16.55 6 16 6Z" fill="#3B82F6" />
                        </svg>
                    </div>
                    <h3>Ready to Join?</h3>
                    <p>This session will take place on Google Meet.</p>

                    <div className={styles.joinActions}>
                        <button
                            className={styles.joinMeetBtn}
                            onClick={handleJoinMeet}
                            disabled={!appointment?.meet_link}
                            style={{
                                background: !appointment?.meet_link ? '#cbd5e1' : '#3b82f6',
                                cursor: !appointment?.meet_link ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {appointment?.meet_link ? "Join Google Meet" : "Link Not Ready"}
                        </button>
                        <button className={styles.secondaryBtn} onClick={() => router.push("/dashboard/patient")}>
                            Back to Dashboard
                        </button>
                    </div>

                    {!appointment?.meet_link && (
                        <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '16px', fontWeight: 500 }}>
                            Waiting for the doctor to provide the meeting link.
                        </p>
                    )}

                </motion.div>
            </main>
        </div>
    );
}

export default function VideoCallPage() {
    return (
        <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Connecting to session...</div>}>
            <VideoCallContent />
        </Suspense>
    );
}
