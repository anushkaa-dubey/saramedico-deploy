"use client";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion } from "framer-motion";

const appointments = [
    { id: 1, patient: "John Doe", doctor: "Dr. Sarah Smith", date: "Oct 24, 2025", time: "10:00 AM", type: "Check-up", status: "Confirmed" },
    { id: 2, patient: "Jane Roe", doctor: "Dr. Michael Brown", date: "Oct 24, 2025", time: "11:30 AM", type: "Consultation", status: "Pending" },
    { id: 3, patient: "Alice Bob", doctor: "Dr. Emily Chen", date: "Oct 25, 2025", time: "09:15 AM", type: "Vaccination", status: "Confirmed" },
];

import { fetchCalendarMonth, fetchCalendarDay } from "@/services/calendar";
import { useState, useEffect } from "react";

export default function AppointmentsPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [monthData, setMonthData] = useState({});
    const [selectedDayEvents, setSelectedDayEvents] = useState(null);
    const [allEvents, setAllEvents] = useState([]);
    const [eventType, setEventType] = useState("");
    const [loading, setLoading] = useState(false);

    const today = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;

                // Fetch month counts for calendar
                const counts = await fetchCalendarMonth(year, month);
                setMonthData(counts);

                // Fetch all events for the month for the list view
                // Calculate start and end of month
                const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
                const lastDay = new Date(year, month, 0).getDate();
                const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

                const params = { start_date: startDate, end_date: endDate };
                if (eventType) params.event_type = eventType;

                const events = await fetchCalendarEvents(params);
                setAllEvents(events);
            } catch (err) {
                console.error("Failed to fetch initial calendar data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [currentDate, eventType]);

    const handleDayClick = async (day, isCurrentMonth) => {
        if (!isCurrentMonth) return;
        setLoading(true);
        try {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            // For day click, we usually want all events regardless of global filter,
            // but if we want to respect the filter:
            const params = { start_date: dateStr, end_date: dateStr };
            if (eventType) params.event_type = eventType;
            const events = await fetchCalendarEvents(params);
            setSelectedDayEvents(events);
        } catch (err) {
            console.error("Failed to fetch calendar day data:", err);
        } finally {
            setLoading(false);
        }
    };

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    // Calculate calendar grid
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];
    // Padding from previous month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        days.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
    }
    // Days of current month
    for (let i = 1; i <= daysInCurrentMonth; i++) {
        days.push({ day: i, isCurrentMonth: true });
    }
    // Padding for next month to complete the grid (usually 35 or 42 cells)
    const remainingCells = 42 - days.length; // Using 42 for a standard 6-row grid
    for (let i = 1; i <= remainingCells; i++) {
        days.push({ day: i, isCurrentMonth: false });
    }

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const appointmentsListMock = [
        { id: 1, patient: "John Doe", doctor: "Dr. Sarah Wilson", time: "10:00 AM", type: "Check-up", status: "Confirmed" },
        { id: 2, patient: "Jane Roe", doctor: "Dr. Michael Chen", time: "11:30 AM", type: "Consultation", status: "Pending" },
        { id: 3, patient: "Daniel Benjamin", doctor: "Dr. Elena Rodriguez", time: "01:30 PM", type: "Surgery Follow-up", status: "Confirmed" },
    ];

    const formatEventsForList = () => {
        const eventsToShow = selectedDayEvents || allEvents;
        if (!eventsToShow || eventsToShow.length === 0) return [];
        return eventsToShow.map(event => ({
            id: event.id,
            patient: event.metadata?.patient_name || event.title || "Subject",
            doctor: event.metadata?.doctor_name || "Doctor",
            time: new Date(event.start_time || event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1),
            status: event.event_type === "appointment" ? (event.metadata?.appointment_status || "Confirmed") : "Active",
            zoomLink: event.metadata?.zoom_link
        }));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.container}
            style={{ flexDirection: 'column', background: 'transparent', padding: 0 }}
        >
            <Topbar title="Hospital Appointments" />

            <div style={{ padding: '24px' }}>
                {/* Big Calendar Header */}
                <div className={styles.bigCalendarContainer}>
                    <div className={styles.calendarToolbar}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{monthName} {currentYear}</h2>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className={styles.outlineBtn} style={{ padding: '0 12px' }} onClick={() => setCurrentDate(new Date())}>Today</button>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button className={styles.iconBtn} style={{ borderRadius: '50%' }} onClick={() => changeMonth(-1)}>‹</button>
                                    <button className={styles.iconBtn} style={{ borderRadius: '50%' }} onClick={() => changeMonth(1)}>›</button>
                                </div>
                            </div>
                        </div>
                        <button className={styles.primaryBtn}>+ New Appointment</button>
                    </div>

                    <div className={styles.calendarGridBig}>
                        {weekDays.map(day => (
                            <div key={day} className={styles.calendarHeaderBig}>{day}</div>
                        ))}
                        {days.map((item, idx) => {
                            const isToday = item.day === today.getDate() && item.isCurrentMonth && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
                            const dayCountData = monthData[item.day];
                            const dayCount = item.isCurrentMonth && dayCountData ? (typeof dayCountData === 'number' ? dayCountData : (dayCountData.count || 0)) : 0;

                            return (
                                <div key={idx}
                                    className={`${styles.calendarCell} ${!item.isCurrentMonth ? styles.notInMonth : ''} ${isToday ? styles.todayCell : ''}`}
                                    onClick={() => handleDayClick(item.day, item.isCurrentMonth)}
                                    style={{ cursor: item.isCurrentMonth ? 'pointer' : 'default' }}
                                >
                                    <div className={styles.dateLabel}>{item.day}</div>
                                    {item.isCurrentMonth && dayCount > 0 && (
                                        <div className={styles.aptIndicator} style={{ background: dayCount >= 10 ? '#fee2e2' : '#f0fdf4', color: dayCount >= 10 ? '#ef4444' : '#15803d' }}>
                                            {dayCount} Appts
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Appointments List Below */}
                <div className={styles.card} style={{ marginTop: '32px' }}>
                    <div className={styles.cardTitle}>
                        <span style={{ fontSize: '18px', fontWeight: '700' }}>
                            {selectedDayEvents ? "Appointment List - Selected Day" : "Appointment List - Today"}
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {selectedDayEvents && <button className={styles.outlineBtn} onClick={() => setSelectedDayEvents(null)}>Reset</button>}
                            <select
                                className={styles.outlineBtn}
                                value={eventType}
                                onChange={(e) => setEventType(e.target.value)}
                                style={{ padding: '0 8px', height: '34px' }}
                            >
                                <option value="">All Types</option>
                                <option value="appointment">Appointments</option>
                                <option value="task">Tasks</option>
                                <option value="custom">Custom</option>
                            </select>
                            <button className={styles.outlineBtn}>Filter</button>
                            <button className={styles.outlineBtn}>Export CSV</button>
                        </div>
                    </div>

                    <div className={styles.activityTableContainer} style={{ marginTop: '20px' }}>
                        <table className={styles.activityTable}>
                            <thead>
                                <tr className={styles.activityHeader}>
                                    <th>PATIENT</th>
                                    <th>DOCTOR</th>
                                    <th>TIME</th>
                                    <th>TYPE</th>
                                    <th style={{ textAlign: 'right' }}>STATUS / ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formatEventsForList().map(apt => (
                                    <tr key={apt.id} className={styles.activityRow}>
                                        <td style={{ fontWeight: '700' }}>{apt.patient}</td>
                                        <td style={{ color: '#64748b' }}>{apt.doctor}</td>
                                        <td style={{ color: '#0f172a', fontWeight: '600' }}>{apt.time}</td>
                                        <td style={{ color: '#359aff', fontWeight: '600' }}>{apt.type}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                <span className={apt.status === 'Confirmed' ? styles.statusCompleted : styles.statusReview}>
                                                    {apt.status}
                                                </span>
                                                {apt.zoomLink && (
                                                    <button
                                                        className={styles.primaryBtn}
                                                        style={{ padding: '4px 12px', fontSize: '11px', height: 'auto' }}
                                                        onClick={() => window.open(apt.zoomLink, '_blank')}
                                                    >
                                                        Join
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {formatEventsForList().length === 0 && (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No appointments found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

