"use client";
import { useState, useEffect } from "react";
import styles from "../PatientDashboard.module.css";
import { fetchCalendarMonth, fetchCalendarDay } from "@/services/calendar";

export default function CalendarView({ appointments = [] }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [monthData, setMonthData] = useState({});
    const [selectedDayEvents, setSelectedDayEvents] = useState(null);

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
                console.error("Failed to fetch calendar monthly data:", err);
            }
        };
        loadMonthData();
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

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    const daysInMonthCount = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
    const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
    const todayDate = new Date().getDate();
    const isTodayMonth = currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();

    const getDayAvailability = (day) => {
        const count = monthData[day];
        if (count === undefined || count === 0) return "none";
        return "blue"; // Patients see blue dots for their appointments
    };

    return (
        <div className={styles.card} style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>My Health Calendar</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>{currentMonthName} {currentYear}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => changeMonth(-1)} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}>‹</button>
                        <button onClick={() => changeMonth(1)} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}>›</button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <span key={d} style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', padding: '8px 0' }}>{d}</span>
                ))}
                {daysInMonth.map((day) => {
                    const hasEvent = getDayAvailability(day) !== 'none';
                    const isToday = isTodayMonth && day === todayDate;

                    return (
                        <div
                            key={day}
                            onClick={() => handleDayClick(day)}
                            style={{
                                cursor: 'pointer',
                                height: '40px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '600',
                                position: 'relative',
                                background: isToday ? '#eff6ff' : 'transparent',
                                color: isToday ? '#2563eb' : '#475569',
                                border: isToday ? '1px solid #bfdbfe' : '1px solid transparent'
                            }}
                        >
                            {day}
                            {hasEvent && (
                                <div style={{
                                    width: '4px',
                                    height: '4px',
                                    borderRadius: '50%',
                                    background: '#3b82f6',
                                    position: 'absolute',
                                    bottom: '6px'
                                }}></div>
                            )}
                        </div>
                    );
                })}
            </div>

            {selectedDayEvents && (
                <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Events for {currentMonthName} {selectedDayEvents[0] ? new Date(selectedDayEvents[0].start_time).getDate() : ''}</h4>
                        <button onClick={() => setSelectedDayEvents(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '11px', cursor: 'pointer' }}>Clear</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedDayEvents.length === 0 ? (
                            <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', margin: '10px 0' }}>No appointments scheduled for this day.</p>
                        ) : selectedDayEvents.map((evt, i) => (
                            <div key={i} style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{evt.title || "Medical Consultation"}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(evt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                                <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', background: '#eff6ff', color: '#3b82f6', textTransform: 'uppercase' }}>
                                    {evt.event_type}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
