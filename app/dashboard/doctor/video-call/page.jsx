"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import styles from "./VideoCall.module.css";
import contactIcon from "@/public/icons/contact.svg";

const FULL_TRANSCRIPT = [
    {
        id: 1,
        speaker: 'patient',
        text: "Ive been facing discomfort in breathing, and severe headaches in uncontrollable frequency, my eyes go blur sometimes, sometimes they see a flash"
    },
    {
        id: 2,
        speaker: 'doctor',
        text: "What else do you think you do when it happens?"
    }
];

export default function DoctorVideoCallPage() {
    const [isCalling, setIsCalling] = useState(true);
    const [isRecording, setIsRecording] = useState(true);
    const [transcript, setTranscript] = useState([]);
    const [noteInput, setNoteInput] = useState("");
    const router = useRouter();

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
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isCalling]);

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
        <div className={styles.sessionWrapper}>
            <Sidebar />
            <main className={styles.mainContent}>
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

                <section className={styles.grid}>
                    <div className={styles.leftCol}>
                        <div className={styles.videoCard}>
                            <button className={styles.expandBtn}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                                </svg>
                            </button>
                        </div>

                        <div className={styles.controlsCard}>
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
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9 9h6v6H9z" /></svg>
                                </button>
                                <button className={styles.stopBtn} onClick={() => setIsRecording(false)}>
                                    <div style={{ width: 12, height: 12, background: 'white', borderRadius: 2 }}></div> {isRecording ? "Stop" : "Stopped"}
                                </button>
                            </div>
                        </div>

                        <div className={styles.entitiesCard}>
                            <div className={styles.entitiesHeader}>
                                <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Detected Entities</h3>
                                <button className={styles.addTagBtn}>+ Add Tag</button>
                            </div>
                            <div className={styles.tags}>
                                <span className={`${styles.tag} ${styles.tagDanger}`}>• Migraine</span>
                                <span className={`${styles.tag} ${styles.tagDanger}`}>• Nausea</span>
                                <span className={`${styles.tag} ${styles.tagDanger}`}>• Photophobia</span>
                                <span className={`${styles.tag} ${styles.tagWarning}`}>• Acrophobia</span>
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Past Sessions</h3>
                            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #eef2f7', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '13px' }}>Today, 9:15 AM</span>
                                <span style={{ fontSize: '13px', color: '#64748b' }}>Lab Results Reviewed</span>
                                <button style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #eef2f7', background: 'white', fontSize: '12px' }}>Details</button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.rightCol}>
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
                                            {msg.text}
                                        </div>
                                    )
                                ))}
                            </div>
                            <div className={styles.notesFooter}>
                                <input
                                    type="text"
                                    placeholder="Add a note?"
                                    className={styles.noteInput}
                                    value={noteInput}
                                    onChange={(e) => setNoteInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && setNoteInput("")}
                                />
                                <button className={styles.addNoteBtn} onClick={() => setNoteInput("")}>Add Note</button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
