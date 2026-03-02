"use client";
import Topbar from "./components/Topbar";
import styles from "./HospitalDashboard.module.css";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { fetchHospitalAppointments, fetchHospitalStats, fetchReviewQueue } from "@/services/hospital";
import { fetchCalendarMonth, fetchCalendarDay, deleteCalendarEvent } from "@/services/calendar";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function HospitalDashboard() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState([]);
    const [statsData, setStatsData] = useState({
        notesPendingSignature: 14,
        transcriptionQueueStatus: 8,
        averageNoteCompletionTime: "4.2 hrs"
    });
    const [reviewQueue, setReviewQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [monthData, setMonthData] = useState({});
    const [selectedDayEvents, setSelectedDayEvents] = useState(null);
    const [isAvailable, setIsAvailable] = useState(true);

    // Filters for Review Queue
    const [filters, setFilters] = useState({
        department: "All",
        provider: "All",
        urgency: "All"
    });

    // useEffect(() => {
    //     const loadData = async () => {
    //         setLoading(true);
    //         try {
    //             const [apptData, statData, queueData] = await Promise.all([
    //                 fetchHospitalAppointments(),
    //                 fetchHospitalStats(),
    //                 fetchReviewQueue()
    //             ]);
    //             setAppointments(apptData);
    //             setStatsData(prev => ({ ...prev, ...statData }));
    //             setReviewQueue(queueData);
    //         } catch (err) {
    //             console.error("Failed to load hospital dashboard data:", err);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     loadData();
    // }, []);

    // Set loading to false since we aren't fetching
    useEffect(() => {
        setLoading(false);
        // Mock some data for the review queue since API is commented out
        setReviewQueue([
            { id: 1, patient: "John Von", provider: "Dr. Sarah Wilson", urgency: "High", status: "Needs Review", department: "Cardiology" },
            { id: 2, patient: "Alice Bob", provider: "Dr. Michael Chen", urgency: "Medium", status: "Processing", department: "Neurology" },
            { id: 3, patient: "Jane Roe", provider: "Dr. Elena Rodriguez", urgency: "Low", status: "Draft Ready", department: "General" }
        ]);
    }, []);

    const refreshMonthData = async () => {
        // try {
        //     const year = currentDate.getFullYear();
        //     const month = currentDate.getMonth() + 1;
        //     const data = await fetchCalendarMonth(year, month);
        //     setMonthData(data);
        // } catch (err) {
        //     console.error("Failed to fetch calendar month data:", err);
        // }
    };

    useEffect(() => {
        refreshMonthData();
    }, [currentDate]);

    const handleDeleteEvent = async (eventId) => {
        if (!confirm("Are you sure you want to delete this custom event?")) return;
        try {
            await deleteCalendarEvent(eventId);
            // Refresh counts and current day view
            refreshMonthData();
            if (selectedDayEvents) {
                const updatedEvents = selectedDayEvents.filter(e => e.id !== eventId);
                setSelectedDayEvents(updatedEvents);
            }
        } catch (err) {
            console.error("Failed to delete event:", err);
            alert("Failed to delete event");
        }
    };

    const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    const daysInMonthCount = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
    const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
    const todayDate = new Date().getDate();
    const isTodayMonth = currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const handleDayClick = async (day) => {
        // try {
        //     const dateStr = `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        //     const events = await fetchCalendarDay(dateStr);
        //     setSelectedDayEvents(events);
        // } catch (err) {
        //     console.error("Failed to fetch calendar day data:", err);
        // }
    };

    // Availability logic based on real data
    const getDayAvailability = (day) => {
        const data = monthData[day];
        if (!data) return "none";

        const count = typeof data === 'number' ? data : (data.count || 0);
        if (count >= 10) return "red"; // Fully booked
        if (count > 0) return "green"; // Some availability
        return "none";
    };

    const stats = [
        {
            label: "PENDING NOTES",
            value: "7",
            badge: "+3 Urgent",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>,
            color: "#3b82f6",
            bgColor: "#eff6ff",
            lineColor: "#3b82f6"
        },
        {
            label: "AVG COMPLETION",
            value: "4m 12s",
            badge: "-18s",
            badgeColor: "#10b981",
            badgeBg: "#f0fdf4",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
            color: "#f59e0b",
            bgColor: "#fffbeb",
            lineColor: "#fde68a"
        },
        {
            label: "PATIENTS TODAY",
            value: "12",
            subValue: "/ 16 Scheduled",
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>,
            color: "#10b981",
            bgColor: "#f0fdf4",
            lineColor: "#10b981"
        },
        {
            label: "UNSIGNED ORDERS",
            value: "3",
            tags: ["Lab Review", "Radiology"],
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>,
            color: "#64748b",
            bgColor: "#f8fafc",
            lineColor: "#e2e8f0"
        }
    ];

    const encounters = [
        { name: "John Doe", meta: "M • 45yo", complaint: "Acute Chest Pain", complaintDetail: "Patient reports tightness...", dos: "Today, 09:00 AM", status: "DRAFT READY", color: "#3b82f6", action: "Review Now" },
        { name: "Robert Brown", meta: "M • 62yo", complaint: "Palpitations", complaintDetail: "Intermittent flutter...", dos: "Yesterday, 4:30 PM", status: "NEEDS REVIEW", color: "#f59e0b", action: "Edit" },
        { name: "Jane Smith", meta: "F • 34yo", complaint: "Hypertension", complaintDetail: "Current consult...", dos: "Today, 10:30 AM", status: "RECORDING", color: "#64748b", action: "In Visit" },
        { name: "Alice Li", meta: "F • 28yo", complaint: "Annual Physical", complaintDetail: "Routine checkup...", dos: "Yesterday, 2:00 PM", status: "SIGNED", color: "#10b981", action: "View" },
        { name: "Tom Wilson", meta: "M • 55yo", complaint: "Post-Op Followup", complaintDetail: "Surgical site...", dos: "Yesterday, 11:00 AM", status: "SIGNED", color: "#10b981", action: "View" }
    ];

    const filteredQueue = useMemo(() => {
        return reviewQueue.filter(item => {
            return (filters.department === "All" || item.department === filters.department) &&
                (filters.provider === "All" || item.provider === filters.provider) &&
                (filters.urgency === "All" || item.urgency === filters.urgency);
        });
    }, [reviewQueue, filters]);

    const departments = ["All", ...new Set(reviewQueue.map(i => i.department))];
    const providers = ["All", ...new Set(reviewQueue.map(i => i.provider))];

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            style={{ display: 'flex', flexDirection: 'column', background: 'transparent', padding: 0, minHeight: '100%' }}
        >
            <Topbar title="Clinical Dashboard" />

            <div className={styles.contentWrapper}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Clinical Dashboard</h1>
                        <p style={{ color: '#64748b', fontSize: '13px', margin: '2px 0 0 0' }}>Good morning, Dr. Mitchell. You have <span style={{ color: '#3b82f6', fontWeight: '700' }}>4 priority drafts</span> pending review.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', alignItems: 'center', gap: '4px' }}>
                            <button
                                onClick={() => setIsAvailable(true)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: isAvailable ? '#10b981' : 'transparent',
                                    color: isAvailable ? 'white' : '#64748b',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ width: '6px', height: '6px', background: isAvailable ? 'white' : '#10b981', borderRadius: '50%' }} />
                                Available
                            </button>
                            <button
                                onClick={() => setIsAvailable(false)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: !isAvailable ? '#f59e0b' : 'transparent',
                                    color: !isAvailable ? 'white' : '#64748b',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Busy
                            </button>
                        </div>
                        <button className={styles.primaryBtn} style={{ height: '36px', fontSize: '13px', padding: '0 20px', borderRadius: '10px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px' }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Start New Visit
                        </button>
                    </div>
                </div>

                <div className={styles.dashboardGrid}>
                    {/* Main Content Area */}
                    <div className={styles.leftColMain}>
                        <div className={styles.overviewSection} style={{ marginBottom: '32px' }}>
                            {stats.map((s, i) => (
                                <div key={`${s.label}-${i}`} className={styles.statCard} style={{ padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', background: '#ffffff', minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ fontSize: 'var(--font-label)', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '8px' }}>{s.label}</div>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                                <div style={{ fontSize: 'var(--font-stat)', fontWeight: '800', color: '#1e293b' }}>{s.value}</div>
                                                {s.subValue && <div style={{ fontSize: 'var(--font-xs)', color: '#94a3b8', fontWeight: '500' }}>{s.subValue}</div>}
                                                {s.badge && <div style={{ fontSize: '10px', color: s.badgeColor || '#ef4444', background: s.badgeBg || '#fee2e2', padding: '2px 8px', borderRadius: '4px', fontWeight: '800', marginLeft: '8px' }}>{s.badge}</div>}
                                            </div>
                                        </div>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: s.bgColor, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                                    </div>
                                    {s.tags ? (
                                        <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
                                            {s.tags.map((tag, idx) => (
                                                <span key={`${tag}-${idx}`} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#64748b', fontWeight: '700' }}>{tag}</span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ width: '100%', height: '4px', background: '#f1f5f9', borderRadius: '2px', marginTop: '16px', position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '40%', background: s.lineColor, borderRadius: '2px' }} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className={styles.card} style={{ border: 'none', background: '#ffffff', padding: '24px 0', borderRadius: '16px', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '0 24px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 }}>My Sessions & Documentation</h2>
                                <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', gap: '4px' }}>
                                    {['All Active', 'Drafts Ready', 'Pending Review', 'Signed'].map((tab, i) => (
                                        <button key={`${tab}-${i}`} style={{
                                            padding: '6px 16px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: i === 0 ? 'white' : 'transparent',
                                            color: i === 0 ? '#1e293b' : '#64748b',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            boxShadow: i === 0 ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                            cursor: 'pointer'
                                        }}>{tab.toUpperCase()}</button>
                                    ))}
                                </div>
                            </div>

                            <table className={styles.activityTable} style={{ fontSize: 'var(--font-body)', borderCollapse: 'collapse', borderSpacing: 0 }}>
                                <thead style={{ background: '#f9fafb', borderBottom: '1px solid #f1f5f9' }}>
                                    <tr className={styles.activityHeader}>
                                        <th style={{ color: '#94a3b8', padding: '16px 24px', fontSize: '10px', fontWeight: '800', letterSpacing: '0.05em' }}>PATIENT</th>
                                        <th style={{ color: '#94a3b8', padding: '16px', fontSize: '10px', fontWeight: '800', letterSpacing: '0.05em' }}>CHIEF COMPLAINT</th>
                                        <th style={{ color: '#94a3b8', padding: '16px', fontSize: '10px', fontWeight: '800', letterSpacing: '0.05em' }}>DOS</th>
                                        <th style={{ color: '#94a3b8', padding: '16px', fontSize: '10px', fontWeight: '800', letterSpacing: '0.05em' }}>AI STATUS</th>
                                        <th style={{ color: '#94a3b8', padding: '16px 24px', textAlign: 'right', fontSize: '10px', fontWeight: '800', letterSpacing: '0.05em' }}>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {encounters.map((row, i) => (
                                        <tr key={`${row.name}-${i}`} style={{ borderBottom: i === encounters.length - 1 ? 'none' : '1px solid #f8fafc' }}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#64748b', fontSize: '11px' }}>{row.name.split(' ').map(n => n[0]).join('')}</div>
                                                    <div>
                                                        <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '14px' }}>{row.name}</div>
                                                        <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>{row.meta}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '14px' }}>{row.complaint}</div>
                                                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>{row.complaintDetail}</div>
                                            </td>
                                            <td style={{ padding: '16px', color: '#64748b', fontWeight: '600', fontSize: '13px' }}>{row.dos}</td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{
                                                    fontSize: '10px',
                                                    fontWeight: '800',
                                                    color: row.status === 'NEEDS REVIEW' ? '#f59e0b' : row.status === 'RECORDING' ? '#359aff' : row.color,
                                                    background: row.status === 'NEEDS REVIEW' ? '#fffbeb' : row.status === 'RECORDING' ? '#eff6ff' : `${row.color}10`,
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    border: row.status === 'NEEDS REVIEW' ? '1px solid #fef3c7' : row.status === 'RECORDING' ? '1px solid #dbeafe' : 'none'
                                                }}>
                                                    {row.status === 'DRAFT READY' && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#3b82f6' }} />}
                                                    {row.status === 'RECORDING' && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>}
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                {row.action === 'Review Now' ? (
                                                    <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>Review Now</button>
                                                ) : row.action === 'Edit' ? (
                                                    <button style={{ background: 'white', border: '1px solid #e2e8f0', color: '#1e293b', padding: '6px 16px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>Edit</button>
                                                ) : row.status === 'RECORDING' ? (
                                                    <button style={{ background: '#f8fafc', border: '1px solid #f1f5f9', color: '#94a3b8', padding: '6px 16px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'default' }}>In Visit</button>
                                                ) : (
                                                    <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', padding: '8px', cursor: 'pointer' }}>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div style={{ marginTop: '24px', textAlign: 'right', padding: '0 24px' }}>
                                <button style={{ background: 'transparent', border: 'none', color: '#359aff', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>View All Sessions</button>
                            </div>
                        </div>

                        {/* Today's Schedule Section at bottom */}
                        <div className={styles.card} style={{ border: 'none', background: '#ffffff', padding: '24px', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>Today's Schedule</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#64748b', fontWeight: '700' }}>
                                    <span style={{ cursor: 'pointer', padding: '4px' }}>‹</span>
                                    <span>Oct 24, 2026</span>
                                    <span style={{ cursor: 'pointer', padding: '4px' }}>›</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
                                {[
                                    { time: "09:00 AM", patient: "John Doe", status: "Completed", type: "Follow-up", completed: true },
                                    { time: "10:30 AM", patient: "Jane Smith", status: "In Visit", tags: ["HTN", "Chest Pain"], badge: "NEW CONSULT", active: true },
                                    { time: "11:45 AM", patient: "Robert Brown", status: "Upcoming", type: "Consultation" },
                                    { time: "02:00 PM", patient: "Alice Li", status: "Upcoming", type: "Routine Check" }
                                ].map((item, i) => (
                                    <div key={`${item.patient}-${i}`} style={{ display: 'flex', borderBottom: i === 3 ? 'none' : '1px solid #f1f5f9', position: 'relative' }}>
                                        {item.active && <div style={{ position: 'absolute', left: '0', top: '0', bottom: '0', width: '4px', background: '#3b82f6' }} />}
                                        <div style={{ width: '80px', padding: '20px 16px', flexShrink: 0, textAlign: 'center', borderRight: '1px solid #f1f5f9' }}>
                                            <div style={{ fontSize: 'var(--font-body)', fontWeight: '800', color: item.active ? '#3b82f6' : '#1e293b' }}>{item.time.split(' ')[0]}</div>
                                            <div style={{ fontSize: 'var(--font-xs)', fontWeight: '700', color: '#94a3b8', marginTop: '2px' }}>{item.time.split(' ')[1]}</div>
                                        </div>
                                        <div style={{ flex: 1, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{
                                                    fontSize: 'var(--font-lg)',
                                                    fontWeight: '700',
                                                    color: item.completed ? '#cbd5e1' : '#1e293b',
                                                    textDecoration: item.completed ? 'line-through' : 'none'
                                                }}>
                                                    {item.patient}
                                                </div>
                                                <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {item.completed ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-sm)', color: '#94a3b8', fontWeight: '500' }}>
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                                            Completed
                                                        </div>
                                                    ) : item.tags ? (
                                                        <div style={{ display: 'flex', gap: '6px' }}>
                                                            {item.tags.map((tag, idx) => (
                                                                <span key={`${tag}-${idx}`} style={{ fontSize: 'var(--font-xs)', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>{tag}</span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span style={{ fontSize: 'var(--font-xs)', color: '#64748b', fontWeight: '500' }}>{item.status}</span>
                                                    )}
                                                </div>
                                            </div>
                                            {item.badge ? (
                                                <div style={{ fontSize: 'var(--font-xs)', fontWeight: '800', color: '#3b82f6', background: '#eff6ff', padding: '4px 12px', borderRadius: '6px', border: '1px solid #dbeafe', textTransform: 'uppercase' }}>
                                                    {item.badge}
                                                </div>
                                            ) : item.type ? (
                                                <div style={{ fontSize: 'var(--font-xs)', background: '#f8fafc', color: item.completed ? '#cbd5e1' : '#94a3b8', padding: '6px 12px', borderRadius: '8px', fontWeight: '700' }}>{item.type}</div>
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side Column */}
                    <div className={styles.rightColMain}>
                        <div className={styles.calendarCard}>
                            <div className={styles.calendarHeader} style={{ marginBottom: '12px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '800' }}>{currentMonthName} {currentYear}</h3>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button onClick={() => changeMonth(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>‹</button>
                                    <button onClick={() => changeMonth(1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>›</button>
                                </div>
                            </div>
                            <div className={styles.calendarGrid}>
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={`${d}-${i}`} className={styles.dayLabel}>{d}</div>)}
                                {daysInMonth.map(day => (
                                    <div
                                        key={day}
                                        className={`${styles.day} ${isTodayMonth && day === todayDate ? styles.todayDay : ''}`}
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.card} style={{ padding: '12px' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '12px' }}>On-Duty Staff</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {[
                                    { name: "Dr. Sarah Wilson", role: "Cardiology", status: "On-site" },
                                    { name: "Dr. Michael Chen", role: "Neurology", status: "Remote" }
                                ].map((staff, i) => (
                                    <div key={`${staff.name}-${i}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '12px', fontWeight: '700' }}>{staff.name}</div>
                                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>{staff.role}</div>
                                        </div>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: staff.status === 'On-site' ? '#10b981' : '#359aff' }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Helper formatting removed as no longer used in this view

