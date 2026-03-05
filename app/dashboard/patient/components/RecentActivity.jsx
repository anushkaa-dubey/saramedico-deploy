import { useState, useEffect } from "react";
import { fetchAppointments } from "@/services/patient";
import styles from "../PatientDashboard.module.css";
import { useRouter } from "next/navigation";

export default function RecentActivity({ consultations }) {
  const router = useRouter();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If consultations are passed from parent, use them; otherwise fetch
    if (consultations !== undefined) {
      // Map consultations to activity shape
      const mapped = (Array.isArray(consultations) ? consultations : []).slice(0, 3);
      setActivities(mapped);
      setLoading(false);
      return;
    }
    const loadActivities = async () => {
      try {
        const data = await fetchAppointments();
        setActivities(data.slice(0, 3));
      } catch (err) {
        console.error("Failed to load patient activities:", err);
      } finally {
        setLoading(false);
      }
    };
    loadActivities();
  }, [consultations]);

  if (loading) return <div className={styles.card}><p>Loading activity...</p></div>;

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>
        <span>Recent Visits</span>
        <span
          style={{ color: "#2563eb", fontSize: "12px", cursor: "pointer" }}
          onClick={() => router.push("/dashboard/patient/appointments")}
        >
          View All
        </span>
      </div>

      <div className={styles.activityTableContainer}>
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
                    <span>{item.doctorName || item.doctor_name || item.doctor?.full_name || "Doctor"}</span>
                  </div>
                </td>
                <td>{item.chiefComplaint || item.chief_complaint || item.reason || "Consultation"}</td>
                <td style={{ color: "#64748b" }}>
                  {(() => {
                    const d = item.scheduledAt || item.scheduled_at || item.appointment_time || item.requested_date;
                    return d ? new Date(d).toLocaleDateString() : "—";
                  })()}
                </td>
                <td>
                  <span className={(item.visitState === 'scheduled' || item.status === 'accepted' || item.status === 'scheduled') ? styles.statusCompleted : styles.statusReview}>
                    {(item.visitState || item.status)
                      ? (item.visitState || item.status).charAt(0).toUpperCase() + (item.visitState || item.status).slice(1)
                      : "—"}
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
                <span className={styles.docName}>{item.doctorName || item.doctor_name || item.doctor?.full_name || "Doctor"}</span>
                <span className={styles.visitMeta}>
                  {(() => { const d = item.scheduledAt || item.scheduled_at || item.requested_date; return d ? new Date(d).toLocaleDateString() : "—"; })()} • {item.chiefComplaint || item.chief_complaint || item.reason || "Consultation"}
                </span>
              </div>
            </div>
            <span className={`${styles.statusBadge} ${(item.visitState === 'scheduled' || item.status === 'accepted' || item.status === 'scheduled') ? styles.ready : styles.pending}`}>
              {item.visitState || item.status || "—"}
            </span>
          </div>
        ))}
      </div>
    </div >
  );
}
