"use client";

import Topbar from "../components/Topbar";
import RecordsTable from "./components/RecordsTable";
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
          <h2>My medical Records</h2>
          <p>Securely access your history, labs, and visit summaries. Documents are available for download upto 5 years.</p>
        </motion.div>

        <motion.div className={styles.card} variants={itemVariants}>
          <div className={styles.cardHeader}>
            <h3>Visit History</h3>

            <div className={styles.filters}>
              <select>
                <option>All Types</option>
              </select>

              <select>
                <option>Last 6 Months</option>
              </select>
            </div>
          </div>

          <RecordsTable />
        </motion.div>

      </motion.section>
    </motion.div>
  );
}
