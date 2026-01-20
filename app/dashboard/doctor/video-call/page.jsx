"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Topbar from "../components/Topbar";
import SOAPEditor from "./components/SOAPEditor";
import AssistPanel from "./components/AssistPanel";
import styles from "./VideoCall.module.css";
import contactIcon from "@/public/icons/contact.svg";
import { motion } from "framer-motion";

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
    const [isCalling, setIsCalling] = useState(true);
    const [isRecording, setIsRecording] = useState(true);
    const [transcript, setTranscript] = useState([]);
    const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
    const router = useRouter();

    const suggestedTags = ["Migraine", "Nausea", "Photophobia", "Acrophobia"];

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsCalling(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isCalling) {
            setTranscript([FULL_TRANSCRIPT[0]]);

            let index = 1;
            const interval = setInterval(() => {
                if (index < FULL_TRANSCRIPT.length) {
                    setTranscript(prev => [...prev, FULL_TRANSCRIPT[index]]);
                    index++;
                } else {
                    clearInterval(interval);
                }
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [isCalling]);

    const toggleFullscreen = () => {
        setIsVideoFullscreen(!isVideoFullscreen);
    };

    if (isCalling) {
        return (
            <div className={styles.screen}>
                <div className={styles.transitionContainer}>
                    <div className={styles.callSymbol}>
                        <img src={contactIcon.src} alt="Call" className={styles.callIcon} />
                        <span className={styles.statusText}>Connecting to session...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={styles.sessionContainer}
        >
            <Topbar />

            <section className={styles.patientInfoBar}>
                <div className={styles.patientMain}>
                    <span className={styles.patientName}>Benjamin Frank</span>
                </div>
                <div className={styles.patientMeta}>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>DOB</span>
                        <span className={styles.metaValue}>01/12/2024</span>
                    </div>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>MRN</span>
                        <span className={styles.metaValue}>#28993</span>
                    </div>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>REASON FOR VISIT</span>
                        <span className={styles.metaValue}>Recurring Migraines & Nausea</span>
                    </div>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>LAST VITALS</span>
                        <span className={styles.metaValue}>BP 120/80 | HR 72</span>
                    </div>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>LAST VISIT</span>
                        <span className={styles.metaValue}>12 OCT 2025</span>
                    </div>
                </div>
            </section>

            {/* Video Display Section */}
            <div className={`${styles.videoSection} ${isVideoFullscreen ? styles.fullscreen : ''}`}>
                <div className={styles.videoContainer}>
                    <div className={styles.videoFeed}>
                        {/* Placeholder for actual video stream */}
                        <div className={styles.videoPlaceholder}>
                            <div className={styles.patientVideoLabel}>Patient Video Feed</div>
                        </div>
                    </div>

                    {/* Video Controls Overlay */}
                    <div className={styles.videoControls}>
                        <button className={styles.fullscreenBtn} onClick={toggleFullscreen} title={isVideoFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                            {isVideoFullscreen ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Recording Controls Bar */}
                <div className={styles.recordingBar}>
                    <div className={styles.recordingBadge}>
                        <div className={styles.dot}></div>
                        Recording
                    </div>
                    <div className={styles.timer}>04:53</div>
                    <div className={styles.waveform}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                            <div
                                key={i}
                                className={styles.waveBar}
                                style={{
                                    animationDelay: `${i * 0.1}s`,
                                    height: `${Math.random() * 20 + 10}px`,
                                    animationPlayState: isRecording ? 'running' : 'paused'
                                }}
                            ></div>
                        ))}
                    </div>
                    <button className={styles.stopBtn} onClick={() => setIsRecording(false)}>
                        <div style={{ width: 12, height: 12, background: 'white', borderRadius: 2 }}></div>
                        {isRecording ? "Stop" : "Stopped"}
                    </button>
                </div>
            </div>

            {/* 3-Column Layout: Transcript | SOAP | Assist */}
            <section className={styles.grid} style={{ padding: '0 24px 24px' }}>
                {/* Column 1: Transcript */}
                <div className={styles.transcriptColumn}>
                    <div className={styles.transcriptCard}>
                        <div className={styles.transcriptHeader}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#359aff" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <span className={styles.transcriptTitle}>Real-time Transcript</span>
                        </div>
                        <div className={styles.transcriptContent}>
                            {transcript.map((msg) => (
                                msg && (
                                    <div key={msg.id} className={`${styles.bubble} ${msg.speaker === 'doctor' ? styles.bubbleDoctor : styles.bubblePatient}`}>
                                        <strong style={{ fontSize: '11px', opacity: 0.7, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                                            {msg.speaker === 'doctor' ? 'Dr. Smith' : 'Patient'}
                                        </strong>
                                        {msg.text}
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </div>

                {/* Column 2: SOAP Note Editor */}
                <div className={styles.soapColumn}>
                    <SOAPEditor initialData={{
                        subjective: "Patient reports recurring migraines with visual disturbances (blurred vision, flashes of light). Symptoms worsen with light and noise. Patient seeks relief in dark, quiet environments.",
                        objective: "BP: 120/80 mmHg, HR: 72 bpm. Patient appears uncomfortable but alert.",
                        assessment: "Likely migraine with aura. Differential: tension headache, cluster headache.",
                        plan: "Prescribe sumatriptan 50mg as needed. Recommend dark room rest, hydration. Follow-up in 2 weeks."
                    }} />
                </div>

                {/* Column 3: Assist Panel */}
                <div className={styles.assistColumn}>
                    <AssistPanel suggestedTags={suggestedTags} />
                </div>
            </section>
        </motion.div>
    );
}
