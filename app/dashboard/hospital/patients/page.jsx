"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchHospitalPatients, fetchHospitalStats } from "@/services/hospital";
import { motion } from "framer-motion";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import pStyles from "./HospitalPatients.module.css";
import { Users, UserPlus, AlertCircle, Filter, ArrowRight } from "lucide-react";

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
        { label: "Active Registry", value: patients.length, icon: <Users size={20} />, color: "#3b82f6", bg: "#eff6ff" },
        { label: "Admissions Today", value: stats.patientsToday, icon: <UserPlus size={20} />, color: "#10b981", bg: "#f0fdf4" },
        { label: "Critical Alerts", value: 0, icon: <AlertCircle size={20} />, color: "#ef4444", bg: "#fef2f2" },
    ];

    const getInitials = (p) =>
        (p.full_name || p.name || "P").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", flexDirection: "column", background: "transparent", padding: 0, minHeight: "100%" }}
        >
            <Topbar title="Patient Registry" onSearch={setSearchQuery} />

            <div className={pStyles.wrapper}>

                {/* ── Header ── */}
                <div className={pStyles.pageHeader}>
                    <div>
                        <h1 className={pStyles.pageTitle}>Patient Directory</h1>
                        <p className={pStyles.pageSub}>
                            Comprehensive clinical workspace for managing patient records.
                        </p>
                    </div>
                </div>

                {/* ── Search (mobile-visible) ── */}
                <div className={pStyles.mobileSearch}>
                    <input
                        type="text"
                        placeholder="Search by name or MRN…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className={pStyles.searchInput}
                    />
                </div>

                {/* ── Stats ── */}
                <div className={pStyles.statsGrid}>
                    {statCards.map((s, i) => (
                        <div key={i} className={pStyles.statCard}>
                            <div className={pStyles.statIcon} style={{ color: s.color, background: s.bg }}>
                                {s.icon}
                            </div>
                            <div>
                                <div className={pStyles.statLabel}>{s.label}</div>
                                <div className={pStyles.statValue}>{loading ? "…" : s.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Table card ── */}
                <div className={pStyles.tableCard}>
                    <div className={pStyles.tableHeader}>
                        <div className={pStyles.filterPill}>
                            <Filter size={14} color="#64748b" />
                            <span>All Wings</span>
                        </div>
                        <div className={pStyles.recordCount}>
                            {filteredPatients.length} record{filteredPatients.length !== 1 ? "s" : ""}
                        </div>
                    </div>

                    {/* Desktop table */}
                    <div className={pStyles.tableWrap}>
                        <table className={pStyles.table}>
                            <thead>
                                <tr>
                                    <th>MRN</th>
                                    <th>Patient</th>
                                    <th>Demographics</th>
                                    <th>Last Admitted</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className={pStyles.emptyCell}>Loading records…</td></tr>
                                ) : filteredPatients.length === 0 ? (
                                    <tr><td colSpan="5" className={pStyles.emptyCell}>No clinical records found.</td></tr>
                                ) : filteredPatients.map((p, i) => (
                                    <tr key={i} className={pStyles.tableRow}
                                        onClick={() => router.push(`/dashboard/hospital/patients/${p.id}`)}>
                                        <td>
                                            <span className={pStyles.mrnBadge}>{p.mrn || "MRN-PENDING"}</span>
                                        </td>
                                        <td>
                                            <div className={pStyles.patientCell}>
                                                <div className={pStyles.avatar}>{getInitials(p)}</div>
                                                <div>
                                                    <div className={pStyles.patientName}>{p.full_name || p.name || "Anonymous"}</div>
                                                    <div className={pStyles.patientSub}>Primary Care Record</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={pStyles.demoGender}>{p.gender || "Not Specified"}</div>
                                            <div className={pStyles.demoAge}>{p.age ? `${p.age} yrs` : "Age N/A"}</div>
                                        </td>
                                        <td className={pStyles.dateCell}>
                                            {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : "Inpatient Today"}
                                        </td>
                                        <td>
                                            <button className={pStyles.fileBtn}>
                                                Clinical File <ArrowRight size={13} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Mobile cards (hidden on desktop) ── */}
                <div className={pStyles.mobileList}>
                    {loading ? (
                        <div className={pStyles.emptyCell}>Loading records…</div>
                    ) : filteredPatients.length === 0 ? (
                        <div className={pStyles.emptyCell}>No clinical records found.</div>
                    ) : filteredPatients.map((p, i) => (
                        <div key={i} className={pStyles.mobileCard}
                            onClick={() => router.push(`/dashboard/hospital/patients/${p.id}`)}>
                            <div className={pStyles.mobileCardTop}>
                                <div className={pStyles.patientCell}>
                                    <div className={pStyles.avatar}>{getInitials(p)}</div>
                                    <div>
                                        <div className={pStyles.patientName}>{p.full_name || p.name || "Anonymous"}</div>
                                        <div className={pStyles.patientSub}>{p.gender || "—"} · {p.age ? `${p.age} yrs` : "Age N/A"}</div>
                                    </div>
                                </div>
                                <ArrowRight size={16} color="#94a3b8" />
                            </div>
                            <div className={pStyles.mobileCardMeta}>
                                <span className={pStyles.mrnBadge}>{p.mrn || "MRN-PENDING"}</span>
                                <span className={pStyles.dateCell}>
                                    {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : "Inpatient Today"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </motion.div>
    );
}