"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Topbar from "../components/Topbar";
import SOAPEditor from "./components/SOAPEditor";
import AssistPanel from "./components/AssistPanel";
import VideoBox from "./components/VideoBox";
import ChatBox from "./components/ChatBox";
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
    const [transcript, setTranscript] = useState([]);
    const [zoomClient, setZoomClient] = useState(null);
    const router = useRouter();

    const suggestedTags = ["Migraine", "Nausea", "Photophobia", "Acrophobia"];

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsCalling(false);
        }, 1500);
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
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [isCalling]);

    const handleEndCall = () => {
        if (zoomClient) {
            zoomClient.leave().catch(console.error);
        }
        router.push("/dashboard/doctor");
    };

    if (isCalling) {
        return (
            <div className={styles.screen}>
                <div className={styles.transitionContainer}>
                    <img src={contactIcon.src} alt="Call" className={styles.callIcon} />
                    <h2 style={{ marginTop: '16px' }}>Connecting to Session...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.sessionContainer}>
            <Topbar />
            {/* will fetch patient data here. */}
            <section className={styles.patientInfoBar}>
                <div className={styles.patientMain}>
                    <span className={styles.patientName}>Benjamin Frank</span>
                </div>
                <div className={styles.patientMeta}>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>ID</span>
                        <span className={styles.metaValue}>#28993</span>
                    </div>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>REASON</span>
                        <span className={styles.metaValue}>Recurring Migraines</span>
                    </div>
                </div>
            </section>

            <main className={styles.mainGrid}>
                {/* LEFT COLUMN: VIDEO & CHAT */}
                <div className={styles.leftColumn}>
                    <div className={styles.videoAreaWrapper}>
                        <VideoBox
                            userRole="doctor"
                            userName="Dr. Sarah Smith"
                            onClientReady={(client) => setZoomClient(client)}
                            onEndCall={handleEndCall}
                        />
                    </div>
                    <div className={styles.chatAreaWrapper}>
                        <ChatBox
                            currentUser="Dr. Sarah Smith"
                            isDoctor={true}
                            zoomClient={zoomClient}
                        />
                    </div>
                </div>

                {/* RIGHT COLUMN: TRANSCRIPT, SOAP, ASSIST */}
                <div className={styles.rightColumn}>
                    <div className={styles.transcriptCard}>
                        <div className={styles.toolHeader}>
                            <span>Real-time Transcript</span>
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
        </div>
    );
}
