import styles from "../PatientDashboard.module.css";
import heart_rate from "@/public/icons/heart_rate.svg";
import blood_pressure from "@/public/icons/blood_pressure.svg";
import weight from "@/public/icons/weight.svg";

export default function Vitals() {
  return (
    <>
      <div className={styles.vitalCard}>
        <div className={styles.vitalLeft}>
          <div className={styles.vitalIcon}>
            <img src={heart_rate.src} alt="Heart Rate" width="20" height="20" />
          </div>
          <div>
            <div className={styles.vitalLabel}>HEART RATE</div>
            <div className={styles.vitalValue}>72 bpm</div>
          </div>
        </div>
        <span className={styles.status}>Normal</span>
      </div>

      <div className={styles.vitalCard}>
        <div className={styles.vitalLeft}>
          <div className={styles.vitalIcon}>
            <img src={blood_pressure.src} alt="Blood Pressure" width="20" height="20" />
          </div>
          <div>
            <div className={styles.vitalLabel}>BLOOD PRESSURE</div>
            <div className={styles.vitalValue}>120/80</div>
          </div>
        </div>
        <span className={styles.status}>Normal</span>
      </div>

      <div className={styles.vitalCard}>
        <div className={styles.vitalLeft}>
          <div className={styles.vitalIcon}>
            <img src={weight.src} alt="Weight" width="20" height="20" />
          </div>
          <div>
            <div className={styles.vitalLabel}>WEIGHT</div>
            <div className={styles.vitalValue}>145 lbs</div>
          </div>
        </div>
        <span className={styles.status}>Normal</span>
      </div>
    </>
  );
}
