import styles from "../PatientDashboard.module.css";

import doctorImage from "@/public/icons/images/doctor_image.png";

export default function UpNextCard() {
  return (
    <div className={styles.upNextCard}>
      {/* Blue Accent */}
      <div className={styles.upNextAccent}></div>

      {/* Left Image */}
      <img src={doctorImage.src} alt="Dr. Emily" className={styles.upNextImage} style={{ objectFit: "cover" }} />

      {/* Right Content */}
      <div className={styles.upNextContent}>
        {/* Title + Time */}
        <div className={styles.upNextTop}>
          <div className={styles.upNextTitle}>Annual Physical Examination</div>
          <div className={styles.upNextTime}>10:30 AM</div>
        </div>

        {/* Tag + Doctor */}
        <div className={styles.upNextMeta}>
          <span className={styles.visitTag}>In-Person Visit</span>
          <span>with Dr. Emily Chen</span>
        </div>

        {/* Reason / Last Visit */}
        <div className={styles.upNextInfo}>
          <div>
            <div className={styles.infoLabel}>REASON FOR VISIT</div>
            <div className={styles.infoValue}>Post-op check</div>
          </div>
          <div>
            <div className={styles.infoLabel}>LAST VISIT</div>
            <div className={styles.infoValue}>Oct 12, 2025</div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.upNextActions}>
          <button className={styles.checkinBtn}>Check-in Now</button>
          <button className={styles.detailsBtn}>Details</button>
        </div>
      </div>
    </div>
  );
}
