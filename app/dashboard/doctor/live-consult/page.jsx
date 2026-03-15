"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Topbar from "../components/Topbar";
import styles from "./LiveConsult.module.css";
import { Search, Mic, MicOff, Video, X, Clock, User, Activity, ChevronDown, CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { fetchRecentPatients, fetchPatients, fetchDoctorProfile, createConsultation, fetchConsultations, completeConsultation, fetchAppointments, updateAppointmentStatus } from "@/services/doctor";

const SESSION_TYPES = [
    { value: "general", label: "General Checkup" },
    { value: "followup", label: "Follow-up Visit" },
    { value: "specialist", label: "Specialist Consultation" },
    { value: "emergency", label: "Emergency / Urgent Care" },
];

export default function LiveConsultPage() {
    const router = useRouter();
    const [recentPatients, setRecentPatients] = useState([]);
    const [allPatients, setAllPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [sessionType, setSessionType] = useState(SESSION_TYPES[0]);
    const [sessionTypeOpen, setSessionTypeOpen] = useState(false);
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [audioLevel, setAudioLevel] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [isCreatingSession, setIsCreatingSession] = useState(false);
    const [activeConsultation, setActiveConsultation] = useState(null);

    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);
    const sessionTypeRef = useRef(null);

    // Close session type dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (sessionTypeRef.current && !sessionTypeRef.current.contains(e.target)) {
                setSessionTypeOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const mapToPatientObject = (p) => {
        if (!p) return null;
        const name = p.full_name || p.patient_name || p.name || p.fullName || p.patientName ||
            (p.first_name ? [p.first_name, p.last_name].filter(Boolean).join(" ") : null) ||
            p.user?.full_name || p.user?.name || (p.user?.first_name ? [p.user.first_name, p.user.last_name].filter(Boolean).join(" ") : null) ||
            "Unknown Patient";
        const email = p.email || p.email_addr || p.contact_email || p.user?.email || "N/A";
        const id = p.patient_id || p.patientId || p.user_id || p.id || p.uuid || "N/A";
        const mrn = p.mrn || p.medical_record_number || (id !== "N/A" && typeof id === 'string' ? `MRN-${id.substring(0, 6)}` : "N/A");

        return {
            id,
            full_name: name,
            email,
            mrn,
            last_activity: typeof (p.last_activity || p.reason || p.activity || p.chief_complaint) === 'object'
                ? ((p.last_activity || p.reason || p.activity || p.chief_complaint)?.chief_complaint || "Consultation")
                : (p.last_activity || p.reason || p.activity || p.chief_complaint || "Consultation"),
            last_visit_date: p.last_visit_date || p.timestamp || p.date || p.last_visit || p.scheduled_at || null,
        };
    };

    const mergeRecentWithActive = (recentList, activeConsultList, appointmentList, directoryList = []) => {
        const dirMap = {};
        (Array.isArray(directoryList) ? directoryList : []).forEach(p => {
            const mapped = mapToPatientObject(p);
            if (mapped && mapped.id !== "N/A") dirMap[mapped.id] = mapped;
        });

        const mappedRecent = (Array.isArray(recentList) ? recentList : []).map(mapToPatientObject).filter(p => p.id !== "N/A");

        const consults = (Array.isArray(activeConsultList) ? activeConsultList : []).filter(c => c.status === 'scheduled' || c.status === 'active');
        const consultPatients = consults.map(c => {
            const pId = c.patientId || c.patient_id;
            const fallback = dirMap[pId];
            return {
                id: pId,
                full_name: c.patientName || c.patient_name || fallback?.full_name || "Patient",
                email: fallback?.email || "N/A",
                mrn: c.patientMrn || fallback?.mrn || "N/A",
                last_activity: "Active Meeting",
                last_visit_date: c.scheduledAt || c.scheduled_at,
                consultation_id: c.id,
                meet_link: c.meetLink || c.meet_link,
                status: c.status,
                type: 'consultation'
            };
        });

        const activeApts = (Array.isArray(appointmentList) ? appointmentList : []).filter(a =>
            (a.status === 'accepted' || a.status === 'scheduled' || a.status === 'active')
        );
        const aptPatients = activeApts.map(a => {
            const pId = a.patient_id || a.patient?.id || "N/A";
            const fallback = dirMap[pId];
            // Backend sets patient_name in the appointment response (decrypted)
            const name = a.patient_name || a.patientName || fallback?.full_name || "Patient";
            const meetLink = a.meet_link || a.join_url || a.start_url || a.meetLink;
            return {
                id: pId,
                full_name: name,
                email: fallback?.email || "N/A",
                mrn: fallback?.mrn || "N/A",
                last_activity: a.status === 'accepted' ? "Confirmed Appointment" : "Scheduled Appointment",
                last_visit_date: a.requested_date || a.appointment_time || a.date,
                appointment_id: a.id,
                meet_link: meetLink,
                status: a.status,
                type: 'appointment'
            };
        });

        // Merge: consultation patients take priority over appointments for the same patient
        const merged = [];
        const seen = new Set();

        // Consultations (doctor-initiated Live Consults) first
        consultPatients.forEach(p => {
            if (p.id && p.id !== "N/A" && !seen.has(p.id)) {
                seen.add(p.id);
                merged.push(p);
            }
        });

        // Accepted appointments (patient-initiated)
        aptPatients.forEach(p => {
            if (p.id && p.id !== "N/A") {
                if (!seen.has(p.id)) {
                    seen.add(p.id);
                    merged.push(p);
                }
            }
        });

        // Add recent patients who aren't already in merged
        mappedRecent.forEach(p => {
            if (!seen.has(p.id)) {
                seen.add(p.id);
                merged.push(p);
            }
        });

        return merged;
    };

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const profile = await fetchDoctorProfile();
                setDoctorProfile(profile);
                const doctorId = profile?.doctor_profile?.id || profile?.id;

                if (doctorId) {
                    const [recentRes, allRes, consultRes, aptRes] = await Promise.all([
                        fetchRecentPatients(doctorId).catch(() => []),
                        fetchPatients().catch(() => []),
                        fetchConsultations().catch(() => ({ consultations: [] })),
                        fetchAppointments().catch(() => [])
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
                    for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
                    setAudioLevel(sum / bufferLength);
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
            const doctorId = doctorProfile?.doctor_profile?.id || doctorProfile?.id;
            const [recentData, activeData, aptRes] = await Promise.all([
                doctorId ? fetchRecentPatients(doctorId).catch(() => []) : Promise.resolve([]),
                fetchConsultations(),
                fetchAppointments()
            ]);
            const activeConsults = Array.isArray(activeData?.consultations) ? activeData.consultations :
                (Array.isArray(activeData) ? activeData : []);
            setRecentPatients(mergeRecentWithActive(recentData, activeConsults, aptRes));
            if (activeConsultation?.id === sessionId) setActiveConsultation(null);
        } catch (err) {
            console.error("Failed to end session", err);
            alert("Failed to end session. Please try again.");
        }
    };

    // Step flow: 1 = select patient, 2 = select session type, 3 = start meet (notify patient)
    const currentStep = !selectedPatient ? 1 : !activeConsultation ? 2 : 3;

    const onStartSession = async () => {
        if (!selectedPatient || selectedPatient.id === "N/A") {
            alert("Please search and select a patient record first.");
            return;
        }
        setIsCreatingSession(true);
        try {
            const resp = await createConsultation({
                patientId: selectedPatient.id,
                scheduledAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
                durationMinutes: 30,
                notes: `${sessionType.label} - Live consultation`,
                sessionType: sessionType.value,
            });

            if (resp && resp.id) {
                setActiveConsultation(resp);
                // Patient notification is triggered server-side on consultation creation
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
            className={styles.pageWrapper}
        >
            <div className={styles.topbarWrap}>
                <Topbar />
            </div>

            <div className={styles.inner}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>New Consultation Session</h1>
                    <p className={styles.pageSub}>
                        Configure session parameters and link to patient record before starting
                    </p>
                </div>

                {/* Step indicator */}
                <div className={styles.stepBar}>
                    {["Select Patient", "Session Type", "Start Meet"].map((step, i) => (
                        <div key={i} className={`${styles.step} ${currentStep > i + 1 ? styles.stepDone : ""} ${currentStep === i + 1 ? styles.stepActive : ""}`}>
                            <div className={styles.stepCircle}>
                                {currentStep > i + 1 ? <CheckCircle size={14} /> : <span>{i + 1}</span>}
                            </div>
                            <span className={styles.stepLabel}>{step}</span>
                            {i < 2 && <div className={styles.stepLine} />}
                        </div>
                    ))}
                </div>

                <section className={styles.grid}>
                    {/* LEFT COLUMN */}
                    <div className={styles.leftCol}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>
                                <User size={16} strokeWidth={2.5} />
                                Patient Context
                            </h3>

                            <div className={styles.cardContent}>
                                <label className={styles.label}>LINK TO PATIENT RECORD</label>
                                <div className={styles.searchBox}>
                                    <Search className={styles.searchIcon} size={16} strokeWidth={2} />
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
                                            className={styles.clearBtn}
                                            onClick={() => { setSelectedPatient(null); setSearchTerm(""); setActiveConsultation(null); }}
                                        >
                                            <X size={16} />
                                        </button>
                                    )}

                                    <AnimatePresence>
                                        {searchTerm && !selectedPatient && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                                className={styles.dropdown}
                                            >
                                                {filteredPatients.length > 0 ? (
                                                    filteredPatients.map(p => (
                                                        <div key={p.id} onClick={() => { setSelectedPatient(p); setSearchTerm(""); }} className={styles.dropdownItem}>
                                                            <div className={styles.dropdownName}>{p.full_name}</div>
                                                            <div className={styles.dropdownSub}>{p.email} &bull; {p.mrn}</div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className={styles.dropdownEmpty}>
                                                        No results for &ldquo;{searchTerm}&rdquo;
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
                                        <div className={styles.selectWrapper} ref={sessionTypeRef}>
                                            <button
                                                className={styles.selectBtn}
                                                onClick={() => setSessionTypeOpen(o => !o)}
                                                disabled={!selectedPatient}
                                            >
                                                <span>{sessionType.label}</span>
                                                <ChevronDown size={14} className={`${styles.chevron} ${sessionTypeOpen ? styles.chevronOpen : ""}`} />
                                            </button>
                                            <AnimatePresence>
                                                {sessionTypeOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                                                        className={styles.selectDropdown}
                                                    >
                                                        {SESSION_TYPES.map(t => (
                                                            <div
                                                                key={t.value}
                                                                className={`${styles.selectOption} ${sessionType.value === t.value ? styles.selectOptionActive : ""}`}
                                                                onClick={() => { setSessionType(t); setSessionTypeOpen(false); }}
                                                            >
                                                                {t.label}
                                                                {sessionType.value === t.value && <CheckCircle size={12} />}
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RECENT PATIENTS */}
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>
                                <Clock size={16} strokeWidth={2.5} />
                                Recent Patients
                            </h3>

                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>PATIENT</th>
                                            <th>ACTIVITY</th>
                                            <th>DATE / TIME</th>
                                            <th>MEETING</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="4" className={styles.tableEmpty}>Loading patient history...</td></tr>
                                        ) : recentPatients.length === 0 ? (
                                            <tr><td colSpan="4" className={styles.tableEmpty}>No recent patient activity found.</td></tr>
                                        ) : (
                                            recentPatients.map((p, idx) => (
                                                <tr
                                                    key={p.id || idx}
                                                    onClick={() => { setSelectedPatient(p); setActiveConsultation(null); }}
                                                    className={selectedPatient?.id === p.id ? styles.activeRow : ""}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <td>
                                                        <div className={styles.userCell}>
                                                            <div className={styles.avatar}>
                                                                {(p.full_name || "P")[0].toUpperCase()}
                                                            </div>
                                                            <span className={styles.patientName}>{p.full_name || "Unknown Patient"}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={styles.activityBadge}>{p.last_activity}</span>
                                                    </td>
                                                    <td className={styles.dateCell}>
                                                        {p.last_visit_date ? new Date(p.last_visit_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : "N/A"}
                                                    </td>
                                                    <td>
                                                        {(p.consultation_id || p.appointment_id) ? (
                                                            <div className={styles.sessionBtns}>
                                                                <button
                                                                    className={styles.joinBtn}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const url = p.consultation_id
                                                                            ? `/dashboard/doctor/video-call?consultationId=${p.consultation_id}`
                                                                            : `/dashboard/doctor/video-call?appointmentId=${p.appointment_id}`;
                                                                        router.push(url);
                                                                    }}
                                                                >
                                                                    <Video size={12} /> Join
                                                                </button>
                                                                <button
                                                                    className={styles.endBtn}
                                                                    onClick={(e) => { e.stopPropagation(); handleEndSession(p); }}
                                                                >
                                                                    <X size={12} /> End
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className={styles.noSession}>No Active Session</span>
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

                    {/* RIGHT COLUMN */}
                    <div className={styles.rightCol}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>
                                <Activity size={16} strokeWidth={2.5} />
                                Audio Configuration
                            </h3>

                            <div className={styles.cardContent}>
                                <label className={styles.label}>INPUT SOURCE</label>
                                <div
                                    className={`${styles.inputBox} ${isRecording ? styles.inputBoxActive : ""}`}
                                    onClick={() => setIsRecording(!isRecording)}
                                >
                                    <div className={`${styles.micIconCircle} ${isRecording ? styles.micIconCircleActive : ""}`}>
                                        {isRecording ? <Mic size={16} color="#fff" /> : <MicOff size={16} color="#94a3b8" />}
                                    </div>
                                    <span className={styles.inputText}>System Default Microphone</span>
                                    <div className={`${styles.liveTag} ${isRecording ? styles.liveTagActive : ""}`}>
                                        {isRecording ? "LIVE" : "TEST MIC"}
                                    </div>
                                </div>

                                <div className={styles.waveBox}>
                                    {[...Array(20)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ height: isRecording ? (8 + (audioLevel * (0.25 + Math.random() * 0.5))) : 5 }}
                                            transition={{ duration: 0.1 }}
                                            className={`${styles.waveBar} ${isRecording ? styles.waveBarActive : ""}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Selected patient summary */}
                            <AnimatePresence>
                                {selectedPatient && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                        className={styles.patientSummary}
                                    >
                                        <div className={styles.summaryAvatar}>{(selectedPatient.full_name || "P")[0].toUpperCase()}</div>
                                        <div>
                                            <div className={styles.summaryName}>{selectedPatient.full_name}</div>
                                            <div className={styles.summaryMeta}>{selectedPatient.mrn} &bull; {sessionType.label}</div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                className={styles.startSessionBtn}
                                onClick={onStartSession}
                                disabled={!selectedPatient || isCreatingSession || !!activeConsultation}
                            >
                                {isCreatingSession ? (
                                    <><Loader2 size={18} className={styles.spinIcon} /> Initializing...</>
                                ) : activeConsultation ? (
                                    <><CheckCircle size={18} /> Session Created</>
                                ) : (
                                    <><Mic size={18} /> Start Consultation</>
                                )}
                            </button>

                            {activeConsultation && (
                                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={styles.notifyBanner}>
                                    <CheckCircle size={14} color="#16a34a" />
                                    <span>Patient notified to join the session</span>
                                </motion.div>
                            )}

                            <button
                                className={`${styles.joinMeetBtn} ${activeConsultation ? styles.joinMeetBtnActive : ""}`}
                                onClick={() => {
                                    const meetLink = activeConsultation?.meetLink || activeConsultation?.meet_link;
                                    if (meetLink) window.open(meetLink, "_blank");
                                    if (activeConsultation?.id) {
                                        router.push(`/dashboard/doctor/video-call?consultationId=${activeConsultation.id}`);
                                    }
                                }}
                                disabled={!activeConsultation}
                            >
                                <Video size={18} /> Join Google Meet
                            </button>
                        </div>

                        <div className={styles.tipBox}>
                            <strong>Tip:</strong> Select a patient from search or the Recent Patients list, then choose the session type. Once you hit &ldquo;Start Consultation&rdquo;, the patient will receive a notification to join.
                        </div>
                    </div>
                </section>
            </div>{/* end .inner */}
        </motion.div>
    );
}