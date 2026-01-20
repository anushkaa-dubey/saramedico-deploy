"use client";

import { useState } from "react";
import styles from "./PDFViewer.module.css";

export default function PDFViewer({ documentUrl, onPageChange }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [zoom, setZoom] = useState(100);
    const totalPages = 12; // This would come from the PDF library

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            if (onPageChange) onPageChange(newPage);
        }
    };

    const handleZoom = (direction) => {
        if (direction === "in" && zoom < 200) {
            setZoom(zoom + 25);
        } else if (direction === "out" && zoom > 50) {
            setZoom(zoom - 25);
        }
    };

    return (
        <div className={styles.pdfViewer}>
            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.toolGroup}>
                    <button
                        className={styles.toolBtn}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <span className={styles.pageInfo}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className={styles.toolBtn}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>

                <div className={styles.toolGroup}>
                    <button className={styles.toolBtn} onClick={() => handleZoom("out")}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="8" y1="11" x2="14" y2="11" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </button>
                    <span className={styles.zoomInfo}>{zoom}%</span>
                    <button className={styles.toolBtn} onClick={() => handleZoom("in")}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="11" y1="8" x2="11" y2="14" />
                            <line x1="8" y1="11" x2="14" y2="11" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </button>
                </div>

                <div className={styles.toolGroup}>
                    <button className={styles.toolBtn} title="Download">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    </button>
                    <button className={styles.toolBtn} title="Print">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 6 2 18 2 18 9" />
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                            <rect x="6" y="14" width="12" height="8" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* PDF Canvas Area */}
            <div className={styles.canvasContainer}>
                <div className={styles.pdfPage} style={{ transform: `scale(${zoom / 100})` }}>
                    {/* Placeholder for actual PDF rendering */}
                    <div className={styles.pagePlaceholder}>
                        <div className={styles.pageHeader}>
                            <h3>Lab Results - Complete Blood Count (CBC)</h3>
                            <p>Patient: Benjamin Frank | Date: January 15, 2024</p>
                        </div>
                        <div className={styles.pageContent}>
                            <div className={styles.resultRow}>
                                <span className={styles.testName}>White Blood Cells (WBC)</span>
                                <span className={styles.testValue}>7.2 K/μL</span>
                                <span className={styles.testRange}>Normal (4.5-11.0)</span>
                            </div>
                            <div className={styles.resultRow}>
                                <span className={styles.testName}>Red Blood Cells (RBC)</span>
                                <span className={styles.testValue}>4.8 M/μL</span>
                                <span className={styles.testRange}>Normal (4.5-5.5)</span>
                            </div>
                            <div className={styles.resultRow}>
                                <span className={styles.testName}>Hemoglobin</span>
                                <span className={styles.testValue}>14.2 g/dL</span>
                                <span className={styles.testRange}>Normal (13.5-17.5)</span>
                            </div>
                            <div className={styles.resultRow}>
                                <span className={styles.testName}>Hematocrit</span>
                                <span className={styles.testValue}>42%</span>
                                <span className={styles.testRange}>Normal (38-50%)</span>
                            </div>
                            <div className={styles.resultRow}>
                                <span className={styles.testName}>Platelets</span>
                                <span className={`${styles.testValue} ${styles.abnormal}`}>180 K/μL</span>
                                <span className={styles.testRange}>Low (150-400)</span>
                            </div>
                        </div>
                        <div className={styles.pageFooter}>
                            <p>This is a placeholder. Actual PDF will be rendered using react-pdf library.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Page Thumbnails Sidebar */}
            <div className={styles.thumbnailSidebar}>
                <div className={styles.thumbnailHeader}>Pages</div>
                <div className={styles.thumbnailList}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <div
                            key={page}
                            className={`${styles.thumbnail} ${page === currentPage ? styles.active : ""}`}
                            onClick={() => handlePageChange(page)}
                        >
                            <div className={styles.thumbnailPreview}>{page}</div>
                            <span className={styles.thumbnailLabel}>Page {page}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
