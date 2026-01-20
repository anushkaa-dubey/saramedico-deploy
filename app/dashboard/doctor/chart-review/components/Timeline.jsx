"use client";

import styles from "./Timeline.module.css";

export default function Timeline({ events, onEventClick }) {
    const sampleEvents = events || [
        {
            id: 1,
            date: "2024-01-15",
            title: "Lab Results - CBC Panel",
            description: "Complete blood count analysis",
            page: 1,
            type: "lab"
        },
        {
            id: 2,
            date: "2024-01-10",
            title: "MRI Scan - Brain",
            description: "Neurological imaging study",
            page: 5,
            type: "imaging"
        },
        {
            id: 3,
            date: "2023-12-20",
            title: "Follow-up Visit",
            description: "Post-treatment consultation",
            page: 8,
            type: "visit"
        },
        {
            id: 4,
            date: "2023-12-01",
            title: "Prescription - Medication",
            description: "Sumatriptan 50mg prescribed",
            page: 10,
            type: "medication"
        }
    ];

    const getEventIcon = (type) => {
        switch (type) {
            case "lab":
                return (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 2v17.5A2.5 2.5 0 0 0 11.5 22v0A2.5 2.5 0 0 0 14 19.5V2" />
                        <path d="M9 5h5" />
                    </svg>
                );
            case "imaging":
                return (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                );
            case "visit":
                return (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                );
            case "medication":
                return (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
                        <rect x="9" y="9" width="6" height="6" />
                        <line x1="9" y1="1" x2="9" y2="4" />
                        <line x1="15" y1="1" x2="15" y2="4" />
                        <line x1="9" y1="20" x2="9" y2="23" />
                        <line x1="15" y1="20" x2="15" y2="23" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const getEventColor = (type) => {
        switch (type) {
            case "lab":
                return "#10b981";
            case "imaging":
                return "#3b82f6";
            case "visit":
                return "#8b5cf6";
            case "medication":
                return "#f59e0b";
            default:
                return "#64748b";
        }
    };

    return (
        <div className={styles.timeline}>
            <div className={styles.header}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="2" x2="12" y2="22" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <h3 className={styles.title}>Medical Timeline</h3>
            </div>

            <div className={styles.eventsContainer}>
                {sampleEvents.map((event, index) => (
                    <div
                        key={event.id}
                        className={styles.eventItem}
                        onClick={() => onEventClick && onEventClick(event.page)}
                    >
                        <div className={styles.eventLine}>
                            <div
                                className={styles.eventDot}
                                style={{ background: getEventColor(event.type) }}
                            >
                                {getEventIcon(event.type)}
                            </div>
                            {index < sampleEvents.length - 1 && <div className={styles.connector} />}
                        </div>
                        <div className={styles.eventContent}>
                            <div className={styles.eventDate}>{event.date}</div>
                            <h4 className={styles.eventTitle}>{event.title}</h4>
                            <p className={styles.eventDescription}>{event.description}</p>
                            <button className={styles.pageLink}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                                Page {event.page}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
