"use client";
import { useState, useEffect } from "react";
import { fetchPatients } from "@/services/doctor";
import { fetchHospitalStats } from "@/services/hospital";
import { motion } from "framer-motion";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";

export default function PatientsPage() {
    const [patients, setPatients] = useState([]);
    const [stats, setStats] = useState({ patientsToday: 0 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [patientData, statData] = await Promise.all([
                    fetchPatients(),
                    fetchHospitalStats()
                ]);
                setPatients(patientData || []);
                setStats(statData);
            } catch (err) {
                console.error("Failed to load patients data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredPatients = patients.filter(p =>
        (p.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.mrn || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const statCards = [
        { label: "Active Patients", value: patients.length, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>, color: "#359aff" },
        { label: "Patients Today", value: stats.patientsToday, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>, color: "#10b981" },
        { label: "Critical Alerts", value: 0, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>, color: "#ef4444" }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', background: 'transparent', padding: 0, minHeight: '100%' }}
        >
            <Topbar title="Patient Directory" onSearch={setSearchQuery} />

            <div className={styles.contentWrapper}>
                <div className={styles.pageHeaderRow} style={{ marginBottom: "32px", display: "flex", flexDirection: "column", gap: "6px" }}>

                    <h1
                        style={{
                            fontSize: "24px",
                            fontWeight: "800",
                            color: "#0f172a",
                            margin: 0
                        }}
                    >
                        Patients
                    </h1>

                    <p
                        style={{
                            color: "#64748b",
                            fontSize: "14px",
                            fontWeight: "500",
                            lineHeight: "1.5",
                            margin: 0
                        }}
                    >
                        Comprehensive registry of all clinical patients across hospital wings.
                    </p>

                </div>

                <div className={styles.overviewSection} style={{ marginBottom: '32px' }}>
                    {statCards.map((s, i) => (
                        <div key={i} style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                            <div style={{ color: s.color, marginBottom: '12px' }}>{s.icon}</div>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>{s.label}</div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{s.value}</div>
                        </div>
                    ))}
                </div>

                <div className={styles.card} style={{ border: 'none', borderRadius: '16px', padding: '0', overflow: 'hidden' }}>
                    <div className={styles.tableScrollWrapper}>
                        <table className={styles.activityTable} style={{ fontSize: '13px' }}>
                            <thead>
                                <tr className={styles.activityHeader}>
                                    <th style={{ padding: '16px 24px' }}>MRN</th>
                                    <th>PATIENT NAME</th>
                                    <th>GENDER</th>
                                    <th>LAST VISIT</th>
                                    <th style={{ textAlign: 'right', paddingRight: '24px' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading patient registry...</td></tr>
                                ) : filteredPatients.length === 0 ? (
                                    <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No patients found matching your search.</td></tr>
                                ) : filteredPatients.map((p, i) => (
                                    <tr key={i} className={styles.activityRow}>
                                        <td style={{ padding: '16px 24px', fontWeight: '700', color: '#3b82f6' }}>#{p.mrn || p.id?.substring(0, 8).toUpperCase() || "N/A"}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '11px' }}>
                                                    {(p.full_name || "P").split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div style={{ fontWeight: '700' }}>{p.full_name}</div>
                                            </div>
                                        </td>
                                        <td style={{ textTransform: 'capitalize' }}>{p.gender || "Other"}</td>
                                        <td>{p.last_visit || "Today"}</td>
                                        <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                                            <button className={styles.outlineBtn} style={{ height: '32px', fontSize: '12px' }}>View Records</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
