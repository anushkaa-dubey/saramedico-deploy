"use client";

import { useState, useEffect } from "react";
import styles from "./DocumentsList.module.css";
import { useRouter } from "next/navigation";
import { fetchPatientDocuments, uploadPatientDocument } from "@/services/doctor";
import { processDocumentWithAI } from "@/services/ai";

export default function DocumentsList({ patientId }) {
    const router = useRouter();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
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

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError("");
        try {
            // Using title as filename for now, category as medical_record
            await uploadPatientDocument(patientId, file, { title: file.name, category: "medical_record" });
            // Refresh list on success
            await loadDocuments();
        } catch (err) {
            console.error("Upload error:", err);
            setError(err.message || "Failed to upload document");
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = null;
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

    if (loading && !documents.length) return <div style={{ padding: "20px" }}>Loading documents...</div>;

    return (
        <div className={styles.documentsList}>
            <div className={styles.header} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 className={styles.title}>Patient Documents</h3>
                <div className={styles.actions}>
                    <input
                        type="file"
                        id="doc-upload"
                        style={{ display: "none" }}
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                    <label
                        htmlFor="doc-upload"
                        style={{
                            background: "#359AFF",
                            color: "white",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            cursor: uploading ? "not-allowed" : "pointer",
                            fontSize: "14px",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            opacity: uploading ? 0.7 : 1,
                            transition: "all 0.2s ease"
                        }}
                    >
                        {uploading ? (
                            <span>Uploading...</span>
                        ) : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                                Upload Document
                            </>
                        )}
                    </label>
                </div>
            </div>

            {error && <div style={{ padding: "12px", color: "red", background: "#fee2e2", borderRadius: "8px", margin: "12px 0", fontSize: "14px" }}>{error}</div>}

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
                    <p style={{ color: "#64748b", fontStyle: "italic", padding: "20px" }}>No documents found for this patient.</p>
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
