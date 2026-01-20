"use client";

import styles from "./DocumentsList.module.css";
import { useRouter } from "next/navigation";

export default function DocumentsList({ patientId }) {
    const router = useRouter();

    // Mock data - in real app would fetch based on patientId
    const documents = [
        {
            id: 1,
            name: "Lab Results - CBC Panel",
            type: "Lab Report",
            date: "Oct 24, 2024",
            size: "2.4 MB",
            status: "analyzed"
        },
        {
            id: 2,
            name: "MRI Scan - Brain",
            type: "Imaging",
            date: "Oct 12, 2024",
            size: "154 MB",
            status: "analyzed"
        },
        {
            id: 3,
            name: "Referral Letter - Neurology",
            type: "Correspondence",
            date: "Sep 30, 2024",
            size: "1.2 MB",
            status: "pending"
        },
        {
            id: 4,
            name: "Past Medical History",
            type: "History",
            date: "Sep 30, 2024",
            size: "4.5 MB",
            status: "analyzed"
        }
    ];

    const handleOpenDocument = (docId) => {
        // Navigate to Chart Review with document selected
        router.push(`/dashboard/doctor/chart-review?docId=${docId}`);
    };

    return (
        <div className={styles.documentsList}>
            <div className={styles.header}>
                <h3 className={styles.title}>Patient Documents</h3>
                <button className={styles.uploadBtn}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload
                </button>
            </div>

            <div className={styles.grid}>
                {documents.map((doc) => (
                    <div key={doc.id} className={styles.card} onClick={() => handleOpenDocument(doc.id)}>
                        <div className={styles.iconWrapper}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                            </svg>
                        </div>
                        <div className={styles.info}>
                            <h4 className={styles.docName}>{doc.name}</h4>
                            <div className={styles.meta}>
                                <span>{doc.type}</span>
                                <span>•</span>
                                <span>{doc.date}</span>
                            </div>
                        </div>
                        <div className={`${styles.status} ${styles[doc.status]}`}>
                            {doc.status === "analyzed" ? "Analyzed" : "Processing"}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
