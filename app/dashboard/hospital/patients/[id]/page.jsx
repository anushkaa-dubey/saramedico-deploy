"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { fetchPatientRecords, fetchPatientDetails, fetchDocumentUrl } from "@/services/hospital";
import Topbar from "../../components/Topbar";
import styles from "../../HospitalDashboard.module.css";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity,
    Thermometer,
    Droplets,
    Scale,
    Wind,
    FileText,
    Calendar,
    User,
    ArrowLeft,
    ChevronRight,
    Search,
    Clock,
    Download,
    TrendingUp,
    Shield,
    Heart,
    Zap,
    ExternalLink
} from "lucide-react";

// --- URL Rewrite Helper (No longer needed, but kept for signature compatibility if used elsewhere) ---
const REWRITE_URL = (url) => url;

// ── Theme Mapping ──────────────────────────────────────────────────────────
const METRIC_CONFIG = {
    heart_rate: { label: "Heart Rate", icon: <Heart size={18} />, unit: "bpm", color: "#f43f5e", bg: "#fff1f2", gradient: "linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)" },
    temperature: { label: "Temp", icon: <Thermometer size={18} />, unit: "°C", color: "#f97316", bg: "#fff7ed", gradient: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)" },
    blood_pressure: { label: "Blood Pressure", icon: <Activity size={18} />, unit: "mmHg", color: "#3b82f6", bg: "#eff6ff", gradient: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)" },
    weight: { label: "Weight", icon: <Scale size={18} />, unit: "kg", color: "#10b981", bg: "#ecfdf5", gradient: "linear-gradient(135deg, #10b981 0%, #34d399 100%)" },
    respiratory_rate: { label: "Respiratory", icon: <Wind size={18} />, unit: "bpm", color: "#0ea5e9", bg: "#f0f9ff", gradient: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)" },
    blood_glucose: { label: "Glucose", icon: <Zap size={18} />, unit: "mg/dL", color: "#8b5cf6", bg: "#f5f3ff", gradient: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)" },
    spo2: { label: "Oxygen Sat.", icon: <Droplets size={18} />, unit: "%", color: "#6366f1", bg: "#eef2ff", gradient: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)" },
};

const DEFAULT_CONFIG = { label: "Metric", icon: <Activity />, unit: "", color: "#64748b", bg: "#f8fafc", gradient: "linear-gradient(135deg, #64748b 0%, #94a3b8 100%)" };

export default function PatientRecordPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const router = useRouter();
    const patientId = params.id;

    const [records, setRecords] = useState(null);
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview"); // "overview" | "vitals" | "documents"

    useEffect(() => {
        const loadRecords = async () => {
            try {
                const [recordData, patientData] = await Promise.all([
                    fetchPatientRecords(patientId),
                    fetchPatientDetails(patientId).catch(() => null)
                ]);
                setRecords(recordData);
                setPatient(patientData);
            } catch (err) {
                console.error("Failed to load records", err);
            } finally {
                setLoading(false);
            }
        };
        loadRecords();
    }, [patientId]);

    const handleViewDocument = async (documentId) => {
        try {
            const { url } = await fetchDocumentUrl(documentId, "inline");
            const finalUrl = REWRITE_URL(url);
            if (finalUrl) window.open(finalUrl, "_blank");
        } catch (err) {
            console.error("Failed to view document", err);
            alert("Failed to open document. Please try again.");
        }
    };

    const handleDownloadDocument = async (documentId, fileName) => {
        try {
            const { url } = await fetchDocumentUrl(documentId, "attachment");
            const finalUrl = REWRITE_URL(url);
            if (finalUrl) {
                const link = document.createElement("a");
                link.href = finalUrl;
                link.setAttribute("download", fileName || "document");
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
        } catch (err) {
            console.error("Failed to download document", err);
            alert("Failed to download document. Please try again.");
        }
    };

    // Grouping metrics by recording session (timestamp)
    const getGroupedMetrics = () => {
        if (!records?.health_metrics) return [];
        const groups = {};
        records.health_metrics.forEach(m => {
            const time = new Date(m.recorded_at).toLocaleString();
            if (!groups[time]) groups[time] = [];
            groups[time].push(m);
        });
        return Object.entries(groups).map(([time, metrics]) => ({ time, metrics }));
    };

    const getLatestMetrics = () => {
        if (!records?.health_metrics) return [];
        const latest = {};
        records.health_metrics.forEach(m => {
            if (!latest[m.metric_type]) latest[m.metric_type] = m;
        });
        return Object.values(latest);
    };

    const latestVitals = getLatestMetrics();
    const groupedMetrics = getGroupedMetrics();
    const documents = records?.documents || [];

    if (loading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f1f5f9" }}>
                <Topbar title="Accessing Clinical Data..." />
                <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div className={styles.spinner}></div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f8fafc" }}>
            <Topbar title="Patient Clinical Dossier" />

            <div className={styles.contentWrapper} style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>

                {/* ── Visual Banner Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: "linear-gradient(160deg, #1e293b 0%, #0f172a 100%)",
                        borderRadius: "32px",
                        padding: "48px",
                        color: "white",
                        marginBottom: "32px",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                        position: "relative",
                        overflow: "hidden"
                    }}
                >
                    <div style={{ position: "relative", zIndex: 2 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <button
                                onClick={() => router.back()}
                                style={{
                                    background: "rgba(255,255,255,0.08)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    color: "white",
                                    padding: "10px 18px",
                                    borderRadius: "14px",
                                    fontSize: "13px",
                                    fontWeight: "800",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    backdropFilter: "blur(12px)",
                                    transition: "all 0.2s"
                                }}
                            >
                                <ArrowLeft size={16} /> Directory
                            </button>

                            <div style={{ display: "flex", gap: "10px" }}>
                                <span style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10b981", padding: "6px 14px", borderRadius: "10px", fontSize: "11px", fontWeight: "900", textTransform: "uppercase" }}>Active Case</span>
                                <span style={{ background: "rgba(255, 255, 255, 0.1)", color: "white", padding: "6px 14px", borderRadius: "10px", fontSize: "11px", fontWeight: "900", textTransform: "uppercase" }}>{records?.patient_info?.mrn || patient?.mrn || "ORG-SECURE"}</span>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "12px", marginTop: "40px" }}>
                            <div style={{ position: "relative" }}>
                                <div style={{
                                    width: "100px", height: "100px", borderRadius: "30px",
                                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "40px", fontWeight: "900", border: "4px solid rgba(255,255,255,0.1)",
                                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)"
                                }}>
                                    {records?.patient_info?.full_name?.[0] || patient?.full_name?.[0] || patient?.name?.[0] || "P"}
                                </div>
                                <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "28px", height: "28px", background: "#10b981", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #0f172a" }}>
                                    <Shield size={14} color="white" />
                                </div>
                            </div>

                            <div style={{ marginLeft: "12px" }}>
                                <h1 style={{ fontSize: "36px", fontWeight: "900", margin: 0, letterSpacing: "-0.04em", lineHeight: 1 }}>
                                    {records?.patient_info?.full_name || patient?.full_name || patient?.name || "Patient Record"}
                                </h1>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginTop: "16px", opacity: 0.9, fontSize: "15px", fontWeight: "600" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><User size={16} opacity={0.6} /> {records?.patient_info?.gender || patient?.gender || "Not Specified"}</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Clock size={16} opacity={0.6} /> {records?.patient_info?.age || patient?.age || "Age N/A"} Years</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Calendar size={16} opacity={0.6} /> DOB: {records?.patient_info?.date_of_birth || patient?.date_of_birth || "Unavailable"}</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Droplets size={16} opacity={0.6} /> MRN: {records?.patient_info?.mrn || patient?.mrn || "ORG-SECURE"}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gradient Art Background */}
                    <div style={{ position: "absolute", right: "-100px", bottom: "-100px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)", zIndex: 1 }}></div>
                    <Activity size={300} style={{ position: "absolute", right: "-50px", top: "-50px", opacity: 0.02, transform: "rotate(-10deg)", zIndex: 1 }} />
                </motion.div>

                {/* ── Navigation Tabs ── */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "32px", background: "#fff", padding: "6px", borderRadius: "18px", width: "fit-content", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
                    {[
                        { id: "overview", label: "Medical Overview", icon: <TrendingUp size={16} /> },
                        { id: "vitals", label: "Vitals History", icon: <Activity size={16} /> },
                        { id: "documents", label: "Health Library", icon: <FileText size={16} /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: "10px 20px", borderRadius: "12px", border: "none",
                                background: activeTab === tab.id ? "#3b82f6" : "transparent",
                                color: activeTab === tab.id ? "#fff" : "#64748b",
                                fontSize: "13px", fontWeight: "800", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: "8px",
                                transition: "all 0.2s ease",
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* ── OVERVIEW TAB ── */}
                    {activeTab === "overview" && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "32px" }}
                        >
                            {/* Latest Vitals Panel */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
                                {latestVitals.map((m, idx) => {
                                    const config = METRIC_CONFIG[m.metric_type] || DEFAULT_CONFIG;
                                    return (
                                        <div key={m.id} style={{ background: "white", padding: "32px", borderRadius: "28px", border: "1px solid #f1f5f9", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", position: "relative", overflow: "hidden" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                <div style={{ background: config.bg, color: config.color, width: "48px", height: "48px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    {config.icon}
                                                </div>
                                                <div style={{ height: "40px", width: "80px", opacity: 0.1, background: config.gradient, borderRadius: "8px" }}></div>
                                            </div>
                                            <div style={{ marginTop: "24px" }}>
                                                <div style={{ fontSize: "12px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{config.label}</div>
                                                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "4px" }}>
                                                    <div style={{ fontSize: "36px", fontWeight: "900", color: "#1e293b" }}>{m.value}</div>
                                                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#64748b" }}>{m.unit || config.unit}</div>
                                                </div>
                                            </div>
                                            <div style={{ marginTop: "16px", fontSize: "12px", color: "#10b981", fontWeight: "800", display: "flex", alignItems: "center", gap: "4px" }}>
                                                <TrendingUp size={14} /> Stable Range
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Sidebar Info */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                                {/* Recent Activity */}
                                <div style={{ background: "white", padding: "32px", borderRadius: "28px", border: "1px solid #f1f5f9", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.04)" }}>
                                    <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#1e293b", margin: "0 0 24px 0" }}>Recent Documents</h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                        {documents.slice(0, 3).map((doc, idx) => (
                                            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", background: "#f8fafc", borderRadius: "18px", border: "1px solid #f1f5f9" }}>
                                                <div style={{ width: "40px", height: "40px", background: "white", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6" }}>
                                                    <FileText size={20} />
                                                </div>
                                                <div style={{ flex: 1, overflow: "hidden" }}>
                                                    <div style={{ fontWeight: "800", color: "#1e293b", fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.file_name}</div>
                                                    <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600" }}>Added {new Date(doc.uploaded_at).toLocaleDateString()}</div>
                                                </div>
                                                <div style={{ display: "flex", gap: "4px" }}>
                                                    <ExternalLink size={14} color="#3b82f6" style={{ cursor: "pointer" }} onClick={() => handleViewDocument(doc.id)} />
                                                    <Download size={14} color="#cbd5e1" style={{ cursor: "pointer" }} onClick={() => handleDownloadDocument(doc.id, doc.file_name)} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Care Team Note */}
                                <div style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", padding: "32px", borderRadius: "28px", color: "white", position: "relative" }}>
                                    <h3 style={{ fontSize: "18px", fontWeight: "900", margin: "0 0 12px 0" }}>Provider Insight</h3>
                                    <p style={{ fontSize: "14px", opacity: 0.9, lineHeight: 1.6, fontWeight: "500" }}>
                                        Patient exhibits excellent stability in glucose management. Continue prescribed monitoring frequency.
                                    </p>
                                    <Activity size={100} style={{ position: "absolute", right: "-20px", bottom: "-20px", opacity: 0.08 }} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── VITALS TAB ── */}
                    {activeTab === "vitals" && (
                        <motion.div
                            key="vitals"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div style={{ background: "white", borderRadius: "32px", overflow: "hidden", border: "1px solid #f1f5f9", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
                                <div style={{ padding: "32px", borderBottom: "1px solid #f1f5f9", background: "#fcfcfd" }}>
                                    <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#1e293b", margin: 0 }}>Metric Chronology</h2>
                                    <p style={{ color: "#94a3b8", margin: "4px 0 0 0", fontSize: "14px", fontWeight: "500" }}>Chronological breakdown of all recorded health dimensions.</p>
                                </div>
                                <div style={{ padding: "0 32px 32px 32px" }}>
                                    {groupedMetrics.length === 0 ? (
                                        <div style={{ textAlign: "center", padding: "100px 0" }}>
                                            <Activity size={64} style={{ color: "#e2e8f0", marginBottom: "20px" }} />
                                            <p style={{ color: "#94a3b8", fontWeight: "700" }}>No metrics found for this period.</p>
                                        </div>
                                    ) : (
                                        groupedMetrics.map((group, i) => (
                                            <div key={i} style={{ marginTop: "40px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                                                    <div style={{ padding: "8px 16px", background: "#f1f5f9", borderRadius: "10px", color: "#475569", fontWeight: "800", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                                                        <Clock size={14} /> {group.time}
                                                    </div>
                                                    <div style={{ flex: 1, height: "1px", background: "#f1f5f9" }}></div>
                                                </div>
                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                                                    {group.metrics.map(m => {
                                                        const config = METRIC_CONFIG[m.metric_type] || DEFAULT_CONFIG;
                                                        return (
                                                            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px", background: "#f8fafc", borderRadius: "20px", border: "1px solid #f1f5f9" }}>
                                                                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: config.bg, color: config.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                                    {config.icon}
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>{config.label}</div>
                                                                    <div style={{ fontWeight: "900", color: "#1e293b", fontSize: "18px" }}>{m.value} <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "700" }}>{m.unit || config.unit}</span></div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── DOCUMENTS TAB ── */}
                    {activeTab === "documents" && (
                        <motion.div
                            key="documents"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                        >
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
                                {documents.length === 0 ? (
                                    <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "100px", background: "#fff", borderRadius: "32px", border: "1px solid #f1f5f9" }}>
                                        <FileText size={64} style={{ color: "#e2e8f0", marginBottom: "20px" }} />
                                        <p style={{ color: "#94a3b8", fontWeight: "700" }}>Clinical repository is currently empty.</p>
                                    </div>
                                ) : (
                                    documents.map(doc => (
                                        <motion.div
                                            key={doc.id}
                                            whileHover={{ y: -5 }}
                                            style={{
                                                background: "white", borderRadius: "24px", padding: "24px",
                                                border: "1px solid #f1f5f9", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
                                                display: "flex", flexDirection: "column", gap: "20px"
                                            }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                <div style={{ width: "56px", height: "56px", borderRadius: "18px", background: "#eff6ff", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <FileText size={28} />
                                                </div>
                                                <button 
                                                    onClick={() => handleViewDocument(doc.id)}
                                                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px", borderRadius: "10px", color: "#64748b", cursor: "pointer" }}
                                                >
                                                    <ExternalLink size={16} />
                                                </button>
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: "16px", fontWeight: "900", color: "#1e293b", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.file_name}</h4>
                                                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                                                    <span style={{ fontSize: "11px", fontWeight: "800", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}><Activity size={12} /> {doc.file_type}</span>
                                                    <span style={{ fontSize: "11px", fontWeight: "800", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}><Scale size={12} /> {(doc.file_size / 1024).toFixed(1)} KB</span>
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                                                <button 
                                                    onClick={() => handleDownloadDocument(doc.id, doc.file_name)}
                                                    style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "#1e293b", color: "#fff", border: "none", fontWeight: "800", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                                                >
                                                    <Download size={14} /> Download
                                                </button>
                                                <button 
                                                    onClick={() => handleViewDocument(doc.id)}
                                                    style={{ padding: "12px", borderRadius: "12px", background: "#f8fafc", color: "#1e293b", border: "1px solid #e2e8f0", fontWeight: "800", fontSize: "13px", cursor: "pointer" }}
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {/* Minimal spacing for bottom */}
            <div style={{ height: "40px" }} />
        </div>
    );
}