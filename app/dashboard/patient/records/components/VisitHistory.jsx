"use client";

import { useState, useEffect } from "react";
import { fetchMyConsultations, fetchDoctors } from "@/services/patient";
import styles from "../Records.module.css";
import VisitSummary from "./VisitSummary";

export default function VisitHistory() {
    const [consultations, setConsultations] = useState([]);
    const [doctorsMap, setDoctorsMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedVisitId, setSelectedVisitId] = useState(null);

    useEffect(() => {
        loadVisits();
    }, []);

    const loadVisits = async () => {
        setLoading(true);
        setError("");
        try {
            const [consultRes, doctorsList] = await Promise.all([
                fetchMyConsultations(),
                fetchDoctors().catch(() => [])
            ]);

            const list = Array.isArray(consultRes) ? consultRes : consultRes?.consultations || consultRes?.data?.consultations || [];
            const dMap = {};
            const doctorsData = Array.isArray(doctorsList) ? doctorsList : doctorsList?.results || doctorsList?.data || [];

            if (Array.isArray(doctorsData)) {
                doctorsData.forEach(d => {
                    const name = d.full_name || d.name || "Doctor";
                    dMap[d.id] = name.startsWith("Dr.") ? name : `Dr. ${name}`;
                });
            }
            setDoctorsMap(dMap);

            // Sort by date desc
            setConsultations(list.sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt)));
        } catch (err) {
            console.error("Failed to load visits:", err);
            setError("Failed to load your visit history.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading visits...</div>;
    if (error) return <div style={{ padding: "40px", textAlign: "center", color: "red" }}>{error}</div>;

    return (
        <>
            <div className={styles.tableContainer}>
                {consultations.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                        No visit history found.
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>DATE</th>
                                <th>DOCTOR</th>
                                <th>STATUS</th>
                                <th>DIAGNOSIS</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {consultations.map((c) => (
                                <tr key={c.id}>
                                    <td style={{ whiteSpace: "nowrap" }}>
                                        {new Date(c.scheduledAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </td>
                                    <td>
                                        {(() => {
                                            const rawName = c.doctorName && c.doctorName !== "Unknown Doctor" ? c.doctorName : (doctorsMap[c.doctorId] || "Doctor");
                                            if (!rawName || rawName === "Doctor") return "Doctor";
                                            return rawName.startsWith("Dr.") ? rawName : `Dr. ${rawName}`;
                                        })()}
                                    </td>
                                    <td>
                                        <span className={`${styles.status} ${c.status === 'completed' ? styles.success : styles.pending}`}>
                                            {c.status?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {c.diagnosis || "General Consultation"}
                                    </td>
                                    <td className={styles.action}>
                                        <button
                                            onClick={() => setSelectedVisitId(c.id)}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                color: "#2563eb",
                                                fontWeight: "600",
                                                fontSize: "13px",
                                                cursor: "pointer",
                                                padding: 0,
                                                textDecoration: "none",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "4px"
                                            }}
                                        >
                                            View Summary →
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {selectedVisitId && (
                <VisitSummary
                    consultationId={selectedVisitId}
                    onClose={() => setSelectedVisitId(null)}
                />
            )}
        </>
    );
}
