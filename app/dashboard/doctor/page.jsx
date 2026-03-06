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
import { fetchAppointments, createConsultation, fetchProfile, fetchTasks, fetchPatients } from "@/services/doctor";
import { fetchQueueMetrics } from "@/services/consultation";
import Link from "next/link";
import { ClipboardList, AlertTriangle, CheckCircle, Timer, ChevronLeft, ChevronRight, X, Plus } from "lucide-react";

import { fetchCalendarMonth, fetchCalendarDay, deleteCalendarEvent, createCalendarEvent } from "@/services/calendar";
import StartSessionModal from "./components/StartSessionModal";

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
  const [currentDate, setCurrentDate] = useState(null);
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
  const [selectedDate, setSelectedDate] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", type: "event", time: "10:00" });
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [metrics, setMetrics] = useState({
    pending_review: 0,
    high_urgency: 0,
    cleared_today: 0,
    today_meetings: 0,
    total_patients: 0,
    total_records: 0
  });

  const loadDashboardData = async () => {
    try {
      const [appts, profile, tasks, patients, queueData, clinicalMetrics] = await Promise.all([
        fetchAppointments().catch(() => []),
        fetchProfile().catch(() => null),
        fetchTasks().catch(() => []),
        fetchPatients().catch(() => []),
        fetchQueueMetrics().catch(() => ({ pending_review: 0, high_urgency: 0, cleared_today: 0 })),
        import("@/services/doctor").then(m => m.fetchDashboardMetrics().catch(() => null))
      ]);

      if (!profile) return;

      if (profile.role !== "doctor") {
        const r = (profile.role || "").toLowerCase();
        const path = r === "patient" ? "/dashboard/patient"
          : (r === "admin" || r === "administrator") ? "/dashboard/admin"
            : r === "hospital" ? "/dashboard/hospital"
              : null;
        if (path) router.replace(path);
        return;
      }

      const consultationsData = await import("@/services/consultation").then(m => m.fetchConsultations().catch(() => ({ consultations: [] })));
      const consultations = Array.isArray(consultationsData) ? consultationsData : (consultationsData?.consultations || consultationsData?.items || []);

      const today = new Date().toISOString().split('T')[0];
      const todayAppts = (appts || []).filter(a => {
        const d = new Date(a.requested_date || a.date || a.scheduled_at).toISOString().split('T')[0];
        return d === today;
      });

      const urgentTasks = (tasks || []).filter(t => t.status !== "completed" && (t.priority === "high" || t.priority === "urgent")).length;

      setAppointments(appts || []);
      setDoctorProfile(profile);

      setMetrics({
        pending_review: clinicalMetrics?.pending_notes || queueData.pending_review || 0,
        high_urgency: urgentTasks || clinicalMetrics?.urgent_notes || queueData.high_urgency || 0,
        cleared_today: queueData.cleared_today || 0,
        today_meetings: todayAppts.length,
        total_patients: patients.length,
        total_records: consultations.length
      });
    } catch (err) {
      console.error("Failed to load doctor dashboard data:", err);
    }
  };

  const refreshMonthData = async () => {
    if (!currentDate) return;
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
    setIsMounted(true);
    setCurrentDate(new Date());
    setSelectedDate(new Date());
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

  if (!isMounted || !currentDate) return null;

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
    const newSelected = new Date(currentYear, currentDate.getMonth(), day);
    setSelectedDate(newSelected);
    try {
      const dateStr = newSelected.toISOString().split('T')[0];
      const events = await fetchCalendarDay(dateStr);
      setSelectedDayEvents(events?.events || []);
    } catch (err) {
      console.error("Failed to fetch calendar day data:", err);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title.trim()) return;
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      await createCalendarEvent({
        title: newEvent.title,
        event_type: newEvent.type,
        start_time: `${dateStr}T${newEvent.time}:00Z`,
        end_time: `${dateStr}T${parseInt(newEvent.time.split(':')[0]) + 1}:00:00Z`
      });
      setIsEventModalOpen(false);
      setNewEvent({ title: "", type: "event", time: "10:00" });
      refreshMonthData();
      handleDayClick(selectedDate.getDate());
    } catch (err) {
      console.error("Failed to create event:", err);
    }
  };

  const getDayAvailability = (day) => {
    return "none";
  };

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
      {!isMounted ? null : (
        <>
          <motion.div variants={itemVariants}>
            <Topbar />
          </motion.div>
          {/* 
      <OnboardPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => router.push("/dashboard/doctor/patients")}
      /> */}

          <StartSessionModal
            isOpen={showConsentModal}
            onClose={() => setShowConsentModal(false)}
            onSessionStarted={(session) => {
              loadDashboardData();
            }}
          />

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
                  title="Upload Documents"
                >
                  <img src={uploadIcon.src} alt="Upload" width="20" height="20" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={styles.iconBtn}
                  onClick={() => router.push("/dashboard/doctor/patients")}
                  title="Add Patient"
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
                <ClipboardList size={22} />
              </div>
              <div className={styles.summaryInfo}>
                <span className={styles.summaryLabel}>Pending Review</span>
                <h3 className={styles.summaryValue}>{metrics.pending_review}</h3>
                <span className={styles.summaryTrend} style={{ color: '#3b82f6' }}>Awaiting Sign-off</span>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={`${styles.summaryIcon}`} style={{ background: '#fef2f2', color: '#ef4444' }}>
                <AlertTriangle size={22} />
              </div>
              <div className={styles.summaryInfo}>
                <span className={styles.summaryLabel}>High Urgency</span>
                <h3 className={styles.summaryValue}>{metrics.high_urgency}</h3>
                <span className={styles.summaryTrend} style={{ color: '#ef4444' }}>Immediate Action</span>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={`${styles.summaryIcon}`} style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <CheckCircle size={22} />
              </div>
              <div className={styles.summaryInfo}>
                <span className={styles.summaryLabel}>Cleared Today</span>
                <h3 className={styles.summaryValue}>{metrics.cleared_today}</h3>
                <span className={styles.summaryTrend} style={{ color: '#16a34a' }}>Successfully Processed</span>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={`${styles.summaryIcon}`} style={{ background: '#fff7ed', color: '#f97316' }}>
                <Timer size={22} />
              </div>
              <div className={styles.summaryInfo}>
                <span className={styles.summaryLabel}>Today's Total Meetings</span>
                <h3 className={styles.summaryValue}>{metrics.today_meetings}</h3>
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
                    <button onClick={() => changeMonth(-1)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#1e293b', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}><ChevronLeft size={18} /></button>
                    <button onClick={() => changeMonth(1)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#1e293b', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}><ChevronRight size={18} /></button>
                  </div>
                </div>

                <div className={styles.dayNames}>
                  <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                </div>

                <div className={styles.calendarGrid}>
                  {daysInMonth.map(day => {
                    const dayDate = new Date(currentYear, currentDate.getMonth(), day);
                    const isToday = isTodayMonth && day === todayDate;
                    const isSelected = selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth();
                    const dayInfo = monthData?.days?.find(d => d.day === day);
                    const eventCount = dayInfo?.event_count || 0;

                    const isBusy = eventCount > 0;
                    const isVeryBusy = eventCount >= 3;
                    return (
                      <div
                        key={day}
                        className={`${styles.calendarCell} ${isToday ? styles.cellToday : ""} ${isSelected ? styles.cellActive : ""}`}
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

                <button
                  className={styles.addTaskBtn}
                  style={{ marginTop: '12px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={() => setIsEventModalOpen(true)}
                  disabled={!selectedDate}
                >
                  <Plus size={16} /> Add Event
                </button>
              </motion.div>

              {/* Today's Schedule Card -> Now Selected Day's Events */}
              <motion.div variants={itemVariants} className={styles.card} style={{ marginBottom: '16px' }}>
                <div className={styles.cardHeader} style={{ marginBottom: '12px' }}>
                  <h3 className={styles.cardTitle}>
                    {selectedDate.toDateString() === new Date().toDateString() ? "Today's Schedule" : `${selectedDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })} Schedule`}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{(selectedDayEvents || []).length} Items</span>
                </div>

                {(selectedDayEvents || []).length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(selectedDayEvents || []).map((ev, idx) => (
                      <div key={ev.id || idx} className={styles.profileCardCompact} style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>{ev.title}</div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                              {ev.start_time ? new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "All-day"}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteEvent(ev.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '10px' }}>No events scheduled</p>
                )}
              </motion.div>


            </div>
          </section>

          {/* Add Event Modal */}
          {isEventModalOpen && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent} style={{ maxWidth: '400px' }}>
                <div className={styles.modalHeader}>
                  <h3 className={styles.modalTitle}>Add Calendar Event</h3>
                  <p className={styles.modalSub}>{selectedDate?.toDateString()}</p>
                </div>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '5px' }}>Title</label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="Event title"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '5px' }}>Type</label>
                      <select
                        value={newEvent.type}
                        onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      >
                        <option value="event">Event</option>
                        <option value="task">Task</option>
                        <option value="reminder">Reminder</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '5px' }}>Time</label>
                      <input
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.modalActions} style={{ padding: '20px', borderTop: '1px solid #e2e8f0' }}>
                  <button className={styles.detailsBtn} onClick={() => setIsEventModalOpen(false)}>Cancel</button>
                  <button className={styles.primaryBtn} onClick={handleCreateEvent}>Save Event</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
