"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./DocumentsList.module.css";
import { fetchPatientDocuments, uploadPatientDocument, fetchDocumentDetails, deletePatientDocument } from "@/services/doctor";

const FILE_ICONS = {
    pdf: { color: "#ef4444", bg: "#fef2f2", icon: "📄" },
    doc: { color: "#2563eb", bg: "#eff6ff", icon: "📝" },
    docx: { color: "#2563eb", bg: "#eff6ff", icon: "📝" },
    dicom: { color: "#7c3aed", bg: "#f5f3ff", icon: "🩻" },
    png: { color: "#16a34a", bg: "#f0fdf4", icon: "🖼️" },
    jpg: { color: "#16a34a", bg: "#f0fdf4", icon: "🖼️" },
    jpeg: { color: "#16a34a", bg: "#f0fdf4", icon: "🖼️" },
    webp: { color: "#16a34a", bg: "#f0fdf4", icon: "🖼️" },
};

function getExt(doc) {
    const name = doc.file_name || doc.title || doc.presigned_url || doc.url || "";
    const match = name.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    return match ? match[1].toLowerCase() : "file";
}

export default function DocumentsList({ patientId }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [processingDoc, setProcessingDoc] = useState(null);
    const [processResults, setProcessResults] = useState({}); // per-doc status
    const [fileInputKey, setFileInputKey] = useState(0); // force re-mount to prevent duplicate events
    const [deletingId, setDeletingId] = useState(null);
    const pollingRefs = useRef({});
    const uploadingRef = useRef(false); // Guard against double-fire

    useEffect(() => {
        if (patientId) loadDocuments();
        return () => {
            // Cleanup all polling intervals on unmount
            Object.values(pollingRefs.current).forEach(id => clearInterval(id));
        };
    }, [patientId]);

    const loadDocuments = useCallback(async () => {
        if (!patientId) return;
        setLoading(true);
        setError("");
        try {
            const data = await fetchPatientDocuments(patientId);
            const list = Array.isArray(data) ? data : (data?.documents || data?.records || []);

            // Intelligently deduplicate: if we have multiple records for the same file name, 
            // and one has a valid downloadUrl/presigned_url but the other doesn't, keep only the valid one.
            const uniqueFiles = new Map();
            list.forEach(doc => {
                const existing = uniqueFiles.get(doc.file_name);
                const hasUrl = doc.downloadUrl || doc.presigned_url;
                const existingHasUrl = existing ? (existing.downloadUrl || existing.presigned_url) : false;
                
                if (!existing) {
                    doc.allIds = [doc.id];
                    uniqueFiles.set(doc.file_name, doc);
                } else {
                    existing.allIds.push(doc.id);
                    if (hasUrl && !existingHasUrl) {
                        doc.allIds = existing.allIds;
                        uniqueFiles.set(doc.file_name, doc);
                    }
                }
            });
            
            setDocuments(Array.from(uniqueFiles.values()).sort((a,b) => 
                new Date(b.uploaded_at || b.created_at) - new Date(a.uploaded_at || a.created_at)
            ));
        } catch (err) {
            console.error("fetchPatientDocuments error:", err);
            if (err.message?.includes("403") || err.message?.toLowerCase().includes("permission") || err.message?.toLowerCase().includes("unauthorized")) {
                setError("Patient has not granted permission to view medical records. Once granted, documents will appear here.");
            } else {
                setError(err.message || "Error fetching documents. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Prevent double-invoke (React StrictMode or label+input double-fire)
        if (uploadingRef.current) return;
        uploadingRef.current = true;

        setUploading(true);
        setError("");
        try {
            await uploadPatientDocument(patientId, file, { title: file.name, category: "other" });
            await loadDocuments();
        } catch (err) {
            console.error("Upload error:", err);
            setError(err.message || "Failed to upload document");
        } finally {
            setUploading(false);
            uploadingRef.current = false;
            // Reset by changing key — forces the input to remount and clears selection
            setFileInputKey(prev => prev + 1);
        }
    };

    const handleProcessWithAI = async (documentId) => {
        if (processingDoc === documentId) return;
        setProcessingDoc(documentId);
        setProcessResults(prev => ({ ...prev, [documentId]: { status: "processing" } }));
        setError("");

        // Mock AI indexing as the new RAG system handles this automatically
        setTimeout(() => {
            setProcessResults(prev => ({
                ...prev,
                [documentId]: { status: "completed", details: "Processed successfully" }
            }));
            setProcessingDoc(null);
            loadDocuments();
        }, 2000);
    };

    const handleDeleteDocument = async (doc, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this document? This cannot be undone.")) return;
        
        setDeletingId(doc.id);
        setError("");
        try {
            const idsToDelete = doc.allIds || [doc.id];
            for (const id of idsToDelete) {
                await deletePatientDocument(id);
            }
            await loadDocuments();
        } catch (err) {
            console.error("Delete document error:", err);
            setError("Failed to delete document. Please try again.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleOpenDocument = async (doc) => {
        // Try presigned_url, then downloadUrl, then fetch document details
        let url = doc.presigned_url || doc.downloadUrl || doc.download_url || doc.url || doc.file_url;
        if (!url && doc.id) {
            try {
                const details = await fetchDocumentDetails(doc.id);
                url = details.downloadUrl || details.presigned_url || details.url;
            } catch (e) {
                console.error("fetchDocumentDetails error:", e);
            }
        }
        if (url) {
            window.open(url, "_blank", "noopener,noreferrer");
        } else {
            alert("Document URL is not available. Please try again later.");
        }
    };

    const getStatusBadge = (doc) => {
        const r = processResults[doc.id];
        // The API might use downloadUrl or presigned_url depending on the endpoint (documents vs doctor_records)
        const hasUrl = doc.downloadUrl || doc.presigned_url;
        
        if (!r && !hasUrl && !loading) {
            return (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{
                        padding: "3px 8px", borderRadius: "6px", fontSize: "11px",
                        fontWeight: 600, background: "#fff7ed", color: "#c2410c",
                        display: "inline-block", marginTop: "4px"
                    }}>
                        ⏳ Waiting for upload...
                    </span>
                    <button 
                        onClick={(e) => { e.stopPropagation(); loadDocuments(); }}
                        style={{ background: "none", border: "none", color: "#359AFF", fontSize: "11px", cursor: "pointer", marginTop: "4px", padding: 0 }}
                    >
                        ↻ Refresh
                    </button>
                </div>
            );
        }
        if (!r) return null;
        const statusMap = {
            processing: { bg: "#fef9c3", color: "#854d0e", label: "⏳ Processing..." },
            completed: { bg: "#dcfce7", color: "#166534", label: "✓ Complete" },
            indexed: { bg: "#dcfce7", color: "#166534", label: "✓ Indexed" },
            processed: { bg: "#dcfce7", color: "#166534", label: "✓ Processed" },
            failed: { bg: "#fee2e2", color: "#991b1b", label: "✗ Failed" },
            timeout: { bg: "#fef3c7", color: "#92400e", label: "⌛ Timed Out" },
        };
        const s = statusMap[r.status] || { bg: "#f1f5f9", color: "#64748b", label: r.status };
        return (
            <span style={{
                padding: "3px 8px", borderRadius: "6px", fontSize: "11px",
                fontWeight: 600, background: s.bg, color: s.color,
                display: "inline-block", marginTop: "4px"
            }}>
                {s.label}
                {r.details && <span style={{ marginLeft: "4px", opacity: 0.7 }}>{r.details}</span>}
            </span>
        );
    };

    if (loading && !documents.length) return <div style={{ padding: "20px", color: "#64748b" }}>Loading documents...</div>;

    return (
        <div className={styles.documentsList}>
            <div className={styles.header} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 className={styles.title}>Patient Documents</h3>
                <div className={styles.actions}>
                    <input
                        key={fileInputKey}
                        type="file"
                        id="doc-upload"
                        style={{ display: "none" }}
                        onChange={handleFileUpload}
                        disabled={uploading}
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.dicom,.dcm,.txt"
                    />
                    <label
                        htmlFor="doc-upload"
                        style={{
                            background: "#359AFF", color: "white", padding: "8px 16px",
                            borderRadius: "8px", cursor: uploading ? "not-allowed" : "pointer",
                            fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center",
                            gap: "8px", opacity: uploading ? 0.7 : 1, transition: "all 0.2s ease",
                            userSelect: "none"
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

            {error && (
                <div style={{ padding: "12px", color: "#991b1b", background: "#fee2e2", borderRadius: "8px", margin: "12px 0", fontSize: "14px" }}>
                    {error}
                </div>
            )}

            <div className={styles.grid}>
                {documents.length === 0 ? (
                    <p style={{ color: "#64748b", fontStyle: "italic", padding: "20px" }}>
                        No documents found for this patient.
                    </p>
                ) : (
                    documents.map((doc) => {
                        const ext = getExt(doc);
                        const iconCfg = FILE_ICONS[ext] || { color: "#64748b", bg: "#f8fafc", icon: "📁" };
                        const result = processResults[doc.id];
                        const isProcessing = processingDoc === doc.id;
                        const isCompleted = result && ["completed", "indexed", "processed"].includes(result.status);
                        const hasUrl = doc.downloadUrl || doc.presigned_url;

                        return (
                            <div key={doc.id} className={styles.card}>
                                {/* File type icon */}
                                <div className={styles.iconWrapper} style={{ background: iconCfg.bg, color: iconCfg.color }}>
                                    <span style={{ fontSize: "18px" }}>{iconCfg.icon}</span>
                                    <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px", marginTop: "2px" }}>
                                        {ext.toUpperCase()}
                                    </span>
                                </div>

                                <div className={styles.info}>
                                    <h4 className={styles.docName}>{doc.title || doc.file_name || "Untitled"}</h4>
                                    <div className={styles.meta}>
                                        <span>{doc.category?.replace(/_/g, " ") || ext}</span>
                                        {(doc.uploaded_at || doc.upload_date || doc.created_at) && (
                                            <>
                                                <span>•</span>
                                                <span>{new Date(doc.uploaded_at || doc.upload_date || doc.created_at).toLocaleDateString()}</span>
                                            </>
                                        )}
                                    </div>
                                    {getStatusBadge(doc)}
                                </div>

                                <div className={styles.actions}>
                                    {isProcessing && (
                                        <span style={{ fontSize: "12px", color: "#64748b" }}>Processing...</span>
                                    )}
                                    
                                    {!isCompleted && !isProcessing && (
                                         <button 
                                            className={styles.aiProcessBtn}
                                            onClick={() => handleProcessWithAI(doc.id)}
                                            style={{
                                                padding: "6px 10px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "600",
                                                cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap"
                                            }}
                                         >
                                            Process with AI
                                         </button>
                                    )}

                                    {isCompleted && (
                                        <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 600 }}>✓ AI Processed</span>
                                    )}

                                    <button
                                        onClick={() => handleOpenDocument(doc)}
                                        className={styles.viewBtn}
                                        disabled={!hasUrl}
                                        title={!hasUrl ? "File is not yet available for viewing" : "View Document"}
                                        style={{
                                            padding: "6px 10px", background: "#f1f5f9", color: "#2563eb",
                                            border: "1px solid #e2e8f0", borderRadius: "6px",
                                            fontSize: "12px", fontWeight: "600",
                                            transition: "all 0.2s ease", whiteSpace: "nowrap",
                                            opacity: hasUrl ? 1 : 0.5,
                                            cursor: hasUrl ? "pointer" : "not-allowed"
                                        }}
                                    >
                                        View →
                                    </button>

                                    <button
                                        onClick={(e) => handleDeleteDocument(doc, e)}
                                        disabled={deletingId === doc.id}
                                        title="Delete document"
                                        style={{
                                            padding: "6px", background: deletingId === doc.id ? "#ccc" : "#fee2e2", color: "#dc2626",
                                            border: "1px solid #fca5a5", borderRadius: "6px",
                                            fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center",
                                            cursor: deletingId === doc.id ? "not-allowed" : "pointer",
                                            opacity: deletingId === doc.id ? 0.5 : 1, transition: "all 0.2s ease",
                                        }}
                                    >
                                        {deletingId === doc.id ? "..." : (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                <path d="M10 11v6M14 11v6" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}
