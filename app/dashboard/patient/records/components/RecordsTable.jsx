"use client";
import { useState, useEffect } from "react";
import { fetchMedicalRecords } from "@/services/patient";
import styles from "../Records.module.css";

export default function RecordsTable() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await fetchMedicalRecords();
      setRecords(data);
    } catch (err) {
      console.error("Failed to fetch records:", err);
      setError("Failed to load records.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading records...</div>;
  if (error) return <div style={{ padding: "40px", textAlign: "center", color: "red" }}>{error}</div>;

  return (
    <>
      <div className={styles.tableContainer}>
        {records.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            No medical records found. Upload your first document to get started.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>DATE</th>
                <th>TITLE</th>
                <th>CATEGORY</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{new Date(record.upload_date).toLocaleDateString()}</td>
                  <td>{record.title}</td>
                  <td>{record.category?.replace("_", " ")}</td>
                  <td>
                    <span className={`${styles.status} ${styles.success}`}>
                      ● Available
                    </span>
                  </td>
                  <td className={styles.action}>
                    <a href={record.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                      View Doc →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className={styles.footer}>
          <span>Showing {records.length} results</span>
        </div>
      </div>
    </>
  );
}
