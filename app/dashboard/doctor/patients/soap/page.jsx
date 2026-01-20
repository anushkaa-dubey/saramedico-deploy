"use client";
import Topbar from "../../components/Topbar";
import styles from "./SoapNotes.module.css";
import messages from "@/public/icons/messages.svg";
import docs from "@/public/icons/docs.svg";
import { motion } from "framer-motion";

export default function SoapNotesPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Topbar />

            {/* Patient Header */}
            <div className={styles.patientHeader}>
                <div className={styles.pName}>Benjamin Frank</div>
                <div className={styles.pMeta}>DOB: 01/12/2024</div>
                <div className={styles.pMeta}>MRN: #28993</div>

                <div className={styles.pDetailGroup} style={{ marginLeft: 'auto' }}>
                    <span className={styles.pLabel}>REASON FOR VISIT</span>
                    <span className={styles.pValue}>Recurring Migraines & Nausea</span>
                </div>

                <div className={styles.pDetailGroup}>
                    <span className={styles.pLabel}>LAST VITALS</span>
                    <span className={styles.pValue}>BP 120/80 | HR 72</span>
                </div>

                <div className={styles.pDetailGroup}>
                    <span className={styles.pLabel}>LAST VISIT</span>
                    <span className={styles.pValue}>12 OCT 2025</span>
                </div>
            </div>

            <div className={styles.contentGrid}>
                {/* Left Column: SOAP Notes */}
                <div className={styles.leftCol}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.headerTitle}>
                                <img src={docs.src} alt="Summary" />
                                SOAP Notes
                            </div>
                            <button className={styles.editBtn}>+ Edit</button>
                        </div>

                        {/* Subjective */}
                        <div className={styles.soapSection}>
                            <span className={styles.sectionLabel}>SUBJECTIVE</span>
                            <div className={styles.textBlock}>
                                Patient presents with persistent lower back pain. Reports stiffness in the mornings.
                                States stretching exercises have been partially effective but notes radiating pain down the left thigh.
                                Denies numbness or pain extending below the knees. Describes these issues with guidance.
                            </div>
                        </div>

                        {/* Objective */}
                        <div className={styles.soapSection}>
                            <span className={styles.sectionLabel}>OBJECTIVE</span>
                            <div className={styles.textBlock}>
                                Patient appears comfortable at rest but demonstrates guarded movement when standing.
                                Range of motion in lumbar spine limited in flexion. No visible antalgic gait noted today.
                            </div>
                        </div>

                        {/* Assessment */}
                        <div className={styles.soapSection}>
                            <span className={styles.sectionLabel}>ASSESSMENT</span>
                            <div className={styles.textBlock}>
                                Symptoms consistent with lumbar radiculopathy (L4-L5 Distribution). Unlikely disc herniation requiring surgical intervention at this stage given lack of neurological deficit.
                            </div>
                        </div>

                        {/* Plan */}
                        <div className={styles.soapSection}>
                            <span className={styles.sectionLabel}>PLAN</span>
                            <ul className={styles.listBlock}>
                                <li>Continue daily stretching regimen, modify to avoid pain.</li>
                                <li>Increase Naproxen to 500mg BID with food.</li>
                                <li>Follow up in 2 weeks.</li>
                                <li>Refer to PT if no improvement.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Column: Summary & Sidebar */}
                <div className={styles.rightCol}>

                    {/* Summary Section */}
                    <div className={styles.summaryHeader}>
                        <img src={messages.src} alt="Summary" />
                        <span>Summary</span>
                    </div>

                    <div className={styles.subHeader}>DETECTED SIGNALS</div>
                    <div className={styles.tagsRow}>
                        <span className={`${styles.tag} ${styles.tagRed}`}>• Migraine</span>
                        <span className={`${styles.tag} ${styles.tagRed}`}>• Acute Pain</span>
                        <span className={`${styles.tag} ${styles.tagRed}`}>• Anxiety</span>
                    </div>
                    <div className={styles.tagsRow}>
                        <span className={`${styles.tag} ${styles.tagYellow}`}>• Mobility Issues</span>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '20px 0' }} />

                    <div className={styles.subHeader}>CLINICAL SEARCH & REMEDIES</div>
                    <input type="text" placeholder="Search Conditions, notes..." className={styles.searchBox} />

                    <div className={styles.infoCard}>
                        <div className={styles.infoCardHeader}>
                            <span className={styles.infoTitle}>Examination Protocol</span>
                            <span className={styles.infoIcon}>↗</span>
                        </div>
                        <p className={styles.infoText}>
                            Symptoms consistent with lumbar radiculopathy (L4-L5 Distribution).
                            Unlikely disc herniation requiring surgical intervention at this stage given lack of neurological deficit.
                        </p>
                    </div>

                    <div className={styles.infoCard}>
                        <div className={styles.infoCardHeader}>
                            <span className={styles.infoTitle}>ICD: M75.1</span>
                            <span className={styles.addIcon}>+</span>
                        </div>
                        <p className={styles.infoText}>
                            Rotator cuff syndrome. Click to add to assessment.
                        </p>
                    </div>

                </div>
            </div>
        </motion.div>
    );
}
