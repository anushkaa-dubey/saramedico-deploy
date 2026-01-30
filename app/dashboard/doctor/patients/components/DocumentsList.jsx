"use client";

import { useState, useEffect } from "react";
import styles from "./DocumentsList.module.css";
import { useRouter } from "next/navigation";
import { fetchPatientDocuments } from "@/services/doctor";

export default function DocumentsList({ patientId }) {
    const router = useRouter();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (patientId) loadDocuments();
    }, [patientId]);

    const loadDocuments = async () => {
        if (!patientId) return;
        setLoading(true);
        setError("");
        try {
            const data = await fetchPatientDocuments(patientId);
            setDocuments(data);
        } catch (err) {
            console.error("fetchPatientDocuments error:", err);
            if (err.message.includes("403") || err.message.toLowerCase().includes("unauthorized") || err.message.toLowerCase().includes("permission")) {
                setError("Patient has not granted permission to view medical records. Once granted, documents will appear here.");
            } else {
                setError(err.message || "Error fetching documents. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDocument = (url) => {
        if (url) window.open(url, "_blank");
    };

    if (loading) return <div style={{ padding: "20px" }}>Loading documents...</div>;
    if (error) return <div style={{ padding: "20px", color: "red" }}>{error}</div>;

    return (
        <div className={styles.documentsList}>
            <div className={styles.header}>
                <h3 className={styles.title}>Patient Documents</h3>
            </div>

            <div className={styles.grid}>
                {documents.length === 0 ? (
                    <p>No documents found for this patient.</p>
                ) : (
                    documents.map((doc) => (
                        <div key={doc.id} className={styles.card} onClick={() => handleOpenDocument(doc.presigned_url)}>
                            <div className={styles.iconWrapper}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                            </div>
                            <div className={styles.info}>
                                <h4 className={styles.docName}>{doc.title || doc.file_name}</h4>
                                <div className={styles.meta}>
                                    <span>{doc.category?.replace("_", " ")}</span>
                                    <span>•</span>
                                    <span>{new Date(doc.uploaded_at || doc.upload_date).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className={`${styles.status} ${styles.analyzed}`}>
                                View
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
