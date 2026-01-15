import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import UpNextCard from "./components/UpNextCard";
import Vitals from "./components/Vitals";
import RecentActivity from "./components/RecentActivity";
import QuickActions from "./components/QuickActions";
import styles from "./PatientDashboard.module.css";
import uploadIcon from "@/public/icons/upload.svg";
import personIcon from "@/public/icons/person.svg";
import scheduleIcon from "@/public/icons/schedule.svg";
import micWhiteIcon from "@/public/icons/mic_white.svg";

export default function PatientDashboard() {
  return (
    <div className={styles.container}>
      <Sidebar />

      <main className={styles.main}>
        <Topbar />

        <section className={styles.header}>
          <div>
            <h2 className={styles.greeting}>Good Morning, Daniel</h2>
            <p className={styles.sub}>Today is Thursday, January 16, 2026</p>
          </div>

          <div className={styles.headerActions}>
            <button className={styles.iconBtn}>
              <img src={uploadIcon.src} alt="Upload" width="20" height="20" />
            </button>
            <button className={styles.iconBtn}>
              <img src={personIcon.src} alt="Add Person" width="20" height="20" />
            </button>
            <button className={styles.outlineBtn}>
              <img src={scheduleIcon.src} alt="Schedule" width="16" height="16" />
              Schedule
            </button>
            <button className={styles.primaryBtn}>
              <img src={micWhiteIcon.src} alt="Start Session" width="16" height="16" />
              Start Session
            </button>
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
