import { useState, useEffect } from "react";
import { fetchAppointments } from "@/services/patient";
import styles from "../PatientDashboard.module.css";

export default function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const data = await fetchAppointments();
        // Show last 3 appointments for dashboard
        setActivities(data.slice(0, 3));
      } catch (err) {
        console.error("Failed to load patient activities:", err);
      } finally {
        setLoading(false);
      }
    };
    loadActivities();
  }, []);

  if (loading) return <div className={styles.card}><p>Loading activity...</p></div>;

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
            {activities.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>No recent activity</td></tr>
            ) : activities.map((item, idx) => (
              <tr className={styles.activityRow} key={idx}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className={styles.avatarSmall}></div>
                    <span>{item.doctor_name || "Dr. Sara"}</span>
                  </div>
                </td>
                <td>{item.reason || "Consultation"}</td>
                <td style={{ color: "#64748b" }}>{new Date(item.requested_date).toLocaleDateString()}</td>
                <td>
                  <span className={item.status === 'accepted' ? styles.statusCompleted : styles.statusReview}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile-only list view */}
      <div className={styles.activityList}>
        {activities.map((item, idx) => (
          <div className={styles.activityListItem} key={idx}>
            <div className={styles.doctorInfo}>
              <div className={styles.avatarCircle}></div>
              <div>
                <span className={styles.docName}>{item.doctor_name || "Dr. Sara"}</span>
                <span className={styles.visitMeta}>{new Date(item.requested_date).toLocaleDateString()} • {item.reason}</span>
              </div>
            </div>
            <span className={`${styles.statusBadge} ${item.status === 'accepted' ? styles.ready : styles.pending}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div >
  );
}
