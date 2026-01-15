"use client";
import { useState } from "react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import styles from "./Patients.module.css";

const patients = [
    {
        id: 1,
        name: "Rohit Sharma",
        status: "Analysis Ready",
        statusClass: "ready",
        dob: "01/12/80",
        mrn: "882-921",
        lastVisit: "01/12/80",
        age: 38,
        gender: "Male",
        phone: "(555) 123-4567"
    },
    {
        id: 2,
        name: "Sara Shetty",
        status: "Check-up pending",
        statusClass: "pending",
        dob: "08/08/80",
        mrn: "882-921",
        lastVisit: "08/08/80",
        age: 32,
        gender: "Female",
        phone: "(555) 987-6543"
    },
    {
        id: 3,
        name: "John Peak",
        status: "Post-op",
        statusClass: "pending",
        dob: "12/10/80",
        mrn: "882-921",
        lastVisit: "12/10/80",
        age: 45,
        gender: "Male",
        phone: "(555) 456-7890"
    },
    {
        id: 4,
        name: "Hamilton",
        status: "Operation",
        statusClass: "pending",
        dob: "12/10/80",
        mrn: "882-921",
        lastVisit: "12/10/80",
        age: 50,
        gender: "Male",
        phone: "(555) 222-3333"
    },
    {
        id: 5,
        name: "Vama Rev",
        status: "Cardiology",
        statusClass: "pending",
        dob: "12/10/80",
        mrn: "882-921",
        lastVisit: "12/10/80",
        age: 29,
        gender: "Female",
        phone: "(555) 111-2222"
    },
];

export default function Patients() {
    const [selectedId, setSelectedId] = useState(1);
    const selectedPatient = patients.find(p => p.id === selectedId);

    return (
        <div className={styles.container}>
            <Sidebar />
            <main className={styles.main}>
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

                        {patients.map((patient) => (
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
                                    </div>

                                    <div className={styles.tabs}>
                                        <div className={`${styles.tab} ${styles.active}`}>Visits</div>
                                        <div className={styles.tab}>Documents</div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Visits */}
                            <div>
                                <div className={styles.sectionHeader}>
                                    <h3 className={styles.sectionTitle}>Recent Visits</h3>
                                    <button className={styles.newVisitBtn}>+ New Visit</button>
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
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
