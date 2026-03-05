"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Topbar from "../components/Topbar";
import DocumentsList from "./components/DocumentsList";
import PatientAIChat from "./components/PatientAIChat";
import styles from "./Patients.module.css";
import { motion } from "framer-motion";
import { Users, Calendar, ChevronRight } from "lucide-react";
import { fetchAppointments, fetchPatients, fetchDoctorProfile, fetchPatientProfile } from "@/services/doctor";
import OnboardPatientModal from "./components/OnboardPatientModal";
import EditPatientModal from "./components/EditPatientModal";

function PatientsContent() {
    const [patientsList, setPatientsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedPatientDetail, setSelectedPatientDetail] = useState(null); // full profile from API
    const [activeTab, setActiveTab] = useState('visits');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [doctorId, setDoctorId] = useState(null);

    const calcAge = (dob) => {
        if (!dob) return null;
        const birth = new Date(dob);
        if (isNaN(birth.getTime())) return null;
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age >= 0 ? age : null;
    };

    useEffect(() => {
        loadPatients();
        loadDoctorProfile();
    }, []);

    const loadDoctorProfile = async () => {
        try {
            const profile = await fetchDoctorProfile();
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
                    name: p.name || p.full_name || p.fullName || [p.first_name, p.last_name].filter(Boolean).join(" ") || "Unknown",
                    status: p.statusTag || "Analysis Ready",
                    statusClass: "ready",
                    dob: p.dob || p.date_of_birth || p.dateOfBirth || "N/A",
                    mrn: p.mrn || p.medical_record_number || "N/A",
                    lastVisit: p.lastVisit || p.last_visit || "N/A",
                    age: p.age || "N/A",
                    gender: p.gender || "N/A",
                    phone: p.phoneNumber || p.phone_number || p.phone || p.user?.phoneNumber || p.user?.phone || p.contact?.phone || "N/A",
                    email: p.email || p.email_address || p.user?.email || p.contact?.email || "N/A",
                    avatar: p.avatar || p.profile_image || p.photo || null
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
                            phone: apt.user?.phone || apt.user?.phoneNumber || apt.patient?.phoneNumber || apt.patient?.phone || "N/A",
                            email: apt.user?.email || apt.patient?.email || "N/A"
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

    const [visits, setVisits] = useState([]);
    const [loadingVisits, setLoadingVisits] = useState(false);

    // When patient selected, load their visits AND fetch full profile details
    useEffect(() => {
        if (selectedId) {
            loadVisits(selectedId);
            fetchPatientProfile(selectedId)
                .then(profile => setSelectedPatientDetail(profile))
                .catch(err => { console.warn("fetchPatientProfile failed:", err); setSelectedPatientDetail(null); });
        }
    }, [selectedId]);

    const loadVisits = async (pId) => {
        setLoadingVisits(true);
        try {
            const { fetchConsultations } = await import("@/services/consultation");
            const data = await fetchConsultations({ patient_id: pId });
            setVisits(data.consultations || data.items || (Array.isArray(data) ? data : []));
        } catch (err) {
            console.error("Failed to fetch visits:", err);
            setVisits([]);
        } finally {
            setLoadingVisits(false);
        }
    };

    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

    const filteredPatients = patientsList.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedPatient = filteredPatients.find(p => p.id === selectedId) || filteredPatients[0];

    // Merge list-level data with the full profile fetched separately
    const mergePatient = (p) => {
        if (!p) return null;
        const detail = (selectedPatientDetail && selectedPatientDetail.id === p.id) ? selectedPatientDetail : null;
        const dobRaw = detail?.dateOfBirth || detail?.date_of_birth || detail?.dob || p.dob;
        const computedAge = calcAge(dobRaw);
        return {
            ...p,
            dob: dobRaw
                ? new Date(dobRaw).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                : "N/A",
            age: computedAge !== null ? computedAge : p.age,
            gender: detail?.gender || p.gender || "N/A",
            phone: detail?.phoneNumber || detail?.phone_number || detail?.phone ||
                detail?.user?.phoneNumber || detail?.user?.phone ||
                detail?.contact?.phone || p.phone || "N/A",
            email: detail?.email || detail?.email_address || detail?.user?.email ||
                detail?.contact?.email || p.email || "N/A",
            mrn: detail?.mrn || detail?.medical_record_number || p.mrn || "N/A",
            avatar: detail?.avatar || detail?.profile_image || p.avatar || null,
        };
    };

    const enrichedSelectedPatient = mergePatient(selectedPatient);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ padding: '0 24px 24px 24px' }}

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

            <EditPatientModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                patientId={selectedId}
                onSuccess={() => {
                    loadPatients();
                    if (selectedId) loadVisits(selectedId);
                }}
            />

            <div className={styles.contentRow}>
                {/* Patient List */}
                <div className={styles.patientListCard}>
                    <div className={styles.listHeader}>
                        <div className={styles.colName}>NAME</div>
                        <div className={styles.colDob}>DOB / AGE</div>
                        <div className={styles.colEmail}>EMAIL</div>
                        <div className={styles.colMrn}>MRN</div>
                        <div className={styles.colVisit}>LAST VISIT</div>
                        <div className={styles.colProblem}>STATUS</div>
                    </div>

                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Loading patients...</div>
                    ) : filteredPatients.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: '#cbd5e1' }}>
                                <Users size={48} />
                            </div>
                            <div style={{ fontWeight: 600, color: "#64748b" }}>No patients found</div>
                            <div style={{ fontSize: "12px", marginTop: "4px" }}>Try adjusting your search or onboard a new patient.</div>
                        </div>
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
                                <div className={styles.itemText}>
                                    {patient.dob}
                                    {calcAge(patient.dob) !== null && <span style={{ opacity: 0.6, fontSize: "11px", marginLeft: "4px" }}>({calcAge(patient.dob)}y)</span>}
                                </div>
                                <div className={styles.itemText} style={{ fontSize: "12px", color: "#64748b" }}>{patient.email}</div>
                                <div className={styles.itemText}>{patient.mrn}</div>
                                <div className={styles.itemText}>{patient.lastVisit}</div>
                                <div className={styles.statusCol}>
                                    <span className={styles.arrow} style={{ color: selectedId === patient.id ? "#0081FE" : "#cbd5e0" }}>›</span>
                                </div>
                            </div>
                        )))}
                </div>

                {/* Patient Details */}
                {selectedPatient && enrichedSelectedPatient && (
                    <div className={styles.detailsPanel}>
                        <div className={styles.profileCard}>
                            {/* Avatar — initials fallback since API has no image URL */}
                            <div className={styles.avatarLarge} style={{
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: "linear-gradient(135deg, #359AFF, #9CCDFF)",
                                color: "#fff", fontSize: "22px", fontWeight: "700",
                                letterSpacing: "0.5px", userSelect: "none"
                            }}>
                                {selectedPatient.avatar
                                    ? <img src={selectedPatient.avatar} alt={selectedPatient.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                                    : (selectedPatient.name
                                        ? selectedPatient.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
                                        : "?")
                                }
                            </div>
                            <div className={styles.profileInfo}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className={styles.profileName}>{enrichedSelectedPatient.name}</div>
                                    <button
                                        onClick={() => setIsEditModalOpen(true)}
                                        className={styles.editProfileBtn}
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                                <div className={styles.profileMeta}>
                                    {enrichedSelectedPatient.age !== null && enrichedSelectedPatient.age !== "N/A"
                                        ? `${enrichedSelectedPatient.age} yrs`
                                        : ""}
                                    {enrichedSelectedPatient.gender && enrichedSelectedPatient.gender !== "N/A"
                                        ? ` · ${enrichedSelectedPatient.gender}`
                                        : ""}
                                </div>

                                <div className={styles.statsRow}>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>MRN</span>
                                        <span className={styles.statValue}>{enrichedSelectedPatient.mrn}</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>DOB</span>
                                        <span className={styles.statValue}>{enrichedSelectedPatient.dob}</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>PHONE</span>
                                        <span className={styles.statValue}>{enrichedSelectedPatient.phone}</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>EMAIL</span>
                                        <span className={styles.statValue} style={{ wordBreak: "break-all", fontSize: "11px" }}>{enrichedSelectedPatient.email}</span>
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
                                    </div>

                                    <div className={styles.visitList}>
                                        {loadingVisits ? (
                                            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Loading visits...</div>
                                        ) : visits.length === 0 ? (
                                            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: '#cbd5e1' }}>
                                                    <Calendar size={48} />
                                                </div>
                                                <div style={{ fontWeight: 600, color: "#64748b" }}>No visit records yet</div>
                                                <div style={{ fontSize: "12px", marginTop: "4px" }}>Consultation records will appear here after sessions are completed.</div>
                                            </div>
                                        ) : (
                                            visits.map((visit, idx) => (
                                                <div key={visit.id || idx} className={styles.visitCard}>
                                                    <div className={styles.visitDateRow}>
                                                        <span className={styles.visitDate}>{new Date(visit.scheduledAt || visit.date).toLocaleDateString()}</span>
                                                        <span className={styles.visitArrow}><ChevronRight size={16} /></span>
                                                    </div>
                                                    <span className={styles.visitType}>{visit.visitState || visit.visit_state || "CONSULTATION"}</span>
                                                    <p className={styles.visitNotes}>
                                                        {visit.chiefComplaint || visit.chief_complaint || visit.summary || visit.reason || "Patient encounter session recorded and processed."}
                                                    </p>
                                                    <Link href={`/dashboard/doctor/patients/soap?id=${visit.id}`} style={{ textDecoration: 'none' }}>
                                                        <button className={styles.soapBtn}>
                                                            View SOAP Note
                                                        </button>
                                                    </Link>
                                                </div>
                                            ))
                                        )}
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

export default function Patients() {
    return (
        <Suspense fallback={<div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Loading Patient Directory...</div>}>
            <PatientsContent />
        </Suspense>
    );
}
