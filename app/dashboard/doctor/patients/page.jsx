"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Topbar from "../components/Topbar";
import DocumentsList from "./components/DocumentsList";
import PatientAIChat from "./components/PatientAIChat";
import styles from "./Patients.module.css";
import { motion } from "framer-motion";
import { fetchAppointments, fetchPatients, fetchProfile } from "@/services/doctor";
import OnboardPatientModal from "./components/OnboardPatientModal";

export default function Patients() {
    const [patientsList, setPatientsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [activeTab, setActiveTab] = useState('visits');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [doctorId, setDoctorId] = useState(null);

    useEffect(() => {
        loadPatients();
        loadDoctorProfile();
    }, []);

    const loadDoctorProfile = async () => {
        try {
            const profile = await fetchProfile();
            setDoctorId(profile.id);
        } catch (err) {
            console.error("Failed to fetch doctor profile:", err);
        }
    };

    const loadPatients = async () => {
        setLoading(true);
        try {
            // 1. Try dedicated patient directory endpoint first
            const patientsData = await fetchPatients();

            if (patientsData && patientsData.length > 0) {
                const mappedPatients = patientsData.map(p => ({
                    id: p.id,
                    name: p.name || p.full_name || "Unknown Patient",
                    status: p.statusTag || "Analysis Ready",
                    statusClass: "ready",
                    dob: p.dob || "N/A",
                    mrn: p.mrn || "N/A",
                    lastVisit: p.lastVisit || "N/A",
                    age: p.age || "N/A",
                    gender: p.gender || "N/A",
                    phone: p.phone || p.phoneNumber || "N/A",
                    email: p.email || "N/A"
                }));
                setPatientsList(mappedPatients);
                if (mappedPatients.length > 0 && !selectedId) setSelectedId(mappedPatients[0].id);
            } else {
                // 2. Fallback: derive from appointments
                const appointments = await fetchAppointments();
                const uniquePatients = [];
                const patientIds = new Set();

                appointments.forEach(apt => {
                    const pId = apt.patient_id || (apt.user && apt.user.id);
                    if (pId && !patientIds.has(pId)) {
                        patientIds.add(pId);
                        uniquePatients.push({
                            id: pId,
                            name: apt.patient_name || (apt.user && apt.user.full_name) || "Unknown Patient",
                            status: apt.status === 'accepted' ? "Analysis Ready" : "Pending",
                            statusClass: apt.status === 'accepted' ? "ready" : "pending",
                            dob: apt.user?.dob || "N/A",
                            mrn: apt.user?.mrn || `MRN-${pId.substring(0, 6)}`,
                            lastVisit: new Date(apt.requested_date || apt.date).toLocaleDateString(),
                            age: apt.user?.age || "N/A",
                            gender: apt.user?.gender || "N/A",
                            phone: apt.user?.phone || "N/A",
                            email: apt.user?.email || "N/A"
                        });
                    }
                });
                setPatientsList(uniquePatients);
                if (uniquePatients.length > 0 && !selectedId) setSelectedId(uniquePatients[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch patients:", error);
        } finally {
            setLoading(false);
        }
    };

    const [searchTerm, setSearchTerm] = useState("");

    const filteredPatients = patientsList.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.mrn.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedPatient = filteredPatients.find(p => p.id === selectedId) || filteredPatients[0];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Topbar />

            <div className={styles.pageHeader}>
                <h2 className={styles.title}>Patient Directory</h2>
                <div className={styles.headerControls}>
                    <div className={styles.searchWrapper}>
                        <input
                            type="text"
                            placeholder="Search by name or MRN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className={styles.onboardBtn}
                    >
                        + Onboard Patient
                    </button>
                </div>
            </div>

            <OnboardPatientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadPatients}
            />

            <div className={styles.contentRow}>
                {/* Patient List */}
                <div className={styles.patientListCard}>
                    <div className={styles.listHeader}>
                        <div className={styles.colName}>NAME</div>
                        <div className={styles.colDob}>DOB</div>
                        <div className={styles.colMrn}>MRN</div>
                        <div className={styles.colVisit}>LAST VISIT</div>
                        <div className={styles.colProblem}>PROBLEM</div>
                    </div>

                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}>Loading patients...</div>
                    ) : filteredPatients.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}>No patients found matching "{searchTerm}"</div>
                    ) : (
                        filteredPatients.map((patient) => (
                            <div
                                key={patient.id}
                                className={`${styles.patientItem} ${selectedId === patient.id ? styles.active : ''}`}
                                onClick={() => setSelectedId(patient.id)}
                            >
                                <div className={styles.nameGroup}>
                                    <span className={styles.pName}>{patient.name}</span>
                                    <span className={`${styles.pStatus} ${styles[patient.statusClass]}`}>
                                        {patient.status}
                                    </span>
                                </div>
                                <div className={styles.itemText}>{patient.dob}</div>
                                <div className={styles.itemText}>{patient.mrn}</div>
                                <div className={styles.itemText}>{patient.lastVisit}</div>
                                <div className={styles.colProblem}>
                                    <span className={styles.arrow}>›</span>
                                </div>
                            </div>
                        )))}
                </div>

                {/* Patient Details */}
                {selectedPatient && (
                    <div className={styles.detailsPanel}>
                        <div className={styles.profileCard}>
                            <div className={styles.avatarLarge}></div>
                            <div className={styles.profileInfo}>
                                <div className={styles.profileName}>{selectedPatient.name}</div>
                                <div className={styles.profileMeta}>{selectedPatient.age} Years - {selectedPatient.gender}</div>

                                <div className={styles.statsRow}>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>MRN</span>
                                        <span className={styles.statValue}>{selectedPatient.mrn}</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>DOB</span>
                                        <span className={styles.statValue}>{selectedPatient.dob}</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>PHONE</span>
                                        <span className={styles.statValue}>{selectedPatient.phone}</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>EMAIL</span>
                                        <span className={styles.statValue}>{selectedPatient.email}</span>
                                    </div>
                                </div>

                                <div className={styles.tabs}>
                                    <div
                                        className={`${styles.tab} ${activeTab === 'visits' ? styles.active : ''}`}
                                        onClick={() => setActiveTab('visits')}
                                    >
                                        Visits
                                    </div>
                                    <div
                                        className={`${styles.tab} ${activeTab === 'documents' ? styles.active : ''}`}
                                        onClick={() => setActiveTab('documents')}
                                    >
                                        Documents
                                    </div>
                                    <div
                                        className={`${styles.tab} ${activeTab === 'ai-chat' ? styles.active : ''}`}
                                        onClick={() => setActiveTab('ai-chat')}
                                    >
                                        AI Chat
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className={styles.tabContent}>
                            {activeTab === 'visits' ? (
                                <div>
                                    <div className={styles.sectionHeader}>
                                        <h3 className={styles.sectionTitle}>Recent Visits</h3>
                                        <Link href="/dashboard/doctor/live-consult">
                                            <button className={styles.newVisitBtn}>+ New Visit</button>
                                        </Link>
                                    </div>

                                    <div className={styles.visitList}>
                                        <div className={styles.visitCard}>
                                            <div className={styles.visitDateRow}>
                                                <span className={styles.visitDate}>Oct 24, 2024</span>
                                                <span className={styles.visitArrow}>›</span>
                                            </div>
                                            <span className={styles.visitType}>FOLLOW UP</span>
                                            <p className={styles.visitNotes}>
                                                Patient reports improvement in daily migraines. Medication adherence is good. Discussed side effects...
                                            </p>
                                            <Link href="/dashboard/doctor/patients/soap" style={{ textDecoration: 'none' }}>
                                                <button className={styles.soapBtn}>
                                                    View SOAP Note
                                                </button>
                                            </Link>
                                        </div>

                                        <div className={styles.visitCard}>
                                            <div className={styles.visitDateRow}>
                                                <span className={styles.visitDate}>Oct 12, 2024</span>
                                                <span className={styles.visitArrow}>›</span>
                                            </div>
                                            <span className={styles.visitType}>FOLLOW UP</span>
                                            <p className={styles.visitNotes}>
                                                Patient reports improvement in daily migraines. Medication adherence is good. Discussed side effects...
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : activeTab === 'documents' ? (
                                <DocumentsList patientId={selectedPatient.id} />
                            ) : activeTab === 'ai-chat' && doctorId ? (
                                <div style={{ height: '600px' }}>
                                    <PatientAIChat
                                        patientId={selectedPatient.id}
                                        chatType="doctor"
                                        doctorId={doctorId}
                                    />
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
