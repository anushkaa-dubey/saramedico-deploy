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

    // Filters for Review Queue
    const [filters, setFilters] = useState({
        department: "All",
        provider: "All",
        urgency: "All"
    });

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [apptData, statData, queueData] = await Promise.all([
                    fetchHospitalAppointments(),
                    fetchHospitalStats(),
                    fetchReviewQueue()
                ]);
                setAppointments(apptData);
                setStatsData(prev => ({ ...prev, ...statData }));
                setReviewQueue(queueData);
            } catch (err) {
                console.error("Failed to load hospital dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const refreshMonthData = async () => {
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const data = await fetchCalendarMonth(year, month);
            setMonthData(data);
        } catch (err) {
            console.error("Failed to fetch calendar month data:", err);
        }
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
        try {
            const dateStr = `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const events = await fetchCalendarDay(dateStr);
            setSelectedDayEvents(events);
        } catch (err) {
            console.error("Failed to fetch calendar day data:", err);
        }
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
            label: "Total Doctors",
            value: "32",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <polyline points="17 11 19 13 23 9" />
                </svg>
            ),
            trend: "+2 this week",
            trendUp: true,
            color: "#3b82f6"
        },
        {
            label: "Notes Pending Signature",
            value: statsData.notesPendingSignature,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
            ),
            trend: "5 urgent",
            trendUp: false,
            color: "#8b5cf6"
        },
        {
            label: "Transcription Queue",
            value: statsData.transcriptionQueueStatus,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20v-6M9 20v-4M15 20v-8M18 20v-10M6 20v-2" />
                </svg>
            ),
            trend: "85% processed",
            trendUp: true,
            color: "#10b981"
        },
        {
            label: "Avg Completion Time",
            value: statsData.averageNoteCompletionTime,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            ),
            trend: "-12% improvement",
            trendUp: true,
            color: "#f59e0b"
        },
    ];

    const visitStates = {
        "Scheduled": "#64748b",
        "Checked-In": "#3b82f6",
        "Recording": "#ef4444",
        "Processing": "#8b5cf6",
        "Draft Ready": "#10b981",
        "Needs Review": "#f59e0b",
        "Signed": "#059669",
        "Locked": "#1e293b"
    };

    const timeline = [
        { doc: "Dr. Sarah Wilson", patient: "John Von", specialty: "Cardiology", time: "09:30 AM", status: "Recording", id: "CONF-001" },
        { doc: "Dr. Michael Chen", patient: "Alice Bob", specialty: "Neurology", time: "11:00 AM", status: "Draft Ready", id: "CONF-002" },
        { doc: "Dr. Elena Rodriguez", patient: "Jane Roe", specialty: "Pediatrics", time: "01:30 PM", status: "Scheduled", id: "CONF-003" },
        { doc: "Dr. James Bond", patient: "Daniel Benjamin", specialty: "General", time: "03:00 PM", status: "Needs Review", id: "CONF-004" },
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
            className={styles.container}
            style={{ flexDirection: 'column', background: 'transparent', padding: 0 }}
        >
            <Topbar title="Hospital Overview" />

            <div className={styles.dashboardGrid}>
                {/* Main Content Area */}
                <div className={styles.leftColMain}>
                    {/* System Status Enhancement */}
                    <motion.div variants={itemVariants} className={styles.alertBoxMain}>
                        <div className={styles.alertPrimaryIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                        </div>
                        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                            <div>
                                <strong style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Processing Latency</strong>
                                <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>1.4s</div>
                            </div>
                            <div>
                                <strong style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Failure Rate</strong>
                                <div style={{ fontSize: '18px', fontWeight: '800', color: '#ef4444' }}>0.02%</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Overview */}
                    <div className={styles.overviewSection}>
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                whileHover={{ scale: 1.02 }}
                                className={styles.statCard}
                            >
                                <div>
                                    <div className={styles.statIconWrapper} style={{ background: `${stat.color}15` }}>
                                        <span style={{ fontSize: '20px', color: stat.color }}>{stat.icon}</span>
                                    </div>
                                    <h3 className={styles.statLabel}>{stat.label}</h3>
                                    <div className={styles.statValue}>{stat.value}</div>
                                </div>
                                <div className={`${styles.statTrend} ${stat.trendUp ? styles.trendUp : styles.trendDown}`}>
                                    {stat.trendUp ? "↑" : "↓"} {stat.trend}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Today's Sessions Timeline */}
                    <motion.div variants={itemVariants} className={styles.card} style={{ border: 'none', background: 'transparent', padding: 0, marginBottom: '32px' }}>
                        <div className={styles.timelineTitle}>
                            <span>{selectedDayEvents ? "Selected Day Sessions" : "Today's Sessions"}</span>
                            <Link href="/dashboard/hospital/appointments" style={{ textDecoration: 'none' }}>
                                <button className={styles.outlineBtn} style={{ fontSize: '12px', height: '34px', color: '#359aff' }}>View Full Schedule</button>
                            </Link>
                        </div>

                        <div className={styles.appointmentTimeline}>
                            {(selectedDayEvents ? formatEventsForTimeline(selectedDayEvents) : timeline).map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    className={styles.timelineItem}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <div className={styles.timelineMarker} style={{ background: visitStates[item.status] || '#64748b' }} />
                                    <div className={styles.appointmentCard}>
                                        <div className={styles.docAvatar} style={{ background: '#359aff20' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#359aff" strokeWidth="2.5">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </div>
                                        <div className={styles.appointmentInfo}>
                                            <div className={styles.docNameMain}>
                                                {item.doc}
                                                <span style={{ color: '#64748b', fontWeight: '400', margin: '0 6px', fontSize: '13px' }}>is meeting with</span>
                                                <span style={{ color: '#359aff' }}>{item.patient}</span>
                                            </div>
                                            <div className={styles.patientMetaMain}>{item.specialty} • {item.type || 'Session'} #{item.id}</div>
                                        </div>
                                        <div className={styles.appointmentTimeMain}>
                                            <div className={styles.timeTextMain}>{item.time}</div>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '6px' }}>
                                                <span className={styles.statusTagMain} style={{ background: `${visitStates[item.status] || '#64748b'}15`, color: visitStates[item.status] || '#64748b' }}>
                                                    {item.status}
                                                </span>
                                                {item.zoomLink && (
                                                    <button
                                                        className={styles.outlineBtn}
                                                        style={{ height: '24px', fontSize: '10px', padding: '0 8px', background: '#359aff', color: 'white' }}
                                                        onClick={() => window.open(item.zoomLink, '_blank')}
                                                    >
                                                        Join Zoom
                                                    </button>
                                                )}
                                                {item.canEdit && (
                                                    <button
                                                        className={styles.outlineBtn}
                                                        style={{ height: '24px', fontSize: '10px', padding: '0 8px', borderColor: '#ef4444', color: '#ef4444' }}
                                                        onClick={() => handleDeleteEvent(item.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {(selectedDayEvents && selectedDayEvents.length === 0) && (
                                <div style={{ padding: '20px', color: '#64748b', textAlign: 'center' }}>No events scheduled for this day.</div>
                            )}
                        </div>
                    </motion.div>

                    {/* Structured Review Queue */}
                    <motion.div variants={itemVariants} className={styles.card}>
                        <div className={styles.cardTitle}>
                            <span>Structured Review Queue</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <select
                                    className={styles.outlineBtn}
                                    style={{ padding: '0 8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
                                    value={filters.department}
                                    onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                                >
                                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <select
                                    className={styles.outlineBtn}
                                    style={{ padding: '0 8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
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

                        <div className={styles.activityTableContainer} style={{ marginTop: '16px' }}>
                            <table className={styles.activityTable}>
                                <thead>
                                    <tr className={styles.activityHeader}>
                                        <th>PATIENT</th>
                                        <th>PROVIDER</th>
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
                                                <td>
                                                    <span style={{
                                                        color: item.urgency === 'High' ? '#ef4444' : item.urgency === 'Medium' ? '#f59e0b' : '#64748b',
                                                        fontWeight: '700',
                                                        fontSize: '11px'
                                                    }}>
                                                        {item.urgency.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>{item.status}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button className={styles.outlineBtn} style={{ height: '30px', fontSize: '12px', marginLeft: 'auto' }}>Open</button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>

                {/* Right Sidebar Widgets */}
                <div className={styles.rightColMain}>
                    {/* Calendar Widget */}
                    <motion.div variants={itemVariants} className={styles.calendarCard}>
                        <div className={styles.calendarHeader}>
                            <h3 className={styles.calendarTitle}>{currentMonthName} {currentYear}</h3>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => changeMonth(-1)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', fontSize: '18px' }}>‹</button>
                                <button onClick={() => changeMonth(1)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', fontSize: '18px' }}>›</button>
                            </div>
                        </div>
                        <div className={styles.calendarGrid}>
                            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                                <div key={day} className={styles.dayLabel}>{day}</div>
                            ))}
                            {daysInMonth.map(day => {
                                const availability = getDayAvailability(day);
                                return (
                                    <div
                                        key={day}
                                        className={`${styles.day} ${isTodayMonth && day === todayDate ? styles.todayDay : ''}`}
                                        style={{ position: 'relative', cursor: 'pointer' }}
                                        onClick={() => handleDayClick(day)}
                                    >
                                        {day}
                                        {availability !== "none" && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '4px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                width: '12px',
                                                height: '3px',
                                                borderRadius: '2px',
                                                background: availability === 'red' ? '#ef4444' : '#10b981'
                                            }} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', fontSize: '11px', fontWeight: '600' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#ef4444' }} />
                                <span>Fully Booked</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#10b981' }} />
                                <span>Available</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Staff On Duty Widget */}
                    <motion.div variants={itemVariants} className={styles.card} style={{ marginBottom: '24px' }}>
                        <div className={styles.cardTitle} style={{ fontSize: '15px', marginBottom: '16px' }}>
                            <span>On-Duty Staff</span>
                            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>12 ONLINE</span>
                        </div>
                        <div className={styles.staffList}>
                            {[
                                { name: "Dr. Sarah Wilson", role: "Head of Cardiology", sessions: 4, documents: 2 },
                                { name: "Dr. Michael Chen", role: "Neurosurgeon", sessions: 2, documents: 5 },
                                { name: "Nurse Jessica", role: "ER Supervisor", sessions: 0, documents: 0 }
                            ].map((staff, i) => (
                                <div key={i} className={styles.staffItem}>
                                    <div className={styles.onlineDot} />
                                    <div className={staff.name === "Nurse Jessica" ? "" : styles.onlineDot} style={{ display: staff.name === "Nurse Jessica" ? "none" : "block" }} />
                                    <div className={styles.staffInfo}>
                                        <div className={styles.staffName}>{staff.name}</div>
                                        <div className={styles.staffRole}>{staff.role}</div>
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '10px', color: '#64748b' }}>
                                            <span>{staff.sessions} Sessions</span>
                                            <span>•</span>
                                            <span>{staff.documents} Pending Docs</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Ward Capacity Widget */}
                    <motion.div variants={itemVariants} className={styles.card}>
                        <div className={styles.cardTitle} style={{ fontSize: '15px', marginBottom: '16px' }}>
                            <span>Ward Capacity</span>
                        </div>
                        {[
                            { ward: "ICU", used: 85, color: "#ef4444", docLoad: "High" },
                            { ward: "General Ward", used: 62, color: "#3b82f6", docLoad: "Med" },
                            { ward: "Pediatrics", used: 40, color: "#10b981", docLoad: "Low" }
                        ].map((ward, i) => (
                            <div key={i} className={styles.capacityWidget}>
                                <div className={styles.capacityLabel}>
                                    <div>
                                        <span>{ward.ward}</span>
                                        <span style={{ marginLeft: '8px', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: '#f1f5f9', color: '#64748b' }}>
                                            Docs: {ward.docLoad}
                                        </span>
                                    </div>
                                    <span>{ward.used}%</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <motion.div
                                        className={styles.progressFill}
                                        style={{ background: ward.color }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${ward.used}%` }}
                                        transition={{ duration: 1.5, delay: 0.5 }}
                                    />
                                </div>
                                {ward.used > 80 && (
                                    <div style={{ fontSize: '10px', color: '#ef4444', fontWeight: '700', marginTop: '4px' }}>
                                        ⚠️ High Ward Pressure
                                    </div>
                                )}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

// Helper to format events for timeline
const formatEventsForTimeline = (events) => {
    if (!events) return null;
    return events.map(event => {
        const localTime = new Date(event.start_time || event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let status = "Scheduled";
        let zoomLink = null;

        if (event.event_type === "appointment") {
            status = event.metadata?.appointment_status || "Scheduled";
            zoomLink = event.metadata?.zoom_link;
        } else if (event.event_type === "task") {
            status = `Task (${event.metadata?.priority || "Normal"})`;
        }

        return {
            doc: event.metadata?.doctor_name || "Doctor",
            patient: event.metadata?.patient_name || event.title || "Patient",
            specialty: event.event_type === "appointment" ? (event.metadata?.department || "General") : "Task",
            time: localTime,
            status: status,
            id: event.id,
            zoomLink: zoomLink,
            type: event.event_type,
            canEdit: event.event_type === "custom"
        };
    });
};
