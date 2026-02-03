"use client";
import { useState } from "react";
import styles from "./AdminDashboard.module.css";
import notificationIcon from "@/public/icons/notification.svg";
import searchIcon from "@/public/icons/search.svg";
import docIcon from "@/public/icons/docs.svg";
import personIcon from "@/public/icons/person.svg";
import micIcon from "@/public/icons/mic_white.svg";
import scheduleIcon from "@/public/icons/schedule.svg";
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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchFilter, setSearchFilter] = useState("All");

  const searchFilters = ["All", "Logins", "Exports", "Patient Data"];

  const topMatches = [
    { type: "doctor", name: "Dr. Smith Sara", icon: personIcon },
    { type: "doctor", name: "Dr. Angel Batista", icon: personIcon },
    { type: "document", name: "patient_data_report.pdf", icon: docIcon },
  ];

  const bookings = [
    { time: "09:00 AM", patient: "John Doe", type: "Checkup", status: "Pending" },
    { time: "10:30 AM", patient: "Jane Smith", type: "Follow-up", status: "Confirmed" },
    { time: "02:00 PM", patient: "Robert Brown", type: "Consultation", status: "Pending" },
  ];

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
            placeholder="Search filters, matches..."
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          />

          {isSearchFocused && (
            <div className={styles.searchDropdown}>
              <div className={styles.filterRow}>
                {searchFilters.map(filter => (
                  <button
                    key={filter}
                    className={`${styles.filterBtn} ${searchFilter === filter ? styles.filterBtnActive : ""}`}
                    onClick={() => setSearchFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <div className={styles.matchesSection}>
                <h4 className={styles.sectionTitle}>Top Matches</h4>
                {topMatches.map((match, idx) => (
                  <div key={idx} className={styles.matchItem}>
                    <img src={match.icon.src} alt="" width="16" height="16" />
                    <span>{match.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            Welcome back, Sarah. Here's what's happening in your clinic today.
          </p>
        </div>

        <Link href="/dashboard/admin/manage-accounts/invite" className={styles.inviteBtn}>
          <img src={micIcon.src} alt="Mic" width="16" height="16" />
          Invite User
        </Link>
      </motion.div>

      <motion.div className={styles.summaryCards} variants={itemVariants}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon} style={{ background: '#eff6ff' }}>
            <img src={scheduleIcon.src} alt="" width="20" />
          </div>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryLabel}>Appointments Today</span>
            <h3 className={styles.summaryValue}>42</h3>
            <span className={styles.summaryTrend} style={{ color: '#16a34a' }}>↑ 12% vs yesterday</span>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon} style={{ background: '#fff7ed' }}>
            <img src={docIcon.src} alt="" width="20" />
          </div>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryLabel}>Pending Uploads</span>
            <h3 className={styles.summaryValue}>18</h3>
            <span className={styles.summaryTrend} style={{ color: '#ea580c' }}>Requires Action</span>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon} style={{ background: '#f0fdf4' }}>
            <img src={personIcon.src} alt="" width="20" />
          </div>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryLabel}>Active Doctors</span>
            <h3 className={styles.summaryValue}>12</h3>
            <span className={styles.summaryTrend} style={{ color: '#16a34a' }}>All on duty</span>
          </div>
        </div>
      </motion.div>

      <section className={styles.dashboardGrid}>
        <div className={styles.leftCol}>
          <motion.div className={styles.card} variants={itemVariants}>
            <div className={styles.cardHeader}>
              <h3>Today's Schedule</h3>
              <Link href="/dashboard/admin/appointments" className={styles.link}>View All</Link>
            </div>
            <div className={styles.scheduleList}>
              {bookings.map((booking, idx) => (
                <div key={idx} className={styles.scheduleItem}>
                  <div className={styles.timeLine}>
                    <span className={styles.timeText}>{booking.time}</span>
                    <div className={styles.timeDot}></div>
                  </div>
                  <div className={styles.scheduleContent}>
                    <div className={styles.scheduleInfo}>
                      <strong>{booking.patient}</strong>
                      <span>{booking.type}</span>
                    </div>
                    <span className={`${styles.statusBadge} ${styles[booking.status.toLowerCase()]}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activity Table */}
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
                  <td><span className={styles.success}>Completed</span></td>
                </tr>
                <tr>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatarSmall}></div>
                      Sarah Miller
                    </div>
                  </td>
                  <td>Uploaded Records</td>
                  <td>Today, 8:45 AM</td>
                  <td><span className={styles.warning}>Processing</span></td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        </div>

        <div className={styles.rightCol}>
          {/* Calendar Widget */}
          <motion.div className={styles.card} variants={itemVariants}>
            <div className={styles.calendarHeader}>
              <h3>Calendar</h3>
              <span>February 2026</span>
            </div>
            <div className={styles.calendarWidget}>
              <div className={styles.calendarGrid}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d} className={styles.calDayHead}>{d}</span>)}
                {Array.from({ length: 30 }).map((_, i) => {
                  const day = i + 1;
                  return (
                    <div
                      key={day}
                      className={`${styles.calDay} ${day === 3 ? styles.calToday : ''} ${[10, 15, 22].includes(day) ? styles.calHasEvent : ''}`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <motion.div className={`${styles.card} ${styles.alertCard}`} variants={itemVariants}>
            <h3>System Alerts</h3>
            <div className={styles.alertList}>
              <div className={styles.alert}>
                <strong>Database Backup</strong>
                <p>Successful backup at 04:00 AM</p>
                <span>5h ago</span>
              </div>
              <div className={styles.alert}>
                <strong>New Staff Onboarded</strong>
                <p>Dr. Angel Batista updated profile</p>
                <span>1h ago</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
