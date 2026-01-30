"use client";
import Topbar from "./components/Topbar";
import TasksSection from "./components/TasksSection";
import styles from "./DoctorDashboard.module.css";
import uploadIcon from "@/public/icons/upload.svg";
import personIcon from "@/public/icons/person.svg";
import scheduleIcon from "@/public/icons/schedule.svg";
import micWhiteIcon from "@/public/icons/mic_white.svg";
import Daniel from "@/public/icons/images/Daniel.png";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import OnboardPatientModal from "./patients/components/OnboardPatientModal";


const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export default function DoctorDashboard() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      style={{ width: "100%" }}
    >
      <motion.div variants={itemVariants}>
        <Topbar />
      </motion.div>

      <OnboardPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => router.push("/dashboard/doctor/patients")}
      />

      <motion.section className={styles.header} variants={itemVariants}>
        <div>
          <h2 className={styles.greeting}>Good Morning, Doctor</h2>
          <p className={styles.sub}>Here's your schedule overview for today</p>
        </div>

        <div className={styles.headerActions}>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={styles.iconBtn}>
            <img src={uploadIcon.src} alt="Upload" width="20" height="20" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={styles.iconBtn}
            onClick={() => setIsModalOpen(true)}
          >
            <img src={personIcon.src} alt="Add Person" width="20" height="20" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={styles.outlineBtn}
            onClick={() => router.push("/dashboard/doctor/appointments")}
          >
            <img src={scheduleIcon.src} alt="Schedule" width="16" height="16" />
            Schedule
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={styles.primaryBtn} onClick={() => router.push("/dashboard/doctor/video-call")}>
            <img src={micWhiteIcon.src} alt="Start Session" width="16" height="16" />
            Start Session
          </motion.button>
        </div>
      </motion.section>

      <section className={styles.grid}>
        {/* LEFT COLUMN */}
        <div className={styles.leftCol}>
          {/* Patient Profile Card */}
          <motion.div className={styles.profileCard} variants={itemVariants}>
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
          </motion.div>

          {/* Recent Activity Table */}
          <motion.div className={styles.card} variants={itemVariants}>
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

            {/* Mobile Activity List */}
            <div className={styles.mobileActivityHeader}>
              <div>PATIENT</div>
              <div>ACTIVITY</div>
              <div>STATUS</div>
            </div>
            <div className={styles.mobileActivityList}>
              <div className={styles.activityCard}>
                <div className={styles.activityUser}>John Von</div>
                <div className={styles.activityAction}>Lab Results Reviewed</div>
                <div className={styles.activityStatus}>
                  <span className={styles.completed}>Completed</span>
                </div>
              </div>
              <div className={styles.activityCard}>
                <div className={styles.activityUser}>John Von</div>
                <div className={styles.activityAction}>Operation</div>
                <div className={styles.activityStatus}>
                  <span className={styles.inReview}>In Review</span>
                </div>
              </div>
              <div className={styles.activityCard}>
                <div className={styles.activityUser}>John Von</div>
                <div className={styles.activityAction}>Check-up</div>
                <div className={styles.activityStatus}>
                  <span className={styles.completed}>Completed</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.rightCol}>
          <motion.div variants={itemVariants} style={{ width: '100%' }}>
            <TasksSection />
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
