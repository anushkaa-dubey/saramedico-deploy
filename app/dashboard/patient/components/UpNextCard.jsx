"use client";

import styles from "../PatientDashboard.module.css";
import { useRouter } from "next/navigation";

export default function UpNextCard({ consultations = [] }) {
  const router = useRouter();

  // API response shape (camelCase per spec):
  // { id, scheduledAt, status, doctorId, doctorName, meetLink, chiefComplaint, visitState, notes, ... }
  const now = new Date();

  const upcoming = consultations
    .filter(c => {
      // visitState is the UI state — "scheduled" means upcoming
      // Also check status field as fallback
      const at = c.scheduledAt;
      const isUpcoming = (c.visitState === "scheduled" || c.status === "scheduled" || c.status === "accepted");
      return isUpcoming && at && new Date(at) >= now;
    })
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  if (upcoming.length === 0) {
    return (
      <div className={styles.upNextCard}>
        <p style={{ color: "#94a3b8", fontSize: "14px" }}>No upcoming appointments</p>
      </div>
    );
  }

  const c = upcoming[0];
  const date = new Date(c.scheduledAt);
  const isValid = !isNaN(date.getTime());

  const nextAppointment = {
    id: c.id,
    title: c.chiefComplaint || "Medical Consultation",
    date: isValid ? date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "—",
    time: isValid ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
    type: "Video Consultation",
    doctor: c.doctorName || "Your Doctor",
    reason: c.chiefComplaint || c.notes || "Consultation",
    join_url: c.meetLink || null,
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

        <div className={styles.upNextInfo}>
          <div>
            <div className={styles.infoLabel}>REASON FOR VISIT</div>
            <div className={styles.infoValue}>{nextAppointment.reason}</div>
          </div>
        </div>

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
