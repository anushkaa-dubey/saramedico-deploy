"use client";
import { useState, useEffect, Suspense } from "react";
import Topbar from "../components/Topbar";
import styles from "../DoctorDashboard.module.css";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchAppointments, approveAppointment, updateAppointmentStatus, fetchPatients } from "@/services/doctor";

function AppointmentsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const statusFilter = searchParams.get('status');
    const filterParam = searchParams.get('filter');
    const priorityFilter = searchParams.get('priority');

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [patientsMap, setPatientsMap] = useState({});

    useEffect(() => {
        loadAppointments();
    }, [statusFilter, filterParam]);

    const loadAppointments = async () => {
        setLoading(true);
        setError("");
        try {
            const [appointmentsData, patientsData] = await Promise.all([
                fetchAppointments(),
                fetchPatients()
            ]);

            const pMap = {};
            if (Array.isArray(patientsData)) {
                patientsData.forEach(p => {
                    if (p.id) pMap[p.id] = p;
                });
            }
            setPatientsMap(pMap);
            
            let filtered = appointmentsData || [];
            
            if (statusFilter) {
                filtered = filtered.filter(a => (a.status || '').toLowerCase() === statusFilter.toLowerCase());
            }

            if (priorityFilter) {
                filtered = filtered.filter(a => (a.priority || '').toLowerCase() === priorityFilter.toLowerCase());
            }
            
            if (filterParam === 'today') {
                const today = new Date().toISOString().split('T')[0];
                filtered = filtered.filter(a => {
                    const dateStr = a.requested_date || a.scheduled_at || a.date;
                    if (!dateStr) return false;
                    const dateObj = new Date(dateStr);
                    if (isNaN(dateObj.getTime())) return false;
                    return dateObj.toISOString().split('T')[0] === today;
                });
            }
            
            setAppointments(filtered);
        } catch (error) {
            console.error("Failed to load data:", error);
            setError("Failed to load appointments. Please ensure you are logged in.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (appointment, status) => {
        const id = appointment.id || appointment;

        try {
            if (status === 'accepted') {
                const appointmentTime = appointment.requested_date || new Date().toISOString();
                const updated = await approveAppointment(id, {
                    appointment_time: appointmentTime
                });

                setAppointments(prev => prev.map(apt =>
                    apt.id === id ? {
                        ...apt,
                        status: 'accepted',
                        start_url: updated.start_url,
                        join_url: updated.join_url
                    } : apt
                ));
            } else {
                await updateAppointmentStatus(id, status);
                setAppointments(prev => prev.map(apt =>
                    apt.id === id ? { ...apt, status } : apt
                ));
            }
        } catch (error) {
            console.error("Failed to update status:", error);
            alert(error.message || "Failed to update status");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ width: "100%" }}
        >
            <Topbar />

            <section className={styles.header}>
                <div>
                    <h2 className={styles.greeting}>Appointment Requests</h2>
                    <p className={styles.sub}>
                        {statusFilter ? `Showing ${statusFilter} requests` : 
                         filterParam === 'today' ? "Showing today's requests" : 
                         "Manage your consultation requests"}
                    </p>
                </div>
            </section>

            {error && <p style={{ color: "red", padding: "0 24px" }}>{error}</p>}

            <div className={styles.card} style={{ margin: "24px" }}>
                {loading ? (
                    <div style={{ padding: "40px", textAlign: "center" }}>Loading requests...</div>
                ) : appointments.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                        <h4>No Results Found</h4>
                        <p>No appointment requests match your current filters.</p>
                        <button 
                            onClick={() => router.push('/dashboard/doctor/appointments')}
                            style={{ marginTop: '16px', padding: '8px 16px', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>PATIENT</th>
                                    <th>DATE & TIME</th>
                                    <th>REASON</th>
                                    <th>STATUS</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map((apt) => (
                                    <tr key={apt.id}>
                                        <td>
                                            {
                                                apt.patient_name ||
                                                apt.patientName ||
                                                (apt.patient && (apt.patient.full_name || (apt.patient.first_name ? `${apt.patient.first_name} ${apt.patient.last_name}` : null))) ||
                                                (patientsMap[apt.patient_id] && (patientsMap[apt.patient_id].name || patientsMap[apt.patient_id].full_name)) ||
                                                (apt.user && apt.user.full_name) ||
                                                "Unknown Patient"
                                            }
                                        </td>
                                        <td>{new Date(apt.requested_date || apt.date).toLocaleString()}</td>
                                        <td>{apt.reason}</td>
                                        <td>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                <span
                                                    className={
                                                        apt.status === 'pending' ? styles.inReview : 
                                                        (apt.status === 'accepted' || apt.status === 'completed') ? styles.completed :
                                                        styles.pending
                                                    }
                                                    style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "12px", width: "fit-content", fontWeight: "600" }}
                                                >
                                                    {apt.status.toUpperCase()}
                                                </span>
                                                {apt.created_by === 'doctor' && (
                                                    <span style={{ fontSize: '11px', color: '#6366f1', background: '#eef2ff', padding: '2px 8px', borderRadius: '12px', width: 'fit-content', fontWeight: 600 }}>
                                                        You Scheduled
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {apt.status === 'pending' ? (
                                                apt.created_by === 'doctor' ? (
                                                    <span style={{ fontSize: '12px', color: '#6366f1', background: '#eef2ff', padding: '6px 14px', borderRadius: '12px', fontWeight: 600, display: 'inline-block' }}>
                                                        Patient Approval Pending
                                                    </span>
                                                ) : (
                                                    <div style={{ display: "flex", gap: "8px" }}>
                                                        <button
                                                            onClick={() => handleStatusChange(apt, 'accepted')}
                                                            style={{ 
                                                                background: "#22c55e", 
                                                                color: "white", 
                                                                border: "none", 
                                                                padding: "6px 14px", 
                                                                borderRadius: "8px", 
                                                                cursor: "pointer",
                                                                fontWeight: "600",
                                                                fontSize: "12px",
                                                                transition: "background 0.2s"
                                                            }}
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(apt, 'declined')}
                                                            style={{ 
                                                                background: "#ef4444", 
                                                                color: "white", 
                                                                border: "none", 
                                                                padding: "6px 14px", 
                                                                borderRadius: "8px", 
                                                                cursor: "pointer",
                                                                fontWeight: "600",
                                                                fontSize: "12px",
                                                                transition: "background 0.2s"
                                                            }}
                                                        >
                                                            Deny
                                                        </button>
                                                    </div>
                                                )
                                            ) : (apt.status === 'accepted' || apt.status === 'scheduled') && 
                                                !(apt.completion_time || apt.completionTime) && 
                                                (apt.visit_state || apt.visitState) !== 'completed' ? (
                                                <button
                                                    onClick={() => router.push(`/dashboard/doctor/video-call?appointmentId=${apt.id}`)}
                                                    style={{
                                                        background: "#3b82f6",
                                                        color: "white",
                                                        border: "none",
                                                        padding: "8px 16px",
                                                        borderRadius: "8px",
                                                        fontSize: "12px",
                                                        fontWeight: "bold",
                                                        cursor: "pointer",
                                                        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)"
                                                    }}
                                                >
                                                    Start Meeting
                                                </button>
                                            ) : (
                                                apt.status === 'rejected' || apt.status === 'declined' ? (
                                                    <div style={{ maxWidth: "200px" }}>
                                                        {(apt.reschedule_note || apt.patient_note || apt.notes) ? (
                                                            <span style={{
                                                                fontSize: "12px",
                                                                color: "#64748b",
                                                                background: "#fef2f2",
                                                                border: "1px solid #fee2e2",
                                                                borderRadius: "8px",
                                                                padding: "5px 10px",
                                                                lineHeight: "1.5",
                                                                display: "block",
                                                                fontStyle: "italic"
                                                            }}>
                                                                💬 {apt.reschedule_note || apt.patient_note || apt.notes}
                                                            </span>
                                                        ) : (
                                                            <span style={{ fontSize: "12px", color: "#94a3b8" }}>No reason provided</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>
                                                        {apt.status === 'completed' ? 'Completed' : 'No Actions'}
                                                    </span>
                                                )
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default function DoctorAppointments() {
    return (
        <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>}>
            <AppointmentsContent />
        </Suspense>
    );
}
