"use client";

import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import recordStyles from "../records/Records.module.css";
import aptStyles from "./Appointments.module.css";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchAppointments, fetchDoctors, fetchMyConsultations } from "@/services/patient";
import {
    CalendarDays,
    FileText,
    Video,
    Plus,
    Stethoscope,
} from "lucide-react";

export default function AppointmentsPage() {
    const router = useRouter();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [doctorsMap, setDoctorsMap] = useState({});

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
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>
        </motion.div>
    );
}