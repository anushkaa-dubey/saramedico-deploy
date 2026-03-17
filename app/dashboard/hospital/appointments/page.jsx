"use client";

import Topbar from "../components/Topbar";
import appt from "./Appointments.module.css";
import dashStyles from "../HospitalDashboard.module.css";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { fetchHospitalAppointments, fetchHospitalStats, fetchOrganizationMembers } from "@/services/hospital";
import { fetchCalendarMonth, fetchCalendarDay, deleteCalendarEvent } from "@/services/calendar";
import CalendarModal from "./components/CalendarModal";
import {
    Calendar as CalendarIcon, List, Users, User, Video,
    Building2, Clock, Plus, MoreHorizontal, ChevronLeft,
    ChevronRight, MapPin, CheckCircle2, CalendarDays
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────
function getWeekDays(date) {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
    });
}

const HOUR_SLOTS = Array.from({ length: 13 }, (_, i) => i + 7); // 7am – 7pm
const WEEK_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function AppointmentsPage() {
    const [view, setView] = useState('list');
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [monthData, setMonthData] = useState({});
    const [stats, setStats] = useState({ notesPendingSignature: 0, transcriptionQueueStatus: 0, totalToday: 0 });
    const [doctors, setDoctors] = useState([]);
    const [doctorFilter, setDoctorFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState('All');
    const [calendarMode, setCalendarMode] = useState('month');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dayEvents, setDayEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ── API (unchanged) ──────────────────────────────────────────────────────
    const loadMonthData = async (date = selectedDate) => {
        try {
            const data = await fetchCalendarMonth(date.getFullYear(), date.getMonth() + 1);
            setMonthData(data || {});
        } catch (err) { console.error(err); }
    };

    const loadDayData = async (date = selectedDate) => {
        try {
            // Use local date parts to avoid timezone shift from toISOString() in UTC
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const data = await fetchCalendarDay(dateStr);
            const events = data?.events || [];
            
            // De-duplicate appointments for org view (where doctor & patient both in same org)
            const seenAppts = new Set();
            const uniqueEvents = events.filter(ev => {
                if (ev.appointment_id) {
                    if (seenAppts.has(ev.appointment_id)) return false;
                    seenAppts.add(ev.appointment_id);
                }
                return true;
            });

            setDayEvents(uniqueEvents);
        } catch (err) { console.error(err); }
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
                fetchOrganizationMembers(),
            ]);

            setStats(statData || { totalToday: 0, transcriptionQueueStatus: 0, notesPendingSignature: 0 });
            setAppointments(apptData || []);
            setDoctors(teamData || []);
            await Promise.all([loadMonthData(), loadDayData()]);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadInitialData(); }, [doctorFilter, statusFilter]);
    useEffect(() => { loadMonthData(selectedDate); }, [selectedDate.getMonth(), selectedDate.getFullYear()]);
    useEffect(() => { loadDayData(selectedDate); }, [selectedDate.toDateString()]);

    // ── Navigation ───────────────────────────────────────────────────────────
    const navigate = (dir) => {
        const d = new Date(selectedDate);
        if (calendarMode === 'month') d.setMonth(d.getMonth() + dir);
        else if (calendarMode === 'week') d.setDate(d.getDate() + dir * 7);
        else d.setDate(d.getDate() + dir);
        setSelectedDate(d);
    };

    const navLabel = () => {
        if (calendarMode === 'month')
            return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        if (calendarMode === 'week') {
            const w = getWeekDays(selectedDate);
            return `${w[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${w[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
        return selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    };

    // ── Calendar days builder ────────────────────────────────────────────────
    const getCalendarDays = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        const prevLast = new Date(year, month, 0).getDate();
        for (let i = firstDay - 1; i >= 0; i--) days.push({ day: prevLast - i, cur: false });
        for (let i = 1; i <= daysInMonth; i++) days.push({ day: i, cur: true });
        while (days.length % 7 !== 0) days.push({ day: days.length - (firstDay + daysInMonth) + 1, cur: false });
        return days;
    };

    const calDays = getCalendarDays();
    const weekDays = getWeekDays(selectedDate);

    const filteredAppts = appointments.filter(a =>
        new Date(a.scheduled_at).toDateString() === selectedDate.toDateString()
    );

    const statCards = [
        { label: "Booked Today", value: stats.totalToday, icon: <CheckCircle2 size={16} />, color: "#3b82f6", bg: "#eff6ff" },
        { label: "Transcription Queue", value: stats.transcriptionQueueStatus || 0, icon: <Clock size={16} />, color: "#f59e0b", bg: "#fffbeb" },
        { label: "Care Providers", value: doctors.length, icon: <Users size={16} />, color: "#10b981", bg: "#f0fdf4" },
        { label: "Pending Notes", value: stats.notesPendingSignature || 0, icon: <MoreHorizontal size={16} />, color: "#ec4899", bg: "#fdf2f8" },
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={appt.page}>
            <Topbar title="" />

            <div className={appt.content}>

                {/* Heading */}
                <h1 className={appt.heading}>{view === 'list' ? "Appointments" : "Staff Schedule"}</h1>
                <p className={appt.subheading}>Real-time synchronization across all departments and practitioners.</p>

                {/* View toggle */}
                <div className={appt.viewToggleBar}>
                    <div className={appt.viewToggle}>
                        {[
                            { id: 'list', icon: <List size={14} />, label: "Appointments" },
                            { id: 'schedule', icon: <CalendarIcon size={14} />, label: "Staff Schedule" },
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setView(t.id)}
                                className={`${appt.viewBtn} ${view === t.id ? appt.viewBtnActive : ''}`}
                            >
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stat cards */}
                <div className={appt.statsGrid}>
                    {statCards.map((s, i) => (
                        <div key={i} className={appt.statCard}>
                            <div className={appt.statIcon} style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                            <div className={appt.statLabel}>{s.label}</div>
                            <div className={appt.statValue}>{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Main grid */}
                <div className={appt.mainGrid}>

                    {/* ══ LEFT PANEL ══ */}
                    <div className={appt.leftPanel}>

                        {view === 'list' ? (
                            <>
                                {/* Filters bar */}
                                <div className={appt.listFiltersBar}>
                                    <h2 className={appt.listDateTitle}>
                                        {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </h2>
                                    <div className={appt.listFilters}>
                                        <select value={doctorFilter} onChange={e => setDoctorFilter(e.target.value)} className={appt.filterSelect}>
                                            <option value="All">All Practitioners</option>
                                            {doctors.map(d => <option key={d.id} value={d.id}>{d.name || d.full_name || "Doctor"}</option>)}
                                        </select>
                                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={appt.filterSelect}>
                                            <option value="All">All Modes</option>
                                            <option value="video">Remote (Video)</option>
                                            <option value="in-person">On-Site</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ minHeight: "260px" }}>
                                    {loading ? (
                                        <div className={appt.loadingWrap}>
                                            <div className={dashStyles.spinner} />
                                            <p className={appt.loadingText}>Loading appointments...</p>
                                        </div>
                                    ) : filteredAppts.length === 0 ? (
                                        <div className={appt.listEmpty}>
                                            <CalendarDays size={44} style={{ color: "#e2e8f0" }} />
                                            <p className={appt.listEmptyTitle}>No Appointments</p>
                                            <p className={appt.listEmptyText}>Try a different date or clear filters.</p>
                                        </div>
                                    ) : filteredAppts.map((a, i) => {
                                        const time = new Date(a.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        const isVideo = a.visit_type === "video";
                                        const badge = (
                                            <span className={appt.apptTypeBadge} style={{ background: isVideo ? "#f5f3ff" : "#f0fdf4", color: isVideo ? "#8b5cf6" : "#10b981" }}>
                                                {isVideo ? <Video size={11} /> : <MapPin size={11} />}
                                                {isVideo ? "Remote" : "On-Site"}
                                            </span>
                                        );
                                        return (
                                            <motion.div key={a.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                                                {/* Desktop row */}
                                                <div className={appt.apptRow}>
                                                    <div className={appt.apptTime}>{time}</div>
                                                    <div className={appt.apptPersonCell}>
                                                        <div className={appt.apptAvatar} style={{ background: "#f1f5f9", color: "#64748b" }}><User size={15} /></div>
                                                        <div className={appt.apptPersonMeta}>
                                                            <div className={appt.apptPersonRole}>Patient</div>
                                                            <div className={appt.apptPersonName}>{a.patient_name || "Anonymous"}</div>
                                                        </div>
                                                    </div>
                                                    <div className={appt.apptPersonCell}>
                                                        <div className={appt.apptAvatar} style={{ background: "#eef2ff", color: "#6366f1" }}><Building2 size={15} /></div>
                                                        <div className={appt.apptPersonMeta}>
                                                            <div className={appt.apptPersonRole}>Practitioner</div>
                                                            <div className={appt.apptPersonName}>{a.doctor_name || "Care Provider"}</div>
                                                        </div>
                                                    </div>
                                                    {badge}
                                                </div>

                                                {/* Mobile card */}
                                                <div className={appt.apptCard}>
                                                    <div className={appt.apptCardTop}>
                                                        <span className={appt.apptCardTime}>{time}</span>
                                                        {badge}
                                                    </div>
                                                    <div className={appt.apptCardBody}>
                                                        <div className={appt.apptAvatar} style={{ background: "#f1f5f9", color: "#64748b", width: 32, height: 32, borderRadius: 8 }}>
                                                            <User size={14} />
                                                        </div>
                                                        <div className={appt.apptCardInfo}>
                                                            <div className={appt.apptCardName}>{a.patient_name || "Anonymous"}</div>
                                                            <div className={appt.apptCardDoctor}>{a.doctor_name || "Care Provider"}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            /* ══ SCHEDULE VIEW ══ */
                            <>
                                <div className={appt.calToolbar}>
                                    <div className={appt.calNavGroup}>
                                        <button className={appt.calNavBtn} onClick={() => navigate(-1)}><ChevronLeft size={15} /></button>
                                        <span className={appt.calNavLabel}>{navLabel()}</span>
                                        <button className={appt.calNavBtn} onClick={() => navigate(1)}><ChevronRight size={15} /></button>
                                        <button className={appt.calTodayBtn} onClick={() => setSelectedDate(new Date())}>Today</button>
                                    </div>
                                    <div className={appt.calModeToggle}>
                                        {['month', 'week', 'day'].map(m => (
                                            <button key={m} onClick={() => setCalendarMode(m)} className={`${appt.calModeBtn} ${calendarMode === m ? appt.calModeBtnActive : ''}`}>
                                                {m.charAt(0).toUpperCase() + m.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={appt.calBody}>
                                    {/* MONTH */}
                                    {calendarMode === 'month' && (
                                        <div className={appt.monthGrid}>
                                            <div className={appt.monthDayLabels}>
                                                {WEEK_LABELS.map(w => <div key={w} className={appt.monthDayLabel}>{w}</div>)}
                                            </div>
                                            <div className={appt.monthCells}>
                                                {calDays.map(({ day, cur }, i) => {
                                                    const hasItems = monthData?.days?.find(d => d.day === day && cur);
                                                    const isSel = cur && selectedDate.getDate() === day;
                                                    const isToday = cur && new Date().getDate() === day && new Date().getMonth() === selectedDate.getMonth() && new Date().getFullYear() === selectedDate.getFullYear();
                                                    return (
                                                        <div key={i} onClick={() => cur && setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
                                                            className={`${appt.monthCell} ${!cur ? appt.monthCellOther : ''} ${isSel ? appt.monthCellSelected : ''}`}>
                                                            <div className={`${appt.monthDateNum} ${isToday ? appt.monthDateNumToday : isSel ? appt.monthDateNumSelected : !cur ? appt.monthDateNumOther : ''}`}>{day}</div>
                                                            {cur && hasItems && (
                                                                <>
                                                                    {hasItems.has_appointments && <div className={appt.monthDot} style={{ background: "#3b82f6" }} />}
                                                                    {hasItems.has_tasks && <div className={appt.monthDot} style={{ background: "#f59e0b" }} />}
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* WEEK */}
                                    {calendarMode === 'week' && (
                                        <div className={appt.weekGrid}>
                                            <div className={appt.weekHeader}>
                                                <div />
                                                {weekDays.map((d, i) => {
                                                    const isToday = d.toDateString() === new Date().toDateString();
                                                    const isSel = d.toDateString() === selectedDate.toDateString();
                                                    return (
                                                        <div key={i} className={appt.weekHeaderCell} onClick={() => setSelectedDate(new Date(d))}>
                                                            <div className={appt.weekHeaderDay}>{WEEK_LABELS[i]}</div>
                                                            <div className={appt.weekHeaderDate} style={{ background: isToday ? "#3b82f6" : isSel ? "#eff6ff" : "transparent", color: isToday ? "#fff" : isSel ? "#3b82f6" : "#1e293b" }}>
                                                                {d.getDate()}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className={appt.weekBody}>
                                                {HOUR_SLOTS.map(hour => (
                                                    <div key={hour} className={appt.weekRow}>
                                                        <div className={appt.weekTimeLabel}>{hour % 12 || 12}{hour < 12 ? "am" : "pm"}</div>
                                                        {weekDays.map((d, di) => {
                                                            const slotAppts = appointments.filter(a => { const ad = new Date(a.scheduled_at); return ad.toDateString() === d.toDateString() && ad.getHours() === hour; });
                                                            return (
                                                                <div key={di} className={appt.weekCell}>
                                                                    {slotAppts.map((a, ai) => <div key={ai} className={appt.weekApptChip}>{a.patient_name || "Patient"}</div>)}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* DAY */}
                                    {calendarMode === 'day' && (
                                        <div className={appt.dayGrid}>
                                            {HOUR_SLOTS.map(hour => {
                                                const slotAppts = appointments.filter(a => { const ad = new Date(a.scheduled_at); return ad.toDateString() === selectedDate.toDateString() && ad.getHours() === hour; });
                                                const slotEvents = dayEvents.filter(e => new Date(e.start_time).getHours() === hour && e.event_type !== 'appointment');
                                                const allItems = [...slotAppts.map(a => ({ type: 'appt', label: a.patient_name || "Patient", sub: a.doctor_name || "" })), ...slotEvents.map(e => ({ type: 'event', label: e.title || "Event", sub: e.metadata?.doctor_name || "" }))];
                                                const isCurrent = new Date().getHours() === hour && selectedDate.toDateString() === new Date().toDateString();
                                                return (
                                                    <div key={hour} className={`${appt.dayRow} ${isCurrent ? appt.dayRowCurrent : ''}`}>
                                                        <div className={appt.dayTimeLabel}>{hour % 12 || 12}:00{hour < 12 ? "am" : "pm"}</div>
                                                        <div className={appt.dayCell}>
                                                            {allItems.map((item, ii) => (
                                                                <div key={ii} className={`${appt.dayChip} ${item.type === 'appt' ? appt.dayChipAppt : appt.dayChipEvent}`}>
                                                                    <div className={appt.dayChipName}>{item.label}</div>
                                                                    {item.sub && <div className={appt.dayChipSub}>{item.sub}</div>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* ══ RIGHT SIDEBAR ══ */}
                    <div className={appt.rightSidebar}>
                        <div className={appt.agendaCard}>
                            <div className={appt.agendaHeader}>
                                <h3 className={appt.agendaTitle}>Clinical Agenda</h3>
                                <button className={appt.agendaAddBtn} onClick={() => setIsModalOpen(true)}><Plus size={15} /></button>
                            </div>
                            {dayEvents.length === 0 ? (
                                <div className={appt.agendaEmpty}>Clear schedule.</div>
                            ) : dayEvents.map((ev, idx) => (
                                <div key={idx} className={appt.agendaEvent}>
                                    <div className={appt.agendaEventHeader}>
                                        <span className={appt.agendaEventTime}><Clock size={10} />{new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <button className={appt.agendaCancelBtn} onClick={() => deleteCalendarEvent(ev.id).then(() => loadDayData())}>Cancel</button>
                                    </div>
                                    <div className={appt.agendaEventTitle}>{ev.title || "Consultation"}</div>
                                    <div className={appt.agendaEventSub}>{ev.metadata?.doctor_name || "Care Provider"}</div>
                                </div>
                            ))}
                        </div>

                        <div className={appt.tipCard}>
                            <h3 className={appt.tipTitle}>Efficiency Tip</h3>
                            <p className={appt.tipText}>Staff members with the "Remote Only" tag can be reassigned to the Virtual Care wing for improved patient throughput.</p>
                            <Video size={70} className={appt.tipIcon} />
                        </div>
                    </div>
                </div>
            </div>

            <CalendarModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedDate={selectedDate}
                onSave={() => { setIsModalOpen(false); loadDayData(); loadMonthData(); loadInitialData(); }}
            />
        </motion.div>
    );
}