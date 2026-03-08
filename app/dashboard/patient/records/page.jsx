"use client";

import { useState } from "react";
import Topbar from "../components/Topbar";
import RecordsTable from "./components/RecordsTable";
import VisitHistory from "./components/VisitHistory";
import styles from "./Records.module.css";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function RecordsPage() {
  const [activeTab, setActiveTab] = useState("visits");

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <Topbar />
      </motion.div>

      <motion.section className={styles.wrapper} variants={itemVariants}>
        <motion.div className={styles.pageHeader} variants={itemVariants}>
          <div>
            <h2>My Medical Records</h2>
            <p>Securely access your history, labs, and visit summaries.</p>
          </div>
        </motion.div>

        <div className={styles.tabs}>
          <div
            className={`${styles.tab} ${activeTab === 'visits' ? styles.active : ''}`}
            onClick={() => setActiveTab('visits')}
          >
            Visit History
          </div>
          <div
            className={`${styles.tab} ${activeTab === 'docs' ? styles.active : ''}`}
            onClick={() => setActiveTab('docs')}
          >
            Documents
          </div>
        </div>

        <motion.div className={styles.card} variants={itemVariants}>
          {activeTab === 'visits' ? (
            <VisitHistory />
          ) : (
            <RecordsTable />
          )}
        </motion.div>

      </motion.section>
    </motion.div>
  );
}
