"use client";
import { useState, useEffect } from "react";
import styles from "./AdminDashboard.module.css";
import notificationIcon from "@/public/icons/notification.svg";
import searchIcon from "@/public/icons/search.svg";
import docIcon from "@/public/icons/docs.svg";
import personIcon from "@/public/icons/person.svg";
import micIcon from "@/public/icons/mic_white.svg";
import scheduleIcon from "@/public/icons/schedule.svg";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetchCalendarMonth, fetchCalendarDay } from "@/services/calendar";

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthData, setMonthData] = useState({});
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);

  useEffect(() => {
    const loadMonthData = async () => {
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const data = await fetchCalendarMonth(year, month);
        setMonthData(data);
      } catch (err) {
        console.error("Failed to fetch calendar monthly data:", err);
      }
    };
    loadMonthData();
  }, [currentDate]);

  const handleDayClick = async (day) => {
    try {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const events = await fetchCalendarDay(dateStr);
      setSelectedDayEvents(events);
    } catch (err) {
      console.error("Failed to fetch calendar day events:", err);
    }
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  const daysInMonthCount = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
  const todayDate = new Date().getDate();
  const isTodayMonth = currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();

  const getDayAvailability = (day) => {
    const data = monthData[day];
    if (!data) return "none";
    const count = typeof data === 'number' ? data : (data.count || 0);
    if (count >= 10) return "red";
    if (count > 0) return "green";
    return "none";
  };

  useEffect(() => {
    // Fetch today's events initially
    const fetchToday = async () => {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const events = await fetchCalendarDay(todayStr);
        setSelectedDayEvents(events);
      } catch (err) {
        console.error("Failed to fetch today's events:", err);
      }
    };
    fetchToday();
  }, []);

  const formatEventsForSchedule = (events) => {
    if (!events || events.length === 0) return [];
    return events.map(event => ({
      time: new Date(event.start_time || event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      patient: event.metadata?.patient_name || event.title || "Consultation",
      type: event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1),
      status: event.metadata?.appointment_status || (event.event_type === 'appointment' ? 'Confirmed' : 'Active'),
      zoomLink: event.metadata?.zoom_link
    }));
  };

  const displaySchedule = selectedDayEvents ? formatEventsForSchedule(selectedDayEvents) : bookings;

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
            <h3 className={styles.summaryValue}>{selectedDayEvents ? selectedDayEvents.length : 42}</h3>
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
              <h3>{selectedDayEvents ? "Events for Selected Day" : "Today's Schedule"}</h3>
              {selectedDayEvents && <span onClick={() => setSelectedDayEvents(null)} style={{ cursor: 'pointer', fontSize: '12px', color: '#666' }}>Reset to Today</span>}
              <Link href="/dashboard/admin/appointments" className={styles.link}>View All</Link>
            </div>
            <div className={styles.scheduleList}>
              {displaySchedule.map((booking, idx) => (
                <div key={idx} className={styles.scheduleItem}>
                  <div className={styles.timeLine}>
                    <span className={styles.timeText}>{booking.time}</span>
                    <div className={styles.timeDot}></div>
                  </div>
                  <div className={styles.scheduleContent}>
                    <div className={styles.scheduleInfo}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong>{booking.patient}</strong>
                        {booking.zoomLink && <a href={booking.zoomLink} target="_blank" style={{ fontSize: '10px', color: '#359aff', fontWeight: 'bold' }}>JOIN ZOOM</a>}
                      </div>
                      <span>{booking.type}</span>
                    </div>
                    <span className={`${styles.statusBadge} ${styles[booking.status.toLowerCase()] || styles.pending}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
              {displaySchedule.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No events found.</div>
              )}
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
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>{currentMonthName} {currentYear}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => changeMonth(-1)} className={styles.iconBtn} style={{ padding: '2px 6px', fontSize: '12px' }}>‹</button>
                  <button onClick={() => changeMonth(1)} className={styles.iconBtn} style={{ padding: '2px 6px', fontSize: '12px' }}>›</button>
                </div>
              </div>
            </div>
            <div className={styles.calendarWidget}>
              <div className={styles.calendarGrid}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d} className={styles.calDayHead}>{d}</span>)}
                {daysInMonth.map((day) => {
                  const availability = getDayAvailability(day);
                  const isToday = isTodayMonth && day === todayDate;

                  return (
                    <div
                      key={day}
                      onClick={() => handleDayClick(day)}
                      style={{ cursor: 'pointer' }}
                      className={`${styles.calDay} ${isToday ? styles.calToday : ''} ${availability !== 'none' ? styles.calHasEvent : ''}`}
                    >
                      {day}
                      {availability !== 'none' && (
                        <div style={{
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          background: availability === 'red' ? '#ef4444' : '#22c55e',
                          position: 'absolute',
                          bottom: '4px'
                        }}></div>
                      )}
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
