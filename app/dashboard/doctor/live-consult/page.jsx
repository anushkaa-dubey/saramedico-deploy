"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Topbar from "../components/Topbar";
import styles from "./LiveConsult.module.css";
import searchIcon from "@/public/icons/search.svg"
import micIcon from "@/public/icons/mic.svg";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { fetchRecentPatients, fetchPatients, fetchDoctorProfile, createConsultation } from "@/services/doctor";

export default function LiveConsultPage() {
    const router = useRouter();
    const [recentPatients, setRecentPatients] = useState([]);
    const [allPatients, setAllPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [audioLevel, setAudioLevel] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [isCreatingSession, setIsCreatingSession] = useState(false);

    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);

    // Enhanced mapping for robustness across different API response formats
    const mapToPatientObject = (p) => {
        if (!p) return null;
        const name = p.full_name || p.patient_name || p.name || p.fullName ||
            [p.first_name, p.last_name].filter(Boolean).join(" ") ||
            (p.user && (p.user.full_name || [p.user.first_name, p.user.last_name].filter(Boolean).join(" "))) ||
            "Unknown Patient";
        const email = p.email || p.email_addr || p.contact_email || p.user?.email || "N/A";
        const id = p.id || p.patient_id || p.user_id || p.uuid || "N/A";
        const mrn = p.mrn || p.medical_record_number || (id !== "N/A" ? `MRN-${id.substring(0, 6)}` : "N/A");

        return {
            id,
            full_name: name,
            email,
            mrn,
            last_activity: p.last_activity || p.reason || p.activity || p.chief_complaint || "Consultation",
            last_visit_date: p.last_visit_date || p.timestamp || p.date || p.last_visit || p.scheduled_at || null,
        };
    };

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                // Fetch profile to get doctor ID
                const profile = await fetchDoctorProfile();
                setDoctorProfile(profile);

                const doctorId = profile?.doctor_profile?.id || profile?.id;

                if (doctorId) {
                    // Fetch both recent and directory patients
                    const [recentRes, allRes] = await Promise.all([
                        fetchRecentPatients(doctorId).catch(err => { console.warn("Recent patients fetch failed", err); return []; }),
                        fetchPatients().catch(err => { console.warn("All patients fetch failed", err); return []; })
                    ]);

                    const mappedRecent = (Array.isArray(recentRes) ? recentRes : []).map(mapToPatientObject).filter(p => p.id !== "N/A");
                    const mappedAll = (Array.isArray(allRes) ? allRes : []).map(mapToPatientObject).filter(p => p.id !== "N/A");

                    setRecentPatients(mappedRecent);
                    setAllPatients(mappedAll);
                }
            } catch (err) {
                console.error("Critical error in Live Consult data loading:", err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    // Microphone viz handler
    useEffect(() => {
        if (!isRecording) {
            cancelAnimationFrame(animationFrameRef.current);
            if (audioContextRef.current) {
                audioContextRef.current.close().catch(() => { });
                audioContextRef.current = null;
            }
            setAudioLevel(0);
            return;
        }

        const runVisualizer = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const context = new (window.AudioContext || window.webkitAudioContext)();
                const analyser = context.createAnalyser();
                const source = context.createMediaStreamSource(stream);
                source.connect(analyser);
                analyser.fftSize = 256;

                audioContextRef.current = context;
                analyserRef.current = analyser;

                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                const renderFrame = () => {
                    if (!analyserRef.current) return;
                    analyserRef.current.getByteFrequencyData(dataArray);
                    let sum = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        sum += dataArray[i];
                    }
                    const avg = sum / bufferLength;
                    setAudioLevel(avg);
                    animationFrameRef.current = requestAnimationFrame(renderFrame);
                };
                renderFrame();
            } catch (err) {
                console.warn("Could not start audio visualizer", err);
                setIsRecording(false);
            }
        };

        runVisualizer();

        return () => {
            cancelAnimationFrame(animationFrameRef.current);
            if (audioContextRef.current) audioContextRef.current.close().catch(() => { });
        };
    }, [isRecording]);

    const filteredPatients = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();
        if (!query) return [];
        return allPatients.filter(p =>
            p.full_name?.toLowerCase().includes(query) ||
            p.email?.toLowerCase().includes(query) ||
            p.id?.toLowerCase().includes(query) ||
            p.mrn?.toLowerCase().includes(query)
        ).slice(0, 5);
    }, [allPatients, searchTerm]);

    const onStartSession = async () => {
        if (!selectedPatient || selectedPatient.id === "N/A") {
            alert("Please search and select a patient record first.");
            return;
        }

        setIsCreatingSession(true);
        try {
            const resp = await createConsultation({
                patient_id: selectedPatient.id,
                scheduled_at: new Date().toISOString(),
                visit_type: "video",
                chief_complaint: "In-Person Live Session"
            });

            if (resp && resp.id) {
                router.push(`/dashboard/doctor/video-call?consultationId=${resp.id}`);
            } else if (resp?.detail) {
                alert(`Error: ${resp.detail}`);
            } else {
                throw new Error("Invalid session creation response");
            }
        } catch (err) {
            console.error("Consultation start failed", err);
            alert("Failed to start session. Check your connection or patient permissions.");
        } finally {
            setIsCreatingSession(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ padding: '0 24px 24px 24px' }}
        >
            <Topbar />

            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>New Consultation Session</h1>
                <p className={styles.pageSub}>
                    Configure session parameters and link to patient record before starting
                </p>
            </div>

            <section className={styles.grid}>
                {/* PATIENT SELECTION COLUMN */}
                <div className={styles.leftCol}>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Patient Context</h3>

                        <div className={styles.cardContent}>
                            <label className={styles.label}>LINK TO PATIENT RECORD</label>
                            <div className={styles.searchBox} style={{ position: 'relative' }}>
                                <Image src={searchIcon} alt="Search" className={styles.searchIcon} />
                                <input
                                    type="text"
                                    placeholder="Search by Patient Name, Email, or MRN..."
                                    className={styles.searchInput}
                                    value={selectedPatient ? selectedPatient.full_name : searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setSelectedPatient(null);
                                    }}
                                />
                                {selectedPatient && (
                                    <button
                                        onClick={() => { setSelectedPatient(null); setSearchTerm(""); }}
                                        style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '20px' }}
                                    >
                                        &times;
                                    </button>
                                )}

                                <AnimatePresence>
                                    {searchTerm && !selectedPatient && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                            className={styles.dropdown}
                                            style={{ zIndex: 9999 }}
                                        >
                                            {filteredPatients.length > 0 ? (
                                                filteredPatients.map(p => (
                                                    <div key={p.id} onClick={() => { setSelectedPatient(p); setSearchTerm(""); }} className={styles.dropdownItem}>
                                                        <div style={{ fontWeight: '700', fontSize: '14px' }}>{p.full_name}</div>
                                                        <div style={{ fontSize: '11px', color: '#64748b' }}>{p.email} • {p.mrn}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{ padding: '12px 16px', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
                                                    No results for "{searchTerm}"
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label className={styles.label}>LANGUAGE</label>
                                    <div className={styles.fakeInput}>English</div>
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>SESSION TYPE</label>
                                    <div className={styles.fakeInput}>General Checkup</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RECENT PATIENTS LIST */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Recent Patients</h3>

                        <div style={{ overflowX: 'auto', width: '100%' }}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>PATIENT</th>
                                        <th>ACTIVITY</th>
                                        <th>DATE/TIME</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="3" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>Loading patient history...</td></tr>
                                    ) : recentPatients.length === 0 ? (
                                        <tr><td colSpan="3" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>No recent patient activity found.</td></tr>
                                    ) : (
                                        recentPatients.map((p, idx) => (
                                            <tr
                                                key={p.id || idx}
                                                onClick={() => setSelectedPatient(p)}
                                                className={selectedPatient?.id === p.id ? styles.activeRow : ""}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <td>
                                                    <div className={styles.userCell}>
                                                        <div className={styles.avatar}>
                                                            {p.full_name ? p.full_name[0].toUpperCase() : "P"}
                                                        </div>
                                                        <span style={{ fontWeight: 600 }}>{p.full_name}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.activityCell}>
                                                        {p.last_activity}
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: '12px', color: '#64748b' }}>
                                                    {p.last_visit_date ? new Date(p.last_visit_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : "N/A"}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* AUDIO & CONTROLS COLUMN */}
                <div className={styles.rightCol}>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}><Image src={micIcon} alt="Mic" /> Audio Configuration</h3>

                        <div className={styles.cardContent}>
                            <label className={styles.label}>INPUT SOURCE</label>
                            <div className={styles.inputBox} onClick={() => setIsRecording(!isRecording)} style={{ cursor: 'pointer', border: isRecording ? '1px solid #3b82f6' : '1px solid #e2e8f0' }}>
                                <div className={styles.micIconCircle} style={{
                                    background: isRecording ? '#ef4444' : '#f1f5f9',
                                }}>
                                    <Image src={micIcon} alt="Mic" width={16} height={16} />
                                </div>
                                <span className={styles.inputText}>System Default Microphone</span>
                                <div style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: '800', color: isRecording ? '#ef4444' : '#94a3b8' }}>
                                    {isRecording ? "LIVE" : "TEST MIC"}
                                </div>
                            </div>

                            <div className={styles.waveBox} style={{ height: '80px', background: '#f8fafc' }}>
                                {[...Array(16)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: isRecording ? (10 + (audioLevel * (0.3 + Math.random() * 0.5))) : 5 }}
                                        style={{ width: '4px', background: isRecording ? '#3b82f6' : '#e2e8f0', borderRadius: '4px', margin: '0 2px' }}
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            className={styles.startSessionBtn}
                            onClick={onStartSession}
                            disabled={!selectedPatient || isCreatingSession}
                            style={{
                                opacity: (!selectedPatient || isCreatingSession) ? 0.6 : 1,
                                cursor: (!selectedPatient || isCreatingSession) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <Image src={micIcon} alt="Session" /> {isCreatingSession ? "INITIALIZING..." : "Start Consultation"}
                        </button>
                    </div>

                    <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '12px', border: '1px solid #bae6fd', fontSize: '12px', color: '#0369a1', lineHeight: '1.5' }}>
                        <strong>Tip:</strong> You can select a patient from the search dropdown or from the Recent Patients list. Once selected, verify your microphone activity before starting the session.
                    </div>
                </div>
            </section>
        </motion.div>
    );
}
