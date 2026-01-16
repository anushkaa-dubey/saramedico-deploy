"use client";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import TasksSection from "./components/TasksSection";
import styles from "./DoctorDashboard.module.css";
import uploadIcon from "@/public/icons/upload.svg";
import personIcon from "@/public/icons/person.svg";
import scheduleIcon from "@/public/icons/schedule.svg";
import micWhiteIcon from "@/public/icons/mic_white.svg";
import Daniel from "@/public/icons/images/Daniel.png";
import { useRouter } from "next/navigation";

export default function DoctorDashboard() {
  const router = useRouter();
  return (
    <div className={styles.container}>
      <Sidebar />

      <main className={styles.main}>
        <Topbar />

        <section className={styles.header}>
          <div>
            <h2 className={styles.greeting}>Good Morning, Dr. Sarah</h2>
            <p className={styles.sub}>Here's your schedule overview for today</p>
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
            <button className={styles.primaryBtn} onClick={() => router.push("/dashboard/doctor/video-call")}>
              <img src={micWhiteIcon.src} alt="Start Session" width="16" height="16" />
              Start Session
            </button>
          </div>
        </section>

        <section className={styles.grid}>
          {/* LEFT COLUMN */}
          <div className={styles.leftCol}>
            {/* Patient Profile Card */}
            <div className={styles.profileCard}>
              <div className={styles.profileImage}>
                <img src={Daniel.src} alt="Daniel" />
              </div>
              <div className={styles.profileContent}>
                <div className={styles.profileName}>Daniel Benjamin</div>
                <div className={styles.profileType}>Follow-Up · Post-op check</div>

                <div className={styles.profileDetails}>
                  <div className={styles.detailItem}>
                    <div className={styles.detailLabel}>REASON FOR VISIT</div>
                    <div className={styles.detailValue}>Post-op check</div>
                  </div>
                  <div className={styles.detailItem}>
                    <div className={styles.detailLabel}>LAST VISIT</div>
                    <div className={styles.detailValue}>Oct 12, 2025</div>
                  </div>
                </div>

                <div className={styles.appointmentTime}>10:30 AM</div>

                <div className={styles.profileActions}>
                  <button className={styles.startMeetBtn} onClick={() => router.push("/dashboard/doctor/video-call")}>Start Meet</button>
                  <button className={styles.detailsBtn}>Details</button>
                </div>
              </div>
            </div>

            {/* Recent Activity Table */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Recent Activity</h3>
                <span className={styles.link}>View All</span>
              </div>

              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>PATIENT</th>
                    <th>ACTIVITY</th>
                    <th>DATE/TIME</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatarSmall}></div>
                        John Von
                      </div>
                    </td>
                    <td>Lab Results Reviewed</td>
                    <td>Today, 9:15 AM</td>
                    <td>
                      <span className={styles.completed}>Completed</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatarSmall}></div>
                        John Von
                      </div>
                    </td>
                    <td>Operation</td>
                    <td>Yesterday, 4:30 PM</td>
                    <td>
                      <span className={styles.inReview}>In Review</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatarSmall}></div>
                        John Von
                      </div>
                    </td>
                    <td>Check-up</td>
                    <td>Sept 12, 2:10 PM</td>
                    <td>
                      <span className={styles.completed}>Completed</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className={styles.rightCol}>
            <TasksSection />
          </div>
        </section>
      </main>
    </div>
  );
}
