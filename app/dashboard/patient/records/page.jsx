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

import { useState } from "react";
import { uploadMedicalRecord } from "@/services/patient";

export default function RecordsPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setUploading(true);
    setError("");

    try {
      await uploadMedicalRecord(formData);
      setShowUpload(false);
      window.location.reload(); // Simple refresh to show new record
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div>
              <h2>My medical Records</h2>
              <p>Securely access your history, labs, and visit summaries.</p>
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className={styles.editBtn}
              style={{ background: "#3b82f6", color: "white", border: "none" }}
            >
              + Upload Document
            </button>
          </div>
        </motion.div>

        {showUpload && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={styles.card}
            style={{ marginBottom: "20px", padding: "20px" }}
          >
            <h3>Upload New Document</h3>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
              <input type="text" name="title" placeholder="Document Title (e.g. Blood Test October)" required style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }} />
              <select name="category" required style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}>
                <option value="LAB_REPORT">Lab Report</option>
                <option value="IMAGING">Imaging (X-Ray/MRI)</option>
                <option value="PAST_PRESCRIPTION">Past Prescription</option>
                <option value="OTHER">Other</option>
              </select>
              <input type="text" name="description" placeholder="Short description" style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }} />
              <input type="file" name="file" required style={{ marginTop: "5px" }} />
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="submit" disabled={uploading} style={{ padding: "10px 20px", background: "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                  {uploading ? "Uploading..." : "Submit Upload"}
                </button>
                <button type="button" onClick={() => setShowUpload(false)} style={{ padding: "10px 20px", background: "#f1f5f9", border: "none", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
              </div>
            </form>
          </motion.div>
        )}

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
