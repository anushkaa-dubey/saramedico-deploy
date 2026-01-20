"use client";

import { useState } from "react";
import styles from "./AssistPanel.module.css";

export default function AssistPanel({ suggestedTags = [], onTagAdd }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTags, setActiveTags] = useState(suggestedTags);

    const remedySuggestions = [
        { name: "Rest", category: "General" },
        { name: "Ice Pack", category: "Pain Relief" },
        { name: "Hydration", category: "General" },
        { name: "Elevation", category: "Injury" },
        { name: "Compression", category: "Injury" }
    ];

    const handleTagClick = (tag) => {
        if (activeTags.includes(tag)) {
            setActiveTags(activeTags.filter(t => t !== tag));
        } else {
            setActiveTags([...activeTags, tag]);
            if (onTagAdd) onTagAdd(tag);
        }
    };

    const filteredRemedies = searchQuery
        ? remedySuggestions.filter(r =>
            r.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : remedySuggestions;

    return (
        <div className={styles.assistPanel}>
            {/* Clinical Tags Section */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h4 className={styles.sectionTitle}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                            <line x1="7" y1="7" x2="7.01" y2="7" />
                        </svg>
                        Clinical Tags
                    </h4>
                    <button className={styles.addBtn}>+ Add</button>
                </div>

                <div className={styles.tagsContainer}>
                    {activeTags.map((tag, idx) => (
                        <span
                            key={idx}
                            className={`${styles.tag} ${styles[`tag${(idx % 3) + 1}`]}`}
                            onClick={() => handleTagClick(tag)}
                        >
                            <span className={styles.tagDot}>•</span>
                            {tag}
                            <button className={styles.tagRemove}>×</button>
                        </span>
                    ))}
                </div>

                <p className={styles.hint}>
                    AI-suggested tags based on conversation analysis
                </p>
            </div>

            {/* Remedies Section */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h4 className={styles.sectionTitle}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                        Home Remedies
                    </h4>
                </div>

                <div className={styles.searchBox}>
                    <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search remedies..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className={styles.remediesList}>
                    {filteredRemedies.map((remedy, idx) => (
                        <div key={idx} className={styles.remedyItem}>
                            <div className={styles.remedyInfo}>
                                <span className={styles.remedyName}>{remedy.name}</span>
                                <span className={styles.remedyCategory}>{remedy.category}</span>
                            </div>
                            <button className={styles.addRemedyBtn}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* ICD-10 Codes Section */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h4 className={styles.sectionTitle}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 11 12 14 22 4" />
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                        Billing Codes
                    </h4>
                </div>

                <div className={styles.codesList}>
                    <div className={styles.codeItem}>
                        <span className={styles.code}>R51</span>
                        <span className={styles.codeDesc}>Headache</span>
                    </div>
                    <div className={styles.codeItem}>
                        <span className={styles.code}>R11.0</span>
                        <span className={styles.codeDesc}>Nausea</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
