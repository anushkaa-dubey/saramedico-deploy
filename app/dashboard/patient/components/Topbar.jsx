import styles from "../PatientDashboard.module.css";

export default function Topbar() {
  return (
    <div className={styles.topbar}>
      <input className={styles.search} placeholder="Search patients, reports, notes..." />

      <div className={styles.profile}>
        <span>🔔</span>
        <div className={styles.avatar}></div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Dr. Sarah Smith</div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>Cardiology</div>
        </div>
      </div>
    </div>
  );
}
