"use client";
import Topbar from "../../components/Topbar";
import styles from "../../HospitalDashboard.module.css";
import { motion } from "framer-motion";
import { fetchCalendarMonth, fetchCalendarDay } from "@/services/calendar";
import { fetchHospitalStats, fetchReviewQueue } from "@/services/hospital";
import { useState, useEffect } from "react";

export default function CardiologyDepartmentPage() {
    const [realStats, setRealStats] = useState({
        notesPendingSignature: "14",
        transcriptionQueueStatus: "8",
        averageNoteCompletionTime: "4.2 hrs"
    });
    const [queueData, setQueueData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPageData = async () => {
            setIsLoading(true);
            try {
                const [stats, queue] = await Promise.all([
                    fetchHospitalStats(),
                    fetchReviewQueue({ limit: 5 })
                ]);
                setRealStats(stats);
                setQueueData(queue);
            } catch (err) {
                console.error("Failed to load cardiology data:", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadPageData();
    }, []);

    const stats = [
        {
            label: "NOTES PENDING SIGNATURE",
            value: realStats.notesPendingSignature,
            badge: "Action Required",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
            color: "#94a3b8",
            badgeBg: "#fef2f2",
            badgeColor: "#ef4444"
        },
        {
            label: "TRANSCRIPTION QUEUE STATUS",
            value: realStats.transcriptionQueueStatus,
            subtext: "Processing",
            badge: "Real-time",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20v-6M9 20v-4M15 20v-8M18 20v-10M6 20v-2"></path></svg>,
            color: "#94a3b8",
            badgeColor: "#10b981",
            isWave: true
        },
        {
            label: "AVG NOTE COMPLETION TIME",
            value: realStats.averageNoteCompletionTime,
            badge: "System Latency",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
            color: "#94a3b8",
            badgeColor: "#10b981"
        },
        {
            label: "TOTAL DOCTORS ONLINE",
            value: "32",
            badge: "+2 active",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
            color: "#94a3b8",
            badgeColor: "#10b981"
        }
    ];

    const [currentDate, setCurrentDate] = useState(new Date());
    const [monthData, setMonthData] = useState({});
    const [selectedDayEvents, setSelectedDayEvents] = useState(null);
    const [isTodayMonth, setIsTodayMonth] = useState(false);

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    useEffect(() => {
        const loadMonthData = async () => {
            try {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;
                const response = await fetchCalendarMonth(year, month);
                const mappedData = {};
                if (response && response.days) {
                    response.days.forEach(d => {
                        mappedData[d.day] = d.event_count || d.count || 0;
                    });
                }
                setMonthData(mappedData);
            } catch (err) {
                console.error("Failed to fetch cardiology calendar:", err);
            }
        };
        loadMonthData();

        const now = new Date();
        setIsTodayMonth(currentDate.getMonth() === now.getMonth() && currentDate.getFullYear() === now.getFullYear());
    }, [currentDate]);

    const handleDayClick = async (day) => {
        try {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const response = await fetchCalendarDay(dateStr);
            setSelectedDayEvents(response.events || response || []);
        } catch (err) {
            console.error("Failed to fetch calendar day events:", err);
        }
    };

    const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    const daysInMonthCount = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
    const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
    const todayDate = new Date().getDate();

    const getDayAvailability = (day) => {
        const count = monthData[day];
        if (count === undefined || count === 0) return "none";
        return "active";
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', background: 'transparent', padding: 0, minHeight: '100%' }}
        >
            <Topbar title="Cardiology Department" />

            <div className={styles.contentWrapper}>
                <div className={styles.dashboardGrid}>
                    <div className={styles.leftColMain}>
                        <div className={styles.pageHeaderRow} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Approval Queue</h1>
                                <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Review clinical sessions for AI documentation.</p>
                            </div>
                            <div className={styles.pageHeaderActions} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <button className={styles.primaryBtn} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0 24px', fontWeight: '700' }}>Schedule</button>
                            </div>
                        </div>

                        <div className={styles.overviewSection} style={{ marginBottom: '32px' }}>
                            {stats.map((stat, idx) => (
                                <div key={idx} className={styles.statCard} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#ffffff', minHeight: '130px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.02em', textTransform: 'uppercase' }}>{stat.label}</div>
                                        <div style={{ color: '#e2e8f0' }}>{stat.icon}</div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                            <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>{stat.value}</div>
                                        </div>
                                        <div style={{ fontSize: '10px', fontWeight: '800', color: stat.badgeColor, background: stat.badgeBg || '#ecfdf5', padding: '2px 8px', borderRadius: '4px' }}>{stat.badge}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.card}>
                            <div className={styles.cardTitle}>{selectedDayEvents ? `Events for ${currentMonthName} ${selectedDayEvents[0]?.start_time?.split('T')[0]?.split('-')[2] || ''}` : 'Review Queue'}</div>
                            {selectedDayEvents && <div onClick={() => setSelectedDayEvents(null)} style={{ cursor: 'pointer', fontSize: '12px', color: '#3b82f6', marginBottom: '8px' }}>← Back to Queue</div>}
                            <div className={styles.filterButtonRow} style={{ display: 'flex', gap: '8px', marginTop: '16px', marginBottom: '16px' }}>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <input placeholder="Search..." style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '13px' }} />
                                </div>
                                <button className={styles.outlineBtn} style={{ height: '36px' }}>Filters</button>
                            </div>

                            <div className={styles.tableScrollWrapper}>
                                <table className={styles.activityTable}>
                                    <thead>
                                        <tr className={styles.activityHeader}>
                                            <th style={{ whiteSpace: 'nowrap' }}>PATIENT</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>SESSION ID</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>URGENCY</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>DATE/TIME</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>PROVIDER</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>STATUS</th>
                                            <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(selectedDayEvents || queueData).map((row, i) => (
                                            <tr key={i} className={styles.activityRow}>
                                                <td style={{ whiteSpace: 'nowrap' }}>
                                                    <div style={{ fontWeight: '800', color: '#1e293b' }}>{row.patient || row.metadata?.patient_name || row.title}</div>
                                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{row.mrn || row.metadata?.patient_mrn || "#MRN-1022"}</div>
                                                </td>
                                                <td style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', whiteSpace: 'nowrap' }}>{row.id?.substring(0, 8) || "#SESS-8842"}</td>
                                                <td style={{ whiteSpace: 'nowrap' }}>
                                                    <span style={{ fontSize: '10px', fontWeight: '800', color: row.urgencyColor || '#3b82f6', background: `${row.urgencyColor || '#3b82f6'}15`, padding: '2px 8px', borderRadius: '4px' }}>{row.urgency || 'Normal'}</span>
                                                </td>
                                                <td style={{ whiteSpace: 'nowrap' }}>
                                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>{row.time || (row.start_time ? new Date(row.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:41 AM')}</div>
                                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{row.date || 'Today'}</div>
                                                </td>
                                                <td style={{ whiteSpace: 'nowrap' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#64748b' }}>{(row.prov || row.metadata?.doctor_name || 'S')[0]}</div>
                                                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>{row.prov || row.metadata?.doctor_name || 'Dr. Sarah Wilson'}</span>
                                                    </div>
                                                </td>
                                                <td style={{ whiteSpace: 'nowrap' }}>
                                                    <span style={{ color: row.color || '#ef4444', background: `${row.color || '#ef4444'}15`, padding: '4px 12px', borderRadius: '20px', fontWeight: '700', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: row.color || '#ef4444' }} />
                                                        {row.status || row.metadata?.appointment_status || 'Needs Review'}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                    <button className={styles.outlineBtn} style={{ height: '32px', fontSize: '12px' }}>Review</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className={styles.rightColMain}>
                        <div className={styles.calendarCard} style={{ marginBottom: '24px' }}>
                            <div className={styles.calendarHeader}>
                                <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>{currentMonthName} {currentYear}</h3>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button onClick={() => changeMonth(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}>‹</button>
                                    <button onClick={() => changeMonth(1)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}>›</button>
                                </div>
                            </div>
                            <div className={styles.calendarGrid}>
                                {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(d => <div key={d} className={styles.dayLabel}>{d}</div>)}
                                {daysInMonth.map((day) => {
                                    const availability = getDayAvailability(day);
                                    const isToday = isTodayMonth && day === todayDate;
                                    return (
                                        <div
                                            key={day}
                                            onClick={() => handleDayClick(day)}
                                            className={`${styles.day} ${isToday ? styles.selectedDay : ''} ${availability !== 'none' ? styles.hasEvent : ''}`}
                                            style={{ cursor: 'pointer', position: 'relative' }}
                                        >
                                            {day}
                                            {availability !== 'none' && (
                                                <div style={{ width: '4px', height: '4px', background: '#3b82f6', borderRadius: '50%', position: 'absolute', bottom: '2px' }} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={styles.card} style={{ marginBottom: '24px' }}>
                            <div className={styles.cardTitle}>On-Duty Staff</div>
                            <div style={{ marginTop: '16px' }}>
                                {[
                                    { name: "Dr. Sarah Wilson", status: "Active", color: "#10b981" },
                                    { name: "Dr. Michael Chen", status: "Away", color: "#f59e0b" }
                                ].map((s, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i === 1 ? 'none' : '1px solid #f1f5f9' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '600' }}>{s.name}</div>
                                        <div style={{ fontSize: '10px', color: s.color, fontWeight: '800' }}>{s.status}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.card}>
                            <div className={styles.cardTitle}>Ward Capacity</div>
                            <div style={{ marginTop: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '700' }}>ICU Capacity</span>
                                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#ef4444' }}>92%</span>
                                </div>
                                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px' }}>
                                    <div style={{ width: '92%', height: '100%', background: '#ef4444', borderRadius: '3px' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
