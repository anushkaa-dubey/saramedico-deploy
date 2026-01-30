"use client";

import { useState } from "react";
import Topbar from "../components/Topbar";
import PDFViewer from "./components/PDFViewer";
import AIChat from "./components/AIChat";
import Timeline from "./components/Timeline";
import styles from "./ChartReview.module.css";
import { motion } from "framer-motion";

export default function ChartReviewPage() {
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showTimeline, setShowTimeline] = useState(false);
    const [isDragging, setIsDragging] = useState(false);


    const handleFileUpload = (e) => {
        e.preventDefault();
        const files = e.target.files || e.dataTransfer?.files;
        if (files && files.length > 0) {
            console.log("Files uploaded:", files);
            alert(`Selected ${files.length} file(s): ${files[0].name}`);
            // In a real app, you'd upload these to the backend here
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



    const sampleDocuments = [
        {
            id: 1,
            name: "Lab Results - CBC Panel",
            date: "2024-01-15",
            pages: 3,
            status: "analyzed"
        },
        {
            id: 2,
            name: "MRI Scan Report",
            date: "2024-01-10",
            pages: 12,
            status: "analyzed"
        },
        {
            id: 3,
            name: "Previous Visit Notes",
            date: "2023-12-20",
            pages: 5,
            status: "pending"
        }
    ];

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
                <button className={styles.uploadBtn} onClick={triggerFileInput}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload Document
                </button>
            </div>

            {!selectedDocument ? (
                // Document Library View
                <div className={styles.libraryView}>
                    <div className={styles.documentsGrid}>
                        {sampleDocuments.map((doc) => (
                            <div
                                key={doc.id}
                                className={styles.documentCard}
                                onClick={() => setSelectedDocument(doc)}
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
                                    <h3 className={styles.docName}>{doc.name}</h3>
                                    <div className={styles.docMeta}>
                                        <span>{doc.pages} pages</span>
                                        <span>•</span>
                                        <span>{doc.date}</span>
                                    </div>
                                </div>
                                <span className={`${styles.statusBadge} ${styles[doc.status]}`}>
                                    {doc.status === "analyzed" ? "Ready" : "Processing"}
                                </span>
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
                                <input type="checkbox" />
                                <span>Auto-Redact PII (Names, SSN, DOB)</span>
                            </label>
                        </div>
                    </div>
                </div>
            ) : (
                // Split View: PDF Viewer + AI Chat/Timeline
                <div className={styles.splitViewContainer}>
                    <div className={styles.viewerControls}>
                        <button className={styles.backBtn} onClick={() => setSelectedDocument(null)}>
                            ← Back to Library
                        </button>
                        <h3 className={styles.documentTitle}>{selectedDocument.name}</h3>
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
                                <AIChat onCitationClick={handleCitationClick} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
