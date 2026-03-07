"use client";
import { useState, useEffect } from "react";
import styles from "../AdminDashboard.module.css";
import uploadIcon from "@/public/icons/upload.svg";
import docIcon from "@/public/icons/docs.svg";
import eyeIcon from "@/public/icons/eye_details.svg";
import { motion } from "framer-motion";
import { fetchPatients, uploadPatientDocument } from "@/services/doctor";

export default function UploadDocuments() {
    const [activeStep, setActiveStep] = useState(0);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patients, setPatients] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("");

    useEffect(() => {
        const loadPatients = async () => {
            try {
                const data = await fetchPatients();
                setPatients(data || []);
            } catch (err) {
                console.error("Failed to fetch patients:", err);
            }
        };
        loadPatients();
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setActiveStep(2);
        }
    };

    const handleStartProcessing = async () => {
        if (!selectedPatient || !selectedFile) return;

        setIsUploading(true);
        setUploadStatus("Uploading...");

        try {
            const patientObj = patients.find(p => p.id === selectedPatient || p.name === selectedPatient);
            const patientId = patientObj?.id || selectedPatient;

            await uploadPatientDocument(patientId, selectedFile, {
                category: "other",
                title: selectedFile.name
            });

            setUploadStatus("Success! AI processing started.");
            setTimeout(() => {
                setActiveStep(0);
                setSelectedFile(null);
                setSelectedPatient(null);
                setUploadStatus("");
            }, 3000);
        } catch (err) {
            console.error("Upload failed:", err);
            setUploadStatus(`Error: ${err.message}`);
        } finally {
            setIsUploading(false);
        }
    };

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
                                            if (activeStep < 1) setActiveStep(1);
                                        }}
                                    >
                                        <option value="" disabled>Choose a patient...</option>
                                        {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            {activeStep >= 1 && (
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={styles.workflowStep}>
                                    <span className={styles.stepNum}>2</span>
                                    <div className={styles.stepDetails}>
                                        <label>Upload & Process</label>
                                        <div className={styles.uploadGroup}>
                                            <input type="file" id="patient-upload" className={styles.hiddenInput} onChange={handleFileChange} />
                                            <label htmlFor="patient-upload" className={styles.uploadBtn}>
                                                <img src={uploadIcon.src} alt="" width="16" /> {selectedFile ? "Change File" : "Choose Files"}
                                            </label>
                                            {selectedFile && <span className={styles.fileSelected}>{selectedFile.name}</span>}
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
                                        <button
                                            className={styles.submitProcessBtn}
                                            onClick={handleStartProcessing}
                                            disabled={isUploading}
                                        >
                                            {isUploading ? "Processing..." : "Start Processing"}
                                        </button>
                                        {uploadStatus && <p className={styles.statusMsg} style={{ marginTop: '10px', fontSize: '13px', color: uploadStatus.startsWith('Error') ? '#ef4444' : '#10b981' }}>{uploadStatus}</p>}
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
