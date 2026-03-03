"use client";
import Topbar from "./components/Topbar";
import TasksSection from "./components/TasksSection";
import styles from "./DoctorDashboard.module.css";
import uploadIcon from "@/public/icons/upload.svg";
import personIcon from "@/public/icons/person.svg";
import scheduleIcon from "@/public/icons/schedule.svg";
import micWhiteIcon from "@/public/icons/mic_white.svg";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { fetchAppointments, createConsultation, fetchProfile, fetchTasks, fetchPatients, fetchTeamMembers } from "@/services/doctor";
import { fetchQueueMetrics } from "@/services/consultation";
import Link from "next/link";

// import { fetchCalendarMonth, fetchCalendarDay, deleteCalendarEvent } from "@/services/calendar"; // Missing backend domain

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [monthData, setMonthData] = useState({});
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);

  // Consent & Recording State
  const [consentVerified, setConsentVerified] = useState(false);
  const [recordingReady, setRecordingReady] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);

  // const [activityFeed, setActivityFeed] = useState([]); // Missing backend endpoint /doctor/activity
  // const [metrics, setMetrics] = useState(null); // Missing backend endpoint /doctor/me/dashboard
  const [doctorProfile, setDoctorProfile] = useState(null);

  const loadDashboardData = async () => {
    try {
      const [appts, profile, tasks, patients, queueData, staffData] = await Promise.all([
        fetchAppointments(),
        fetchProfile(),
        fetchTasks(),
        fetchPatients(),
        fetchQueueMetrics().catch(() => ({ pending_review: 0, high_urgency: 0, cleared_today: 0, avg_wait_time_minutes: 0 })),
        fetchTeamMembers().catch(() => [])
      ]);

      const consultationsData = await import("@/services/consultation").then(m => m.fetchConsultations().catch(() => ({ consultations: [] })));
      const consultations = Array.isArray(consultationsData) ? consultationsData : (consultationsData?.consultations || consultationsData?.items || []);

      setAppointments(appts || []);
      setDoctorProfile(profile);
      setTeamMembers(staffData || []);
      setMetrics({
        pending_review: queueData.pending_review || 0,
        high_urgency: queueData.high_urgency || 0,
        cleared_today: queueData.cleared_today || 0,
        avg_wait_time: queueData.avg_wait_time_minutes || 0,
        total_patients: patients.length,
        total_records: consultations.length
      });
    } catch (err) {
      console.error("Failed to load doctor dashboard data:", err);
    }
  };

  const [metrics, setMetrics] = useState({
    pending_review: 0,
    high_urgency: 0,
    cleared_today: 0,
    avg_wait_time: 0,
    total_patients: 0,
    total_records: 0
  });

  const [teamMembers, setTeamMembers] = useState([]);

  const refreshMonthData = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const data = await fetchCalendarMonth(year, month);
      setMonthData(data);
    } catch (err) {
      console.error("Failed to fetch calendar month data:", err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    refreshMonthData();
  }, [currentDate]);

  const handleDeleteEvent = async (eventId) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteCalendarEvent(eventId);
      refreshMonthData();
      if (selectedDayEvents) {
        setSelectedDayEvents(selectedDayEvents.filter(e => e.id !== eventId));
      }
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  const daysInMonthCount = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
  const todayDate = new Date().getDate();
  const isTodayMonth = currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const handleDayClick = async (day) => {
    try {
      const dateStr = `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const events = await fetchCalendarDay(dateStr);
      setSelectedDayEvents(events);
    } catch (err) {
      console.error("Failed to fetch calendar day data:", err);
    }
  };

  const getDayAvailability = (day) => {
    // Missing backend Calendar domain
    return "none";
  };

  const [showConsentModal, setShowConsentModal] = useState(false);

  const handleStartSession = () => {
    setShowConsentModal(true);
  };

  const proceedToSession = async () => {
    if (!consentVerified || !recordingReady) {
      setShowConsentError(true);
      return;
    }

    try {
      const appointment = appointments[0];
      const patient_id = appointment?.patient_id || appointment?.patientId || appointment?.user_id || appointment?.id;
      const appointment_id = appointment?.id;

      if (!patient_id) {
        alert("No active patient appointment found for session initiation.");
        return;
      }

      const session = await createConsultation({
        patient_id,
        appointment_id,
        scheduled_at: new Date().toISOString(),
        visit_type: "video"
      });

      if (session && session.meet_link) {
        setShowConsentModal(false);
        window.open(session.meet_link, "_blank");
      } else {
        setShowConsentModal(false);
        // Fallback if no link returned
        router.push("/dashboard/doctor/video-call");
      }
    } catch (err) {
      console.error("Failed to start session:", err);
      const msg = typeof err === 'string' ? err : (err.message || "Unknown error");
      alert("Failed to start Google Meet session: " + msg);
    }
  };

  const visitStates = {
    "Scheduled": "#64748b",
    "Checked-In": "#3b82f6",
    "Recording": "#ef4444",
    "Processing": "#8b5cf6",
    "Draft Ready": "#10b981",
    "Needs Review": "#f59e0b",
    "Signed": "#059669",
    "Locked": "#1e293b"
  };

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
      {/* 
      <OnboardPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => router.push("/dashboard/doctor/patients")}
      /> */}

      <motion.section className={styles.header} variants={itemVariants}>
        <div>
          <h2 className={styles.greeting}>
            Good Morning, {doctorProfile?.full_name || doctorProfile?.first_name ? `Dr. ${(doctorProfile.full_name || doctorProfile.first_name).split(' ')[0]}` : "Doctor"}
          </h2>
          <p className={styles.sub}>Here's your schedule overview for today</p>
        </div>

        <div className={styles.headerActions}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className={styles.iconBtn}
              onClick={() => router.push("/dashboard/admin/upload-documents")}
            >
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={styles.primaryBtn}
              onClick={handleStartSession}
            >
              <img src={micWhiteIcon.src} alt="Start Session" width="16" height="16" />
              Start Session
            </motion.button>
          </div>
        </div>
      </motion.section>

      <motion.section
        className={styles.summaryCards}
        variants={itemVariants}
        style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}
      >
        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIcon}`} style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <img src={scheduleIcon.src} alt="Pending Review" width="22" height="22" />
          </div>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryLabel}>Pending Review</span>
            <h3 className={styles.summaryValue}>{metrics.pending_review}</h3>
            <span className={styles.summaryTrend} style={{ color: '#3b82f6' }}>Awaiting Sign-off</span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIcon}`} style={{ background: '#fef2f2', color: '#ef4444' }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
          </div>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryLabel}>High Urgency</span>
            <h3 className={styles.summaryValue}>{metrics.high_urgency}</h3>
            <span className={styles.summaryTrend} style={{ color: '#ef4444' }}>Immediate Action</span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIcon}`} style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <img src={uploadIcon.src} alt="Cleared Today" width="22" height="22" />
          </div>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryLabel}>Cleared Today</span>
            <h3 className={styles.summaryValue}>{metrics.cleared_today}</h3>
            <span className={styles.summaryTrend} style={{ color: '#16a34a' }}>Successfully Processed</span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIcon}`} style={{ background: '#fff7ed', color: '#f97316' }}>
            <span style={{ fontSize: '20px' }}>⏱️</span>
          </div>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryLabel}>Avg Wait Time</span>
            <h3 className={styles.summaryValue}>{metrics.avg_wait_time}m</h3>
            <span className={styles.summaryTrend} style={{ color: '#f97316' }}>Patient Flow</span>
          </div>
        </div>
      </motion.section>

      <section className={styles.grid}>
        {/* LEFT COLUMN */}
        <div className={styles.leftCol}>
          {/* Recent Activity Table */}
          <motion.div className={styles.card} variants={itemVariants}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Recent Activity</h3>
              <Link href="/dashboard/doctor/patients" className={styles.link}>View All</Link>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Activity</th>
                    <th>Date/Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length > 0 ? appointments.slice(0, 8).map((app, idx) => (
                    <tr key={app.id || idx}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatarSmall}></div>
                          <span>{app.patient_name || app.patient?.full_name || "Patient"}</span>
                        </div>
                      </td>
                      <td>{app.reason || "Consultation"}</td>
                      <td>{new Date(app.requested_date).toLocaleDateString()}</td>
                      <td>
                        <span className={app.status === 'accepted' ? styles.success : styles.inReview}>
                          {(app.status || "Pending").charAt(0).toUpperCase() + (app.status || "Pending").slice(1)}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No recent activity</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} style={{ width: '100%' }}>
            <TasksSection onRefresh={refreshMonthData} />
          </motion.div>
        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.rightCol}>
          {/* Calendar Widget */}
          <motion.div variants={itemVariants} className={styles.card} style={{ marginBottom: '16px' }}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{currentMonthName} {currentYear}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => changeMonth(-1)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#1e293b', fontWeight: 'bold' }}>‹</button>
                <button onClick={() => changeMonth(1)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#1e293b', fontWeight: 'bold' }}>›</button>
              </div>
            </div>

            <div className={styles.dayNames}>
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
            </div>

            <div className={styles.calendarGrid}>
              {daysInMonth.map(day => {
                const isToday = isTodayMonth && day === todayDate;
                const isBusy = [3, 12, 18, 24].includes(day);
                const isVeryBusy = [5, 15].includes(day);

                return (
                  <div
                    key={day}
                    className={`${styles.calendarCell} ${isToday ? styles.cellToday : ""}`}
                    onClick={() => handleDayClick(day)}
                    style={{ position: 'relative' }}
                  >
                    {day}
                    {(isBusy || isVeryBusy) && (
                      <div style={{
                        position: 'absolute',
                        bottom: '4px',
                        display: 'flex',
                        gap: '2px'
                      }}>
                        {isBusy && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#3b82f6' }}></span>}
                        {isVeryBusy && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ef4444' }}></span>}
                        {isToday && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#10b981' }}></span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Today's Schedule Card */}
          <motion.div variants={itemVariants} className={styles.card} style={{ marginBottom: '16px' }}>
            <div className={styles.cardHeader} style={{ marginBottom: '12px' }}>
              <h3 className={styles.cardTitle}>Today's Schedule</h3>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>{appointments.length} Total</span>
            </div>

            {appointments.length > 0 ? (
              <div className={styles.profileCardCompact}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div className={styles.profileName} style={{ fontSize: '15px' }}>
                    {appointments[0].patient_name || "Patient Session"}
                  </div>
                  <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '13px' }}>
                    {new Date(appointments[0].requested_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                  {appointments[0].reason || "General Consultation"}
                </div>
                <div className={styles.profileActions}>
                  <button className={styles.startMeetBtn} style={{ height: '32px', fontSize: '12px' }} onClick={handleStartSession}>Join Now</button>
                  <button className={styles.detailsBtn} style={{ height: '32px', fontSize: '12px' }} onClick={() => router.push(`/dashboard/doctor/patients/${appointments[0].patient_id}`)}>View Record</button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '10px' }}>No visits scheduled</p>
            )}
          </motion.div>

          {/* On-duty Staff */}
          <motion.div variants={itemVariants} className={styles.card}>
            <div className={styles.cardHeader} style={{ marginBottom: '12px' }}>
              <h3 className={styles.cardTitle}>On-Duty Staff</h3>
              <Link href="/dashboard/doctor/team" className={styles.link}>Manage</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {teamMembers.length > 0 ? teamMembers.slice(0, 3).map((staff, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className={styles.avatarSmall} style={{ background: staff.role === 'Admin' ? '#fef3c7' : '#ecfdf5' }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{staff.full_name || staff.name || "Team Member"}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{staff.role || "Staff"} • Active</div>
                  </div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: staff.status === 'offline' ? '#cbd5e1' : '#10b981' }}></div>
                </div>
              )) : (
                <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>No active staff listed</p>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Start Session Modal */}
      {showConsentModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Pre-Visit Checklist</h3>
              <p className={styles.modalSub}>Please verify the required pre-requisites before initializing the AI scribe session.</p>
            </div>

            <div className={styles.checkboxGroup}>
              <label className={`${styles.checkboxItem} ${consentVerified ? styles.checkboxItemActive : ""}`}>
                <input type="checkbox" checked={consentVerified} onChange={(e) => setConsentVerified(e.target.checked)} style={{ width: "18px", height: "18px", cursor: "pointer" }} />
                <span className={`${styles.checkboxLabel} ${consentVerified ? styles.checkboxLabelActive : ""}`}>Patient Consent Verified</span>
              </label>

              <label className={`${styles.checkboxItem} ${recordingReady ? styles.checkboxItemActive : ""}`}>
                <input type="checkbox" checked={recordingReady} onChange={(e) => setRecordingReady(e.target.checked)} style={{ width: "18px", height: "18px", cursor: "pointer" }} />
                <span className={`${styles.checkboxLabel} ${recordingReady ? styles.checkboxLabelActive : ""}`}>Recording Hardware Ready</span>
              </label>
            </div>

            {showConsentError && (!consentVerified || !recordingReady) && (
              <div className={styles.errorMsg}>
                Please check all required boxes to proceed.
              </div>
            )}

            <div className={styles.modalActions}>
              <button className={styles.detailsBtn} onClick={() => setShowConsentModal(false)}>Cancel</button>
              <button
                className={styles.primaryBtn}
                onClick={proceedToSession}
                style={{
                  background: (consentVerified && recordingReady) ? "" : "#cbd5e1",
                  cursor: (consentVerified && recordingReady) ? "pointer" : "not-allowed"
                }}
              >
                Join Meet
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
