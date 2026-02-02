"use client";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion } from "framer-motion";

const appointments = [
    { id: 1, patient: "John Doe", doctor: "Dr. Sarah Smith", date: "Oct 24, 2025", time: "10:00 AM", type: "Check-up", status: "Confirmed" },
    { id: 2, patient: "Jane Roe", doctor: "Dr. Michael Brown", date: "Oct 24, 2025", time: "11:30 AM", type: "Consultation", status: "Pending" },
    { id: 3, patient: "Alice Bob", doctor: "Dr. Emily Chen", date: "Oct 25, 2025", time: "09:15 AM", type: "Vaccination", status: "Confirmed" },
];

export default function AppointmentsPage() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const monthName = today.toLocaleString('default', { month: 'long' });

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
    const remainingCells = 35 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
        days.push({ day: i, isCurrentMonth: false });
    }

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const calendarAppointments = {
        2: 5, 8: 3, 12: 8, 15: 4, 18: 6, 22: 12, 25: 7
    };

    const appointmentsList = [
        { id: 1, patient: "John Doe", doctor: "Dr. Sarah Wilson", time: "10:00 AM", type: "Check-up", status: "Confirmed" },
        { id: 2, patient: "Jane Roe", doctor: "Dr. Michael Chen", time: "11:30 AM", type: "Consultation", status: "Pending" },
        { id: 3, patient: "Daniel Benjamin", doctor: "Dr. Elena Rodriguez", time: "01:30 PM", type: "Surgery Follow-up", status: "Confirmed" },
    ];

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
                                <button className={styles.outlineBtn} style={{ padding: '0 12px' }}>Today</button>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button className={styles.iconBtn} style={{ borderRadius: '50%' }}>‹</button>
                                    <button className={styles.iconBtn} style={{ borderRadius: '50%' }}>›</button>
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
                            const isToday = item.day === today.getDate() && item.isCurrentMonth;
                            return (
                                <div key={idx} className={`${styles.calendarCell} ${!item.isCurrentMonth ? styles.notInMonth : ''} ${isToday ? styles.todayCell : ''}`}>
                                    <div className={styles.dateLabel}>{item.day}</div>
                                    {item.isCurrentMonth && calendarAppointments[item.day] && (
                                        <div className={styles.aptIndicator}>
                                            {calendarAppointments[item.day]} Appts
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
                        <span style={{ fontSize: '18px', fontWeight: '700' }}>Appointment List - Today</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
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
                                    <th style={{ textAlign: 'right' }}>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointmentsList.map(apt => (
                                    <tr key={apt.id} className={styles.activityRow}>
                                        <td style={{ fontWeight: '700' }}>{apt.patient}</td>
                                        <td style={{ color: '#64748b' }}>{apt.doctor}</td>
                                        <td style={{ color: '#0f172a', fontWeight: '600' }}>{apt.time}</td>
                                        <td style={{ color: '#359aff', fontWeight: '600' }}>{apt.type}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span className={apt.status === 'Confirmed' ? styles.statusCompleted : styles.statusReview}>
                                                {apt.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

