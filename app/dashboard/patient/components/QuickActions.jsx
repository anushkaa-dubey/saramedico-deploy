import styles from "../PatientDashboard.module.css";

export default function QuickActions() {
  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>QUICK ACTIONS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
        {/* <button
          onClick={() => window.location.href = "/dashboard/patient/records"}
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: '600', color: '#1e293b', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span style={{ color: '#3b82f6' }}>✦</span> AI Health Assistant
        </button> */}
        <button
          onClick={() => window.location.href = "/dashboard/patient/appointments/request"}
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: 'linear-gradient(90deg, #359AFF, #9CCDFF)', color: '#fff', cursor: 'pointer', fontWeight: '600', textAlign: 'center' }}
        >
          Book New Visit
        </button>
      </div>
    </div>
  );
}
