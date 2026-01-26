"use client";

import { useState, useEffect } from "react";
import styles from "../PatientDashboard.module.css";
import doctorImage from "@/public/icons/images/doctor_image.png";
// TODO: Uncomment when connecting backend
// import { fetchAppointments } from "@/services/patient";

export default function UpNextCard() {
  const [nextAppointment, setNextAppointment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNextAppointment();
  }, []);

  /**
   * Fetch next upcoming appointment
   */
  const loadNextAppointment = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const appointments = await fetchAppointments();
      // const upcoming = appointments.filter(apt => new Date(apt.date) > new Date());
      // setNextAppointment(upcoming[0] || null);

      // TEMPORARY: Using dummy data
      const dummyAppointment = {
        id: 1,
        title: "Annual Physical Examination",
        time: "10:30",
        period: "AM",
        type: "In-Person Visit",
        doctor: "Dr. Emily Chen",
        reason: "Post-op check",
        lastVisit: "Oct 12, 2025",
        doctorImage: doctorImage.src
      };
      setNextAppointment(dummyAppointment);
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
          <button className={styles.checkinBtn}>Check-in</button>
          <button className={styles.detailsBtn}>Details</button>
        </div>
      </div>
    </div>
  );
}
