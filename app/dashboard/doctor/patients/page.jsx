"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Topbar from "../components/Topbar";
import DocumentsList from "./components/DocumentsList";
import PatientAIChat from "./components/PatientAIChat";
import PatientVitals from "./components/PatientVitals";
import styles from "./Patients.module.css";
import { motion } from "framer-motion";
import { Users, Calendar, ChevronRight, MoreVertical, Trash2, Search } from "lucide-react";
import { fetchAppointments, fetchPatients, fetchDoctorProfile, fetchPatientProfile } from "@/services/doctor";
import { checkPermissions, requestAccess, revokeDoctorAccess } from "@/services/permissions";
import OnboardPatientModal from "./components/OnboardPatientModal";
import EditPatientModal from "./components/EditPatientModal";

function PatientsContent() {
    const [patientsList, setPatientsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedPatientDetail, setSelectedPatientDetail] = useState(null);
    const [activeTab, setActiveTab] = useState('visits');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [doctorId, setDoctorId] = useState(null);

    const [openMenuId, setOpenMenuId] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [actionToast, setActionToast] = useState(null);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const menuRef = useRef(null);

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
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const showToast = (msg, type = "success") => {
        setActionToast({ msg, type });
        setTimeout(() => setActionToast(null), 3500);
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

    const handleCheckPermission = async (patient) => {
        if (!doctorId) return;
        setActionLoading(patient.id);
        setOpenMenuId(null);
        try {
            const result = await checkPermissions(patient.id, doctorId);
            const hasAccess = result?.has_access ?? result?.access ?? result?.allowed ?? false;
            if (hasAccess) {
                showToast(`✅ You have access to ${patient.name}'s records.`, "success");
                setPermissionDenied(false);
            } else {
                showToast(`🔒 No access to ${patient.name}'s records.`, "error");
                if (selectedId === patient.id) setPermissionDenied(true);
            }
        } catch (err) {
            showToast(`Error checking permission: ${err.message}`, "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRequestAccess = async (patient) => {
        if (!doctorId) return;
        setActionLoading(patient.id);
        setOpenMenuId(null);
        try {
            await requestAccess({ patient_id: patient.id, doctor_id: doctorId, access_level: "read_analyze", ai_access_permission: true });
            showToast(`📨 Access request sent to ${patient.name}.`, "success");
        } catch (err) {
            showToast(`Failed: ${err.message}`, "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRevokeAccess = async (patient) => {
        if (!doctorId) return;
        setActionLoading(patient.id);
        setOpenMenuId(null);
        try {
            await revokeDoctorAccess({ patient_id: patient.id, doctor_id: doctorId });
            showToast(`Access to ${patient.name} revoked.`, "info");
        } catch (err) {
            showToast(`Failed: ${err.message}`, "error");
        } finally {
            setActionLoading(null);
        }
    };

    const loadPatients = async () => {
        setLoading(true);
        try {
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
                    avatar: p.avatar || p.profile_image || p.photo || null,
                }));
                setPatientsList(mappedPatients);
                if (mappedPatients.length > 0 && !selectedId) setSelectedId(mappedPatients[0].id);
            } else {
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
                            email: apt.user?.email || apt.patient?.email || "N/A",
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
    const [deletingVisitId, setDeletingVisitId] = useState(null);

    const handleDeleteConsultation = async (visitId) => {
        if (!confirm("Are you sure you want to delete this consultation record? This cannot be undone.")) return;
        setDeletingVisitId(visitId);
        try {
            const { deleteConsultation } = await import("@/services/consultation");
            await deleteConsultation(visitId);
            showToast("Consultation record deleted successfully.", "success");
            loadVisits(selectedId);
        } catch (err) {
            console.error(err);
            showToast(err.message || "Failed to delete consultation record.", "error");
        } finally {
            setDeletingVisitId(null);
        }
    };

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

    const mergePatient = (p) => {
        if (!p) return null;
        const detail = (selectedPatientDetail && selectedPatientDetail.id === p.id) ? selectedPatientDetail : null;
        const dobRaw = detail?.dateOfBirth || detail?.date_of_birth || detail?.dob || p.dob;
        const computedAge = calcAge(dobRaw);
        return {
            ...p,
            dob: dobRaw ? new Date(dobRaw).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A",
            age: computedAge !== null ? computedAge : p.age,
            gender: detail?.gender || p.gender || "N/A",
            phone: detail?.phoneNumber || detail?.phone_number || detail?.phone || detail?.user?.phoneNumber || detail?.user?.phone || detail?.contact?.phone || p.phone || "N/A",
            email: detail?.email || detail?.email_address || detail?.user?.email || detail?.contact?.email || p.email || "N/A",
            mrn: detail?.mrn || detail?.medical_record_number || p.mrn || "N/A",
            avatar: detail?.avatar || detail?.profile_image || p.avatar || null,
        };
    };

    const enrichedSelectedPatient = mergePatient(selectedPatient);

    return (
        <>
            {/* Topbar outside padded wrapper so it flush-aligns with sidebar — no grey gap */}
            <div className="patients-topbar-wrap">
                <Topbar />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ padding: '24px' }}
            >
                {/* ── Page Header: title left, search + button right, all one line ── */}
                <div className={styles.pageHeader}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.title}>Patient Directory</h1>
                        <p className={styles.headerSubtitle}>Manage clinical records and patient access.</p>
                    </div>

                    <div className={styles.headerControls}>
                        {/* Search with lucide icon */}
                        {/* <div className={styles.searchWrapper}>
                            <span className={styles.searchIcon}>
                                <Search size={14} />
                            </span>
                            <input
                                type="text"
                                placeholder="Search by name or MRN..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div> */}
                        <button onClick={() => setIsModalOpen(true)} className={styles.onboardBtn}>
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
                    onSuccess={() => { loadPatients(); if (selectedId) loadVisits(selectedId); }}
                />

                <div className={styles.contentRow}>
                    {/* Patient List */}
                    <div className={styles.patientListCard}>
                        <div className={styles.listHeader}>
                            <div className={styles.colName}>NAME</div>
                            <div className={styles.colDob}>DOB / AGE</div>
                            <div className={styles.colMrn}>MRN</div>
                            <div className={styles.colVisit}>LAST VISIT</div>
                            <div className={styles.colProblem}>STATUS</div>
                        </div>

                        {loading ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Loading patients...</div>
                        ) : filteredPatients.length === 0 ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: '#cbd5e1' }}>
                                    <Users size={40} />
                                </div>
                                <div style={{ fontWeight: 600, color: "#64748b" }}>No patients found</div>
                                <div style={{ fontSize: "12px", marginTop: "4px" }}>Try adjusting your search or onboard a new patient.</div>
                            </div>
                        ) : (
                            <div ref={menuRef}>
                                {filteredPatients.map((patient) => (
                                    <div
                                        key={patient.id}
                                        className={`${styles.patientItem} ${selectedId === patient.id ? styles.active : ''}`}
                                        onClick={() => { setSelectedId(patient.id); setPermissionDenied(false); }}
                                        style={{ position: "relative" }}
                                    >
                                        <div className={styles.nameGroup}>
                                            <span className={styles.pName}>{patient.name}</span>
                                            <span className={`${styles.pStatus} ${styles[patient.statusClass]}`}>{patient.status}</span>
                                        </div>
                                        <div className={styles.itemText}>
                                            {patient.dob}
                                            {calcAge(patient.dob) !== null && (
                                                <span style={{ opacity: 0.6, fontSize: "11px", marginLeft: "4px" }}>({calcAge(patient.dob)}y)</span>
                                            )}
                                        </div>
                                        <div className={styles.itemText}>{patient.mrn}</div>
                                        <div className={styles.itemText}>{patient.lastVisit}</div>
                                        <div className={styles.statusCol} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === patient.id ? null : patient.id); }}
                                                disabled={actionLoading === patient.id}
                                                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "2px", borderRadius: "4px", display: "flex", alignItems: "center", opacity: actionLoading === patient.id ? 0.5 : 1 }}
                                                title="Patient actions"
                                            >
                                                {actionLoading === patient.id
                                                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                                    : <MoreVertical size={14} />}
                                            </button>

                                            {openMenuId === patient.id && (
                                                <div style={{ position: "absolute", right: "8px", top: "100%", zIndex: 500, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: "180px", overflow: "hidden" }}
                                                    onClick={e => e.stopPropagation()}>
                                                    {[
                                                        { label: "📂 View Documents", action: () => { setSelectedId(patient.id); setActiveTab("documents"); setOpenMenuId(null); } },
                                                        { label: "📨 Request Access", action: () => handleRequestAccess(patient) },
                                                        { label: "🔍 Check Permission", action: () => handleCheckPermission(patient) },
                                                        { label: "🚫 Revoke Access", action: () => handleRevokeAccess(patient), danger: true },
                                                    ].map((item) => (
                                                        <button key={item.label} onClick={item.action} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", background: "none", border: "none", fontSize: "13px", cursor: "pointer", color: item.danger ? "#ef4444" : "#1e293b", fontWeight: "500", borderBottom: "1px solid #f8fafc", transition: "background 0.1s" }}
                                                            onMouseEnter={e => e.currentTarget.style.background = item.danger ? "#fff5f5" : "#f8fafc"}
                                                            onMouseLeave={e => e.currentTarget.style.background = "none"}>
                                                            {item.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            <span className={styles.arrow} style={{ color: selectedId === patient.id ? "#0081FE" : "#cbd5e0" }}>›</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Patient Details */}
                    {selectedPatient && enrichedSelectedPatient && (
                        <div className={styles.detailsPanel}>
                            {permissionDenied && (
                                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 16px", marginBottom: "4px", display: "flex", alignItems: "center", gap: "10px" }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                                    <div>
                                        <div style={{ fontSize: "13px", fontWeight: "700", color: "#dc2626" }}>Access Restricted</div>
                                        <div style={{ fontSize: "12px", color: "#91231c" }}>Access to this patient's records requires patient approval.</div>
                                    </div>
                                    <button onClick={() => setPermissionDenied(false)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>✕</button>
                                </div>
                            )}

                            <div className={styles.profileCard}>
                                <div className={styles.avatarLarge} style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #359AFF, #9CCDFF)", color: "#fff", fontSize: "20px", fontWeight: "700", userSelect: "none" }}>
                                    {selectedPatient.avatar
                                        ? <img src={selectedPatient.avatar} alt={selectedPatient.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                                        : (selectedPatient.name ? selectedPatient.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "?")}
                                </div>

                                <div className={styles.profileInfo}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div className={styles.profileName}>{enrichedSelectedPatient.name}</div>
                                        <button onClick={() => setIsEditModalOpen(true)} className={styles.editProfileBtn}>Edit Profile</button>
                                    </div>
                                    <div className={styles.profileMeta}>
                                        {enrichedSelectedPatient.age !== null && enrichedSelectedPatient.age !== "N/A" ? `${enrichedSelectedPatient.age} yrs` : ""}
                                        {enrichedSelectedPatient.gender && enrichedSelectedPatient.gender !== "N/A" ? ` · ${enrichedSelectedPatient.gender}` : ""}
                                    </div>

                                    <div className={styles.statsRow}>
                                        {[
                                            { label: "MRN", value: enrichedSelectedPatient.mrn },
                                            { label: "DOB", value: enrichedSelectedPatient.dob },
                                            { label: "PHONE", value: enrichedSelectedPatient.phone },
                                            { label: "EMAIL", value: enrichedSelectedPatient.email },
                                        ].map(s => (
                                            <div key={s.label} className={styles.statItem}>
                                                <span className={styles.statLabel}>{s.label}</span>
                                                <span className={styles.statValue} style={{ fontSize: s.label === "EMAIL" ? "11px" : undefined, wordBreak: s.label === "EMAIL" ? "break-all" : undefined }}>{s.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className={styles.tabs}>
                                        {['visits', 'documents', 'ai-chat', 'vitals'].map(tab => (
                                            <div key={tab} className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`} onClick={() => setActiveTab(tab)}>
                                                {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className={styles.tabContent}>
                                {activeTab === 'visits' && (
                                    <div>
                                        <div className={styles.sectionHeader}>
                                            <h3 className={styles.sectionTitle}>Recent Visits</h3>
                                        </div>
                                        <div className={styles.visitList}>
                                            {loadingVisits ? (
                                                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Loading visits...</div>
                                            ) : visits.length === 0 ? (
                                                <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: '#cbd5e1' }}><Calendar size={40} /></div>
                                                    <div style={{ fontWeight: 600, color: "#64748b" }}>No visit records yet</div>
                                                    <div style={{ fontSize: "12px", marginTop: "4px" }}>Consultation records will appear here after sessions are completed.</div>
                                                </div>
                                            ) : visits.map((visit, idx) => (
                                                <div key={visit.id || idx} className={styles.visitCard}>
                                                    <div className={styles.visitDateRow}>
                                                        <span className={styles.visitDate}>{new Date(visit.scheduledAt || visit.date).toLocaleDateString()}</span>
                                                        <span className={styles.visitArrow}><ChevronRight size={16} /></span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                                        <span style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", background: visit.status === "completed" ? "#f0fdf4" : "#f8fafc", color: visit.status === "completed" ? "#16a34a" : "#64748b", border: `1px solid ${visit.status === "completed" ? "#bbf7d0" : "#e2e8f0"}` }}>
                                                            MEETING: {visit.status || "UNKNOWN"}
                                                        </span>
                                                        <span style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", background: visit.aiStatus === "completed" ? "#f0fdf4" : visit.aiStatus === "processing" ? "#eff6ff" : visit.aiStatus === "failed" ? "#fef2f2" : "#f8fafc", color: visit.aiStatus === "completed" ? "#16a34a" : visit.aiStatus === "processing" ? "#2563eb" : visit.aiStatus === "failed" ? "#dc2626" : "#64748b", border: `1px solid ${visit.aiStatus === "completed" ? "#bbf7d0" : visit.aiStatus === "processing" ? "#bfdbfe" : visit.aiStatus === "failed" ? "#fecaca" : "#e2e8f0"}` }}>
                                                            SOAP: {visit.aiStatus || "PENDING"}
                                                        </span>
                                                        {visit.visitState && visit.visitState !== "scheduled" && (
                                                            <span className={styles.visitType}>{visit.visitState || visit.visit_state}</span>
                                                        )}
                                                    </div>
                                                    <p className={styles.visitNotes}>
                                                        {(typeof (visit.chiefComplaint || visit.chief_complaint || visit.summary || visit.reason) === 'object'
                                                            ? ((visit.chiefComplaint || visit.chief_complaint || visit.summary || visit.reason)?.chief_complaint || JSON.stringify(visit.chiefComplaint || visit.chief_complaint || visit.summary || visit.reason))
                                                            : (visit.chiefComplaint || visit.chief_complaint || visit.summary || visit.reason)) || "Patient encounter session recorded and processed."}
                                                    </p>
                                                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                                        <Link href={`/dashboard/doctor/patients/soap?consultationId=${visit.id}`} style={{ textDecoration: 'none', flex: 1 }}>
                                                            <button className={styles.soapBtn} style={{ width: '100%' }}>View SOAP Note</button>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteConsultation(visit.id)}
                                                            disabled={deletingVisitId === visit.id}
                                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', borderRadius: '8px', cursor: deletingVisitId === visit.id ? 'not-allowed' : 'pointer', background: '#fff', border: '1px solid #fee2e2', color: '#ef4444', opacity: deletingVisitId === visit.id ? 0.5 : 1, transition: 'all 0.2s' }}
                                                            onMouseEnter={e => { if (deletingVisitId !== visit.id) e.currentTarget.style.background = '#fef2f2'; }}
                                                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                                            title="Delete Consultation"
                                                        >
                                                            {deletingVisitId === visit.id
                                                                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                                                : <Trash2 size={18} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'documents' && <DocumentsList patientId={selectedPatient.id} />}
                                {activeTab === 'ai-chat' && doctorId && (
                                    <div style={{ height: '600px' }}>
                                        <PatientAIChat patientId={selectedPatient.id} chatType="doctor" doctorId={doctorId} />
                                    </div>
                                )}
                                {activeTab === 'vitals' && <PatientVitals patientId={selectedPatient.id} />}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Toast */}
            {actionToast && (
                <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 99999, background: actionToast.type === "error" ? "#fee2e2" : actionToast.type === "info" ? "#f0f9ff" : "#f0fdf4", color: actionToast.type === "error" ? "#dc2626" : actionToast.type === "info" ? "#0369a1" : "#16a34a", border: `1px solid ${actionToast.type === "error" ? "#fecaca" : actionToast.type === "info" ? "#bae6fd" : "#bbf7d0"}`, padding: "12px 18px", borderRadius: "12px", fontSize: "13px", fontWeight: "600", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", maxWidth: "320px", animation: "slideInToast 0.3s ease" }}>
                    {actionToast.msg}
                </div>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes slideInToast { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } } .patients-topbar-wrap [class*="topbarSearchWrap"] { display: none !important; } ::-webkit-scrollbar { display: none; } * { scrollbar-width: none; }`}</style>
        </>
    );
}

export default function Patients() {
    return (
        <Suspense fallback={<div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Loading Patient Directory...</div>}>
            <PatientsContent />
        </Suspense>
    );
}