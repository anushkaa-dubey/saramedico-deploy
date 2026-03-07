"use client";

import { useState, useEffect } from "react";
import styles from "./AdminDashboard.module.css";
import { motion } from "framer-motion";
import { fetchAdminOverview } from "@/services/admin";
import { fetchProfile } from "@/services/doctor";
import { useRouter } from "next/navigation";

import {
  Users,
  ClipboardList,
  Shield,
  User
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
    y: 0
  }
};

export default function AdminDashboard() {

  const router = useRouter();

  const [adminUser, setAdminUser] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const init = async () => {

      try {

        const [profile, overviewData] = await Promise.all([
          fetchProfile(),
          fetchAdminOverview()
        ]);

        if (!profile) {
          router.replace("/auth/login");
          return;
        }

        if (profile.role !== "admin") {

          const r = (profile.role || "").toLowerCase();

          const path =
            r === "patient"
              ? "/dashboard/patient"
              : r === "doctor"
              ? "/dashboard/doctor"
              : null;

          if (path) router.replace(path);

          return;

        }

        setAdminUser(profile);
        setOverview(overviewData);

      } catch (err) {

        console.error("Admin dashboard error:", err);

      } finally {

        setLoading(false);

      }

    };

    init();

  }, [router]);


  const adminName = adminUser?.full_name || "Admin";

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
      // style={{ width: "100%" }}
        style={{ width: "100%", paddingLeft: "20px" }}

    >

      {/* Header */}

      <motion.div
        className={styles.header}
        variants={itemVariants}
      >

        <div>

          <h2 className={styles.greeting}>
            System Overview
          </h2>

          <p className={styles.sub}>
            Welcome back, {adminName.split(" ")[0]}.
          </p>

        </div>

      </motion.div>


      {/* Summary Cards */}

      <motion.div
        className={styles.summaryCards}
        variants={itemVariants}
      >

        <div className={styles.summaryCard}>

          <div
            className={styles.summaryIcon}
            style={{
              background: "#eff6ff",
              color: "#3b82f6"
            }}
          >

            <Users size={22} />

          </div>

          <div className={styles.summaryInfo}>

            <span className={styles.summaryLabel}>
              Total Doctors
            </span>

            <h3 className={styles.summaryValue}>
              {loading ? "..." : overview?.total_doctors ?? "0"}
            </h3>

            <span
              className={styles.summaryTrend}
              style={{ color: "#16a34a" }}
            >
              Active medical staff
            </span>

          </div>

        </div>


        <div className={styles.summaryCard}>

          <div
            className={styles.summaryIcon}
            style={{
              background: "#fef2f2",
              color: "#ef4444"
            }}
          >

            <ClipboardList size={22} />

          </div>

          <div className={styles.summaryInfo}>

            <span className={styles.summaryLabel}>
              Today's Appointments
            </span>

            <h3 className={styles.summaryValue}>
              {loading ? "..." : overview?.appointments_today ?? "0"}
            </h3>

            <span
              className={styles.summaryTrend}
              style={{ color: "#3b82f6" }}
            >
              Scheduled today
            </span>

          </div>

        </div>


        <div className={styles.summaryCard}>

          <div
            className={styles.summaryIcon}
            style={{
              background: "#f0fdf4",
              color: "#16a34a"
            }}
          >

            <Shield size={22} />

          </div>

          <div className={styles.summaryInfo}>

            <span className={styles.summaryLabel}>
              Storage Usage
            </span>

            <h3 className={styles.summaryValue}>
              {loading
                ? "..."
                : overview?.storage?.percentage
                ? `${overview.storage.percentage}%`
                : "0%"}
            </h3>

            <span
              className={styles.summaryTrend}
              style={{ color: "#16a34a" }}
            >

              {overview?.storage?.used_gb
                ? `${overview.storage.used_gb}GB / ${overview.storage.total_gb}GB`
                : "Cloud storage"}

            </span>

          </div>

        </div>

      </motion.div>


      {/* Dashboard Grid */}

      <section className={styles.dashboardGrid}>

        {/* Recent Activity */}

        <motion.div
          className={styles.card}
          variants={itemVariants}
        >

          <div className={styles.cardHeader}>

            <h3>Recent Activity</h3>

          </div>

          <table className={styles.table}>

            <thead>

              <tr>
                <th>USER</th>
                <th>ACTION</th>
                <th>RESOURCE</th>
                <th>TIMESTAMP</th>
              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td colSpan="4" style={{ padding: "20px", textAlign: "center" }}>
                    Loading...
                  </td>
                </tr>

              ) : overview?.recent_activity?.length === 0 ? (

                <tr>
                  <td colSpan="4" style={{ padding: "20px", textAlign: "center" }}>
                    No activity found
                  </td>
                </tr>

              ) : (

                overview?.recent_activity?.map((log, i) => (

                  <tr key={log.id || i}>

                    <td>

                      <div className={styles.userCell}>

                        <div className={styles.avatarSmall}>

                          {log.user_avatar
                            ? <img src={log.user_avatar} alt="" />
                            : <User size={12} />}

                        </div>

                        {log.user_name}

                      </div>

                    </td>

                    <td>{log.event_description}</td>

                    <td>
                      <span
                        style={{
                          background: "#f3f4f6",
                          color: "#374151",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "600",
                          textTransform: "capitalize"
                        }}
                      >
                        {log.resource_type || "System"}
                      </span>
                    </td>

                    <td style={{ fontSize: "12px", color: "#6b7280" }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </motion.div>


        {/* System Alerts */}

        <motion.div
          className={styles.card}
          variants={itemVariants}
        >

          <div className={styles.cardHeader}>

            <h3>System Alerts</h3>

            {overview?.alerts?.length > 0 && (

              <span
                className={styles.badge}
                style={{
                  background: "#fef2f2",
                  color: "#ef4444"
                }}
              >

                {overview.alerts.length}

              </span>

            )}

          </div>

          <div className={styles.alertList} style={{ maxHeight: "300px", overflowY: "auto" }}>

            {loading ? (

              <div className={styles.alert}>
                Loading alerts...
              </div>

            ) : overview?.alerts?.length > 0 ? (

              overview.alerts.map((alert, i) => (

                <div
                  key={alert.id || i}
                  className={styles.alert}
                  style={{
                    borderLeft:
                      `4px solid ${alert.severity === "high" ? "#ef4444" : alert.severity === "medium" ? "#f59e0b" : "#3b82f6"}`,
                    marginBottom: "10px",
                    padding: "10px",
                    background: "#f9fafb",
                    borderRadius: "0 4px 4px 0"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "13px" }}>{alert.title}</strong>
                    <span style={{ fontSize: "10px", color: "#9ca3af" }}>{alert.time_ago}</span>
                  </div>
                  <p style={{ fontSize: "12px", margin: "4px 0 0", color: "#4b5563" }}>{alert.message}</p>

                </div>

              ))

            ) : (

              <div
                className={styles.alert}
                style={{ 
                  borderLeft: "4px solid #10b981",
                  background: "#f0fdf4",
                  padding: "15px",
                  borderRadius: "0 4px 4px 0"
                }}
              >

                <strong style={{ color: "#065f46" }}>All Systems Operational</strong>

                <p style={{ color: "#059669", fontSize: "12px" }}>No high priority alerts.</p>

              </div>

            )}

          </div>

        </motion.div>

      </section>

    </motion.div>

  );

}