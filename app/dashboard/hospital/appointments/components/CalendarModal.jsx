"use client";
import { useState } from "react";
import { createCalendarEvent } from "@/services/calendar";

export default function CalendarModal({ isOpen, onClose, selectedDate, onSave }) {
    const [title, setTitle] = useState("");
    const [time, setTime] = useState("10:00");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Extract YYYY-MM-DD cleanly using local getters to safely bypass browser timezone wrapping
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            const [hours, mins] = time.split(':');
            
            // Format explicitly as UTC to ensure the exact selected date and time map into the database without local offsets pushing it over boundary lines
            const formattedStartTime = `${dateStr}T${hours}:${mins}:00.000Z`;
            
            const startHourInt = parseInt(hours, 10);
            const endHourStr = String(startHourInt + 1).padStart(2, '0');
            const formattedEndTime = `${dateStr}T${endHourStr}:${mins}:00.000Z`;

            await createCalendarEvent({
                title,
                start_time: formattedStartTime,
                end_time: formattedEndTime
            });
            onSave();
            setTitle("");
        } catch (err) {
            console.error("Failed to save calendar item:", err);
            alert("Failed to save. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                background: 'white',
                padding: '32px',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '450px',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                    Create New Event
                </h2>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Title</label>
                        <input
                            required
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Meeting with Patient"
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Time</label>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '700', color: '#64748b', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '12px',
                                border: 'none',
                                background: '#3b82f6',
                                color: 'white',
                                fontWeight: '700',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Creating...' : `Create Event`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
