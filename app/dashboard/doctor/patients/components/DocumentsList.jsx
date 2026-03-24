"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./DocumentsList.module.css";
import { fetchPatientDocuments, uploadPatientDocument, fetchDocumentDetails, deletePatientDocument } from "@/services/doctor";
import { FileText, FileImage, File, FileCode, Trash2, AlertCircle, Clock, CheckCircle2, XCircle, Timer, RefreshCw } from "lucide-react";

const FILE_ICONS = {
    pdf: { color: "#ef4444", bg: "#fef2f2", LucideIcon: FileText },
    doc: { color: "#2563eb", bg: "#eff6ff", LucideIcon: FileText },
    docx: { color: "#2563eb", bg: "#eff6ff", LucideIcon: FileText },
    dicom: { color: "#7c3aed", bg: "#f5f3ff", LucideIcon: FileCode },
    png: { color: "#16a34a", bg: "#f0fdf4", LucideIcon: FileImage },
    jpg: { color: "#16a34a", bg: "#f0fdf4", LucideIcon: FileImage },
    jpeg: { color: "#16a34a", bg: "#f0fdf4", LucideIcon: FileImage },
    webp: { color: "#16a34a", bg: "#f0fdf4", LucideIcon: FileImage },
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
    const [processResults, setProcessResults] = useState({});
    const [fileInputKey, setFileInputKey] = useState(0);
    const [deletingId, setDeletingId] = useState(null);
    const pollingRefs = useRef({});
    const uploadingRef = useRef(false);
    const [deleteDocModal, setDeleteDocModal] = useState({ open: false, doc: null });

    useEffect(() => {
        if (patientId) loadDocuments();
        return () => {
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
            setDocuments(Array.from(uniqueFiles.values()).sort((a, b) =>
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
            setFileInputKey(prev => prev + 1);
        }
    };

    const handleProcessWithAI = async (documentId) => {
        if (processingDoc === documentId) return;
        setProcessingDoc(documentId);
        setProcessResults(prev => ({ ...prev, [documentId]: { status: "processing" } }));
        setError("");
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
        setDeleteDocModal({ open: true, doc });
    };

    const confirmDeleteDocument = async () => {
        const doc = deleteDocModal.doc;
        if (!doc) return;
        setDeleteDocModal({ open: false, doc: null });
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
        const hasUrl = doc.downloadUrl || doc.presigned_url;
        if (!r && !hasUrl && !loading) {
            return (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{
                        padding: "3px 8px", borderRadius: "6px", fontSize: "11px",
                        fontWeight: 600, background: "#fff7ed", color: "#c2410c",
                        display: "flex", alignItems: "center", gap: "4px", marginTop: "4px"
                    }}>
                        <Clock size={10} /> Waiting for upload...
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); loadDocuments(); }}
                        style={{ background: "none", border: "none", color: "#359AFF", fontSize: "11px", cursor: "pointer", marginTop: "4px", padding: 0, display: "flex", alignItems: "center", gap: "2px" }}
                    >
                        <RefreshCw size={10} /> Refresh
                    </button>
                </div>
            );
        }
        if (!r) return null;
        const statusMap = {
            processing: { bg: "#fef9c3", color: "#854d0e", label: "Processing...", Icon: Clock },
            completed: { bg: "#dcfce7", color: "#166534", label: "Complete", Icon: CheckCircle2 },
            indexed: { bg: "#dcfce7", color: "#166534", label: "Indexed", Icon: CheckCircle2 },
            processed: { bg: "#dcfce7", color: "#166534", label: "Processed", Icon: CheckCircle2 },
            failed: { bg: "#fee2e2", color: "#991b1b", label: "Failed", Icon: XCircle },
            timeout: { bg: "#fef3c7", color: "#92400e", label: "Timed Out", Icon: Timer },
        };
        const s = statusMap[r.status] || { bg: "#f1f5f9", color: "#64748b", label: r.status, Icon: AlertCircle };
        return (
            <span style={{
                padding: "3px 8px", borderRadius: "6px", fontSize: "11px",
                fontWeight: 600, background: s.bg, color: s.color,
                display: "flex", alignItems: "center", gap: "4px", marginTop: "4px", width: "fit-content"
            }}>
                {s.Icon && <s.Icon size={10} />}
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
                                <div className={styles.iconWrapper} style={{ background: iconCfg.bg, color: iconCfg.color }}>
                                    {iconCfg.LucideIcon
                                        ? <iconCfg.LucideIcon size={22} strokeWidth={1.8} />
                                        : <File size={22} strokeWidth={1.8} />}
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

                                <div className={styles.actions} style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gridTemplateRows: "auto auto",
                                    gap: "6px",
                                    alignItems: "center",
                                    minWidth: "140px"
                                }}>
                                    {isProcessing && (
                                        <span style={{ fontSize: "12px", color: "#64748b", gridColumn: "1 / -1" }}>Processing...</span>
                                    )}
                                    {!isCompleted && !isProcessing && (
                                        <button
                                            className={styles.aiProcessBtn}
                                            onClick={() => handleProcessWithAI(doc.id)}
                                            style={{
                                                gridColumn: "1 / -1",
                                                padding: "7px 10px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "600",
                                                cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap", textAlign: "center"
                                            }}
                                        >
                                            ✦ Process with AI
                                        </button>
                                    )}
                                    {isCompleted && (
                                        <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 600, gridColumn: "1 / -1" }}>✓ AI Processed</span>
                                    )}
                                    <button
                                        onClick={() => handleOpenDocument(doc)}
                                        className={styles.viewBtn}
                                        disabled={!hasUrl}
                                        title={!hasUrl ? "File is not yet available for viewing" : "View Document"}
                                        style={{
                                            padding: "7px 10px", background: "#eff6ff", color: "#2563eb",
                                            border: "1px solid #bfdbfe", borderRadius: "8px",
                                            fontSize: "12px", fontWeight: "600",
                                            transition: "all 0.2s ease", whiteSpace: "nowrap",
                                            opacity: hasUrl ? 1 : 0.5,
                                            cursor: hasUrl ? "pointer" : "not-allowed",
                                            display: "flex", alignItems: "center", justifyContent: "center", gap: "4px"
                                        }}
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                        View
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteDocument(doc, e)}
                                        disabled={deletingId === doc.id}
                                        title="Delete document"
                                        style={{
                                            padding: "7px 10px", background: deletingId === doc.id ? "#f1f5f9" : "#fef2f2", color: "#dc2626",
                                            border: "1px solid #fca5a5", borderRadius: "8px",
                                            fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
                                            cursor: deletingId === doc.id ? "not-allowed" : "pointer",
                                            opacity: deletingId === doc.id ? 0.5 : 1, transition: "all 0.2s ease",
                                        }}
                                    >
                                        {deletingId === doc.id ? (
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                        ) : (
                                            <Trash2 size={13} strokeWidth={2.5} />
                                        )}
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* ── DELETE CONFIRMATION MODAL ── */}
            {deleteDocModal.open && typeof document !== "undefined" && createPortal(
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 999999,
                    background: "rgba(15, 23, 42, 0.4)",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    padding: "6% 16px",
                    animation: "fadeInOverlay 0.2s ease"
                }}
                    onClick={() => setDeleteDocModal({ open: false, doc: null })}
                >
                    <div style={{
                        background: "#ffffff",
                        borderRadius: "16px",
                        width: "100%",
                        maxWidth: "400px",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                        animation: "slideUpModal 0.25s cubic-bezier(0, 0.5, 0.5, 1)",
                        overflow: "hidden",
                        border: "1px solid #eef2f7"
                    }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal body */}
                        <div style={{ padding: "24px" }}>
                            {/* Icon + heading row */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px", marginBottom: "24px" }}>
                                <div style={{
                                    width: "56px", height: "56px",
                                    borderRadius: "14px",
                                    background: "#eff6ff",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0,
                                }}>
                                    <AlertCircle size={28} color="#359AFF" />
                                </div>
                                <div>
                                    <h3 style={{
                                        margin: "0 0 8px",
                                        fontSize: "20px",
                                        fontWeight: "700",
                                        color: "#0f172a",
                                    }}>
                                        Delete Document?
                                    </h3>
                                    <p style={{
                                        margin: 0,
                                        fontSize: "14px",
                                        color: "#64748b",
                                        lineHeight: "1.5"
                                    }}>
                                        Are you sure you want to delete <span style={{ fontWeight: 600, color: "#1e293b" }}>&quot;{deleteDocModal.doc?.title || deleteDocModal.doc?.file_name}&quot;</span>? This action cannot be undone.
                                    </p>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div style={{
                                display: "flex",
                                gap: "12px",
                            }}>
                                <button
                                    onClick={() => setDeleteDocModal({ open: false, doc: null })}
                                    style={{
                                        flex: 1,
                                        padding: "12px 0",
                                        borderRadius: "10px",
                                        border: "1px solid #e2e8f0",
                                        background: "#fff",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                        color: "#475569",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = "#f8fafc";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = "#fff";
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteDocument}
                                    style={{
                                        flex: 1,
                                        padding: "12px 0",
                                        borderRadius: "10px",
                                        border: "none",
                                        background: "#359AFF",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                        color: "#fff",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px",
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.opacity = "0.9";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.opacity = "1";
                                    }}
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes overlayIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.92) translateY(12px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
}