import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import UpNextCard from "./components/UpNextCard";
import Vitals from "./components/Vitals";
import RecentActivity from "./components/RecentActivity";
import QuickActions from "./components/QuickActions";
import styles from "./PatientDashboard.module.css";

export default function PatientDashboard() {
  return (
    <div className={styles.container}>
      <Sidebar />

      <main className={styles.main}>
        <Topbar />

        <section className={styles.header}>
  <div>
    <h2 className={styles.greeting}>Good Morning, Daniel</h2>
    <p className={styles.sub}>Today is Tuesday, October 24, 2023</p>
  </div>

  <div className={styles.headerActions}>
    <button className={styles.iconBtn}>☁</button>
    <button className={styles.iconBtn}>👤</button>
    <button className={styles.outlineBtn}>Schedule</button>
    <button className={styles.primaryBtn}>Start Session</button>
  </div>
</section>


        <section className={styles.grid}>
          <div className={styles.leftCol}>
            <UpNextCard />
            <RecentActivity />
          </div>

          <div className={styles.rightCol}>
            <Vitals />
            <QuickActions />
          </div>
        </section>
      </main>
    </div>
  );
}
