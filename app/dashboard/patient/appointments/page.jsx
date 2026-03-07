"use client";

import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import styles from "../records/Records.module.css";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchAppointments, fetchDoctors, fetchMyConsultations } from "@/services/patient";
import CalendarView from "../components/CalendarView";

export default function AppointmentsPage() {
    const router = useRouter();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadAppointments();
    }, []);

    const [doctorsMap, setDoctorsMap] = useState({});

    const loadAppointments = async () => {
        setLoading(true);
        setError("");
        try {
            const [appointmentsData, consultationsData, doctorsData] = await Promise.all([
                fetchAppointments(),
                fetchMyConsultations(),
                fetchDoctors()
            ]);

            // Create map of doctor id -> name
            const dMap = {};
            if (Array.isArray(doctorsData)) {
                doctorsData.forEach(d => {
                    dMap[d.id] = d.name.startsWith("Dr.") ? d.name : `Dr. ${d.name}`;
                });
            }
            setDoctorsMap(dMap);

            // Format consultations to match appointment structure
            const consults = (consultationsData?.consultations || []).map(c => ({
                id: c.id,
                doctor_name: c.doctorName || dMap[c.doctorId] || "Doctor",
                requested_date: c.scheduledAt,
                status: c.status,
                meet_link: c.meetLink,
                is_consultation: true,
                display_notes: c.notes || "Instant meeting created by doctor"
            }));

            const combined = [
                ...appointmentsData.map(a => ({ ...a, is_consultation: false, display_notes: a.doctor_notes || a.reason })),
                ...consults
            ].sort((a, b) => new Date(b.requested_date) - new Date(a.requested_date));

            setAppointments(combined);
        } catch (err) {
            console.error("Failed to load appointments:", err);
            setError(err.message || "Failed to load your appointments. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Topbar />

            <section className={styles.wrapper}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>Personal Health Workspace</h2>
                        <p style={{ color: '#64748b' }}>Manage your appointments, track status, and join sessions.</p>
                    </div>
                    <Link href="/dashboard/patient/appointments/request">
                        <button className={styles.requestCTA} style={{ background: "linear-gradient(90deg, #359AFF, #9CCDFF)", border: "none", color: "white", padding: "10px 20px", fontWeight: "600", borderRadius: "10px", cursor: "pointer", textDecoration: "none", display: "inline-block" }}>
                            Request Appointment
                        </button>
                    </Link>
                </div>

                {error && <p style={{ color: "red", padding: "0 24px" }}>{error}</p>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', alignItems: 'start' }}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3>Session Tracking</h3>
                        </div>

                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center' }}>Loading appointments...</div>
                        ) : appointments.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center' }}>You have no appointment requests.</div>
                        ) : (
                            <div className={styles.tableContainer}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>DOCTOR</th>
                                            <th>DATE & TIME</th>
                                            <th>STATUS</th>
                                            <th>TYPE</th>
                                            <th>NOTES</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointments.map((apt) => (
                                            <tr key={apt.id}>
                                                <td>
                                                    {apt.doctor_name ||
                                                        (apt.doctor && (apt.doctor.full_name || `Dr. ${apt.doctor.first_name} ${apt.doctor.last_name}`)) ||
                                                        doctorsMap[apt.doctor_id] ||
                                                        "Unknown Doctor"}
                                                </td>
                                                <td>{new Date(apt.requested_date).toLocaleString()}</td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <span
                                                            style={{
                                                                padding: '4px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                fontWeight: '600',
                                                                background: apt.status === 'accepted' || apt.status === 'scheduled' || apt.status === 'active' ? '#dcfce7' :
                                                                    apt.status === 'completed' ? '#e0f2fe' :
                                                                    apt.status === 'declined' || apt.status === 'cancelled' ? '#fee2e2' : '#fef9c3',
                                                                color: apt.status === 'accepted' || apt.status === 'scheduled' || apt.status === 'active' ? '#166534' :
                                                                    apt.status === 'completed' ? '#0369a1' :
                                                                    apt.status === 'declined' || apt.status === 'cancelled' ? '#991b1b' : '#854d0e',
                                                                width: 'fit-content'
                                                            }}
                                                        >
                                                            {(apt.status || "PENDING").toUpperCase()}
                                                        </span>
                                                        {(apt.status === 'accepted' || apt.status === 'scheduled' || apt.status === 'active') && (
                                                            <button
                                                                onClick={() => {
                                                                    const link = apt.meetLink || apt.meet_link || apt.join_url;
                                                                    if (link) {
                                                                        window.open(link, "_blank");
                                                                    } else {
                                                                        router.push(`/dashboard/patient/video-call${apt.is_consultation ? `?consultationId=${apt.id}` : ''}`);
                                                                    }
                                                                }}
                                                                style={{
                                                                    display: "inline-flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    padding: "6px 14px",
                                                                    width: "fit-content",
                                                                    background: "#82c0ff",
                                                                    color: "white",
                                                                    border: "none",
                                                                    borderRadius: "6px",
                                                                    fontSize: "12px",
                                                                    fontWeight: "600",
                                                                    cursor: "pointer",
                                                                    marginTop: "4px"
                                                                }}
                                                            >
                                                                Join Meeting
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{ 
                                                        fontSize: '11px', 
                                                        color: apt.is_consultation ? '#3B82F6' : '#64748B',
                                                        background: apt.is_consultation ? '#EFF6FF' : '#F8FAFC',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        border: `1px solid ${apt.is_consultation ? '#DBEAFE' : '#E2E8F0'}`
                                                    }}>
                                                        {apt.is_consultation ? 'Instant Meeting' : 'Appointment'}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: '14px', color: '#64748b' }}>
                                                    {apt.display_notes || "No notes yet"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Calendar View Hidden - Backend domain missing */}
                    {/* <CalendarView appointments={appointments} /> */}
                </div>
            </section>
        </motion.div>
    );
}

