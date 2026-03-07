"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchPatientRecords } from "@/services/hospital";
import Topbar from "../../components/Topbar";
import styles from "../../HospitalDashboard.module.css";

export default function PatientRecordPage() {
    const params = useParams();
    const patientId = params.id;

    const [records, setRecords] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRecords = async () => {
            try {
                const data = await fetchPatientRecords(patientId);
                setRecords(data);
            } catch (err) {
                console.error("Failed to load records", err);
            } finally {
                setLoading(false);
            }
        };

        loadRecords();
    }, [patientId]);

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>

            <Topbar title="Patient Records" />

            <div className={styles.contentWrapper}>

                {/* Page Header */}
                <div style={{ marginBottom: "30px" }}>
                    <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "6px" }}>
                        Patient Records
                    </h1>

                    <p style={{ color: "#64748b", fontSize: "14px" }}>
                        Patient ID: {patientId}
                    </p>
                </div>

                {loading ? (
                    <div>Loading records...</div>
                ) : !records ? (
                    <div>No records found</div>
                ) : (
                    <>
                        {/* HEALTH METRICS */}
                        <div className={styles.card} style={{ marginBottom: "30px" }}>
                            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>
                                Health Metrics
                            </h2>

                            {records.health_metrics?.length === 0 ? (
                                <p>No metrics available</p>
                            ) : (
                                records.health_metrics.map((metric) => (
                                    <div
                                        key={metric.id}
                                        style={{
                                            padding: "12px 0",
                                            borderBottom: "1px solid #f1f5f9",
                                            display: "flex",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <div>
                                            <strong>{metric.metric_type}</strong>
                                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                                                {new Date(metric.recorded_at).toLocaleString()}
                                            </div>
                                        </div>

                                        <div style={{ fontWeight: 700 }}>
                                            {metric.value} {metric.unit}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* DOCUMENTS */}
                        <div className={styles.card}>
                            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>
                                Documents
                            </h2>

                            {records.documents?.length === 0 ? (
                                <p>No documents uploaded</p>
                            ) : (
                                records.documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        style={{
                                            padding: "14px 0",
                                            borderBottom: "1px solid #f1f5f9",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{doc.file_name}</div>
                                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                                                {doc.file_type} • {(doc.file_size / 1024).toFixed(1)} KB
                                            </div>
                                        </div>

                                        <span
                                            style={{
                                                fontSize: "12px",
                                                padding: "4px 10px",
                                                borderRadius: "20px",
                                                background: "#f1f5f9",
                                            }}
                                        >
                                            {doc.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}