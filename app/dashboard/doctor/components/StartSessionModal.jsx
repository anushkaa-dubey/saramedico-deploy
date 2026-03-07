"use client";
import { useState, useEffect } from "react";
import styles from "../DoctorDashboard.module.css";
import { fetchAppointments, createConsultation } from "@/services/doctor";
import { CheckCircle, Video, X, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StartSessionModal({ isOpen, onClose, onSessionStarted }) {
    const router = useRouter();
    const [allPatients, setAllPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [selectedPatientName, setSelectedPatientName] = useState("");
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
            setStarting(false);
            setSelectedPatientId(null);
            setSelectedPatientName("");
            setSearchTerm("");
            setError("");
        }
    }, [isOpen]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const m = await import("@/services/doctor");
            const data = await m.fetchPatients().catch(() => ({ all_patients: [] }));
            const list = Array.isArray(data) ? data : (data.all_patients || data.allPatients || []);
            setAllPatients(list);
        } catch (err) {
            console.error("Failed to load modal data:", err);
            setAllPatients([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = allPatients.filter(p => 
        (p.full_name || p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectPatient = (p) => {
        setSelectedPatientId(p.id);
        setSelectedPatientName(p.full_name || p.name || "Patient");
        setError("");
    };

    const handleStartSession = async () => {
        if (!selectedPatientId) {
            setError("Please select a patient to proceed.");
            return;
        }

        setStarting(true);
        setError("");
        try {
            const session = await createConsultation({
                patientId: selectedPatientId,
                scheduledAt: new Date().toISOString(),
                durationMinutes: 30,
                notes: "Quick Consultation"
            });

            if (session?.id) {
                if (onSessionStarted) onSessionStarted(session);
                router.push(`/dashboard/doctor/video-call?consultationId=${session.id}`);
                onClose();
            } else {
                setError("Failed to create session.");
                setStarting(false);
            }
        } catch (err) {
            setError(err.message || "Failed to initiate session.");
            setStarting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} style={{ maxWidth: "450px" }}>
                <div className={styles.modalHeader}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 className={styles.modalTitle}>Start New Session</h3>
                            <p className={styles.modalSub}>
                                {selectedPatientName ? `Selected: ${selectedPatientName}` : "Pick a patient from your list to start a meeting."}
                            </p>
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div style={{ padding: '20px' }}>
                    {/* Search Bar */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                            Find Patient
                        </label>
                        <input
                            type="text"
                            placeholder="Search by Name or Email..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                        Patients List
                    </label>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>Loading patient list...</div>
                    ) : filteredPatients.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px', background: '#f8fafc', borderRadius: '8px' }}>
                            {searchTerm ? "No patients found matching your search." : "Your patient list is empty."}
                        </div>
                    ) : (
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '8px', 
                            maxHeight: '280px', 
                            overflowY: 'auto', 
                            padding: '4px',
                            background: '#f8fafc',
                            borderRadius: '10px',
                            border: '1px solid #eef2f7'
                        }}>
                            {filteredPatients.map(p => {
                                const isActive = selectedPatientId === p.id;
                                return (
                                    <div
                                        key={p.id}
                                        className={`${styles.checkboxItem} ${isActive ? styles.checkboxItemActive : ""}`}
                                        onClick={() => handleSelectPatient(p)}
                                        style={{ 
                                            cursor: 'pointer', 
                                            padding: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            background: isActive ? '#eff6ff' : '#ffffff',
                                            border: isActive ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ 
                                            width: '32px', 
                                            height: '32px', 
                                            borderRadius: '50%', 
                                            background: isActive ? '#3b82f6' : '#f1f5f9',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: isActive ? 'white' : '#64748b'
                                        }}>
                                            <User size={16} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', fontSize: '13px', color: isActive ? '#1e3a8a' : '#1e293b' }}>
                                                {p.full_name || p.name || "Unknown Patient"}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                {p.email || "No email available"}
                                            </div>
                                        </div>
                                        {isActive && <CheckCircle size={18} color="#3b82f6" />}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {error && <div className={styles.errorMsg} style={{ marginTop: '16px', textAlign: 'center' }}>{error}</div>}
                </div>

                <div className={styles.modalActions} style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <button className={styles.detailsBtn} onClick={onClose} style={{ height: '36px', px: '16px', fontSize: '13px', border: '1px solid #e2e8f0' }}>
                        Cancel
                    </button>
                    <button
                        className={styles.primaryBtn}
                        onClick={handleStartSession}
                        disabled={!selectedPatientId || starting}
                        style={{ 
                            background: (!selectedPatientId || starting) ? '#cbd5e1' : 'linear-gradient(90deg, #359AFF, #9CCDFF)', 
                            height: '36px', 
                            padding: '0 24px', 
                            fontSize: '13px',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: (!selectedPatientId || starting) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {starting ? (
                            <>
                                <span className={styles.spinner}></span> Creating Session...
                            </>
                        ) : (
                            <>
                                <Video size={16} /> Start Meeting
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
