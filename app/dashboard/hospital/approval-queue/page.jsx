"use client";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { fetchReviewQueue } from "@/services/hospital";

export default function ApprovalQueuePage() {
    const [reviewQueue, setReviewQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        department: "All",
        provider: "All",
        urgency: "All"
    });

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const data = await fetchReviewQueue();
                setReviewQueue(data);
            } catch (err) {
                console.error("Failed to load review queue:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredQueue = useMemo(() => {
        return reviewQueue.filter(item => {
            return (filters.department === "All" || item.department === filters.department) &&
                (filters.provider === "All" || item.provider === filters.provider) &&
                (filters.urgency === "All" || item.urgency === filters.urgency);
        });
    }, [reviewQueue, filters]);

    const departments = ["All", ...new Set(reviewQueue.map(i => i.department))];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.container}
            style={{ flexDirection: 'column', background: 'transparent', padding: 0 }}
        >
            <Topbar title="Centralized Approval Queue" />

            <div style={{ padding: '24px' }}>
                <motion.div className={styles.card}>
                    <div className={styles.cardTitle}>
                        <span style={{ fontSize: '18px', fontWeight: '700' }}>Review Queue</span>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <select
                                className={styles.outlineBtn}
                                value={filters.department}
                                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                            >
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select
                                className={styles.outlineBtn}
                                value={filters.urgency}
                                onChange={(e) => setFilters(prev => ({ ...prev, urgency: e.target.value }))}
                            >
                                <option value="All">All Urgency</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.activityTableContainer} style={{ marginTop: '24px' }}>
                        <table className={styles.activityTable}>
                            <thead>
                                <tr className={styles.activityHeader}>
                                    <th>PATIENT</th>
                                    <th>PROVIDER</th>
                                    <th>DEPARTMENT</th>
                                    <th>URGENCY</th>
                                    <th>STATUS</th>
                                    <th style={{ textAlign: 'right' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {filteredQueue.map((item) => (
                                        <motion.tr
                                            layout
                                            key={item.id}
                                            className={styles.activityRow}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <td style={{ fontWeight: '700' }}>{item.patient}</td>
                                            <td>{item.provider}</td>
                                            <td>{item.department}</td>
                                            <td>
                                                <span style={{
                                                    color: item.urgency === 'High' ? '#ef4444' : item.urgency === 'Medium' ? '#f59e0b' : '#64748b',
                                                    fontWeight: '700'
                                                }}>
                                                    {item.urgency.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>{item.status}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button className={styles.primaryBtn} style={{ height: '32px', fontSize: '12px', marginLeft: 'auto' }}>Review Note</button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                        {filteredQueue.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                No items found matching filters.
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
