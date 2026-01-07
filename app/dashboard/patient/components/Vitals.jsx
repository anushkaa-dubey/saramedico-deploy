import styles from "../PatientDashboard.module.css";

export default function Vitals() {
  return (
    <>
      <div className={styles.vitalCard}>
        <div className={styles.vitalLeft}>
          <div className={styles.vitalIcon}>❤️</div>
          <div>
            <div className={styles.vitalLabel}>HEART RATE</div>
            <div className={styles.vitalValue}>72 bpm</div>
          </div>
        </div>
        <span className={styles.status}>Normal</span>
      </div>

      <div className={styles.vitalCard}>
        <div className={styles.vitalLeft}>
          <div className={styles.vitalIcon}>🩺</div>
          <div>
            <div className={styles.vitalLabel}>BLOOD PRESSURE</div>
            <div className={styles.vitalValue}>120/80</div>
          </div>
        </div>
        <span className={styles.status}>Normal</span>
      </div>

      <div className={styles.vitalCard}>
        <div className={styles.vitalLeft}>
          <div className={styles.vitalIcon}>⚖</div>
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
