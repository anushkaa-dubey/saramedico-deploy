"use client";

import { useState } from "react";
import styles from "./AssistPanel.module.css";
import { Tag, Activity, Search, Plus, Check, X } from "lucide-react";

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
                        <Tag size={16} />
                        Clinical Tags
                    </h4>
                    <button className={styles.addBtn}><Plus size={14} /> Add</button>
                </div>

                <div className={styles.tagsContainer}>
                    {activeTags.map((tag, idx) => (
                        <span
                            key={idx}
                            className={`${styles.tag} ${styles[`tag${(idx % 3) + 1}`]}`}
                            onClick={() => handleTagClick(tag)}
                        >
                            <span className={styles.tagDot}></span>
                            {tag}
                            <button className={styles.tagRemove}><X size={12} /></button>
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
                        <Activity size={16} />
                        Home Remedies
                    </h4>
                </div>

                <div className={styles.searchBox}>
                    <Search className={styles.searchIcon} size={14} />
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
                                <Plus size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* ICD-10 Codes Section */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h4 className={styles.sectionTitle}>
                        <Check size={16} />
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
