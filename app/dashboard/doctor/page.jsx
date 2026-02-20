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
import { fetchAppointments } from "@/services/doctor";
import { fetchCalendarMonth, fetchCalendarDay, deleteCalendarEvent } from "@/services/calendar";

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

  const loadAppts = async () => {
    try {
      const data = await fetchAppointments();
      setAppointments(data);
    } catch (err) {
      console.error("Failed to load doctor appointments:", err);
    }
  };

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
    loadAppts();
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
    const data = monthData[day];
    if (!data) return "none";

    const count = typeof data === 'number' ? data : (data.count || 0);
    if (count >= 10) return "red";
    if (count > 0) return "green";
    return "none";
  };

  const handleStartSession = () => {
    if (!consentVerified || !recordingReady) {
      setShowConsentError(true);
      return;
    }
    router.push("/dashboard/doctor/video-call");
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={styles.primaryBtn}
                onClick={handleStartSession}
                style={{ opacity: (!consentVerified || !recordingReady) ? 0.6 : 1 }}
              >
                <img src={micWhiteIcon.src} alt="Start Session" width="16" height="16" />
                Start Session
              </motion.button>
            </div>
            {showConsentError && (!consentVerified || !recordingReady) && (
              <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 'bold', background: '#fee2e2', padding: '4px 8px', borderRadius: '4px' }}>
                {!consentVerified && "• Patient consent verification required. "}
                {!recordingReady && "• Recording hardware check failed."}
              </div>
            )}
            <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={consentVerified} onChange={(e) => setConsentVerified(e.target.checked)} />
                Consent Verified
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={recordingReady} onChange={(e) => setRecordingReady(e.target.checked)} />
                Recording Ready
              </label>
            </div>
          </div>
        </div>
      </motion.section>

      <section className={styles.grid}>
        {/* LEFT COLUMN */}
        <div className={styles.leftCol}>
          {/* Patient Profile Card (Today's Session) */}
          <motion.div className={styles.profileCard} variants={itemVariants}>
            <div className={styles.profileImage}>
              <img src={Daniel.src} alt="Daniel" />
            </div>
            <div className={styles.profileContent}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className={styles.profileName}>Daniel Benjamin</div>
                  <div className={styles.profileType}>Follow-Up · Post-op check</div>
                </div>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: '#3b82f615', color: '#3b82f6', fontWeight: '700' }}>
                  CHECKED-IN
                </span>
              </div>

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
                <button className={styles.startMeetBtn} onClick={handleStartSession}>Start Meet</button>
                <button className={styles.detailsBtn}>Details</button>
                <button className={styles.detailsBtn} style={{ borderColor: '#3b82f6', color: '#3b82f6' }}>Resume</button>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity / Selected Day Agenda */}
          <motion.div className={styles.card} variants={itemVariants}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{selectedDayEvents ? "Selected Day Agenda" : "Recent Activity"}</h3>
              <span className={styles.link} onClick={() => setSelectedDayEvents(null)} style={{ cursor: 'pointer' }}>
                {selectedDayEvents ? "View Recent Activity" : "View All"}
              </span>
            </div>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{selectedDayEvents ? "SUBJECT/PATIENT" : "PATIENT"}</th>
                  <th>{selectedDayEvents ? "TIME" : "ACTIVITY"}</th>
                  <th>{selectedDayEvents ? "TYPE" : "DATE/TIME"}</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {selectedDayEvents ? (
                  selectedDayEvents.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No events for this day</td></tr>
                  ) : (
                    selectedDayEvents.map((event) => {
                      const localTime = new Date(event.start_time || event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const status = event.event_type === "appointment" ? (event.metadata?.appointment_status || "Scheduled") : (event.event_type === "task" ? `Priority: ${event.metadata?.priority}` : "Custom");
                      const patientName = event.metadata?.patient_name || event.title || "Subject";
                      const zoomLink = event.metadata?.zoom_link;

                      return (
                        <tr key={event.id}>
                          <td>
                            <div className={styles.userCell}>
                              <div className={styles.avatarSmall}></div>
                              {patientName}
                            </div>
                          </td>
                          <td>{localTime}</td>
                          <td>{event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span className={styles.completed} style={{
                                background: (visitStates[status] || '#64748b') + '15',
                                color: visitStates[status] || '#64748b'
                              }}>
                                {status}
                              </span>
                              {zoomLink && (
                                <a href={zoomLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 'bold' }}>
                                  Zoom Link
                                </a>
                              )}
                              {event.event_type === 'custom' && (
                                <button
                                  onClick={() => handleDeleteEvent(event.id)}
                                  style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '10px', cursor: 'pointer', textAlign: 'left', padding: 0, fontWeight: 'bold' }}
                                >
                                  Delete Event
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )
                ) : (
                  <>
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
                        <span className={styles.completed} style={{ background: visitStates["Signed"] + '15', color: visitStates["Signed"] }}>Completed</span>
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
                        <span className={styles.inReview} style={{ background: visitStates["Needs Review"] + '15', color: visitStates["Needs Review"] }}>In Review</span>
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
                        <span className={styles.completed} style={{ background: visitStates["Signed"] + '15', color: visitStates["Signed"] }}>Completed</span>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </motion.div>
        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.rightCol}>
          {/* Calendar Widget */}
          <motion.div variants={itemVariants} className={styles.card} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>{currentMonthName} {currentYear}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => changeMonth(-1)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>‹</button>
                <button onClick={() => changeMonth(1)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>›</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => <div key={d} style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' }}>{d}</div>)}
              {daysInMonth.map(day => {
                const availability = getDayAvailability(day);
                return (
                  <div key={day}
                    onClick={() => handleDayClick(day)}
                    style={{
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      borderRadius: '50%',
                      background: isTodayMonth && day === todayDate ? '#3b82f6' : 'transparent',
                      color: isTodayMonth && day === todayDate ? 'white' : '#475569',
                      position: 'relative',
                      cursor: 'pointer'
                    }}>
                    {day}
                    {availability !== "none" && (
                      <div style={{
                        position: 'absolute',
                        bottom: '2px',
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: availability === 'red' ? '#ef4444' : '#10b981'
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} style={{ width: '100%' }}>
            <TasksSection onRefresh={refreshMonthData} />
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
