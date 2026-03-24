"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Topbar from "../components/Topbar";
import PDFViewer from "./components/PDFViewer";
import AIChat from "./components/AIChat";
import Timeline from "./components/Timeline";
import styles from "./ChartReview.module.css";
import { motion } from "framer-motion";
import { fetchPatients, fetchDoctorProfile, fetchPatientDocuments, uploadPatientDocument, fetchDocumentDetails } from "@/services/doctor";
import { API_BASE_URL, getAuthHeaders } from "@/services/apiConfig";
import { Trash2, AlertCircle } from "lucide-react";


export default function ChartReviewPage() {
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showTimeline, setShowTimeline] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const [doctorId, setDoctorId] = useState(null);
    const [patientId, setPatientId] = useState(null);
    const [patients, setPatients] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Delete confirmation modal state
    const [deleteModal, setDeleteModal] = useState({ open: false, doc: null });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const profile = await fetchDoctorProfile();
            setDoctorId(profile.id);

            const patientsList = await fetchPatients();
            setPatients(patientsList || []);
            if (patientsList && patientsList.length > 0) {
                const firstPatientId = patientsList[0].id;
                setPatientId(firstPatientId);
                loadDocuments(firstPatientId);
            }
        } catch (err) {
            console.error("Failed to load chart review data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePatientChange = (e) => {
        const newPatientId = e.target.value;
        setPatientId(newPatientId);
        setSelectedDocument(null);
        loadDocuments(newPatientId);
    };

    const loadDocuments = async (pId) => {
        try {
            const data = await fetchPatientDocuments(pId);
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
            console.error("Failed to load documents:", err);
            setDocuments([]);
        }
    };

    const [uploadStatus, setUploadStatus] = useState({ msg: "", type: "" });

    const openDeleteModal = (docObj, e) => {
        e.stopPropagation();
        setDeleteModal({ open: true, doc: docObj });
    };

    const handleDeleteDocument = async () => {
        const docObj = deleteModal.doc;
        if (!docObj) return;
        setDeleteModal({ open: false, doc: null });

        setDeleting(docObj.id);
        try {
            const idsToDelete = docObj.allIds || [docObj.id];
            for (const id of idsToDelete) {
                const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
                    method: "DELETE",
                    headers: getAuthHeaders(),
                });
                if (!response.ok && response.status !== 204 && response.status !== 404) {
                    console.error(`Delete failed for ${id}: ${response.status}`);
                }
            }
            // Reload from API to guarantee perfectly synced view
            await loadDocuments(patientId);
            if (selectedDocument?.id === docObj.id) {
                setSelectedDocument(null);
            }
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            setDeleting(null);
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        const files = e.target.files || e.dataTransfer?.files;
        if (!files || files.length === 0) return;
        if (uploading) return; // Prevent duplicate submissions

        if (!patientId) {
            alert("Please select a patient before uploading.");
            return;
        }

        setUploading(true);
        setUploadStatus({ msg: "Uploading...", type: "" });
        try {
            const file = files[0];
            await uploadPatientDocument(patientId, file, {
                title: file.name,
                category: "other"
            });

            // Reset the file input so the same file can be re-uploaded if needed
            const input = document.getElementById("docFileInput");
            if (input) input.value = "";

            setUploadStatus({ msg: "Upload Successful! Document processing started.", type: "success" });
            loadDocuments(patientId);
            setTimeout(() => setUploadStatus({ msg: "", type: "" }), 5000);
        } catch (err) {
            console.error("Upload failed:", err);
            setUploadStatus({ msg: `Upload failed: ${err.message}`, type: "error" });
            setTimeout(() => setUploadStatus({ msg: "", type: "" }), 8000);
        } finally {
            setUploading(false);
        }
    };

    const triggerFileInput = () => {
        document.getElementById("docFileInput").click();
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileUpload(e);
    };

    const handleCitationClick = (page) => {
        setCurrentPage(page);
        console.log(`Jumping to page ${page}`);
    };

    const handleEventClick = (page) => {
        setCurrentPage(page);
        console.log(`Jumping to page ${page} from timeline`);
    };

    const handleSelectDocument = async (doc) => {
        setSelectedDocument(doc); // Optimistic UI update
        try {
            const fullDoc = await fetchDocumentDetails(doc.id);
            if (fullDoc) {
                // Ensure we get the properly formatted downloadUrl from the API
                setSelectedDocument(prev => prev && prev.id === fullDoc.id ? { ...prev, ...fullDoc } : prev);
            }
        } catch (err) {
            console.error("Failed to load full document details:", err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Topbar />
            <input
                type="file"
                id="docFileInput"
                multiple
                style={{ display: "none" }}
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.jpg,.png"
            />


            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Chart Review</h1>
                    <p className={styles.pageSubtitle}>
                        Upload and analyze medical documents with AI-powered insights
                    </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {/* Patient Selector */}
                    <select
                        value={patientId || ""}
                        onChange={handlePatientChange}
                        style={{
                            padding: "8px 14px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            fontSize: "14px",
                            fontWeight: "500",
                            background: "#fff",
                            cursor: "pointer",
                            minWidth: "200px"
                        }}
                    >
                        {patients.length === 0 && <option value="">No patients found</option>}
                        {patients.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.full_name || p.fullName || p.name || `Patient ${p.id.slice(0, 8)}`}
                            </option>
                        ))}
                    </select>
                    <button className={styles.uploadBtn} onClick={triggerFileInput}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload Document
                    </button>
                </div>
            </div>

            {!selectedDocument ? (
                // Document Library View
                <div className={styles.libraryView}>
                    <div className={styles.documentsGrid}>
                        {loading && <p>Loading documents...</p>}
                        {!loading && documents.length === 0 && <p>No documents found for the active patient.</p>}

                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className={styles.documentCard}
                                onClick={() => handleSelectDocument(doc)}
                                style={{ position: "relative" }}
                            >
                                <div className={styles.docIcon}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                        <polyline points="10 9 9 9 8 9" />
                                    </svg>
                                </div>
                                <div className={styles.docInfo}>
                                    <h3 className={styles.docName}>{doc.title || doc.file_name || "Untitled"}</h3>
                                    <div className={styles.docMeta}>
                                        <span>{doc.category || "General"}</span>
                                        <span>•</span>
                                        <span>{new Date(doc.uploaded_at || doc.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <span className={`${styles.statusBadge} ${styles.analyzed}`}>
                                    Ready
                                </span>
                                {/* Delete Button */}
                                <button
                                    onClick={(e) => openDeleteModal(doc, e)}
                                    disabled={deleting === doc.id}
                                    title="Delete document"
                                    style={{
                                        position: "absolute",
                                        top: "10px",
                                        right: "10px",
                                        background: deleting === doc.id ? "#f1f5f9" : "#fff",
                                        border: "1.5px solid #DFF2FF",
                                        borderRadius: "8px",
                                        padding: "4px 10px",
                                        cursor: deleting === doc.id ? "not-allowed" : "pointer",
                                        color: "#359AFF",
                                        fontSize: "12px",
                                        fontWeight: "700",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        opacity: deleting === doc.id ? 0.5 : 1,
                                        zIndex: 2,
                                        transition: "all 0.2s ease"
                                    }}
                                    onMouseEnter={e => { if (deleting !== doc.id) { e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.borderColor = '#359AFF'; } }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#DFF2FF'; }}
                                >
                                    {deleting === doc.id ? "..." : (
                                        <>
                                            <Trash2 size={13} strokeWidth={2.5} />
                                            Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Upload Zone */}
                    <div
                        className={`${styles.uploadZone} ${isDragging ? styles.uploadZoneActive : ""}`}
                        onClick={triggerFileInput}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >

                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>

                        <h3>Drag & Drop Documents Here</h3>
                        <p>or click to browse files</p>
                        <div className={styles.uploadOptions}>
                            <label className={styles.checkbox}>
                                <input type="checkbox" defaultChecked />
                                <span>Auto-Redact PII (Names, SSN, DOB)</span>
                            </label>
                        </div>
                        {uploadStatus.msg && (
                            <div className={`${styles.statusMsg} ${uploadStatus.type ? styles[uploadStatus.type] : ""}`}>
                                {uploadStatus.msg}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // Split View: PDF Viewer + AI Chat/Timeline
                <div className={styles.splitViewContainer}>
                    <div className={styles.viewerControls}>
                        <button className={styles.backBtn} onClick={() => setSelectedDocument(null)}>
                            ← Back to Library
                        </button>
                        <h3 className={styles.documentTitle}>{selectedDocument.title || selectedDocument.file_name || "Document"}</h3>
                        <div className={styles.viewToggle}>
                            <button
                                className={`${styles.toggleBtn} ${!showTimeline ? styles.active : ""}`}
                                onClick={() => setShowTimeline(false)}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                AI Chat
                            </button>
                            <button
                                className={`${styles.toggleBtn} ${showTimeline ? styles.active : ""}`}
                                onClick={() => setShowTimeline(true)}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                    <path d="M3 3v5h5" />
                                    <path d="M12 7v5l4 2" />
                                </svg>
                                Timeline
                            </button>
                        </div>
                    </div>

                    <div className={styles.splitView}>
                        <div className={styles.viewerPanel}>
                            <PDFViewer
                                documentUrl={selectedDocument.downloadUrl || selectedDocument.download_url || selectedDocument.presigned_url || selectedDocument.url || null}
                                documentName={selectedDocument.title || selectedDocument.file_name || selectedDocument.fileName || "Document"}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                        <div className={styles.sidePanel}>
                            {showTimeline ? (
                                <Timeline
                                    documentId={selectedDocument?.id}
                                    onEventClick={handleEventClick}
                                />
                            ) : (
                                <AIChat
                                    onCitationClick={handleCitationClick}
                                    patientId={patientId}
                                    doctorId={doctorId}
                                    documentId={selectedDocument.id}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.open && typeof document !== "undefined" && createPortal(
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
                    onClick={() => setDeleteModal({ open: false, doc: null })}
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
                                        Are you sure you want to delete <span style={{ fontWeight: 600, color: "#1e293b" }}>&quot;{deleteModal.doc?.title || deleteModal.doc?.file_name}&quot;</span>? This action cannot be undone.
                                    </p>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div style={{
                                display: "flex",
                                gap: "12px",
                            }}>
                                <button
                                    onClick={() => setDeleteModal({ open: false, doc: null })}
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
                                    onClick={handleDeleteDocument}
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
                @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUpModal { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @media (max-width: 480px) {
                    .deleteModalCard { padding: 20px 16px 18px !important; }
                }
            `}</style>
        </motion.div>
    );
}
