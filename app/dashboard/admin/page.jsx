"use client";
import { useState, useEffect } from "react";
import styles from "./AdminDashboard.module.css";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { fetchCalendarMonth, fetchCalendarDay } from "@/services/calendar";
import { fetchAdminOverview, fetchAdminAuditLogs } from "@/services/admin";
import { fetchProfile } from "@/services/doctor";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Users,
  Shield,
  ClipboardList,
  Calendar as CalendarIcon
} from "lucide-react";


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
  const router = useRouter();

  const [adminUser, setAdminUser] = useState(null);
  const [overview, setOverview] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [currentDate, setCurrentDate] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [monthData, setMonthData] = useState({});
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [profile, overviewData, logs] = await Promise.all([
          fetchProfile(),
          fetchAdminOverview(),
          fetchAdminAuditLogs({ limit: 5 }),
        ]);

        if (!profile) return;

        if (profile.role !== "admin") {
          const r = (profile.role || "").toLowerCase();
          const path = r === "patient" ? "/dashboard/patient"
            : r === "doctor" ? "/dashboard/doctor"
              : null;
          if (path) router.replace(path);
          return;
        }

        setAdminUser(profile);
        setOverview(overviewData);
        setAuditLogs(logs || []);

      } catch (err) {
        console.error("AdminDashboard init error:", err);
      } finally {
        setLoadingOverview(false);
      }
    };

    init();
    setIsMounted(true);
    setCurrentDate(new Date());
  }, [router]);

  useEffect(() => {
    const loadMonthData = async () => {
      if (!currentDate) return;
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const response = await fetchCalendarMonth(year, month);
        const mappedData = {};
        if (response && response.days) {
          response.days.forEach(d => {
            mappedData[d.day] = d.event_count || d.count || 0;
          });
        }
        setMonthData(mappedData);
      } catch (err) {
        console.error("Failed to fetch calendar monthly data:", err);
      }
    };
    loadMonthData();
  }, [currentDate]);

  // Search removed — no supported API endpoint



  useEffect(() => {
    const fetchToday = async () => {
      const today = new Date().toISOString().split('T')[0];
      try {
        const response = await fetchCalendarDay(today);
        setSelectedDayEvents(response?.events || []);
      } catch (err) {
        console.error("Init today events error:", err);
      }
    };
    if (isMounted) fetchToday();
  }, [isMounted]);

  if (!currentDate || !isMounted) return null;

  const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  const daysInMonthCount = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
  const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1).getDay(); // 0=Sun
  const todayDate = new Date().getDate();
  const isTodayMonth = currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();

  const handleDayClick = async (day) => {
    const selectedDate = new Date(currentYear, currentDate.getMonth(), day);
    const dateStr = selectedDate.toISOString().split('T')[0];
    try {
      const response = await fetchCalendarDay(dateStr);
      setSelectedDayEvents(response?.events || []);
    } catch (err) {
      console.error("Failed to fetch day events:", err);
      setSelectedDayEvents([]);
    }
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };









  const getDayAvailability = (day) => {
    const count = monthData[day];
    if (count === undefined || count === 0) return "none";
    if (count >= 10) return "red";
    return "green";
  };

  const formatEventsForSchedule = (events) => {
    if (!events) return [];
    return events.map(ev => ({
      time: ev.start_time ? new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "All Day",
      title: ev.title || "Untitled Event",
      type: ev.event_type || "meeting",
      color: ev.color || "#3b82f6"
    })).sort((a, b) => a.time.localeCompare(b.time));
  };

  const displaySchedule = formatEventsForSchedule(selectedDayEvents || []);

  const adminName = adminUser?.full_name || "Admin";

  // Derive summary card values from overview or calendar
  const appointmentsToday = selectedDayEvents?.length ?? overview?.appointments_today ?? 0;
  const pendingUploads = overview?.pending_uploads ?? overview?.pending_documents ?? "—";
  const activeDoctors = overview?.active_doctors ?? overview?.doctors_count ?? "—";

  const actionColors = {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#3b82f6",
    info: "#6366f1"
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      style={{ width: "100%" }}
    >
      {!isMounted ? null : (
        <>
          <motion.div className={styles.header} variants={itemVariants}>
            <div>
              <h2 className={styles.greeting}>Clinic Overview</h2>
              <p className={styles.sub}>
                Welcome back, {adminName.split(' ')[0]}. Here&apos;s the latest system status.
              </p>
            </div>
          </motion.div>

          <motion.div className={styles.summaryCards} variants={itemVariants}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon} style={{ background: '#eff6ff', color: '#3b82f6' }}>
                <Users size={22} />
              </div>
              <div className={styles.summaryInfo}>
                <span className={styles.summaryLabel}>Total Doctors</span>
                <h3 className={styles.summaryValue}>
                  {loadingOverview ? "..." : (overview?.total_doctors ?? "0")}
                </h3>
                <span className={styles.summaryTrend} style={{ color: '#16a34a' }}>
                  {overview?.total_doctors !== undefined ? "Active Medical Staff" : "Data unavailable"}
                </span>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon} style={{ background: '#fef2f2', color: '#ef4444' }}>
                <ClipboardList size={22} />
              </div>
              <div className={styles.summaryInfo}>
                <span className={styles.summaryLabel}>Today&apos;s Appointments</span>
                <h3 className={styles.summaryValue}>
                  {loadingOverview ? "..." : (overview?.appointments_today ?? "0")}
                </h3>
                <span className={styles.summaryTrend} style={{ color: '#3b82f6' }}>
                  Scheduled today
                </span>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon} style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <Shield size={22} />
              </div>
              <div className={styles.summaryInfo}>
                <span className={styles.summaryLabel}>Storage Usage</span>
                <h3 className={styles.summaryValue}>
                  {loadingOverview ? "..." : (overview?.storage?.percentage ? `${overview.storage.percentage}%` : "12.5%")}
                </h3>
                <span className={styles.summaryTrend} style={{ color: '#16a34a' }}>
                  {overview?.storage?.used_gb ? `${overview.storage.used_gb}GB / ${overview.storage.total_gb}GB` : "Cloud Optimized"}
                </span>
              </div>
            </div>
          </motion.div>

          <section className={styles.dashboardGrid}>
            <div className={styles.leftCol}>
              <motion.div className={styles.card} variants={itemVariants} style={{ marginBottom: '20px' }}>
                <div className={styles.cardHeader}>
                  <h3>Today&apos;s Schedule</h3>
                  <span className={styles.link}>{displaySchedule.length} tasks scheduled</span>
                </div>
                <div className={styles.scheduleList}>
                  {displaySchedule.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      No appointments or tasks scheduled for today.
                    </div>
                  ) : (
                    displaySchedule.map((item, idx) => (
                      <div key={idx} className={styles.scheduleItem}>
                        <div className={styles.timeLine}>
                          <span className={styles.timeText}>{item.time}</span>
                          <div className={styles.timeDot} style={{ background: item.color }}></div>
                        </div>
                        <div className={styles.scheduleContent}>
                          <div className={styles.scheduleInfo}>
                            <strong>{item.title}</strong>
                            <span>{item.type.toUpperCase()}</span>
                          </div>
                          <CalendarIcon size={14} color="#64748b" style={{ opacity: 0.5 }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>

              <motion.div className={styles.card} variants={itemVariants}>
                <div className={styles.cardHeader}>
                  <h3>System Activity</h3>
                  <Link href="/dashboard/admin/audit-logs" className={styles.link}>View All</Link>
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
                    {loadingOverview ? (
                      <tr>
                        <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                          Loading activity...
                        </td>
                      </tr>
                    ) : (overview?.recent_activity?.length || auditLogs.length) === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                          No recent activity found.
                        </td>
                      </tr>
                    ) : (
                      (overview?.recent_activity || auditLogs).slice(0, 5).map((log, i) => (
                        <tr key={log.id || i}>
                          <td>
                            <div className={styles.userCell}>
                              <div className={styles.avatarSmall}>
                                {log.user_avatar ? <img src={log.user_avatar} alt="" /> : <User size={12} />}
                              </div>
                              {log.user_name || log.user_email || log.user_id || "System"}
                            </div>
                          </td>
                          <td>{log.event_description || log.action || log.event || "—"}</td>
                          <td>{log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}</td>
                          <td>
                            <span
                              className={styles.success}
                              style={{ color: "#3b82f6", background: "#eff6ff", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600" }}
                            >
                              {log.status || "Completed"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </motion.div>
            </div>

            <div className={styles.rightCol}>
              <motion.div className={styles.card} variants={itemVariants} style={{ marginBottom: '20px' }}>
                <div className={styles.calendarHeader}>
                  <h3>{currentMonthName} {currentYear}</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => changeMonth(-1)} className={styles.iconBtn} style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: '#f1f5f9', borderRadius: '4px', cursor: 'pointer' }}>
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => changeMonth(1)} className={styles.iconBtn} style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: '#f1f5f9', borderRadius: '4px', cursor: 'pointer' }}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
                <div className={styles.calendarGrid}>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                    <div key={d} className={styles.calDayHead}>{d}</div>
                  ))}
                  {/* Leading empty cells for day-of-week alignment */}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className={styles.calDay} style={{ background: 'transparent', cursor: 'default' }} />
                  ))}
                  {daysInMonth.map(d => {
                    const status = getDayAvailability(d);
                    const isToday = isTodayMonth && d === todayDate;
                    return (
                      <div
                        key={d}
                        onClick={() => handleDayClick(d)}
                        className={`${styles.calDay} ${isToday ? styles.calToday : ""} ${status !== "none" ? styles.calHasEvent : ""}`}
                      >
                        {d}
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div className={styles.card} variants={itemVariants}>
                <div className={styles.cardHeader}>
                  <h3>System Alerts</h3>
                  {overview?.alerts?.length > 0 && (
                    <span className={styles.badge} style={{ background: '#fef2f2', color: '#ef4444' }}>
                      {overview.alerts.length}
                    </span>
                  )}
                </div>
                <div className={styles.alertList}>
                  {loadingOverview ? (
                    <div className={styles.alert}>
                      <strong>Loading alerts...</strong>
                    </div>
                  ) : overview?.alerts?.length > 0 ? (
                    overview.alerts.slice(0, 3).map((alert, i) => (
                      <div key={alert.id || i} className={styles.alert} style={{ borderLeft: `4px solid ${actionColors[alert.severity] || '#3b82f6'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <strong>{alert.title}</strong>
                          <small style={{ color: '#94a3b8' }}>{alert.time_ago}</small>
                        </div>
                        <p>{alert.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className={styles.alert} style={{ borderLeft: '4px solid #10b981' }}>
                      <strong>All Systems Operational</strong>
                      <p>No high-priority alerts detected in the last 24 hours.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </section>
        </>
      )}
    </motion.div>
  );
}
