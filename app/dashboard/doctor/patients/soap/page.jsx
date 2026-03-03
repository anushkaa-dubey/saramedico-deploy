"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { fetchConsultationById } from "@/services/consultation";
import Topbar from "../../components/Topbar";
import styles from "./SoapNotes.module.css";
import messages from "@/public/icons/messages.svg";
import docs from "@/public/icons/docs.svg";
import { motion } from "framer-motion";

export default function SoapNotesPage() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const [consultation, setConsultation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadConsultation(id);
        } else {
            setLoading(false);
        }
    }, [id]);

    const loadConsultation = async (consultId) => {
        setLoading(true);
        try {
            const data = await fetchConsultationById(consultId);
            setConsultation(data);
        } catch (err) {
            console.error("Failed to fetch consultation:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            Loading clinical encounter...
        </div>
    );

    if (!consultation && !loading) return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <Topbar />
            <div style={{ marginTop: '100px' }}>
                <h2>Encounter Note Not Found</h2>
                <p>Backend not connected — could not retrieve record #{id}</p>
            </div>
        </div>
    );

    const patient = consultation?.patient || {};
    const soap = consultation?.soap_note || {};

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Topbar />

            {/* Patient Header */}
            <div className={styles.patientHeader}>
                <div className={styles.pName}>{patient.full_name || consultation?.patient_name || "Patient Record"}</div>
                <div className={styles.pMeta}>DOB: {patient.dob || "N/A"}</div>
                <div className={styles.pMeta}>MRN: {patient.mrn || "N/A"}</div>

                <div className={styles.pDetailGroup} style={{ marginLeft: 'auto' }}>
                    <span className={styles.pLabel}>REASON FOR VISIT</span>
                    <span className={styles.pValue}>{consultation?.chief_complaint || consultation?.reason || "Consultation"}</span>
                </div>

                <div className={styles.pDetailGroup}>
                    <span className={styles.pLabel}>VISIT TYPE</span>
                    <span className={styles.pValue}>{consultation?.visit_type || "Follow Up"}</span>
                </div>

                <div className={styles.pDetailGroup}>
                    <span className={styles.pLabel}>VISIT DATE</span>
                    <span className={styles.pValue}>{consultation?.scheduled_at ? new Date(consultation.scheduled_at).toLocaleDateString() : "Today"}</span>
                </div>
            </div>

            <div className={styles.contentGrid}>
                {/* Left Column: SOAP Notes */}
                <div className={styles.leftCol}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.headerTitle}>
                                <img src={docs.src} alt="Summary" width={20} />
                                Encounter Note (SOAP)
                            </div>
                            <button className={styles.editBtn}>+ Edit Note</button>
                        </div>

                        {/* Subjective */}
                        <div className={styles.soapSection}>
                            <span className={styles.sectionLabel}>SUBJECTIVE</span>
                            <div className={styles.textBlock}>
                                {soap.subjective || consultation?.transcription || "No subjective data recorded for this session."}
                            </div>
                        </div>

                        {/* Objective */}
                        <div className={styles.soapSection}>
                            <span className={styles.sectionLabel}>OBJECTIVE</span>
                            <div className={styles.textBlock}>
                                {soap.objective || "No physical examination or objective markers recorded."}
                            </div>
                        </div>

                        {/* Assessment */}
                        <div className={styles.soapSection}>
                            <span className={styles.sectionLabel}>ASSESSMENT</span>
                            <div className={styles.textBlock}>
                                {soap.assessment || consultation?.summary || "Clinical assessment pending further diagnostics."}
                            </div>
                        </div>

                        {/* Plan */}
                        <div className={styles.soapSection}>
                            <span className={styles.sectionLabel}>PLAN</span>
                            <div className={styles.textBlock}>
                                {soap.plan || "Follow up as directed by clinical protocol."}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Summary & Sidebar */}
                <div className={styles.rightCol}>

                    {/* Summary Section */}
                    <div className={styles.summaryHeader}>
                        <img src={messages.src} alt="Summary" width={20} />
                        <span>AI Assistant Summary</span>
                    </div>

                    <div className={styles.subHeader}>DETECTED CLINICAL SIGNALS</div>
                    <div className={styles.tagsRow}>
                        {consultation?.urgency_level === "High" && <span className={`${styles.tag} ${styles.tagRed}`}>• High Urgency</span>}
                        <span className={`${styles.tag} ${styles.tagRed}`}>• {consultation?.visit_state || "Active"}</span>
                        <span className={`${styles.tag} ${styles.tagYellow}`}>• Analysis Complete</span>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '20px 0' }} />

                    <div className={styles.subHeader}>CLINICAL SEARCH & REMEDIES</div>
                    <input type="text" placeholder="Search Conditions, coding, notes..." className={styles.searchBox} />

                    <div className={styles.infoCard}>
                        <div className={styles.infoCardHeader}>
                            <span className={styles.infoTitle}>Session Transcript Summary</span>
                            <span className={styles.infoIcon}>↗</span>
                        </div>
                        <p className={styles.infoText}>
                            {consultation?.summary || "Automated clinical summary will appear here after session analysis is finalized."}
                        </p>
                    </div>

                    <div className={styles.infoCard}>
                        <div className={styles.infoCardHeader}>
                            <span className={styles.infoTitle}>Status: {consultation?.status || "Processed"}</span>
                        </div>
                        <p className={styles.infoText}>
                            Record ID: {consultation?.id}
                        </p>
                    </div>

                </div>
            </div>
        </motion.div>
    );
}
