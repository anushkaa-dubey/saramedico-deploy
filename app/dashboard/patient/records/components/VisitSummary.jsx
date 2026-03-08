"use client";

import { useState, useEffect } from "react";
import { fetchSoapNote, fetchConsultationDetails, fetchDoctors } from "@/services/patient";
import styles from "../Records.module.css";
import { motion, AnimatePresence } from "framer-motion";

export default function VisitSummary({ consultationId, onClose }) {
    const [consultation, setConsultation] = useState(null);
    const [soapNote, setSoapNote] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (consultationId) {
            loadDetails();
        }
    }, [consultationId]);

    const loadDetails = async () => {
        setLoading(true);
        try {
            const [details, soap, doctors] = await Promise.all([
                fetchConsultationDetails(consultationId),
                fetchSoapNote(consultationId).catch(() => null),
                fetchDoctors().catch(() => [])
            ]);

            const data = details;
            const doctorsData = Array.isArray(doctors) ? doctors : doctors?.results || doctors?.data || [];

            // Resolve doctor name if unknown
            if (!data.doctorName || data.doctorName === "Unknown Doctor") {
                const doc = doctorsData.find(d => d.id === data.doctorId || d.id === data.doctor_id);
                if (doc) {
                    const name = doc.full_name || doc.name || "Doctor";
                    data.doctorName = name.startsWith("Dr.") ? name : `Dr. ${name}`;
                } else {
                    data.doctorName = "Doctor";
                }
            } else if (!data.doctorName.startsWith("Dr.")) {
                data.doctorName = `Dr. ${data.doctorName}`;
            }

            setConsultation(data);
            setSoapNote(soap?.soap_note || soap);
        } catch (err) {
            console.error("Failed to load visit details:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                className={styles.modalOverlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className={styles.modalContent}
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={styles.modalHeader}>
                        <h2>Visit Summary</h2>
                        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                    </div>

                    {loading ? (
                        <div className={styles.modalLoading}>Loading summary...</div>
                    ) : !consultation ? (
                        <div className={styles.modalError}>Consultation not found.</div>
                    ) : (
                        <div className={styles.modalScroll}>
                            <div className={styles.visitHeader}>
                                <div className={styles.visitAvatar}>
                                    <img src={consultation.doctor_photo || "/dr-placeholder.png"} alt="Doctor" onError={(e) => e.target.src = "/dr-placeholder.png"} />
                                </div>
                                <div className={styles.visitInfo}>
                                    <p className={styles.visitDoctor}>Dr. {consultation.doctorName || "Doctor"}</p>
                                    <p className={styles.visitDate}>
                                        {new Date(consultation.scheduledAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                                <span className={styles.visitBadge}>{consultation.status?.toUpperCase()}</span>
                            </div>

                            {(consultation.diagnosis || consultation.prescription) && (
                                <div className={styles.visitSection}>
                                    <h3>Medical Summary</h3>
                                    <div className={styles.visitCard}>
                                        {consultation.diagnosis && (
                                            <div className={styles.visitSubRow}>
                                                <label>DIAGNOSIS</label>
                                                <p>{consultation.diagnosis}</p>
                                            </div>
                                        )}
                                        {consultation.prescription && (
                                            <div className={styles.visitSubRow}>
                                                <label>PRESCRIPTION</label>
                                                <p>{consultation.prescription}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className={styles.visitSection}>
                                <h3>Visit Analysis</h3>
                                {soapNote ? (
                                    <div className={styles.soapCard}>
                                        <div className={styles.soapPart}>
                                            <label>SUBJECTIVE</label>
                                            <p>{soapNote.subjective || "Not available"}</p>
                                        </div>
                                        <div className={styles.soapPart}>
                                            <label>OBJECTIVE</label>
                                            <p>{soapNote.objective || "Not available"}</p>
                                        </div>
                                        <div className={styles.soapPart}>
                                            <label>ASSESSMENT</label>
                                            <p>{soapNote.assessment || "Not available"}</p>
                                        </div>
                                        <div className={styles.soapPart}>
                                            <label>PLAN</label>
                                            <p>{soapNote.plan || "Not available"}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.emptySoap}>
                                        <p>AI Analysis is not available for this visit.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
