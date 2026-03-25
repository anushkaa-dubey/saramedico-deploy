"use client";
import { motion } from "framer-motion";
import Topbar from "./components/Topbar";
import UpNextCard from "./components/UpNextCard";
import Vitals from "./components/Vitals";
import RecentActivity from "./components/RecentActivity";
import QuickActions from "./components/QuickActions";
import styles from "./PatientDashboard.module.css";
import personIcon from "@/public/icons/person.svg";
import scheduleIcon from "@/public/icons/schedule.svg";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchProfile, fetchAppointments, fetchDoctors } from "@/services/patient";
import { fetchConsultations } from "@/services/consultation";
import { setUser as setStoredUser, getUser as getStoredUser } from "@/services/tokenService";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

export default function PatientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formattedDate, setFormattedDate] = useState("");

  /** Maps any backend role string to a safe dashboard path */
  const roleToDashboard = (role) => {
    if (!role) return null;
    const r = role.toLowerCase();
    if (r === "doctor") return "/dashboard/doctor";
    if (r === "admin" || r === "administrator" || r === "hospital") return "/dashboard/admin";
    return null; // stay on patient dashboard
  };

  // useEffect(() => {
  //   const load = async () => {
  //     try {
  //       const profile = await fetchProfile();
  //       setUser(profile);
  //       if (profile) localStorage.setItem("user", JSON.stringify(profile));
  //     } catch (err) {
  //       const stored = localStorage.getItem("user");
  //       if (stored) {
  //         try { setUser(JSON.parse(stored)); } catch (_) { }
  //       }
  //     }
  //   };
  //   load();
  // }, []);
  useEffect(() => {
    const load = async () => {
      try {
        const profile = await fetchProfile();

        if (!profile) {
          router.replace("/auth/login");
          return;
        }
        if (profile.role !== "patient") {
          const path = roleToDashboard(profile.role);
          if (path) router.replace(path);
          return;
        }

        setUser(profile);
        setStoredUser(profile);

        // Fetch everything in parallel
        const [cons, appts, docsList] = await Promise.all([
          fetchConsultations().catch(() => ({ consultations: [] })),
          fetchAppointments().catch(() => []),
          fetchDoctors().catch(() => [])
        ]);

        // API returns { consultations: [...], total: N } for consultations
        const list = Array.isArray(cons) ? cons : (cons?.consultations || []);

        // Resolve names for consultations if they are "Unknown Doctor"
        const resolvedList = list.map(c => {
          if (!c.doctorName || c.doctorName === "Unknown Doctor" || c.doctorName === "Doctor") {
            const matchedDoc = docsList.find(d => String(d.id) === String(c.doctorId));
            if (matchedDoc) {
              return { ...c, doctorName: matchedDoc.full_name || matchedDoc.name };
            }
          }
          return c;
        });

        // Resolve names for appointments if they are "Unknown Doctor"
        const resolvedAppts = (Array.isArray(appts) ? appts : []).map(a => {
          if (!a.doctor_name || a.doctor_name === "Unknown Doctor" || a.doctor_name === "Doctor") {
            const matchedDoc = docsList.find(d => String(d.id) === String(a.doctor_id));
            if (matchedDoc) {
              return { ...a, doctor_name: matchedDoc.full_name || matchedDoc.name };
            }
          }
          return a;
        });

        setConsultations(resolvedList);
        setAppointments(resolvedAppts);
        setDoctors(docsList);

        setFormattedDate(new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }));

      } catch (err) {
        const stored = getStoredUser();
        if (stored) {
          try {
            const parsed = stored;

            if (parsed.role !== "patient") {
              const path = roleToDashboard(parsed.role);
              if (path) router.replace(path);
            }

            setUser(parsed);
          } catch (_) { }
        }
      }
    };

    load();
  }, [router]);

  const firstName = user?.full_name
    ? user.full_name.split(" ")[0]
    : user?.first_name || "Patient";

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

      <motion.section className={styles.header} variants={itemVariants}>
        <div>
          <h2 className={styles.greeting}>Good Morning, {firstName}</h2>
          <p className={styles.sub}>
            Today's {formattedDate}
          </p>
        </div>

        {/* Desktop Header Actions */}
        <div className={styles.headerActions}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={styles.iconBtn}
            onClick={() => router.push("/dashboard/patient/appointments/request")}
          >
            <img src={scheduleIcon.src} alt="Schedule" width="20" height="20" />
          </motion.button>
        </div>


      </motion.section>

      <section className={styles.grid}>
        <div className={styles.rightCol}>
          <motion.div variants={itemVariants} style={{ width: "100%" }}>
            <Vitals />
          </motion.div>
          <motion.div variants={itemVariants} style={{ width: "100%" }}>
            <QuickActions />
          </motion.div>
        </div>

        <div className={styles.leftCol}>
          <div className={styles.dashboardActions}></div>

          {/* Mobile Title */}
          <div className={styles.mobileOnly} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontWeight: "700", fontSize: "16px", color: "#1e293b" }}>Up Next</span>
            <Link href="/dashboard/patient/appointments" style={{ color: "#2563eb", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>View Calendar</Link>
          </div>

          <motion.div variants={itemVariants}>
            {/* Combine consultations and appointments for UpNextCard */}
            <UpNextCard consultations={consultations} appointments={appointments} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <RecentActivity consultations={consultations} appointments={appointments} />
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
