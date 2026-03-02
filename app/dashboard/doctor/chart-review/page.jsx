"use client";

import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import PDFViewer from "./components/PDFViewer";
import AIChat from "./components/AIChat";
import Timeline from "./components/Timeline";
import styles from "./ChartReview.module.css";
import { motion } from "framer-motion";
import { fetchPatients, fetchProfile, fetchPatientDocuments, uploadPatientDocument } from "@/services/doctor";
import { API_BASE_URL, getAuthHeaders } from "@/services/apiConfig";


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

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const profile = await fetchProfile();
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
            const docs = await fetchPatientDocuments(pId);
            setDocuments(docs || []);
        } catch (err) {
            console.error("Failed to load documents:", err);
            setDocuments([]);
        }
    };

    const [uploadStatus, setUploadStatus] = useState({ msg: "", type: "" });

    const handleDeleteDocument = async (docId, e) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this document? This cannot be undone.")) return;

        setDeleting(docId);
        try {
            const response = await fetch(`${API_BASE_URL}/documents/${docId}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });
            if (!response.ok && response.status !== 204) {
                throw new Error(`Delete failed: ${response.status}`);
            }
            setDocuments((prev) => prev.filter((d) => d.id !== docId));
        } catch (err) {
            console.error("Delete error:", err);
            alert("Failed to delete document. Please try again.");
        } finally {
            setDeleting(null);
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        const files = e.target.files || e.dataTransfer?.files;
        if (!files || files.length === 0) return;

        if (!patientId) {
            alert("Please select a patient before uploading.");
            return;
        }

        setUploadStatus({ msg: "Uploading...", type: "" });
        try {
            const file = files[0];
            await uploadPatientDocument(patientId, file, {
                title: file.name,
                category: "Chart Review"
            });

            setUploadStatus({ msg: "Upload Successful! Document processing started.", type: "success" });
            loadDocuments(patientId);
            setTimeout(() => setUploadStatus({ msg: "", type: "" }), 5000);
        } catch (err) {
            console.error("Upload failed:", err);
            setUploadStatus({ msg: `Upload failed: ${err.message}`, type: "error" });
            setTimeout(() => setUploadStatus({ msg: "", type: "" }), 8000);
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
                                onClick={() => setSelectedDocument(doc)}
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
                                    onClick={(e) => handleDeleteDocument(doc.id, e)}
                                    disabled={deleting === doc.id}
                                    title="Delete document"
                                    style={{
                                        position: "absolute",
                                        top: "8px",
                                        right: "8px",
                                        background: deleting === doc.id ? "#ccc" : "#fee2e2",
                                        border: "none",
                                        borderRadius: "6px",
                                        padding: "4px 8px",
                                        cursor: deleting === doc.id ? "not-allowed" : "pointer",
                                        color: "#dc2626",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        opacity: deleting === doc.id ? 0.5 : 1,
                                        zIndex: 2
                                    }}
                                >
                                    {deleting === doc.id ? "..." : (
                                        <>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                <path d="M10 11v6M14 11v6" />
                                            </svg>
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
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="2" x2="12" y2="22" />
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                                Timeline
                            </button>
                        </div>
                    </div>

                    <div className={styles.splitView}>
                        <div className={styles.viewerPanel}>
                            <PDFViewer onPageChange={setCurrentPage} />
                        </div>
                        <div className={styles.sidePanel}>
                            {showTimeline ? (
                                <Timeline onEventClick={handleEventClick} />
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
        </motion.div>
    );
}
