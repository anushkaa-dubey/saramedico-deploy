"use client";

import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import recordStyles from "../records/Records.module.css";
import aptStyles from "./Appointments.module.css";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchAppointments, fetchDoctors, fetchMyConsultations, updateAppointmentStatus } from "@/services/patient";
import { API_BASE_URL, getAuthHeaders } from "@/services/apiConfig";
import {
    CalendarDays,
    FileText,
    Video,
    Plus,
    Stethoscope,
    CheckCircle,
    XCircle
} from "lucide-react";
import Alert from "@/app/dashboard/components/Alert";

export default function AppointmentsPage() {
    const router = useRouter();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [doctorsMap, setDoctorsMap] = useState({});
    const [declineState, setDeclineState] = useState({ open: false, apt: null, note: "" });

    useEffect(() => {
        loadAppointments();
    }, []);

    // ── All API & backend logic is untouched ──────────────────────────────────
    const loadAppointments = async () => {
        setLoading(true);
        setError("");
        try {
            const [appointmentsData, consultationsData, doctorsData] = await Promise.all([
                fetchAppointments(),
                fetchMyConsultations(),
                fetchDoctors()
            ]);

            const dMap = {};
            const doctorsArr = Array.isArray(doctorsData) ? doctorsData : doctorsData?.results || doctorsData?.data || [];
            if (Array.isArray(doctorsArr)) {
                doctorsArr.forEach(d => {
                    const name = d.full_name || d.name || "Doctor";
                    dMap[d.id] = name.startsWith("Dr.") ? name : `Dr. ${name}`;
                });
            }
            setDoctorsMap(dMap);

            const consults = (consultationsData?.consultations || []).map(c => ({
                id: c.id,
                doctor_id: c.doctorId || c.doctor_id,
                doctor_name: c.doctorName || dMap[c.doctorId] || "Doctor",
                requested_date: c.scheduledAt,
                status: c.status,
                meet_link: c.meetLink,
                is_consultation: true,
                display_notes: c.notes || "Instant meeting created by doctor"
            }));

            const combined = [
                ...appointmentsData.map(a => ({ ...a, is_consultation: false, display_notes: a.doctor_notes || a.reason })),
                ...consults.filter(c => {
                    // Skip this consultation if it has a matching appointment with the same doctor & scheduled time
                    // Backend creates linked consultations when an appointment is approved, so they will share the same time.
                    const cTime = new Date(c.requested_date).getTime();
                    return !appointmentsData.find(a => {
                        const aTime = new Date(a.requested_date).getTime();
                        const sameDr = a.doctor_id === c.doctor_id;
                        const sameTime = Math.abs(aTime - cTime) < 60000; // within 1 minute
                        return sameDr && sameTime;
                    });
                })
            ].sort((a, b) => new Date(b.requested_date) - new Date(a.requested_date));

            setAppointments(combined);
        } catch (err) {
            console.error("Failed to load appointments:", err);
            setError(err.message || "Failed to load your appointments. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const getDoctorName = (apt) => {
        const rawName = apt.doctor_name ||
            (apt.doctor && (apt.doctor.full_name || `${apt.doctor.first_name || ''} ${apt.doctor.last_name || ''}`).trim()) ||
            doctorsMap[apt.doctor_id] ||
            "Doctor";
        if (!rawName || rawName === "Doctor" || rawName === "Unknown Doctor") return "Doctor";
        return rawName.startsWith("Dr") ? rawName : `Dr. ${rawName}`;
    };

    const handleJoin = (apt) => {
        const link = apt.meetLink || apt.meet_link || apt.join_url;
        if (link) {
            window.open(link, "_blank");
        } else {
            router.push(`/dashboard/patient/video-call${apt.is_consultation ? `?consultationId=${apt.id}` : ''}`);
        }
    };

    const handleStatusUpdate = async (apt, newStatus) => {
        if (newStatus === "rejected" || newStatus === "declined") {
            setDeclineState({ open: true, apt, note: "" });
            return;
        }

        try {
            await updateAppointmentStatus(apt.id, newStatus);
            loadAppointments();
        } catch (err) {
            console.error("Failed to update status", err);
            alert(err.message || "Failed to update status");
        }
    };

    const submitDecline = async () => {
        const { apt, note } = declineState;
        try {
            await updateAppointmentStatus(apt.id, 'rejected', note);
            setDeclineState({ open: false, apt: null, note: "" });
            loadAppointments();
        } catch (err) {
            console.error("Failed to decline", err);
            alert(err.message || "Failed to decline");
        }
    };
    // ─────────────────────────────────────────────────────────────────────────

    const isActive = (status) =>
        status === 'accepted' || status === 'scheduled' || status === 'active';

    const getStatusClass = (status) => {
        if (isActive(status)) return aptStyles.statusActive;
        if (status === 'completed') return aptStyles.statusCompleted;
        if (status === 'declined' || status === 'cancelled') return aptStyles.statusDeclined;
        return aptStyles.statusPending;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Topbar />

            <section className={recordStyles.wrapper}>

                {/* ── Page Header ── */}
                <div className={aptStyles.pageHeader}>
                    <div>
                        <h2 className={aptStyles.pageTitle}>Personal Health Workspace</h2>
                        <p className={aptStyles.pageSubtitle}>
                            Manage your appointments, track status, and join sessions.
                        </p>
                    </div>
                    <Link href="/dashboard/patient/appointments/request">
                        <button className={aptStyles.requestBtn}>
                            <Plus size={15} />
                            Request Appointment
                        </button>
                    </Link>
                </div>

                {error && <p className={aptStyles.errorMsg}>{error}</p>}

                {/* ── Session Tracking Card ── */}
                <div className={recordStyles.card}>
                    <div className={recordStyles.cardHeader}>
                        <h3 className={aptStyles.cardTitle}>Session Tracking</h3>
                    </div>

                    {loading ? (
                        <div className={aptStyles.stateMessage}>Loading appointments...</div>
                    ) : appointments.length === 0 ? (
                        <div className={aptStyles.stateMessage}>You have no appointment requests.</div>
                    ) : (
                        <>
                            {/* ── Desktop table ── */}
                            <div className={aptStyles.tableWrap}>
                                <table className={recordStyles.table}>
                                    <thead>
                                        <tr>
                                            <th>DOCTOR</th>
                                            <th>DATE &amp; TIME</th>
                                            <th>STATUS</th>
                                            <th>TYPE</th>
                                            <th>NOTES</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointments.map((apt) => (
                                            <tr key={apt.id}>
                                                <td className={aptStyles.doctorCell}>
                                                    {getDoctorName(apt)}
                                                </td>
                                                <td className={aptStyles.dateCell}>
                                                    {new Date(apt.requested_date).toLocaleString()}
                                                </td>
                                                <td>
                                                    <div className={aptStyles.statusCell}>
                                                        <span className={`${aptStyles.statusBadge} ${getStatusClass(apt.status)}`}>
                                                            {(apt.status || "PENDING").toUpperCase()}
                                                        </span>
                                                        {isActive(apt.status) && (
                                                            <button
                                                                className={aptStyles.joinBtn}
                                                                onClick={() => handleJoin(apt)}
                                                            >
                                                                <Video size={12} />
                                                                Join Meeting
                                                            </button>
                                                        )}
                                                        {apt.status === "pending" && apt.created_by === "doctor" && (
                                                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                                                <button
                                                                    className={aptStyles.joinBtn}
                                                                    style={{ background: '#22c55e' }}
                                                                    onClick={() => handleStatusUpdate(apt, 'accepted')}
                                                                >
                                                                    <CheckCircle size={12} /> Accept
                                                                </button>
                                                                <button
                                                                    className={aptStyles.joinBtn}
                                                                    style={{ background: '#ef4444' }}
                                                                    onClick={() => handleStatusUpdate(apt, 'rejected')}
                                                                >
                                                                    <XCircle size={12} /> Decline
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`${aptStyles.typeBadge} ${apt.is_consultation ? aptStyles.typeConsultation : aptStyles.typeAppointment}`}>
                                                        {apt.is_consultation ? 'Instant Meeting' : 'Appointment'}
                                                    </span>
                                                </td>
                                                <td className={aptStyles.notesCell}>
                                                    {apt.display_notes || "No notes yet"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* ── Mobile cards ── */}
                            <div className={aptStyles.cardList}>
                                {appointments.map((apt) => (
                                    <div key={apt.id} className={aptStyles.mobileCard}>

                                        <div className={aptStyles.mobileCardTop}>
                                            <span className={aptStyles.mobileCardDoctor}>
                                                {getDoctorName(apt)}
                                            </span>
                                            <span className={`${aptStyles.statusBadge} ${getStatusClass(apt.status)}`}>
                                                {(apt.status || "PENDING").toUpperCase()}
                                            </span>
                                        </div>

                                        <div className={aptStyles.mobileCardRow}>
                                            <CalendarDays size={13} />
                                            {new Date(apt.requested_date).toLocaleString()}
                                        </div>

                                        <div className={aptStyles.mobileCardRow}>
                                            <Stethoscope size={13} />
                                            <span className={`${aptStyles.typeBadge} ${apt.is_consultation ? aptStyles.typeConsultation : aptStyles.typeAppointment}`}>
                                                {apt.is_consultation ? 'Instant Meeting' : 'Appointment'}
                                            </span>
                                        </div>

                                        {apt.display_notes && (
                                            <div className={aptStyles.mobileCardNotes}>
                                                <FileText size={13} style={{ marginTop: 1, flexShrink: 0 }} />
                                                {apt.display_notes}
                                            </div>
                                        )}

                                        {isActive(apt.status) && (
                                            <button
                                                className={aptStyles.mobileJoinBtn}
                                                onClick={() => handleJoin(apt)}
                                            >
                                                <Video size={14} />
                                                Join Meeting
                                            </button>
                                        )}

                                        {apt.status === "pending" && apt.created_by === "doctor" && (
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                                <button
                                                    className={aptStyles.mobileJoinBtn}
                                                    style={{ background: '#22c55e', flex: 1 }}
                                                    onClick={() => handleStatusUpdate(apt, 'accepted')}
                                                >
                                                    <CheckCircle size={14} /> Accept
                                                </button>
                                                <button
                                                    className={aptStyles.mobileJoinBtn}
                                                    style={{ background: '#ef4444', flex: 1 }}
                                                    onClick={() => handleStatusUpdate(apt, 'rejected')}
                                                >
                                                    <XCircle size={14} /> Decline
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>

            <Alert
                isOpen={declineState.open}
                onClose={() => setDeclineState({ open: false, apt: null, note: "" })}
                title="Decline Appointment"
                message="Are you sure you want to decline this appointment? You can leave a message below."
                type="warning"
                showCancel={true}
                confirmText="Send & Decline"
                onConfirm={submitDecline}
            >
                <textarea
                    placeholder="Enter reason for declining..."
                    value={declineState.note}
                    onChange={(e) => setDeclineState({ ...declineState, note: e.target.value })}
                    style={{
                        width: "100%",
                        height: "100px",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        fontSize: "14px",
                        marginTop: "12px",
                        outline: "none",
                        fontFamily: "inherit"
                    }}
                />
            </Alert>
        </motion.div>
    );
}