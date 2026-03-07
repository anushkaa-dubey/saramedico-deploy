"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Topbar from "../components/Topbar";
import styles from "./LiveConsult.module.css";
import searchIcon from "@/public/icons/search.svg"
import micIcon from "@/public/icons/mic.svg";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { fetchRecentPatients, fetchPatients, fetchDoctorProfile, createConsultation, fetchConsultations, completeConsultation, fetchAppointments, updateAppointmentStatus } from "@/services/doctor";

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
    const [activeConsultation, setActiveConsultation] = useState(null);

    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);

    // Enhanced mapping for robustness across different API response formats
    const mapToPatientObject = (p) => {
        if (!p) return null;
        const name = p.full_name || p.patient_name || p.name || p.fullName || p.patientName ||
            (p.first_name ? [p.first_name, p.last_name].filter(Boolean).join(" ") : null) ||
            p.user?.full_name || p.user?.name || (p.user?.first_name ? [p.user.first_name, p.user.last_name].filter(Boolean).join(" ") : null) ||
            "Unknown Patient";
        const email = p.email || p.email_addr || p.contact_email || p.user?.email || "N/A";
        const id = p.id || p.patient_id || p.user_id || p.uuid || "N/A";
        const mrn = p.mrn || p.medical_record_number || (id !== "N/A" && typeof id === 'string' ? `MRN-${id.substring(0, 6)}` : "N/A");

        return {
            id,
            full_name: name,
            email,
            mrn,
            last_activity: p.last_activity || p.reason || p.activity || p.chief_complaint || "Consultation",
            last_visit_date: p.last_visit_date || p.timestamp || p.date || p.last_visit || p.scheduled_at || null,
        };
    };

    const mergeRecentWithActive = (recentList, activeConsultList, appointmentList, directoryList = []) => {
        // Create a lookup map from directoryList for missing names
        const dirMap = {};
        (Array.isArray(directoryList) ? directoryList : []).forEach(p => {
            const mapped = mapToPatientObject(p);
            if (mapped && mapped.id !== "N/A") {
                dirMap[mapped.id] = mapped;
            }
        });

        const mappedRecent = (Array.isArray(recentList) ? recentList : []).map(mapToPatientObject).filter(p => p.id !== "N/A");
        
        // 1. Instant Consultations
        const consults = (Array.isArray(activeConsultList) ? activeConsultList : []).filter(c => c.status === 'scheduled' || c.status === 'active');
        const consultPatients = consults.map(c => {
            const pId = c.patientId || c.patient_id;
            const fallback = dirMap[pId];
            return {
                id: pId,
                full_name: c.patientName || c.patient_name || fallback?.full_name || "Patient",
                email: fallback?.email || "N/A",
                mrn: fallback?.mrn || "N/A",
                last_activity: "Active Meeting",
                last_visit_date: c.scheduledAt || c.scheduled_at,
                consultation_id: c.id,
                meet_link: c.meetLink || c.meet_link,
                status: c.status,
                type: 'consultation'
            };
        });

        // 2. Regular Appointments (Accepted/Scheduled)
        const activeApts = (Array.isArray(appointmentList) ? appointmentList : []).filter(a => 
            (a.status === 'accepted' || a.status === 'scheduled' || a.status === 'active') && 
            !(a.completion_time || a.completionTime)
        );
        const aptPatients = activeApts.map(a => {
            const pId = a.patient_id || a.patient?.id || a.user_id || "N/A";
            const fallback = dirMap[pId];
            const name = a.patient_name || a.patientName || a.patient?.full_name || a.patient?.name || (a.patient?.first_name ? `${a.patient.first_name} ${a.patient.last_name || ''}` : null) || a.user?.full_name || a.user?.name || fallback?.full_name || "Patient";
            
            return {
                id: pId,
                full_name: name,
                email: a.patient?.email || fallback?.email || "N/A",
                mrn: a.patient?.mrn || fallback?.mrn || "N/A",
                last_activity: "Scheduled Appointment",
                last_visit_date: a.requested_date || a.appointment_time || a.date,
                appointment_id: a.id,
                meet_link: a.meet_link || a.join_url || a.start_url || a.meetLink,
                status: a.status,
                type: 'appointment'
            };
        });

        // Merge all three, active sessions take precedence
        const merged = [...consultPatients, ...aptPatients, ...mappedRecent];
        return Array.from(new Map(merged.map(p => [p.id, p])).values());
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
                    // Fetch both recent, directory patients, and active consultations
                    const [recentRes, allRes, consultRes, aptRes] = await Promise.all([
                        fetchRecentPatients(doctorId).catch(err => { console.warn("Recent patients fetch failed", err); return []; }),
                        fetchPatients().catch(err => { console.warn("All patients fetch failed", err); return []; }),
                        fetchConsultations().catch(err => { console.warn("Consultations fetch failed", err); return { consultations: [] }; }),
                        fetchAppointments().catch(err => { console.warn("Appointments fetch failed", err); return []; })
                    ]);

                    const activeConsults = Array.isArray(consultRes?.consultations) ? consultRes.consultations : 
                                         (Array.isArray(consultRes) ? consultRes : []);
                    
                    const pList = (Array.isArray(allRes) ? allRes : []).map(mapToPatientObject).filter(p => p.id !== "N/A");
                    setAllPatients(pList);

                    const mergedData = mergeRecentWithActive(recentRes, activeConsults, aptRes, allRes);
                    setRecentPatients(mergedData);
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

    const handleEndSession = async (session) => {
        const sessionId = session.consultation_id || session.appointment_id;
        const isAppointment = !!session.appointment_id;

        try {
            if (isAppointment) {
                await updateAppointmentStatus(sessionId, 'completed');
            } else {
                await completeConsultation(sessionId);
            }
            
            alert("Session ended successfully.");
            
            // Refresh data
            const [recentData, activeData, aptRes] = await Promise.all([
                fetchRecentPatients(),
                fetchConsultations(),
                fetchAppointments()
            ]);
            
            const activeConsults = Array.isArray(activeData?.consultations) ? activeData.consultations : 
                                 (Array.isArray(activeData) ? activeData : []);
                                 
            setRecentPatients(mergeRecentWithActive(recentData, activeConsults, aptRes));
            
            if (activeConsultation?.id === sessionId) {
                setActiveConsultation(null);
            }
        } catch (err) {
            console.error("Failed to end session", err);
            alert("Failed to end session. Please try again.");
        }
    };

    const onStartSession = async () => {
        if (!selectedPatient || selectedPatient.id === "N/A") {
            alert("Please search and select a patient record first.");
            return;
        }

        setIsCreatingSession(true);
        try {
            const resp = await createConsultation({
                patientId: selectedPatient.id,
                // scheduledAt: new Date().toISOString(),
                scheduledAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
                durationMinutes: 30,
                notes: "Live consultation"
            });

            if (resp && resp.id) {
                setActiveConsultation(resp);
                // We keep the doctor on this page so they can click the "Join Google Meet" button as per requirement.
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
                                        <th>MEETING</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="4" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>Loading patient history...</td></tr>
                                    ) : recentPatients.length === 0 ? (
                                        <tr><td colSpan="4" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>No recent patient activity found.</td></tr>
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
                                                            {(p.full_name || p.name || p.patient_name || p.patientName || "P")[0].toUpperCase()}
                                                        </div>
                                                        <span style={{ fontWeight: 600 }}>{p.full_name || p.name || p.patient_name || p.patientName || "Unknown Patient"}</span>
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
                                                <td>
                                                    {(p.consultation_id || p.appointment_id) ? (
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const url = p.consultation_id ? 
                                                                                `/dashboard/doctor/video-call?consultationId=${p.consultation_id}` : 
                                                                                `/dashboard/doctor/video-call?appointmentId=${p.appointment_id}`;
                                                                    router.push(url);
                                                                }}
                                                                style={{
                                                                    background: '#3b82f6',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '6px',
                                                                    fontSize: '11px',
                                                                    fontWeight: '600',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                Join Session
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEndSession(p);
                                                                }}
                                                                style={{
                                                                    background: '#ef4444',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '6px',
                                                                    fontSize: '11px',
                                                                    fontWeight: '600',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                End Session
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: '#94a3b8', fontSize: '11px' }}>No Active Session</span>
                                                    )}
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
                            disabled={!selectedPatient || isCreatingSession || activeConsultation}
                            style={{
                                opacity: (!selectedPatient || isCreatingSession || activeConsultation) ? 0.6 : 1,
                                cursor: (!selectedPatient || isCreatingSession || activeConsultation) ? 'not-allowed' : 'pointer',
                                marginBottom: '12px'
                            }}
                        >
                            <Image src={micIcon} alt="Mic" /> {isCreatingSession ? "INITIALIZING..." : (activeConsultation ? "Session Created" : "Start Consultation")}
                        </button>

                        <button
                            className={styles.startSessionBtn}
                            onClick={() => {
                                const meetLink = activeConsultation?.meetLink || activeConsultation?.meet_link;
                                if (meetLink) {
                                    window.open(meetLink, "_blank");
                                }
                                if (activeConsultation?.id) {
                                    router.push(`/dashboard/doctor/video-call?consultationId=${activeConsultation.id}`);
                                }
                            }}
                            disabled={!activeConsultation}
                            style={{
                                background: activeConsultation ? "#3b82f6" : "#e2e8f0",
                                color: activeConsultation ? "white" : "#94a3b8",
                                opacity: !activeConsultation ? 0.6 : 1,
                                cursor: !activeConsultation ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Join Google Meet
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
