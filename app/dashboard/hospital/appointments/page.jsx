"use client";

import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { fetchHospitalAppointments, fetchHospitalStats, fetchOrganizationMembers } from "@/services/hospital";
import { fetchCalendarMonth, fetchCalendarDay, deleteCalendarEvent, createCalendarEvent } from "@/services/calendar";
import CalendarModal from "./components/CalendarModal";
import {
    Calendar as CalendarIcon,
    List,
    Users,
    User,
    Video,
    Building2,
    Clock,
    Plus,
    Filter,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    Search,
    MapPin,
    CheckCircle2,
    CalendarDays
} from "lucide-react";

export default function AppointmentsPage() {
    const [view, setView] = useState('list'); // 'list' | 'schedule'
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [monthData, setMonthData] = useState({});
    const [stats, setStats] = useState({ notesPendingSignature: 0, transcriptionQueueStatus: 0, totalToday: 0 });
    const [doctors, setDoctors] = useState([]);
    const [doctorFilter, setDoctorFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState('All');
    const [calendarMode, setCalendarMode] = useState('month'); // 'month' | 'week' | 'day'
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dayEvents, setDayEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const filters = {};
            if (doctorFilter !== "All") filters.doctor_id = doctorFilter;
            if (statusFilter !== "All") filters.visit_type = statusFilter;

            const [statData, apptData, teamData] = await Promise.all([
                fetchHospitalStats(),
                fetchHospitalAppointments(filters),
                fetchOrganizationMembers()
            ]);

            // Filter appointments for today to get a real count for stats
            const today = new Date().toDateString();
            const todayAppts = (apptData || []).filter(a => new Date(a.scheduled_at).toDateString() === today);

            setStats({
                ...statData,
                totalToday: todayAppts.length
            });
            setAppointments(apptData || []);
            setDoctors(teamData || []);
            await Promise.all([loadMonthData(), loadDayData()]);
        } catch (err) {
            console.error("Failed to load appointments data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, [doctorFilter, statusFilter]);

    useEffect(() => {
        loadMonthData(selectedDate);
    }, [selectedDate.getMonth(), selectedDate.getFullYear()]);

    useEffect(() => {
        loadDayData(selectedDate);
    }, [selectedDate]);

    const getCalendarDays = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        // Fill previous month padding
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({ day: prevMonthLastDay - i, isCurrentMonth: false });
        }
        // Current month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, isCurrentMonth: true });
        }
        // Next month padding
        while (days.length % 7 !== 0) {
            const nextDay = (days.length - (firstDay + daysInMonth)) + 1;
            days.push({ day: nextDay, isCurrentMonth: false });
        }
        return days;
    };

    const calendarDays = getCalendarDays();
    const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    // ── Filtered Data ────────────────────────────────────────────────────────
    const filteredAppointments = appointments.filter(a => {
        const matchesDate = !selectedDate || new Date(a.scheduled_at).toDateString() === selectedDate.toDateString();
        return matchesDate;
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', background: '#f8fafc', minHeight: '100vh', padding: 0 }}
        >
            <Topbar title="Clinical Master Schedule" />

            <div className={styles.contentWrapper} style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>

                {/* ── Page Header & Stats ── */}
                <div className={styles.apptPageHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
                    <div>
                        <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#0f172a", margin: 0, letterSpacing: "-0.03em" }}>
                            {view === 'list' ? "Master Appointment Schedule" : "Staff Coverage Planner"}
                        </h1>
                        <p style={{ color: "#64748b", margin: "8px 0 0 0", fontSize: "16px", fontWeight: "500" }}>
                            Real-time synchronization across all departments and practitioners.
                        </p>
                    </div>

                    <div className={styles.apptViewToggle} style={{ display: "flex", gap: "12px", background: "#fff", padding: "6px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
                        <button
                            onClick={() => setView('list')}
                            style={{
                                display: "flex", alignItems: "center", gap: "8px",
                                padding: "10px 20px", borderRadius: "12px", border: "none",
                                background: view === 'list' ? "#3b82f6" : "transparent",
                                color: view === 'list' ? "#fff" : "#64748b",
                                fontWeight: "800", fontSize: "14px", cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                            <List size={18} /> Appointments
                        </button>
                        <button
                            onClick={() => setView('schedule')}
                            style={{
                                display: "flex", alignItems: "center", gap: "8px",
                                padding: "10px 20px", borderRadius: "12px", border: "none",
                                background: view === 'schedule' ? "#3b82f6" : "transparent",
                                color: view === 'schedule' ? "#fff" : "#64748b",
                                fontWeight: "800", fontSize: "14px", cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                            <CalendarIcon size={18} /> Staff Schedule
                        </button>
                    </div>
                </div>

                {/* ── Summary Stats Grid ── */}
                <div className={styles.apptStatsGrid} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" }}>
                    {[
                        { label: "Booked Today", value: stats.totalToday, icon: <CheckCircle2 size={20} />, color: "#3b82f6", bg: "#eff6ff" },
                        { label: "Transcription Queue", value: stats.transcriptionQueueStatus || 0, icon: <Clock size={20} />, color: "#f59e0b", bg: "#fffbeb" },
                        { label: "Care Providers", value: doctors.length, icon: <Users size={20} />, color: "#10b981", bg: "#f0fdf4" },
                        { label: "Pending Notes", value: stats.notesPendingSignature || 0, icon: <MoreHorizontal size={20} />, color: "#ec4899", bg: "#fdf2f8" }
                    ].map((s, i) => (
                        <div key={i} style={{ background: "white", padding: "24px", borderRadius: "24px", border: "1px solid #f1f5f9", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {s.icon}
                                </div>
                            </div>
                            <div style={{ marginTop: "16px" }}>
                                <div style={{ fontSize: "12px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                                <div style={{ fontSize: "28px", fontWeight: "900", color: "#1e293b", marginTop: "4px" }}>{s.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Main View Area ── */}
                <div className={styles.apptMainGrid} style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }}>
                    {/* Left Column: List or Calendar */}
                    <div style={{ background: "white", borderRadius: "32px", border: "1px solid #f1f5f9", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)", overflow: "hidden" }}>

                        {view === 'list' ? (
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {/* List Header/Filters */}
                                <div className={styles.apptListHeader} style={{ padding: "32px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#1e293b", margin: 0 }}>
                                        {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </h2>
                                    <div className={styles.apptListFilters} style={{ display: "flex", gap: "12px" }}>
                                        <select
                                            value={doctorFilter}
                                            onChange={(e) => setDoctorFilter(e.target.value)}
                                            style={{
                                                padding: "10px 16px", borderRadius: "12px", border: "1px solid #e2e8f0",
                                                background: "#f8fafc", fontSize: "13px", fontWeight: "700", color: "#475569"
                                            }}
                                        >
                                            <option value="All">All Practitioners</option>
                                            {doctors.map(d => <option key={d.id} value={d.id}>{d.name || d.full_name || "Doctor"}</option>)}
                                        </select>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            style={{
                                                padding: "10px 16px", borderRadius: "12px", border: "1px solid #e2e8f0",
                                                background: "#f8fafc", fontSize: "13px", fontWeight: "700", color: "#475569"
                                            }}
                                        >
                                            <option value="All">All Modes</option>
                                            <option value="video">Remote (Video)</option>
                                            <option value="in-person">On-Site (In-Person)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* List Content */}
                                <div style={{ minHeight: "500px" }}>
                                    {loading ? (
                                        <div style={{ padding: "100px", textAlign: "center" }}>
                                            <div className={styles.spinner}></div>
                                            <p style={{ marginTop: "16px", color: "#94a3b8", fontWeight: "700" }}>Synchronizing clinical data...</p>
                                        </div>
                                    ) : filteredAppointments.length === 0 ? (
                                        <div style={{ padding: "140px 40px", textAlign: "center" }}>
                                            <CalendarDays size={64} style={{ color: "#e2e8f0", marginBottom: "20px" }} />
                                            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", margin: 0 }}>No Appointments Found</h3>
                                            <p style={{ color: "#94a3b8", marginTop: "8px" }}>Try selecting a different date or clearing filters.</p>
                                        </div>
                                    ) : (
                                        <div>
                                            {filteredAppointments.map((appt, i) => {
                                                const time = new Date(appt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                const isVideo = appt.visit_type === "video";
                                                return (
                                                    <motion.div
                                                        key={appt.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        style={{
                                                            padding: "24px 32px",
                                                            borderBottom: i < filteredAppointments.length - 1 ? "1px solid #f8fafc" : "none",
                                                            display: "grid",
                                                            gridTemplateColumns: "100px 1fr 1fr 180px 120px",
                                                            alignItems: "center",
                                                            transition: "background 0.2s"
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background = "#fcfcfd"}
                                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                                    >
                                                        <div style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>{time}</div>

                                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                                                                <User size={20} />
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: "10px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>Patient</div>
                                                                <div style={{ fontWeight: "800", color: "#1e293b" }}>{appt.patient_name || "Anonymous"}</div>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1" }}>
                                                                <Building2 size={20} />
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: "10px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>Practitioner</div>
                                                                <div style={{ fontWeight: "700", color: "#1e293b" }}>{appt.doctor_name || "Care Provider"}</div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <span style={{
                                                                display: "inline-flex", alignItems: "center", gap: "6px",
                                                                padding: "6px 12px", borderRadius: "10px",
                                                                background: isVideo ? "#f5f3ff" : "#f0fdf4",
                                                                color: isVideo ? "#8b5cf6" : "#10b981",
                                                                fontSize: "12px", fontWeight: "800"
                                                            }}>
                                                                {isVideo ? <Video size={14} /> : <MapPin size={14} />}
                                                                {isVideo ? "Remote" : "On-Site"}
                                                            </span>
                                                        </div>

                                                        <div style={{ textAlign: "right" }}>
                                                            <button style={{ background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", padding: "8px" }}>
                                                                <MoreHorizontal size={20} />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* ── Staff Schedule (Calendar) View ── */
                            <div style={{ padding: "32px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                        <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#1e293b", margin: 0 }}>
                                            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </h2>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <button onClick={() => {
                                                const d = new Date(selectedDate);
                                                d.setMonth(d.getMonth() - 1);
                                                setSelectedDate(d);
                                            }} style={{ padding: "8px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "white", cursor: "pointer" }}>
                                                <ChevronLeft size={18} />
                                            </button>
                                            <button onClick={() => {
                                                const d = new Date(selectedDate);
                                                d.setMonth(d.getMonth() + 1);
                                                setSelectedDate(d);
                                            }} style={{ padding: "8px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "white", cursor: "pointer" }}>
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", background: "#f1f5f9", padding: "4px", borderRadius: "12px" }}>
                                        {['month', 'week', 'day'].map(mode => (
                                            <button
                                                key={mode}
                                                onClick={() => setCalendarMode(mode)}
                                                style={{
                                                    padding: "8px 20px", borderRadius: "10px", border: "none",
                                                    background: calendarMode === mode ? "white" : "transparent",
                                                    color: calendarMode === mode ? "#3b82f6" : "#64748b",
                                                    fontWeight: "800", fontSize: "13px", cursor: "pointer",
                                                    boxShadow: calendarMode === mode ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
                                                }}
                                            >
                                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px", background: "#f1f5f9", borderRadius: "24px", overflow: "hidden", border: "1px solid #f1f5f9" }}>
                                    {weekDays.map(w => (
                                        <div key={w} style={{ background: "#f8fafc", padding: "16px", textAlign: "center", fontSize: "11px", fontWeight: "900", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                            {w}
                                        </div>
                                    ))}
                                    {calendarDays.map((dayObj, i) => {
                                        const { day, isCurrentMonth } = dayObj;
                                        const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                        const hasItems = monthData?.days?.find(d => d.day === day && isCurrentMonth);
                                        const isSelected = selectedDate.getDate() === day && isCurrentMonth;

                                        return (
                                            <div
                                                key={i}
                                                onClick={() => isCurrentMonth && setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
                                                style={{
                                                    minHeight: "120px", background: isSelected ? "#f5f3ff" : "white",
                                                    padding: "16px", cursor: isCurrentMonth ? "pointer" : "default",
                                                    transition: "background 0.2s"
                                                }}
                                            >
                                                <div style={{
                                                    fontSize: "14px", fontWeight: "800",
                                                    color: isCurrentMonth ? (isSelected ? "#7c3aed" : "#1e293b") : "#cbd5e1"
                                                }}>
                                                    {day}
                                                </div>
                                                {isCurrentMonth && hasItems && (
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "12px" }}>
                                                        {hasItems.has_appointments && (
                                                            <div style={{ height: "6px", width: "100%", borderRadius: "4px", background: "#3b82f6" }} title="Appointments"></div>
                                                        )}
                                                        {hasItems.has_tasks && (
                                                            <div style={{ height: "6px", width: "100%", borderRadius: "4px", background: "#f59e0b" }} title="Tasks"></div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Daily Agenda / Mini Sidebar */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        <div style={{ background: "white", borderRadius: "32px", padding: "32px", border: "1px solid #f1f5f9", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                                <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#1e293b", margin: 0 }}>Clinical Agenda</h3>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    style={{
                                        width: "36px", height: "36px", borderRadius: "12px", background: "#1e293b", color: "#fff",
                                        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "none"
                                    }}
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {dayEvents.length === 0 ? (
                                    <div style={{ padding: "40px 20px", textAlign: "center", background: "#f8fafc", borderRadius: "24px", border: "2px dashed #e2e8f0" }}>
                                        <p style={{ color: "#94a3b8", fontSize: "13px", fontWeight: "700" }}>Clear schedule for this period.</p>
                                    </div>
                                ) : (
                                    dayEvents.map((ev, idx) => (
                                        <div key={idx} style={{
                                            padding: "16px", background: "#f8fafc", borderRadius: "20px", borderLeft: "4px solid #3b82f6"
                                        }}>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <div style={{ fontSize: "12px", fontWeight: "900", color: "#3b82f6", display: "flex", alignItems: "center", gap: "4px" }}>
                                                    <Clock size={12} /> {new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <button
                                                    onClick={() => deleteCalendarEvent(ev.id).then(() => loadDayData())}
                                                    style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "10px", fontWeight: "900" }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                            <div style={{ fontWeight: "800", color: "#1e293b", marginTop: "8px", fontSize: "14px" }}>{ev.title || "Consultation"}</div>
                                            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{ev.metadata?.doctor_name || "Care Provider"}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Quick Tips or Insights */}
                        <div style={{
                            background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
                            borderRadius: "32px", padding: "32px", color: "#fff",
                            position: "relative", overflow: "hidden"
                        }}>
                            <div style={{ position: "relative", zIndex: 1 }}>
                                <h3 style={{ fontSize: "16px", fontWeight: "900", margin: 0 }}>Efficiency Tip</h3>
                                <p style={{ fontSize: "13px", opacity: 0.9, marginTop: "12px", lineHeight: "1.6", fontWeight: "500" }}>
                                    Staff members with the "Remote Only" tag can be reassigned to the Virtual Care wing for improved patient throughput.
                                </p>
                            </div>
                            <Video size={100} style={{ position: "absolute", right: "-20px", bottom: "-20px", opacity: 0.1 }} />
                        </div>
                    </div>
                </div>

                <CalendarModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    selectedDate={selectedDate}
                    onSave={() => { setIsModalOpen(false); loadDayData(); loadMonthData(); loadInitialData(); }}
                />
            </div>
        </motion.div>
    );
}
