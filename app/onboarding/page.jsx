"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Onboarding.module.css";
import { motion, AnimatePresence } from "framer-motion";

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const router = useRouter();

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            router.push("/dashboard/doctor");
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    return (
        <div className={styles.container}>
            {/* Progress Header */}
            <div className={styles.header}>
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>⚡</span> SARA
                </div>
                <div className={styles.progressContainer}>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${((step - 1) / 2) * 100}%` }}
                        ></div>
                    </div>
                    <div className={styles.stepsText}>
                        Step {step} of 3
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <Step1Specialty key="step1" onNext={handleNext} />
                    )}
                    {step === 2 && (
                        <Step2Upload key="step2" onNext={handleNext} onBack={handleBack} />
                    )}
                    {step === 3 && (
                        <Step3MicTest key="step3" onNext={handleNext} onBack={handleBack} />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// Step 1: Specialty Selection
function Step1Specialty({ onNext }) {
    const [selected, setSelected] = useState("");
    const specialties = [
        { id: "gp", label: "General Practice", icon: "🩺" },
        { id: "cardio", label: "Cardiology", icon: "❤️" },
        { id: "neuro", label: "Neurology", icon: "🧠" },
        { id: "ortho", label: "Orthopedics", icon: "🦴" },
        { id: "peds", label: "Pediatrics", icon: "👶" },
        { id: "psych", label: "Psychiatry", icon: "🛋️" }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={styles.stepContainer}
        >
            <h1 className={styles.title}>What is your specialty?</h1>
            <p className={styles.subtitle}>
                We calibrate Sara's medical vocabulary based on your field of practice.
            </p>

            <div className={styles.grid}>
                {specialties.map((spec) => (
                    <button
                        key={spec.id}
                        className={`${styles.card} ${selected === spec.id ? styles.selected : ""}`}
                        onClick={() => setSelected(spec.id)}
                    >
                        <span className={styles.cardIcon}>{spec.icon}</span>
                        <span className={styles.cardLabel}>{spec.label}</span>
                    </button>
                ))}
            </div>

            <div className={styles.footer}>
                <button
                    className={styles.primaryBtn}
                    disabled={!selected}
                    onClick={onNext}
                >
                    Continue
                </button>
            </div>
        </motion.div>
    );
}

// Step 2: Sample Upload
function Step2Upload({ onNext, onBack }) {
    const [isUploading, setIsUploading] = useState(false);
    const [file, setFile] = useState(null);

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) setFile(droppedFile);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={styles.stepContainer}
        >
            <h1 className={styles.title}>Upload a Sample Note</h1>
            <p className={styles.subtitle}>
                Sara learns your writing style and formatting preferences from your past notes.
            </p>

            <div
                className={`${styles.uploadZone} ${file ? styles.hasFile : ""}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                {file ? (
                    <div className={styles.filePreview}>
                        <span className={styles.fileIcon}>📄</span>
                        <span className={styles.fileName}>{file.name}</span>
                        <button className={styles.removeFile} onClick={() => setFile(null)}>×</button>
                    </div>
                ) : (
                    <>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <h3>Drag & drop a de-identified note</h3>
                        <p>PDF, DOCX, or TXT</p>
                        <button className={styles.browseBtn}>Browse Files</button>
                    </>
                )}
            </div>

            <div className={styles.footer}>
                <button className={styles.secondaryBtn} onClick={onBack}>Back</button>
                <button
                    className={styles.primaryBtn}
                    onClick={onNext}
                >
                    {file ? "Analyze & Continue" : "Skip for Now"}
                </button>
            </div>
        </motion.div>
    );
}

// Step 3: Mic Test
function Step3MicTest({ onNext, onBack }) {
    const [isListening, setIsListening] = useState(false);
    const [volume, setVolume] = useState(0);

    const toggleMic = () => {
        if (isListening) {
            setIsListening(false);
            setVolume(0);
        } else {
            setIsListening(true);
            // Simulate volume changes
            const interval = setInterval(() => {
                setVolume(Math.random() * 100);
            }, 100);
            setTimeout(() => clearInterval(interval), 5000);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={styles.stepContainer}
        >
            <h1 className={styles.title}>Let's check your audio</h1>
            <p className={styles.subtitle}>
                We need clear audio to accurately transcribe your consultations.
            </p>

            <div className={styles.micCheckContainer}>
                <div className={styles.visualizer}>
                    {[...Array(10)].map((_, i) => (
                        <div
                            key={i}
                            className={styles.bar}
                            style={{
                                height: isListening ? `${20 + Math.random() * 60}%` : '20%',
                                background: isListening ? '#359aff' : '#cbd5e1'
                            }}
                        ></div>
                    ))}
                </div>

                <button
                    className={`${styles.micButton} ${isListening ? styles.active : ""}`}
                    onClick={toggleMic}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                    {isListening ? "Listening..." : "Test Microphone"}
                </button>

                <p className={styles.micStatus}>
                    {isListening ? "Great! We can hear you clearly." : "Click to test your input device"}
                </p>
            </div>

            <div className={styles.footer}>
                <button className={styles.secondaryBtn} onClick={onBack}>Back</button>
                <button className={styles.primaryBtn} onClick={onNext}>
                    Complete Setup
                </button>
            </div>
        </motion.div>
    );
}
