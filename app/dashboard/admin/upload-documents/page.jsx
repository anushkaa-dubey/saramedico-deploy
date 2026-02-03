"use client";
import { useState } from "react";
import styles from "../AdminDashboard.module.css";
import uploadIcon from "@/public/icons/upload.svg";
import docIcon from "@/public/icons/docs.svg";
import eyeIcon from "@/public/icons/eye_details.svg";
import { motion } from "framer-motion";

export default function UploadDocuments() {
    const [activeStep, setActiveStep] = useState(0);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const patients = ["John Doe", "Jane Smith", "Robert Brown", "Sarah Wilson"];

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    return (
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div className={styles.titleRow} variants={itemVariants}>
                <div>
                    <h2 className={styles.heading}>Upload Patient Documents</h2>
                    <p className={styles.subtext}>Securely upload and process medical records with AI-powered PII redaction</p>
                </div>
            </motion.div>

            <motion.div className={styles.managementSection} variants={itemVariants}>
                <div className={styles.contextPanel} style={{ height: 'auto', opacity: 1 }}>
                    <div className={styles.panelContent}>
                        <div className={styles.progressiveFlow}>
                            <div className={styles.workflowStep}>
                                <span className={styles.stepNum}>1</span>
                                <div className={styles.stepDetails}>
                                    <label>Select Patient Profile</label>
                                    <select
                                        className={styles.input}
                                        value={selectedPatient || ""}
                                        onChange={(e) => {
                                            setSelectedPatient(e.target.value);
                                            setActiveStep(1);
                                        }}
                                    >
                                        <option value="" disabled>Choose a patient...</option>
                                        {patients.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>

                            {activeStep >= 1 && (
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={styles.workflowStep}>
                                    <span className={styles.stepNum}>2</span>
                                    <div className={styles.stepDetails}>
                                        <label>Upload & Process</label>
                                        <div className={styles.uploadGroup}>
                                            <input type="file" id="patient-upload" className={styles.hiddenInput} onChange={() => setActiveStep(2)} />
                                            <label htmlFor="patient-upload" className={styles.uploadBtn}>
                                                <img src={uploadIcon.src} alt="" width="16" /> Choose Files
                                            </label>
                                            {activeStep === 2 && <span className={styles.fileSelected}>record_v1.pdf selected</span>}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeStep >= 2 && (
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={styles.workflowStep}>
                                    <span className={styles.stepNum}>3</span>
                                    <div className={styles.stepDetails}>
                                        <label>Security Options</label>
                                        <div className={styles.toggleRow}>
                                            <img src={eyeIcon.src} alt="" width="16" />
                                            <span>PII Redaction Engine</span>
                                            <div className={styles.toggleSwitch}>
                                                <input type="checkbox" id="pii-toggle" defaultChecked />
                                                <label htmlFor="pii-toggle"></label>
                                            </div>
                                        </div>
                                        <button className={styles.submitProcessBtn}>Start Processing</button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
