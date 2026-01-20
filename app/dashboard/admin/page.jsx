"use client";
import styles from "./AdminDashboard.module.css";
import notificationIcon from "@/public/icons/notification.svg";
import searchIcon from "@/public/icons/search.svg";
import micIcon from "@/public/icons/mic_white.svg";
import Link from "next/link";
import { motion } from "framer-motion";

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

export default function AdminDashboard() {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      style={{ width: "100%" }}
    >
      <motion.div variants={itemVariants} className={styles.topbar}>
        <div className={styles.searchWrapper}>
          <img src={searchIcon.src} alt="Search" className={styles.searchIcon} />
          <input
            className={styles.search}
            placeholder="Search something..."
          />
        </div>

        <div className={styles.topActions}>
          <button className={styles.iconBtn}>
            <img src={notificationIcon.src} alt="Notifications" width="20" height="20" />
          </button>

          <div className={styles.profile}>
            <div className={styles.profileInfo}>
              <span>Dr. Sarah Smith</span>
              <small>Admin</small>
            </div>
            <div className={styles.avatar}></div>
          </div>
        </div>
      </motion.div>

      <motion.div className={styles.titleRow} variants={itemVariants}>
        <div>
          <h2 className={styles.heading}>Dashboard Overview</h2>
          <p className={styles.subtext}>
            Access to your clinic's workspace securely
          </p>
        </div>

        <Link href="/dashboard/admin/manage-accounts/invite" className={styles.inviteBtn}>
          <img src={micIcon.src} alt="Mic" width="16" height="16" />
          Invite User
        </Link>
      </motion.div>

      <section className={styles.grid}>
        <div className={styles.leftCol}>
          {/* Recent Activity (TABLE) */}
          <motion.div className={styles.card} variants={itemVariants}>
            <div className={styles.cardHeader}>
              <h3>Recent Activity</h3>
              <span className={styles.link}>View Logs</span>
            </div>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>USER</th>
                  <th>EVENT</th>
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
                  <td>Viewed Lab Results</td>
                  <td>Today, 9:15 AM</td>
                  <td>
                    <span className={styles.success}>Completed</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatarSmall}></div>
                      John Von
                    </div>
                  </td>
                  <td>Started a session</td>
                  <td>Yesterday, 4:30 PM</td>
                  <td>
                    <span className={styles.warning}>In Review</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatarSmall}></div>
                      John Von
                    </div>
                  </td>
                  <td>Joined a session</td>
                  <td>Sept 12, 2:10 PM</td>
                  <td>
                    <span className={styles.success}>Completed</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </motion.div>

          <motion.div className={styles.card} variants={itemVariants}>
            <div className={styles.securityHeader}>
              <h3>Security</h3>
            </div>

            <div className={styles.securityRow}>
              <div>
                <strong>Password</strong>
                <p>Last changed 3 months ago</p>
              </div>
              <button className={styles.changeBtn}>Change</button>
            </div>
          </motion.div>
        </div>

        <div className={styles.rightCol}>
          <motion.div className={`${styles.card} ${styles.alertCard}`} variants={itemVariants}>
            <h3>Alerts</h3>

            <div className={styles.alertList}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div className={styles.alert} key={i}>
                  <strong>Consultation summary ready</strong>
                  <p>
                    Patient Daniel Koshear - AI Analysis complete. Key vitals
                    extracted.
                  </p>
                  <span>42m ago</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div className={styles.card} variants={itemVariants}>
            <h3>Quick Actions</h3>
            <div className={styles.quickEmpty}></div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
