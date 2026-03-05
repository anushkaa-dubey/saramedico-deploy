"use client";
import { useState, useEffect } from "react";
import styles from "./AdminDashboard.module.css";
// import notificationIcon from "@/public/icons/notification.svg";
import searchIcon from "@/public/icons/search.svg";
import docIcon from "@/public/icons/docs.svg";
import personIcon from "@/public/icons/person.svg";
import micIcon from "@/public/icons/mic_white.svg";
import scheduleIcon from "@/public/icons/schedule.svg";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
// import { fetchCalendarMonth, fetchCalendarDay } from "@/services/calendar"; // Missing backend domain
import { fetchAdminOverview, fetchAdminAuditLogs, fetchAuditLogs } from "@/services/admin";
import { fetchProfile, searchDoctors, searchDoctorDirectory } from "@/services/doctor";


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

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchFilter, setSearchFilter] = useState("All");
  const [adminUser, setAdminUser] = useState(null);
  const [overview, setOverview] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [topMatches, setTopMatches] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchFilters = ["All", "Doctors Directory", "Internal Doctors"];

  const [currentDate, setCurrentDate] = useState(new Date());
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
          router.replace(`/dashboard/${profile.role}`);
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
  }, [router]);

  useEffect(() => {
    const loadMonthData = async () => {
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

  useEffect(() => {
    if (!searchQuery.trim()) {
      setTopMatches([]);
      return;
    }
    const debounceSearch = setTimeout(async () => {
      setIsSearching(true);
      try {
        let results = [];
        if (searchFilter === "Doctors Directory") {
          results = await searchDoctorDirectory({ query: searchQuery });
        } else {
          // Default to internal doctors search
          results = await searchDoctors({ query: searchQuery });
        }
        setTopMatches(results || []);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(debounceSearch);
  }, [searchQuery, searchFilter]);

  const handleDayClick = async (day) => {
    // Missing backend Calendar domain
    return;
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  useEffect(() => {
    // Missing backend Calendar domain
    /*
    const fetchToday = async () => {
      ...
    };
    fetchToday();
    */
  }, []);

  const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  const daysInMonthCount = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
  const todayDate = new Date().getDate();
  const isTodayMonth = currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();

  const getDayAvailability = (day) => {
    const count = monthData[day];
    if (count === undefined || count === 0) return "none";
    if (count >= 10) return "red";
    return "green";
  };

  const formatEventsForSchedule = (events) => {
    return []; // Missing backend Calendar domain
  };

  const displaySchedule = []; // SelectedDayEvents logic disabled

  const adminName = adminUser?.full_name || "Admin";

  // Derive summary card values from overview or calendar
  const appointmentsToday = selectedDayEvents?.length ?? overview?.appointments_today ?? 0;
  const pendingUploads = overview?.pending_uploads ?? overview?.pending_documents ?? "—";
  const activeDoctors = overview?.active_doctors ?? overview?.doctors_count ?? "—";

  const getActionColor = (action = "") => {
    const a = action.toLowerCase();
    if (a.includes("delete") || a.includes("remove") || a.includes("error")) return "#ef4444";
    if (a.includes("update") || a.includes("edit") || a.includes("patch")) return "#f59e0b";
    if (a.includes("create") || a.includes("post") || a.includes("register") || a.includes("login")) return "#10b981";
    return "#3b82f6";
  };

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
            placeholder="Search doctors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                {isSearching ? (
                  <div style={{ padding: "8px 0", color: "#94a3b8", fontSize: "13px" }}>
                    Searching...
                  </div>
                ) : topMatches.length === 0 ? (
                  <div style={{ padding: "8px 0", color: "#94a3b8", fontSize: "13px" }}>
                    {searchQuery ? "No doctors found." : "Type to search..."}
                  </div>
                ) : (
                  topMatches.map((match, idx) => (
                    <Link key={idx} href={`/dashboard/admin/doctors/${match.id}`} className={styles.matchItem} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                      <img src={match.photo_url || personIcon.src} alt="" width="24" height="24" style={{ borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', color: '#0f172a' }}>
                        <span>{match.name || match.full_name || "Doctor"}</span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{match.specialty || "General Physician"}</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.topActions}>
          {/* <button className={styles.iconBtn}>
            <img src={notificationIcon.src} alt="Notifications" width="20" height="20" />
          </button> */}

          <div className={styles.profile}>
            <div className={styles.profileInfo}>
              <span style={{ fontWeight: '700', color: '#0f172a' }}>
                {loadingOverview ? "Loading..." : adminName}
              </span>
              <small style={{ color: '#64748b' }}>{adminUser?.role || "Administrator"}</small>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className={styles.titleRow} variants={itemVariants}>
        <div>
          <h2 className={styles.heading}>Clinic Overview</h2>
          <p className={styles.subtext}>
            Welcome back, {adminName.split(' ')[0]}. Here&apos;s the latest system status.
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
            <h3 className={styles.summaryValue}>
              {loadingOverview ? "..." : appointmentsToday}
            </h3>
            <span className={styles.summaryTrend} style={{ color: '#16a34a' }}>
              {loadingOverview ? "Loading..." : (appointmentsToday === "—" ? "Backend not connected" : "Live Count")}
            </span>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon} style={{ background: '#fff7ed' }}>
            <img src={docIcon.src} alt="" width="20" />
          </div>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryLabel}>Pending Uploads</span>
            <h3 className={styles.summaryValue}>
              {loadingOverview ? "..." : pendingUploads}
            </h3>
            <span className={styles.summaryTrend} style={{ color: '#ea580c' }}>
              {pendingUploads === "—" ? "Backend not connected" : "Requires Action"}
            </span>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon} style={{ background: '#f0fdf4' }}>
            <img src={personIcon.src} alt="" width="20" />
          </div>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryLabel}>Active Doctors</span>
            <h3 className={styles.summaryValue}>
              {loadingOverview ? "..." : activeDoctors}
            </h3>
            <span className={styles.summaryTrend} style={{ color: '#16a34a' }}>
              {activeDoctors === "—" ? "Backend not connected" : "All on duty"}
            </span>
          </div>
        </div>
      </motion.div>

      <section className={styles.dashboardGrid}>
        <div className={styles.leftCol}>
          {/* Schedule Hidden - Backend Calendar domain missing */}
          {/*
          <motion.div className={styles.card} variants={itemVariants}>
            ...
          </motion.div>
          */}

          {/* Activity Table — from real audit logs */}
          <motion.div className={styles.card} variants={itemVariants}>
            <div className={styles.cardHeader}>
              <h3>Recent Activity</h3>
              <Link href="/dashboard/hospital/audit-logs" className={styles.link}>View Logs</Link>
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
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                      {loadingOverview ? "Loading..." : "Backend not connected — no audit logs."}
                    </td>
                  </tr>
                ) : (
                  auditLogs.slice(0, 5).map((log, i) => (
                    <tr key={log.id || i}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatarSmall}></div>
                          {log.user_id || log.user_email || "System"}
                        </div>
                      </td>
                      <td>{log.action || log.event || "—"}</td>
                      <td>{log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}</td>
                      <td>
                        <span
                          className={styles.success}
                          style={{ color: getActionColor(log.action || "") }}
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
          {/* Calendar Widget */}
          {/* Calendar Widget Hidden - Backend domain missing */}
          {/*
          <motion.div className={styles.card} variants={itemVariants}>
            ...
          </motion.div>
          */}

          {/* System Alerts from Overview */}
          <motion.div className={`${styles.card} ${styles.alertCard}`} variants={itemVariants}>
            <h3>System Alerts</h3>
            <div className={styles.alertList}>
              {loadingOverview ? (
                <div className={styles.alert}>
                  <strong>Loading alerts...</strong>
                </div>
              ) : overview?.alerts?.length > 0 ? (
                overview.alerts.slice(0, 3).map((alert, i) => (
                  <div key={i} className={styles.alert}>
                    <strong>{alert.title || alert.type || "System Alert"}</strong>
                    <p>{alert.message || alert.description || "—"}</p>
                    <span>{alert.time || alert.created_at ? new Date(alert.created_at || alert.time).toLocaleString() : "—"}</span>
                  </div>
                ))
              ) : (
                <div className={styles.alert}>
                  <strong>Backend not connected</strong>
                  <p>System alert data is unavailable.</p>
                  <span>—</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
