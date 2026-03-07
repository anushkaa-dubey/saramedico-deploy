"use client";

import { useState } from "react";
import styles from "./PDFViewer.module.css";

export default function PDFViewer({ documentUrl, documentName, onPageChange }) {
    const [zoom, setZoom] = useState(100);

    const handleZoom = (direction) => {
        if (direction === "in" && zoom < 200) setZoom(zoom + 25);
        else if (direction === "out" && zoom > 50) setZoom(zoom - 25);
    };

    const handleDownload = () => {
        if (documentUrl) {
            const a = document.createElement("a");
            a.href = documentUrl;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.click();
        }
    };

    const isImage = documentUrl?.match(/\.(jpeg|jpg|png|gif|webp)(\?.*)?$/i) || documentName?.match(/\.(jpeg|jpg|png|gif|webp)$/i);

    return (
        <div className={styles.pdfViewer}>
            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.toolGroup}>
                    <span className={styles.pageInfo} style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {documentName || "Document"}
                    </span>
                </div>

                <div className={styles.toolGroup}>
                    <button className={styles.toolBtn} onClick={() => handleZoom("out")} title="Zoom Out">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="8" y1="11" x2="14" y2="11" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </button>
                    <span className={styles.zoomInfo}>{zoom}%</span>
                    <button className={styles.toolBtn} onClick={() => handleZoom("in")} title="Zoom In">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="11" y1="8" x2="11" y2="14" />
                            <line x1="8" y1="11" x2="14" y2="11" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </button>
                </div>

                <div className={styles.toolGroup}>
                    <button className={styles.toolBtn} onClick={handleDownload} title="Open / Download">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Document Area */}
            <div className={styles.canvasContainer} style={{ overflow: "auto" }}>
                {documentUrl ? (
                    <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center", transition: "transform 0.2s ease", width: "100%", height: "100%", display: "flex", justifyContent: "center" }}>
                        {isImage ? (
                            <img
                                src={documentUrl}
                                alt={documentName || "Document"}
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "calc(100vh - 180px)",
                                    objectFit: "contain",
                                    borderRadius: "8px",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
                                }}
                            />
                        ) : (
                            <iframe
                                src={documentUrl}
                                title={documentName || "Document Viewer"}
                                style={{
                                    width: "100%",
                                    minWidth: "500px",
                                    maxWidth: "800px",
                                    height: "calc(100vh - 180px)",
                                    border: "none",
                                    background: "#fff",
                                    borderRadius: "8px",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
                                }}
                            />
                        )}
                    </div>
                ) : (
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        color: "#64748b",
                        gap: "16px",
                        padding: "40px"
                    }}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <p style={{ textAlign: "center", maxWidth: "280px" }}>
                            No preview available. Click <strong>Open / Download</strong> to view the document.
                        </p>
                        <button
                            onClick={handleDownload}
                            style={{
                                padding: "10px 24px",
                                background: "linear-gradient(90deg, #359AFF, #9CCDFF)",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontWeight: "600",
                                cursor: "pointer",
                                fontSize: "14px"
                            }}
                        >
                            Open Document ↗
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
