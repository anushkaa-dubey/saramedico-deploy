"use client";
import { motion } from "framer-motion";
import Topbar from "./components/Topbar";
import UpNextCard from "./components/UpNextCard";
import Vitals from "./components/Vitals";
import RecentActivity from "./components/RecentActivity";
import QuickActions from "./components/QuickActions";
import styles from "./PatientDashboard.module.css";
import uploadIcon from "@/public/icons/upload.svg";
import personIcon from "@/public/icons/person.svg";
import scheduleIcon from "@/public/icons/schedule.svg";
import micWhiteIcon from "@/public/icons/mic_white.svg";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";


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

export default function PatientDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Patient");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.full_name) {
      setUserName(user.full_name.split(' ')[0]);
    } else if (user.username) {
      setUserName(user.username);
    }
  }, []);

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
          <h2 className={styles.greeting}>Good Morning, {userName}</h2>

          <p className={styles.sub}>Today's {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Desktop Header Actions - Hidden on mobile via CSS */}
        <div className={styles.headerActions}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={styles.iconBtn}
            onClick={() => router.push("/dashboard/patient/appointments/request")}
          >
            <img src={scheduleIcon.src} alt="Schedule" width="20" height="20" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={styles.iconBtn}>
            <img src={uploadIcon.src} alt="Upload" width="20" height="20" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={styles.iconBtn}>
            <img src={personIcon.src} alt="Add Person" width="20" height="20" />
          </motion.button>
        </div>

        {/* Mobile Search Bar  */}
        <div className={styles.mobileSearch}>
          <img src="/icons/search.svg" alt="Search" width="18" height="18" />
          <input type="text" placeholder="Search visits, reports, notes..." />
        </div>
      </motion.section>

      <section className={styles.grid}>
        <div className={styles.leftCol}>
          {/* Dashboard Quick Actions moved closer to appointment card */}
          <div className={styles.dashboardActions}>

          </div>

          {/* Mobile  Title */}
          <div className={styles.mobileOnly} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: '700', fontSize: '16px', color: '#1e293b' }}>Up Next</span>
            <a href="#" style={{ color: '#2563eb', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>View Calendar</a>
          </div>

          <motion.div variants={itemVariants}>
            <UpNextCard />
          </motion.div>

          {/* Mobile  Title */}
          <div className={styles.mobileOnly} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', marginBottom: '8px' }}>
            <span style={{ fontWeight: '700', fontSize: '16px', color: '#1e293b' }}>Recent Visits</span>
            <a href="#" style={{ color: '#2563eb', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>View All</a>
          </div>

          <motion.div variants={itemVariants}>
            <RecentActivity />
          </motion.div>
        </div>

        <div className={styles.rightCol}>
          <motion.div variants={itemVariants} style={{ width: '100%' }}>
            <Vitals />
          </motion.div>

          <motion.div variants={itemVariants} style={{ width: '100%' }}>
            <QuickActions />
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
