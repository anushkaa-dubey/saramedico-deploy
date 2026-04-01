"use client";

import styles from "../PatientDashboard.module.css";
import { useRouter } from "next/navigation";

export default function UpNextCard({ consultations = [], appointments = [] }) {
  const router = useRouter();

  const now = new Date();

  // visitState is the UI state — "scheduled" means upcoming
  // Also check status field as fallback
  // Exclude completed/cancelled/declined consultations
  const upcomingCons = (Array.isArray(consultations) ? consultations : [])
    .filter(c => {
      const isActive = (c.visitState === "scheduled" || c.status === "scheduled" || c.status === "accepted");
      const isCompleted = (c.status === "completed" || c.status === "cancelled" || c.status === "declined" || c.status === "rejected");
      return isActive && !isCompleted && c.scheduledAt && new Date(c.scheduledAt) >= now;
    })
    .map(c => ({
      id: c.id,
      scheduledAt: c.scheduledAt,
      doctorName: c.doctorName,
      chiefComplaint: c.chiefComplaint,
      meetLink: c.meetLink,
      notes: c.notes,
      type: "Consultation"
    }));

  // Exclude completed/cancelled/declined appointments
  const upcomingAppts = (Array.isArray(appointments) ? appointments : [])
    .filter(a => {
      const isActive = (a.status === "scheduled" || a.status === "accepted" || a.status === "approved");
      const isCompleted = (a.status === "completed" || a.status === "cancelled" || a.status === "declined" || a.status === "rejected");
      return isActive && !isCompleted && a.requested_date && new Date(a.requested_date) >= now;
    })
    .map(a => ({
      id: a.id,
      scheduledAt: a.requested_date,
      doctorName: a.doctor_name,
      chiefComplaint: a.reason,
      meetLink: a.meet_link,
      notes: null,
      type: "Appointment"
    }));

  // Deduplicate: If an appointment and consultation exist for the same doctor at the same time, pick only one
  const sessionMap = new Map();
  [...upcomingCons, ...upcomingAppts].forEach(item => {
    const key = `${item.scheduledAt}_${item.doctorName}`;
    if (!sessionMap.has(key)) {
      sessionMap.set(key, item);
    }
  });

  const combined = Array.from(sessionMap.values())
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  if (combined.length === 0) {
    return (
      <div className={styles.upNextCard}>
        <p style={{ color: "#94a3b8", fontSize: "14px" }}>No upcoming appointments</p>
      </div>
    );
  }

  const c = combined[0];
  const date = new Date(c.scheduledAt);
  const isValid = !isNaN(date.getTime());

  const doctorRaw = c.doctorName || "Doctor";
  const doctorDisplayName = (!doctorRaw || doctorRaw === "Doctor")
    ? "Doctor"
    : (doctorRaw.startsWith('Dr. ') ? doctorRaw : `Dr. ${doctorRaw}`);

  const nextAppointment = {
    id: c.id,
    title: c.chiefComplaint || "Medical Consultation",
    date: isValid ? date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "—",
    time: isValid ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
    type: c.type === "Consultation" ? "Video Consultation" : "Appointment",
    doctor: doctorDisplayName,
    reason: c.chiefComplaint || c.notes || "Consultation",
    join_url: c.meetLink || c.meet_link || null,
  };

  return (
    <div className={styles.upNextCard}>
      <div className={styles.upNextAccent}></div>

      <div className={styles.upNextContent}>
        <div className={styles.upNextTop}>
          <div className={styles.upNextTitle}>{nextAppointment.title}</div>
          <div className={styles.upNextTime}>
            <div>{nextAppointment.time}</div>
            <div style={{ fontSize: "11px", fontWeight: "400", color: "#94a3b8" }}>{nextAppointment.date}</div>
          </div>
        </div>

        <div className={styles.upNextMeta}>
          <span className={styles.visitTag}>{nextAppointment.type}</span>
          <span>with {nextAppointment.doctor}</span>
        </div>

        {nextAppointment.reason && nextAppointment.reason !== nextAppointment.title && (
          <div className={styles.upNextInfo}>
            <div>
              <div className={styles.infoLabel}>REASON FOR VISIT</div>
              <div className={styles.infoValue}>{nextAppointment.reason}</div>
            </div>
          </div>
        )}

        <div className={styles.upNextActions}>
          <button
            className={styles.checkinBtn}
            onClick={() => {
              if (nextAppointment.join_url) {
                window.open(nextAppointment.join_url, "_blank");
              } else {
                router.push("/dashboard/patient/video-call");
              }
            }}
          >
            Join Session
          </button>
          <button className={styles.detailsBtn} onClick={() => router.push("/dashboard/patient/appointments")}>Details</button>
        </div>
      </div>
    </div>
  );
}
