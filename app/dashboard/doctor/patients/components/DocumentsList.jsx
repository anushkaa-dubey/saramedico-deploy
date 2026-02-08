"use client";

import { useState, useEffect } from "react";
import styles from "./DocumentsList.module.css";
import { useRouter } from "next/navigation";
import { fetchPatientDocuments } from "@/services/doctor";
import { processDocumentWithAI } from "@/services/ai";

export default function DocumentsList({ patientId }) {
    const router = useRouter();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingDoc, setProcessingDoc] = useState(null);
    const [processResult, setProcessResult] = useState(null);

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

    const handleProcessWithAI = async (documentId) => {
        setProcessingDoc(documentId);
        setProcessResult(null);
        setError("");

        try {
            const payload = {
                patient_id: patientId,
                document_id: documentId,
                processing_type: "comprehensive",
                priority: "normal"
            };

            const result = await processDocumentWithAI(payload);
            setProcessResult({
                documentId,
                jobId: result.job_id,
                status: result.status || result.message
            });
        } catch (err) {
            console.error("AI processing error:", err);
            setError(err.message || "Failed to process document with AI");
        } finally {
            setProcessingDoc(null);
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

            {processResult && (
                <div style={{
                    padding: "12px",
                    margin: "12px 0",
                    background: "rgba(76, 175, 80, 0.1)",
                    border: "1px solid rgba(76, 175, 80, 0.3)",
                    borderRadius: "8px",
                    fontSize: "14px"
                }}>
                    <strong>✓ Processing Queued</strong>
                    <div style={{ marginTop: "4px" }}>Job ID: <code>{processResult.jobId}</code></div>
                    <div style={{ marginTop: "2px", opacity: 0.8 }}>{processResult.status}</div>
                </div>
            )}

            <div className={styles.grid}>
                {documents.length === 0 ? (
                    <p>No documents found for this patient.</p>
                ) : (
                    documents.map((doc) => (
                        <div key={doc.id} className={styles.card}>
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
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                    className={styles.aiProcessBtn}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleProcessWithAI(doc.id);
                                    }}
                                    disabled={processingDoc === doc.id}
                                    style={{
                                        padding: '6px 12px',
                                        background: processingDoc === doc.id ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: processingDoc === doc.id ? 'not-allowed' : 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        transition: 'all 0.2s ease',
                                        opacity: processingDoc === doc.id ? 0.6 : 1
                                    }}
                                >
                                    {processingDoc === doc.id ? 'Processing...' : 'Process with AI'}
                                </button>
                                <div
                                    className={`${styles.status} ${styles.analyzed}`}
                                    onClick={() => handleOpenDocument(doc.presigned_url)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    View
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
