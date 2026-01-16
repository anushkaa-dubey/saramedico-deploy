import styles from "../PatientDashboard.module.css";

export default function RecentActivity() {
  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>
        <span>Recent Activity</span>
        <span style={{ color: "#2563eb", fontSize: "12px", cursor: "pointer" }}>
          View All
        </span>
      </div>

      <div className={styles.activityTableContainer}>
        {/* Header Row */}
        <div className={styles.tableHeaderRow}>
          <div>DOCTOR</div>
          <div>ACTIVITY</div>
          <div>DATE/TIME</div>
          <div>STATUS</div>
        </div>

        <table className={styles.activityTable}>
          <tbody>
            <tr className={styles.activityRow}>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className={styles.avatarSmall}></div>
                  <span>John Von</span>
                </div>
              </td>
              <td>Lab Results Reviewed</td>
              <td style={{ color: "#64748b" }}>Today, 9:15 AM</td>
              <td>
                <span className={styles.statusCompleted}>Completed</span>
              </td>
            </tr>

            <tr className={styles.activityRow}>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className={styles.avatarSmall}></div>
                  <span>John Von</span>
                </div>
              </td>
              <td>Operation</td>
              <td style={{ color: "#64748b" }}>Yesterday, 4:30 PM</td>
              <td>
                <span className={styles.statusReview}>In Review</span>
              </td>
            </tr>

            <tr className={styles.activityRow}>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className={styles.avatarSmall}></div>
                  <span>John Von</span>
                </div>
              </td>
              <td>Check-up</td>
              <td style={{ color: "#64748b" }}>Sept 12, 2:10 PM</td>
              <td>
                <span className={styles.statusCompleted}>Completed</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div >
  );
}
