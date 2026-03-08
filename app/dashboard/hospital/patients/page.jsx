"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchHospitalPatients, fetchHospitalStats } from "@/services/hospital";
import { motion, AnimatePresence } from "framer-motion";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import {
    Users,
    UserPlus,
    AlertCircle,
    Search,
    ChevronRight,
    Calendar,
    Filter,
    ArrowRight
} from "lucide-react";

export default function PatientsPage() {
    const router = useRouter();
    const [patients, setPatients] = useState([]);
    const [stats, setStats] = useState({ patientsToday: 0 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [patientData, statData] = await Promise.all([
                    fetchHospitalPatients(),
                    fetchHospitalStats()
                ]);
                setPatients(patientData?.patients || []);
                setStats(statData || { patientsToday: 0 });
            } catch (err) {
                console.error("Failed to load patients data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredPatients = patients.filter(p =>
        (p.full_name || p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.mrn || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const statCards = [
        { label: "Active Registry", value: patients.length, icon: <Users size={22} />, color: "#3b82f6", bg: "#eff6ff" },
        { label: "Admissions Today", value: stats.patientsToday, icon: <UserPlus size={22} />, color: "#10b981", bg: "#f0fdf4" },
        { label: "Critical Alerts", value: 0, icon: <AlertCircle size={22} />, color: "#ef4444", bg: "#fef2f2" }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', background: 'transparent', padding: 0, minHeight: '100%' }}
        >
            <Topbar title="Patient Registry" onSearch={setSearchQuery} />

            <div className={styles.contentWrapper} style={{ padding: "32px" }}>
                <div style={{ marginBottom: "40px" }}>
                    <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#0f172a", margin: 0, letterSpacing: "-0.03em" }}>
                        Patient Directory
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "16px", marginTop: "8px", fontWeight: "500" }}>
                        Comprehensive clinical workspace for managing patient records and historical data.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "40px" }}>
                    {statCards.map((s, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -4 }}
                            style={{
                                background: '#ffffff',
                                padding: '28px',
                                borderRadius: '24px',
                                border: '1px solid #f1f5f9',
                                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)"
                            }}
                        >
                            <div style={{
                                width: "48px", height: "48px", borderRadius: "14px",
                                background: s.bg, color: s.color,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                marginBottom: "20px"
                            }}>
                                {s.icon}
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: "0.05em" }}>{s.label}</div>
                            <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{s.value}</div>
                        </motion.div>
                    ))}
                </div>

                <div style={{
                    background: '#ffffff',
                    borderRadius: '24px',
                    border: '1px solid #f1f5f9',
                    overflow: 'hidden',
                    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)"
                }}>
                    <div style={{ padding: "24px 32px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ background: "#f8fafc", padding: "8px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "8px" }}>
                                <Filter size={16} color="#64748b" />
                                <span style={{ fontSize: "13px", fontWeight: "700", color: "#475569" }}>All Wings</span>
                            </div>
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "13px", fontWeight: "600" }}>
                            Displaying {filteredPatients.length} records
                        </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                                    <th style={{ padding: '20px 32px', fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>MRN Identifier</th>
                                    <th style={{ padding: '20px 16px', fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Patient Information</th>
                                    <th style={{ padding: '20px 16px', fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Demographics</th>
                                    <th style={{ padding: '20px 16px', fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Last Admitted</th>
                                    <th style={{ padding: '20px 32px', textAlign: 'right' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ padding: '100px', textAlign: 'center' }}><div className={styles.spinner}></div></td></tr>
                                ) : filteredPatients.length === 0 ? (
                                    <tr><td colSpan="5" style={{ padding: '100px', textAlign: 'center', color: '#94a3b8', fontWeight: "700" }}>No clinical records found.</td></tr>
                                ) : filteredPatients.map((p, i) => (
                                    <motion.tr
                                        key={i}
                                        whileHover={{ background: "#fcfdfe" }}
                                        style={{ borderBottom: "1px solid #f8fafc", cursor: "pointer" }}
                                        onClick={() => router.push(`/dashboard/hospital/patients/${p.id}`)}
                                    >
                                        <td style={{ padding: '24px 32px' }}>
                                            <span style={{
                                                background: "#eff6ff",
                                                color: "#3b82f6",
                                                padding: "6px 12px",
                                                borderRadius: "8px",
                                                fontSize: "12px",
                                                fontWeight: "800",
                                                letterSpacing: "0.02em"
                                            }}>
                                                {p.mrn || "MRN-PENDING"}
                                            </span>
                                        </td>
                                        <td style={{ padding: '24px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{
                                                    width: '48px', height: '48px', borderRadius: '16px',
                                                    background: 'linear-gradient(135deg, #3b82f615, #6366f120)',
                                                    color: '#3b82f6',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: '900', fontSize: '14px', flexShrink: 0
                                                }}>
                                                    {(p.full_name || p.name || "P").split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '16px' }}>
                                                        {p.full_name || p.name || "Anonymous Patient"}
                                                    </div>
                                                    <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "2px", fontWeight: "600" }}>
                                                        Primary Care Record
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td style={{ padding: '24px 16px' }}>
                                            <div style={{ textTransform: 'capitalize', fontWeight: "700", color: "#475569", fontSize: "14px" }}>{p.gender || "Not Specified"}</div>
                                            <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "2px" }}>{p.age ? `${p.age} years` : "Age N/A"}</div>
                                        </td>

                                        <td style={{ padding: '24px 16px', color: "#64748b", fontSize: "14px", fontWeight: "600" }}>
                                            {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : "Inpatient Today"}
                                        </td>

                                        <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                                            <button
                                                style={{
                                                    background: "transparent",
                                                    border: "1.5px solid #e2e8f0",
                                                    color: "#475569",
                                                    padding: "8px 16px",
                                                    borderRadius: "12px",
                                                    fontSize: "13px",
                                                    fontWeight: "800",
                                                    cursor: "pointer",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "8px",
                                                    transition: "all 0.2s"
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#3b82f6"; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}
                                            >
                                                Clinical File <ArrowRight size={14} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
