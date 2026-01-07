import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import RecordsTable from "./components/RecordsTable";
import styles from "./Records.module.css";

export default function RecordsPage() {
  return (
    <div className={styles.container}>
      <Sidebar />

      <main className={styles.main}>
        <Topbar />

        <section className={styles.wrapper}>

  {/* ===== PATIENT HEADER ===== */}
  <div className={styles.profileHeader}>
    <div className={styles.profileLeft}>
      <div className={styles.avatar}></div>

      <div>
        <h2 className={styles.patientName}>Jane Smith</h2>
        <div className={styles.metaRow}>
          <div>
            <span>DOB</span>
            <p>Jan 12, 1980</p>
          </div>
          <div>
            <span>GENDER</span>
            <p>Female</p>
          </div>
          <div>
            <span>MRN</span>
            <p>#8823-99</p>
          </div>
          <div>
            <span>DIAGNOSED BY</span>
            <p>Arrhythmias</p>
          </div>
        </div>
      </div>
    </div>

    <button className={styles.newVisitBtn}>＋ New Visit</button>
  </div>

  {/* ===== TABS ===== */}
  <div className={styles.tabs}>
    <div className={`${styles.tab} ${styles.active}`}>Visits</div>
    <div className={styles.tab}>Documents</div>
  </div>

  {/* ===== VISIT HISTORY ===== */}
  <div className={styles.card}>
    <div className={styles.cardHeader}>
      <h3>Visit History</h3>

      <div className={styles.filters}>
        <select>
          <option>All Types</option>
        </select>

        <select>
          <option>Last 6 Months</option>
        </select>
      </div>
    </div>

    <RecordsTable />
  </div>
</section>

      </main>
    </div>
  );
}
