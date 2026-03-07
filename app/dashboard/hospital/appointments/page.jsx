"use client";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { fetchHospitalAppointments, fetchHospitalStats, fetchOrganizationMembers } from "@/services/hospital";
import { fetchCalendarMonth, fetchCalendarDay, deleteCalendarEvent, createCalendarEvent } from "@/services/calendar";
import CalendarModal from "./components/CalendarModal";

export default function AppointmentsPage() {
    const [view, setView] = useState('schedule');
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [monthData, setMonthData] = useState({});
    const [stats, setStats] = useState({ notesPendingSignature: 0, transcriptionQueueStatus: 0 });
    const [doctors, setDoctors] = useState([]);
    const [doctorFilter, setDoctorFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dayEvents, setDayEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('event'); // 'event' or 'task'

    const loadMonthData = async (date = selectedDate) => {
        try {
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const data = await fetchCalendarMonth(year, month);
            setMonthData(data || {});
        } catch (err) {
            console.error("Failed to load month data:", err);
        }
    };

    const loadDayData = async (date = selectedDate) => {
        try {
            const dateStr = date.toISOString().split('T')[0];
            const data = await fetchCalendarDay(dateStr);
            setDayEvents(data?.events || []);
        } catch (err) {
            console.error("Failed to load day data:", err);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const [statData, apptData, teamData] = await Promise.all([
                    fetchHospitalStats(),
                    fetchHospitalAppointments(),
                    fetchOrganizationMembers()
                ]);
                setStats(statData);
                setAppointments(apptData || []);
                setDoctors(teamData || []);
                await Promise.all([loadMonthData(), loadDayData()]);
            } catch (err) {
                console.error("Failed to load appointments data:", err);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        loadMonthData(selectedDate);
    }, [selectedDate.getMonth(), selectedDate.getFullYear()]);

    useEffect(() => {
        loadDayData(selectedDate);
    }, [selectedDate]);

    const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const currentDateObj = new Date();
    const currentMonthName = currentDateObj.toLocaleString('default', { month: 'long' });
    const currentYear = currentDateObj.getFullYear();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', background: 'transparent', padding: 0, minHeight: '100%' }}
        >
            <Topbar title={view === 'schedule' ? "Staff Schedule" : "Appointments Schedule"} />

            <div className={styles.contentWrapper}>
                <div className={styles.pageHeaderRow} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                            {view === 'schedule' ? "Schedule" : "Master Appointment Schedule"}
                        </h1>
                        <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>
                            {view === 'schedule'
                                ? "Manage shift coverage and personnel assignments for the cardiology wing."
                                : "Daily overview of all clinical encounters across departments."}
                        </p>
                    </div>
                    <div className={styles.pageHeaderActions} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                            <button
                                onClick={() => setView('list')}
                                style={{
                                    padding: '6px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: view === 'list' ? 'white' : 'transparent',
                                    color: view === 'list' ? '#1e293b' : '#94a3b8',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    boxShadow: view === 'list' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                                }}
                            >
                                Appointments
                            </button>
                            <button
                                onClick={() => setView('schedule')}
                                style={{
                                    padding: '6px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: view === 'schedule' ? 'white' : 'transparent',
                                    color: view === 'schedule' ? '#1e293b' : '#94a3b8',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    boxShadow: view === 'schedule' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                                }}
                            >
                                Staff Schedule
                            </button>
                        </div>

                        {view === 'schedule' ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {/* <button className={styles.outlineBtn} style={{ background: '#ffffff', color: '#3b82f6', width: '40px', padding: 0, justifyContent: 'center' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                </button> */}
                                {/* <button className={styles.primaryBtn} style={{ background: '#3b82f6', color: 'white' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px' }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    New Shift
                                </button> */}
                            </div>
                        ) : null}
                    </div>
                </div>

                {view === 'list' ? (
                    <div className={styles.card} style={{ border: 'none', borderRadius: '16px', padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                            <div style={{ fontWeight: '700', color: '#0f172a' }}>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <select
                                    className={styles.outlineBtn}
                                    style={{ background: '#ffffff' }}
                                    value={doctorFilter}
                                    onChange={(e) => setDoctorFilter(e.target.value)}
                                >
                                    <option value="All">All Doctors</option>
                                    {doctors.map(d => <option key={d.id} value={d.full_name}>{d.full_name}</option>)}
                                </select>
                                <select
                                    className={styles.outlineBtn}
                                    style={{ background: '#ffffff' }}
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Remote">Remote</option>
                                    <option value="On-Site">On-Site</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {loading ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading appointments...</div>
                            ) : appointments.filter(a => {
                                const matchesDoctor = doctorFilter === "All" || a.doctor_name === doctorFilter || a.doctor?.full_name === doctorFilter;
                                const matchesStatus = statusFilter === "All" || (statusFilter === "Remote" && a.visit_type === "video") || (statusFilter === "On-Site" && a.visit_type === "in-person");
                                const matchesDate = !selectedDate || new Date(a.scheduled_at).toDateString() === selectedDate.toDateString();
                                return matchesDoctor && matchesStatus && matchesDate;
                            }).length === 0 ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No appointments match your filters.</div>
                            ) : appointments.filter(a => {
                                const matchesDoctor = doctorFilter === "All" || a.doctor_name === doctorFilter || a.doctor?.full_name === doctorFilter;
                                const matchesStatus = statusFilter === "All" || (statusFilter === "Remote" && a.visit_type === "video") || (statusFilter === "On-Site" && a.visit_type === "in-person");
                                const matchesDate = !selectedDate || new Date(a.scheduled_at).toDateString() === selectedDate.toDateString();
                                return matchesDoctor && matchesStatus && matchesDate;
                            }).map((appt, i) => {
                                const time = appt.scheduled_at ? new Date(appt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD";
                                const status = appt.status || "scheduled";
                                const colors = {
                                    completed: "#10b981",
                                    accepted: "#10b981",
                                    scheduled: "#3b82f6",
                                    "in-progress": "#3b82f6",
                                    pending: "#f59e0b",
                                    upcoming: "#64748b",
                                    cancelled: "#ef4444"
                                };
                                const color = colors[status.toLowerCase()] || "#64748b";

                                return (
                                    <div key={i} className={styles.appointmentListItem} style={{ display: 'flex', padding: '24px', borderBottom: i === appointments.length - 1 ? 'none' : '1px solid #f1f5f9', alignItems: 'center' }}>
                                        <div style={{ width: '100px', flexShrink: 0 }}>
                                            <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>{time}</div>
                                        </div>
                                        <div className={styles.appointmentListItem} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '48px' }}>
                                            <div style={{ minWidth: '200px' }}>
                                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Patient</div>
                                                <div style={{ fontWeight: '700', color: '#1e293b' }}>{appt.patient_name || appt.patient?.full_name || "Unknown Patient"}</div>
                                            </div>
                                            <div style={{ minWidth: '200px' }}>
                                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Practitioner</div>
                                                <div style={{ fontWeight: '600', color: '#475569' }}>{appt.doctor_name || appt.doctor?.full_name || "Doctor"}</div>
                                            </div>
                                            <div style={{ minWidth: '150px' }}>
                                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Visit Type</div>
                                                <div style={{ fontWeight: '500', color: '#64748b' }}>{appt.visit_type === 'video' ? 'Remote' : 'On-Site'}</div>
                                            </div>
                                            <div style={{ flex: 1, textAlign: 'right' }}>
                                                <span style={{ color: color, background: `${color}10`, padding: '6px 16px', borderRadius: '8px', fontWeight: '800', fontSize: '10px', textTransform: 'uppercase' }}>{status}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className={styles.dashboardGrid}>
                        <div className={styles.card} style={{ border: 'none', borderRadius: '16px', padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 }}>{selectedDate.toLocaleString('default', { month: 'long' })} {selectedDate.getFullYear()}</h2>
                                    <div style={{ display: 'flex', gap: '8px', color: '#94a3b8' }}>
                                        <button onClick={() => {
                                            const newDate = new Date(selectedDate);
                                            newDate.setMonth(newDate.getMonth() - 1);
                                            setSelectedDate(newDate);
                                        }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>‹</button>
                                        <button onClick={() => {
                                            const newDate = new Date(selectedDate);
                                            newDate.setMonth(newDate.getMonth() + 1);
                                            setSelectedDate(newDate);
                                        }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>›</button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                                    <button style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: 'white', color: '#1e293b', fontSize: '12px', fontWeight: '700', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>Monthly</button>
                                    <button style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>Weekly</button>
                                    <button style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>Daily</button>
                                </div>
                            </div>

                            <div className={styles.tableScrollWrapper} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', border: '1px solid #f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
                                {weekDays.map(h => (
                                    <div key={h} style={{ padding: '12px', textAlign: 'center', fontSize: '10px', fontWeight: '800', color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>{h}</div>
                                ))}
                                {Array.from({ length: 35 }).map((_, i) => {
                                    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
                                    const day = i + 1 - firstDayOfMonth;
                                    const isCurrentMonth = day > 0 && day <= new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
                                    const displayDay = isCurrentMonth ? day : "";

                                    const dayData = monthData?.days?.find(d => d.day === day) || {};
                                    const count = dayData.events_count || 0;
                                    const isSelected = selectedDate.getDate() === day && isCurrentMonth;

                                    return (
                                        <div
                                            key={i}
                                            onClick={() => isCurrentMonth && setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
                                            style={{
                                                minHeight: '100px',
                                                padding: '8px',
                                                cursor: isCurrentMonth ? 'pointer' : 'default',
                                                background: isSelected ? '#eff6ff' : (isCurrentMonth ? '#ffffff' : '#f9fafb'),
                                                borderRight: (i + 1) % 7 === 0 ? 'none' : '1px solid #f1f5f9',
                                                borderBottom: '1px solid #f1f5f9'
                                            }}
                                        >
                                            <div style={{ fontSize: '11px', fontWeight: '700', color: isSelected ? '#3b82f6' : '#94a3b8', marginBottom: '8px' }}>{displayDay}</div>
                                            {count > 0 && isCurrentMonth && (
                                                <div style={{ fontSize: '9px', fontWeight: '800', background: count > 3 ? '#fef2f2' : '#eff6ff', color: count > 3 ? '#ef4444' : '#3b82f6', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: count > 3 ? '#ef4444' : '#3b82f6' }} />
                                                    {count} {count === 1 ? 'Event' : 'Events'}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className={styles.card} style={{ padding: '24px', borderRadius: '16px', border: 'none' }}>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '16px', textTransform: 'uppercase' }}>Statistics</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 0 0 1 0 7.75" /></svg>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>{stats.notesPendingSignature || 0}</div>
                                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>PENDING REVIEWS</div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.card} style={{ padding: '24px', borderRadius: '16px', border: 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Selected Day Schedule</div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => { setModalMode('event'); setIsModalOpen(true); }} style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>+ EVENT</button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {dayEvents.length === 0 ? (
                                        <div style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center', padding: '20px 0' }}>No events for this day.</div>
                                    ) : (
                                        <>
                                            {dayEvents.map((ev, idx) => (
                                                <div key={`ev-${idx}`} style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <div style={{ fontSize: '13px', fontWeight: '700' }}>{ev.title || "Meeting"}</div>
                                                        <div style={{ fontSize: '10px', color: '#64748b' }}>{ev.time || ev.scheduled_at?.split('T')[1].substring(0, 5)} • {ev.doctor_name || "Doctor"}</div>
                                                    </div>
                                                    <button onClick={() => { if (confirm("Delete event?")) deleteCalendarEvent(ev.id).then(() => loadDayData()); }} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}>×</button>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>

                            <CalendarModal
                                isOpen={isModalOpen}
                                onClose={() => setIsModalOpen(false)}
                                mode={modalMode}
                                selectedDate={selectedDate}
                                doctors={doctors}
                                onSave={() => { setIsModalOpen(false); loadDayData(); loadMonthData(); }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
