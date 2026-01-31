"use client";

import { useState, useEffect } from "react";
import styles from "../PatientDashboard.module.css";
import doctorImage from "@/public/icons/images/doctor_image.png";
import { useRouter } from "next/navigation";
// TODO: Uncomment when connecting backend
import { fetchAppointments } from "@/services/patient";

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
      const appointments = await fetchAppointments();
      const now = new Date();

      // Get upcoming accepted appointments
      const upcoming = appointments
        .filter(apt => apt.status === 'accepted' && new Date(apt.requested_date) >= now)
        .sort((a, b) => new Date(a.requested_date) - new Date(b.requested_date));

      if (upcoming.length > 0) {
        const apt = upcoming[0];
        const date = new Date(apt.requested_date);
        setNextAppointment({
          id: apt.id,
          title: apt.reason || "Medical Consultation",
          time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(' ')[0],
          period: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(' ')[1],
          type: "Video Consultation",
          doctor: apt.doctor_name || (apt.doctor && apt.doctor.full_name) || "Dr. Sara",
          reason: apt.reason || "General checkup",
          lastVisit: "N/A",
          doctorImage: doctorImage.src,
          join_url: apt.join_url || apt.zoom_url
        });
      } else {
        setNextAppointment(null);
      }
    } catch (error) {
      console.error("Failed to load next appointment:", error);
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
      {/* Blue Accent */}
      <div className={styles.upNextAccent}></div>

      {/* Left Image */}
      <img src={nextAppointment.doctorImage} alt={nextAppointment.doctor} className={styles.upNextImage} style={{ objectFit: "cover" }} />

      {/* Right Content */}
      <div className={styles.upNextContent}>
        {/* Title + Time */}
        <div className={styles.upNextTop}>
          <div className={styles.upNextTitle}>{nextAppointment.title}</div>
          <div className={styles.upNextTime}>
            <div>{nextAppointment.time}</div>
            <div style={{ fontSize: '11px', fontWeight: '400', color: '#94a3b8' }}>{nextAppointment.period}</div>
          </div>
        </div>

        {/* Tag + Doctor */}
        <div className={styles.upNextMeta}>
          <span className={styles.visitTag}>{nextAppointment.type}</span>
          <span>with {nextAppointment.doctor}</span>
        </div>

        {/* Reason / Last Visit - Hidden on mobile via CSS */}
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

        {/* Actions */}
        <div className={styles.upNextActions}>
          <button
            className={styles.checkinBtn}
            onClick={() => router.push("/dashboard/patient/video-call")}
          >
            Join Session
          </button>
          <button className={styles.detailsBtn}>Details</button>
        </div>
      </div>
    </div >
  );
}
