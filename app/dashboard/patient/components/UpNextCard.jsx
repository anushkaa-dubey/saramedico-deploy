"use client";

import { useState, useEffect } from "react";
import styles from "../PatientDashboard.module.css";
import { useRouter } from "next/navigation";
// import { fetchAppointments } from "@/services/patient";
import { fetchConsultations } from "@/services/consultation";

export default function UpNextCard() {
  const [nextAppointment, setNextAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadNextAppointment();
  }, []);

  /**
   * Fetch next upcoming appointment
   */
  const loadNextAppointment = async () => {
    setLoading(true);
    try {
      const raw = await fetchConsultations();
      // Backend returns paginated object { items: [...] } OR a plain array
      const consultations = Array.isArray(raw) ? raw : (raw?.items || raw?.data || raw?.consultations || []);
      const now = new Date();

      const upcoming = consultations
        .filter(c => {
          const at = c.scheduledAt || c.scheduled_at || c.appointment_time;
          return (c.status === "scheduled" || c.status === "accepted") && at && new Date(at) >= now;
        })
        .sort((a, b) => {
          const aAt = a.scheduledAt || a.scheduled_at || a.appointment_time;
          const bAt = b.scheduledAt || b.scheduled_at || b.appointment_time;
          return new Date(aAt) - new Date(bAt);
        });

      if (upcoming.length > 0) {
        const c = upcoming[0];
        const date = new Date(c.scheduledAt);

        setNextAppointment({
          id: c.id,
          title: "Medical Consultation",
          time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "Video Consultation",
          doctor: c.doctorName,
          reason: c.notes,
          join_url: c.meet_link
        });
      } else {
        setNextAppointment(null);
      }
    } catch (error) {
      console.error("Failed to load next consultation:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.upNextCard}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!nextAppointment) {
    return (
      <div className={styles.upNextCard}>
        <p>No upcoming appointments</p>
      </div>
    );
  }

  return (
    <div className={styles.upNextCard}>
      <div className={styles.upNextAccent}></div>

      {/* Left Image
      <img src={nextAppointment.doctorImage} alt={nextAppointment.doctor} className={styles.upNextImage} style={{ objectFit: "cover" }} /> */}

      {/* Right Content */}
      <div className={styles.upNextContent}>
        <div className={styles.upNextTop}>
          <div className={styles.upNextTitle}>{nextAppointment.title}</div>
          <div className={styles.upNextTime}>
            <div>{nextAppointment.time}</div>
            <div style={{ fontSize: '11px', fontWeight: '400', color: '#94a3b8' }}>{nextAppointment.period}</div>
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
          <div>
            <div className={styles.infoLabel}>LAST VISIT</div>
            <div className={styles.infoValue}>{nextAppointment.lastVisit}</div>
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
    </div >
  );
}
