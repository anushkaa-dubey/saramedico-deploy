import { useState, useEffect } from "react";
import { fetchAppointments } from "@/services/patient";
import styles from "../PatientDashboard.module.css";
import { useRouter } from "next/navigation";

export default function RecentActivity({ consultations, appointments }) {
  const router = useRouter();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();

    const listCons = (Array.isArray(consultations) ? consultations : [])
      .filter(c => {
        const isPast = (c.visitState === "completed" || c.status === "completed" || new Date(c.scheduledAt || c.scheduled_at) < now);
        return isPast;
      })
      .map(c => ({
        id: c.id,
        doctorName: c.doctorName || c.doctor_name || "Doctor",
        chiefComplaint: c.chiefComplaint || c.chief_complaint || "Consultation",
        date: c.scheduledAt || c.scheduled_at,
        status: c.visitState || c.status,
        type: 'Consultation'
      }));

    const listAppts = (Array.isArray(appointments) ? appointments : [])
      .filter(a => {
        const isPast = (a.status === "completed" || a.status === "cancelled" || a.status === "declined" || new Date(a.requested_date || a.appointment_date) < now);
        return isPast;
      })
      .map(a => ({
        id: a.id,
        doctorName: a.doctor_name || "Doctor",
        chiefComplaint: a.reason || "Appointment",
        date: a.requested_date || a.appointment_date,
        status: a.status,
        type: 'Appointment'
      }));

    // Deduplicate if same ID exists (unlikely in different modules but possible in merged views)
    const combinedMap = new Map();
    [...listCons, ...listAppts].forEach(item => {
      if (!combinedMap.has(item.id)) {
        combinedMap.set(item.id, item);
      }
    });

    const combined = Array.from(combinedMap.values())
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5); // Show top 5 recent activities

    setActivities(combined);
    setLoading(false);
  }, [consultations, appointments]);

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
                    <span>
                      {(() => {
                        let name = item.doctorName || item.doctor_name || "Doctor";
                        if (name === "Doctor") return "Doctor";
                        return name.startsWith('Dr. ') ? name : `Dr. ${name}`;
                      })()}
                    </span>
                  </div>
                </td>
                <td>
                  {typeof (item.chiefComplaint || item.chief_complaint || item.reason) === 'object'
                    ? ((item.chiefComplaint || item.chief_complaint || item.reason)?.chief_complaint || "Consultation")
                    : (item.chiefComplaint || item.chief_complaint || item.reason || "Consultation")}
                </td>
                <td style={{ color: "#64748b" }}>
                  {item.date ? new Date(item.date).toLocaleDateString() : "—"}
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
                <span className={styles.docName}>
                  {(() => {
                    let name = item.doctorName || item.doctor_name || "Doctor";
                    if (name === "Doctor") return "Doctor";
                    return name.startsWith('Dr. ') ? name : `Dr. ${name}`;
                  })()}
                </span>
                <span className={styles.visitMeta}>
                  {item.date ? new Date(item.date).toLocaleDateString() : "—"} • {item.chiefComplaint}
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
