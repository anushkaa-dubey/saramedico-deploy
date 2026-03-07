"use client";

import { useState, useEffect } from "react";
import styles from "./Timeline.module.css";
import { API_BASE_URL, getAuthHeaders } from "@/services/apiConfig";

const EVENT_CONFIG = {
    lab:         { color: "#10b981", bg: "#ecfdf5", label: "Lab" },
    imaging:     { color: "#3b82f6", bg: "#eff6ff", label: "Imaging" },
    visit:       { color: "#8b5cf6", bg: "#f5f3ff", label: "Visit" },
    medication:  { color: "#f59e0b", bg: "#fffbeb", label: "Medication" },
    procedure:   { color: "#ef4444", bg: "#fef2f2", label: "Procedure" },
    surgery:     { color: "#dc2626", bg: "#fee2e2", label: "Surgery" },
    diagnosis:   { color: "#0ea5e9", bg: "#e0f2fe", label: "Diagnosis" },
    vaccination: { color: "#22c55e", bg: "#f0fdf4", label: "Vaccination" },
    other:       { color: "#64748b", bg: "#f8fafc", label: "Other" },
};

function EventIcon({ type }) {
    const icons = {
        lab: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 2v17.5A2.5 2.5 0 0 0 11.5 22v0A2.5 2.5 0 0 0 14 19.5V2" /><path d="M9 5h5" />
            </svg>
        ),
        imaging: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
        ),
        visit: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            </svg>
        ),
        medication: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v3" />
                <circle cx="18" cy="18" r="4" /><path d="M18 16v2"/><path d="M18 20v.01" />
            </svg>
        ),
        diagnosis: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
        ),
    };
    return icons[type] || (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    );
}

export default function Timeline({ documentId, onEventClick }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [source, setSource] = useState(null);
    const [lastDocId, setLastDocId] = useState(null);

    useEffect(() => {
        if (documentId && documentId !== lastDocId) {
            setLastDocId(documentId);
            analyseDocument(documentId);
        }
    }, [documentId]);

    const analyseDocument = async (docId) => {
        setLoading(true);
        setError("");
        setEvents([]);
        setSource(null);
        try {
            const res = await fetch(`${API_BASE_URL}/doctor/ai/timeline/${docId}`, {
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setEvents(data.events || []);
            setSource(data.source);
        } catch (err) {
            console.error("Timeline fetch error:", err);
            setError("Could not generate timeline. The AI service may be busy.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.timeline}>
            <div className={styles.header}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M12 7v5l4 2" />
                </svg>
                <h3 className={styles.title}>Medical Timeline</h3>
                {source === "ai" && (
                    <span style={{
                        marginLeft: "auto", fontSize: "10px", fontWeight: 700,
                        background: "#dcfce7", color: "#16a34a", padding: "2px 8px", borderRadius: "999px"
                    }}>AI Generated</span>
                )}
            </div>

            {loading && (
                <div style={{ padding: "32px", textAlign: "center" }}>
                    <div style={{
                        width: "32px", height: "32px", border: "3px solid #e2e8f0",
                        borderTopColor: "#3b82f6", borderRadius: "50%",
                        animation: "spin 1s linear infinite", margin: "0 auto 12px"
                    }} />
                    <p style={{ fontSize: "13px", color: "#64748b" }}>Analysing document with AI…</p>
                </div>
            )}

            {!loading && error && (
                <div style={{
                    padding: "16px", margin: "12px", borderRadius: "8px",
                    background: "#fef2f2", color: "#dc2626", fontSize: "13px"
                }}>
                    {error}
                </div>
            )}

            {!loading && !error && !documentId && (
                <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ margin: "0 auto 12px" }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <p style={{ fontSize: "13px" }}>Select a document to generate its medical timeline</p>
                </div>
            )}

            {!loading && !error && documentId && events.length === 0 && (
                <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                    No medical timeline events found in this document.
                </div>
            )}

            {!loading && events.length > 0 && (
                <div className={styles.eventsContainer}>
                    {events.map((event, index) => {
                        const cfg = EVENT_CONFIG[event.type] || EVENT_CONFIG.other;
                        return (
                            <div
                                key={event.id}
                                className={styles.eventItem}
                                onClick={() => onEventClick && onEventClick(event.page)}
                            >
                                <div className={styles.eventLine}>
                                    <div
                                        className={styles.eventDot}
                                        style={{ background: cfg.color }}
                                    >
                                        <span style={{ color: "#fff" }}>
                                            <EventIcon type={event.type} />
                                        </span>
                                    </div>
                                    {index < events.length - 1 && <div className={styles.connector} />}
                                </div>
                                <div className={styles.eventContent}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                                        <span style={{
                                            fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px",
                                            padding: "1px 6px", borderRadius: "4px",
                                            background: cfg.bg, color: cfg.color
                                        }}>
                                            {cfg.label}
                                        </span>
                                    </div>
                                    <div className={styles.eventDate}>{event.date}</div>
                                    <h4 className={styles.eventTitle}>{event.title}</h4>
                                    <p className={styles.eventDescription}>{event.description}</p>
                                    <button className={styles.pageLink} onClick={(e) => { e.stopPropagation(); onEventClick && onEventClick(event.page); }}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                        </svg>
                                        Page {event.page}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
