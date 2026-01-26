"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Topbar from "../components/Topbar";
import DocumentsList from "./components/DocumentsList";
import styles from "./Patients.module.css";
import { motion } from "framer-motion";
// import { fetchPatients } from "@/services/doctor";

export default function Patients() {
    const [patientsList, setPatientsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [activeTab, setActiveTab] = useState('visits');

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        setLoading(true);
        try {
            // TODO: Replace with actual API call
            // const data = await fetchPatients();
            // setPatientsList(data);

            // Dummy data for now
            const dummyPatients = [
                {
                    id: 1,
                    name: "Rohit Sharma",
                    status: "Analysis Ready",
                    statusClass: "ready",
                    dob: "01/12/80",
                    mrn: "882-921",
                    lastVisit: "15/01/26",
                    age: 38,
                    gender: "Male",
                    phone: "(555) 123-4567",
                    email: "rohit@example.com"
                },
                {
                    id: 2,
                    name: "Sara Shetty",
                    status: "Check-up pending",
                    statusClass: "pending",
                    dob: "08/08/80",
                    mrn: "882-922",
                    lastVisit: "08/08/80",
                    age: 32,
                    gender: "Female",
                    phone: "(555) 987-6543",
                    email: "sara@example.com"
                },
                {
                    id: 3,
                    name: "John Peak",
                    status: "Post-op",
                    statusClass: "pending",
                    dob: "12/10/80",
                    mrn: "882-923",
                    lastVisit: "12/10/80",
                    age: 45,
                    gender: "Male",
                    phone: "(555) 456-7890",
                    email: "john@example.com"
                }
            ];
            setPatientsList(dummyPatients);
            if (dummyPatients.length > 0) setSelectedId(dummyPatients[0].id);
        } catch (error) {
            console.error("Failed to fetch patients:", error);
        } finally {
            setLoading(false);
        }
    };

    const selectedPatient = patientsList.find(p => p.id === selectedId);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Topbar />

            <h2 className={styles.title}>Patient Directory</h2>

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
                    ) : patientsList.map((patient) => (
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
                    ))}
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
                            ) : (
                                <DocumentsList patientId={selectedPatient.id} />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
