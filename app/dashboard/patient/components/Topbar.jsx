import styles from "../PatientDashboard.module.css";

export default function Topbar() {
  return (
    <div className={styles.topbar}>
      <input
        className={styles.search}
        placeholder="Search patients, appointments, notes..."
      />

      <div className={styles.topActions}>
        <button className={styles.iconBtn}>🔔</button>
        <button className={styles.iconBtn}>👤</button>

        <div className={styles.profile}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
            Dr. Sarah Smith
          </span>
          <small style={{ color: "#94a3b8", fontSize: "12px" }}>Patient</small>
        </div>
      </div>
    </div>
  );
}
