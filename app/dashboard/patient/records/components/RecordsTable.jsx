"use client";
import { useState, useEffect } from "react";
import { fetchMedicalRecords } from "@/services/patient";
import styles from "../Records.module.css";

const FILE_TYPE_CONFIG = {
  pdf: { label: "PDF", color: "#ef4444", bg: "#fef2f2" },
  doc: { label: "DOC", color: "#2563eb", bg: "#eff6ff" },
  docx: { label: "DOCX", color: "#2563eb", bg: "#eff6ff" },
  dicom: { label: "DICOM", color: "#7c3aed", bg: "#f5f3ff" },
  png: { label: "PNG", color: "#16a34a", bg: "#f0fdf4" },
  webp: { label: "WEBP", color: "#16a34a", bg: "#f0fdf4" },
  jpg: { label: "JPG", color: "#16a34a", bg: "#f0fdf4" },
  jpeg: { label: "JPEG", color: "#16a34a", bg: "#f0fdf4" },
  mp4: { label: "MP4", color: "#ea580c", bg: "#fff7ed" },
  mp3: { label: "MP3", color: "#ea580c", bg: "#fff7ed" },
  txt: { label: "TXT", color: "#64748b", bg: "#f8fafc" },
};

function getFileType(record) {
  if (record.file_type) return record.file_type.toLowerCase().replace(".", "");
  const name = record.file_name || record.title || record.presigned_url || record.url || "";
  const match = name.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  if (match) return match[1].toLowerCase();
  return "file";
}

function FileTypeBadge({ record }) {
  const ext = getFileType(record);
  const config = FILE_TYPE_CONFIG[ext] || { label: ext.toUpperCase() || "FILE", color: "#64748b", bg: "#f1f5f9" };
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: "6px",
      fontSize: "10px",
      fontWeight: "700",
      letterSpacing: "0.5px",
      color: config.color,
      background: config.bg,
      border: `1px solid ${config.color}22`,
    }}>
      {config.label}
    </span>
  );
}

function openDocument(record) {
  const url = record.presigned_url || record.downloadUrl || record.download_url || record.url || record.file_url;
  if (url) {
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    alert("Document URL is not available for this record.");
  }
}

const MONTHS = [
  "All", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function RecordsTable() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [monthFilter, setMonthFilter] = useState("All");

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await fetchMedicalRecords();
      const list = Array.isArray(data) ? data : [];

      // Intelligently deduplicate: if we have multiple records for the same file name, 
      // and one has a valid downloadUrl/presigned_url but the other doesn't, keep only the valid one.
      const uniqueFiles = new Map();
      list.forEach(doc => {
          const existing = uniqueFiles.get(doc.file_name);
          const hasUrl = doc.downloadUrl || doc.presigned_url;
          const existingHasUrl = existing ? (existing.downloadUrl || existing.presigned_url) : false;
          
          if (!existing) {
              doc.allIds = [doc.id];
              uniqueFiles.set(doc.file_name, doc);
          } else {
              existing.allIds.push(doc.id);
              if (hasUrl && !existingHasUrl) {
                  doc.allIds = existing.allIds;
                  uniqueFiles.set(doc.file_name, doc);
              }
          }
      });
      
      setRecords(Array.from(uniqueFiles.values()).sort((a,b) => 
          new Date(b.uploaded_at || b.created_at) - new Date(a.uploaded_at || a.created_at)
      ));
    } catch (err) {
      console.error("Failed to fetch records:", err);
      setError("Failed to load records.");
    } finally {
      setLoading(false);
    }
  };

  const fileTypes = ["All Types", ...new Set(records.map(r => getFileType(r).toUpperCase()).filter(Boolean))];

  const filtered = records.filter(record => {
    if (typeFilter !== "All Types") {
      if (getFileType(record).toUpperCase() !== typeFilter) return false;
    }
    // Month filter
    if (monthFilter !== "All") {
      const dateStr = record.uploaded_at || record.upload_date || record.created_at;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      const monthName = d.toLocaleString("default", { month: "long" });
      if (monthName !== monthFilter) return false;
    }
    return true;
  });

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading records...</div>;
  if (error) return <div style={{ padding: "40px", textAlign: "center", color: "red" }}>{error}</div>;

  return (
    <>
      {/* Filters */}
      <div className={styles.filters} style={{ marginBottom: "12px" }}>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          {fileTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}>
          {MONTHS.map(m => <option key={m} value={m}>{m === "All" ? "All Months" : m}</option>)}
        </select>
      </div>

      <div className={styles.tableContainer}>
        {filtered.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            {records.length === 0
              ? "No medical records found. Your doctor will upload any relevant documents here."
              : "No records match the selected filters."}
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>DATE</th>
                <th>TITLE</th>
                <th>TYPE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((record) => (
                <tr key={record.id}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {record.uploaded_at || record.upload_date || record.created_at
                      ? new Date(record.uploaded_at || record.upload_date || record.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                      : "—"}
                  </td>
                  <td>{record.title || record.file_name || "Untitled Document"}</td>
                  <td><FileTypeBadge record={record} /></td>
                  <td>
                      {(() => {
                        const hasUrl = record.presigned_url || record.downloadUrl || record.download_url || record.url;
                        return (
                          <span className={`${styles.status} ${hasUrl ? styles.success : styles.pending}`}>
                            {hasUrl ? "● Available" : "○ Processing"}
                          </span>
                        );
                      })()}
                  </td>
                  <td className={styles.action}>
                    <button
                      onClick={() => openDocument(record)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#2563eb",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: "pointer",
                        padding: 0,
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      View Doc →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className={styles.footer}>
          <span>Showing {filtered.length} of {records.length} records</span>
        </div>
      </div>
    </>
  );
}
