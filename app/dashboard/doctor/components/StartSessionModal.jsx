"use client";
import { useState, useEffect } from "react";
import styles from "../DoctorDashboard.module.css";
import { fetchAppointments, createConsultation } from "@/services/doctor";
import { CheckCircle, Video, X } from "lucide-react";

export default function StartSessionModal({ isOpen, onClose, onSessionStarted }) {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAptId, setSelectedAptId] = useState(null);
    const [step, setStep] = useState(1); // 1: Select Patient, 2: Checklist
    const [consentVerified, setConsentVerified] = useState(false);
    const [recordingReady, setRecordingReady] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            loadTodayAppointments();
            setStep(1);
            setConsentVerified(false);
            setRecordingReady(false);
            setSelectedAptId(null);
        }
    }, [isOpen]);

    const loadTodayAppointments = async () => {
        setLoading(true);
        try {
            const data = await fetchAppointments();
            // Filter for today's appointments
            const today = new Date().toISOString().split('T')[0];
            const filtered = data.filter(apt => {
                const aptDate = new Date(apt.requested_date || apt.date || apt.scheduled_at).toISOString().split('T')[0];
                return aptDate === today;
            });
            setAppointments(filtered);
        } catch (err) {
            console.error("Failed to load appointments:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleProceedToChecklist = () => {
        if (!selectedAptId) {
            setError("Please select a patient to proceed.");
            return;
        }
        setStep(2);
        setError("");
    };

    const handleStartMeet = async () => {
        if (!consentVerified || !recordingReady) {
            setError("Please verify all checklist items.");
            return;
        }

        const appointment = appointments.find(a => a.id === selectedAptId);
        if (!appointment) return;

        try {
            const patient_id = appointment.patient_id || appointment.user_id;
            const session = await createConsultation({
                patient_id,
                appointment_id: appointment.id,
                scheduled_at: new Date().toISOString(),
                visit_type: "video"
            });

            if (session?.meet_link) {
                window.open(session.meet_link, "_blank");
                if (onSessionStarted) onSessionStarted(session);
                onClose();
            } else {
                setError("Failed to generate meeting link.");
            }
        } catch (err) {
            setError(err.message || "Failed to initiate session.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} style={{ maxWidth: "400px" }}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>
                        {step === 1 ? "Start New Session" : "Pre-Visit Checklist"}
                    </h3>
                    <p className={styles.modalSub}>
                        {step === 1
                            ? "Select a patient scheduled for today."
                            : "Verify pre-requisites before initializing session."}
                    </p>
                </div>

                <div style={{ padding: '20px' }}>
                    {step === 1 ? (
                        <>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '10px' }}>Loading schedule...</div>
                            ) : appointments.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '10px', color: '#94a3b8', fontSize: '13px' }}>
                                    No appointments for today.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto', padding: '2px' }}>
                                    {appointments.map(apt => (
                                        <div
                                            key={apt.id}
                                            className={`${styles.checkboxItem} ${selectedAptId === apt.id ? styles.checkboxItemActive : ""}`}
                                            onClick={() => setSelectedAptId(apt.id)}
                                            style={{ cursor: 'pointer', padding: '10px' }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '600', fontSize: '13px', color: selectedAptId === apt.id ? '#1e3a8a' : '#1e293b' }}>
                                                    {apt.patient_name || "Unknown Patient"}
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                    {new Date(apt.requested_date || apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            {selectedAptId === apt.id && <CheckCircle size={16} color="#3b82f6" />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={styles.checkboxGroup}>
                            <label className={`${styles.checkboxItem} ${consentVerified ? styles.checkboxItemActive : ""}`} style={{ padding: '10px' }}>
                                <input
                                    type="checkbox"
                                    checked={consentVerified}
                                    onChange={(e) => setConsentVerified(e.target.checked)}
                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                                <span className={`${styles.checkboxLabel} ${consentVerified ? styles.checkboxLabelActive : ""}`} style={{ fontSize: '13px' }}>
                                    Patient Consent Verified
                                </span>
                            </label>
                            <label className={`${styles.checkboxItem} ${recordingReady ? styles.checkboxItemActive : ""}`} style={{ padding: '10px' }}>
                                <input
                                    type="checkbox"
                                    checked={recordingReady}
                                    onChange={(e) => setRecordingReady(e.target.checked)}
                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                                <span className={`${styles.checkboxLabel} ${recordingReady ? styles.checkboxLabelActive : ""}`} style={{ fontSize: '13px' }}>
                                    Hardware Ready
                                </span>
                            </label>
                        </div>
                    )}

                    {error && <div className={styles.errorMsg} style={{ marginTop: '12px', textAlign: 'center' }}>{error}</div>}
                </div>

                <div className={styles.modalActions} style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <button className={styles.detailsBtn} onClick={step === 2 ? () => setStep(1) : onClose} style={{ height: '32px', fontSize: '12px' }}>
                        {step === 2 ? "Back" : "Cancel"}
                    </button>
                    {step === 1 ? (
                        <button
                            className={styles.primaryBtn}
                            onClick={handleProceedToChecklist}
                            disabled={!selectedAptId}
                            style={{ background: !selectedAptId ? '#cbd5e1' : '', height: '32px', fontSize: '12px' }}
                        >
                            Continue
                        </button>
                    ) : (
                        <button
                            className={styles.primaryBtn}
                            onClick={handleStartMeet}
                            disabled={!consentVerified || !recordingReady}
                            style={{ background: (!consentVerified || !recordingReady) ? '#cbd5e1' : '', height: '32px', fontSize: '12px' }}
                        >
                            <Video size={14} />
                            Join Meet
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
