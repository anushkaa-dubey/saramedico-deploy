"use client";

import { useState } from "react";
import styles from "./SOAPEditor.module.css";

export default function SOAPEditor({ initialData = {} }) {
    const [soapData, setSoapData] = useState({
        subjective: initialData.subjective || "",
        objective: initialData.objective || "",
        assessment: initialData.assessment || "",
        plan: initialData.plan || ""
    });

    const handleChange = (section, value) => {
        setSoapData(prev => ({
            ...prev,
            [section]: value
        }));
    };

    const sections = [
        {
            key: "subjective",
            label: "Subjective",
            placeholder: "Patient's chief complaint, symptoms, history...",
            color: "#3b82f6"
        },
        {
            key: "objective",
            label: "Objective",
            placeholder: "Vital signs, physical examination findings...",
            color: "#10b981"
        },
        {
            key: "assessment",
            label: "Assessment",
            placeholder: "Diagnosis, differential diagnosis...",
            color: "#f59e0b"
        },
        {
            key: "plan",
            label: "Plan",
            placeholder: "Treatment plan, medications, follow-up...",
            color: "#8b5cf6"
        }
    ];

    return (
        <div className={styles.soapEditor}>
            <div className={styles.header}>
                <h3 className={styles.title}>SOAP Note</h3>
                <div className={styles.actions}>
                    <button className={styles.copyBtn}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copy
                    </button>
                    <button className={styles.saveBtn}>Save to EMR</button>
                </div>
            </div>

            <div className={styles.sectionsContainer}>
                {sections.map(section => (
                    <div key={section.key} className={styles.section}>
                        <div className={styles.sectionHeader} style={{ borderLeftColor: section.color }}>
                            <span className={styles.sectionLabel}>{section.label}</span>
                            <span className={styles.charCount}>
                                {soapData[section.key].length} chars
                            </span>
                        </div>
                        <textarea
                            className={styles.textarea}
                            placeholder={section.placeholder}
                            value={soapData[section.key]}
                            onChange={(e) => handleChange(section.key, e.target.value)}
                            rows={6}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
