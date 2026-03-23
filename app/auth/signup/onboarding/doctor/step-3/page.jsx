"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Step3.module.css";
import logo from "@/public/logo2.svg";
import { extractDoctorCredentials } from "@/services/doctor";

export default function DoctorOnboardingStep3() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [extracted, setExtracted] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setExtracted(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setExtracted(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (file) {
        // Try to extract credentials from the uploaded document
        try {
          const credentials = await extractDoctorCredentials(file);
          setExtracted(credentials);
        } catch (extractErr) {
          console.warn("Credential extraction failed, continuing:", extractErr);
        }
      }

      // Navigate to dashboard — onboarding was completed in step 2
      router.push("/dashboard/doctor");
    } catch (err) {
      console.error("Failed to process document:", err);
      setError(err.message || "Failed to process document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/dashboard/doctor");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src={logo.src} alt="SaraMedico" className={styles.logo} />
      </div>

      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.topBar}>
            <div className={styles.stepInfo}>
              <span className={styles.stepTitle}>STEP 3 OF 3</span>
              <h2 className={styles.mainTitle}>Document Upload (Optional)</h2>
            </div>
            <div className={styles.progressSection}>
              <span className={styles.progressText}>100% Completed</span>
              <div className={styles.progressBarBg}>
                <div className={styles.progressBarFill} style={{ width: "100%" }}></div>
              </div>
            </div>
          </div>
          {error && <div style={{ color: "red", padding: "0 40px", fontSize: "14px", marginBottom: "10px" }}>{error}</div>}

          <div className={styles.mainContent}>
            <div className={styles.headerBlock}>
              <h1 className={styles.heading}>Upload your Medical Certificate</h1>
              <p className={styles.subheading}>
                Upload your medical certificate or license document for verification. 
                This step is <strong>optional</strong> — you can skip it and upload later from your profile settings.
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.formLayout}>
              <div className={styles.cardGrid}>
                {/* Left Card: Upload Area */}
                <div className={styles.innerCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>📄 Medical Certificate</h3>
                  </div>

                  <div className={styles.cardBody}>
                    <div style={{
                      border: "2px dashed #cbd5e1",
                      borderRadius: "12px",
                      padding: "40px 24px",
                      textAlign: "center",
                      background: file ? "#f0fdf4" : "#f8fafc",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      minHeight: "200px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {file ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                          <div style={{ fontSize: "48px" }}>✅</div>
                          <div>
                            <p style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", marginBottom: "4px" }}>{file.name}</p>
                            <p style={{ fontSize: "13px", color: "#64748b" }}>{(file.size / 1024).toFixed(2)} KB</p>
                          </div>
                          <button 
                            type="button" 
                            onClick={handleRemoveFile}
                            style={{
                              background: "#fee2e2",
                              border: "none",
                              color: "#dc2626",
                              padding: "6px 16px",
                              borderRadius: "6px",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                          >
                            Remove File
                          </button>
                        </div>
                      ) : (
                        <>
                          <div style={{ fontSize: "48px", marginBottom: "12px" }}>📁</div>
                          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", marginBottom: "8px" }}>Drag and drop your document</h3>
                          <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>or click to browse your local files</p>
                          <label style={{
                            display: "inline-block",
                            padding: "10px 24px",
                            background: "#3b82f6",
                            color: "white",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "background 0.2s"
                          }}>
                            Select Files
                            <input
                              type="file"
                              style={{ display: "none" }}
                              accept=".jpg,.jpeg,.png,.webp,.pdf"
                              onChange={handleFileChange}
                            />
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Card: Tips */}
                <div className={`${styles.innerCard} ${styles.textCard}`}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>💡 Best Practices</h3>
                  </div>
                  <div className={styles.cardBody}>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      <li style={{ fontSize: "14px", color: "#475569", marginBottom: "14px", display: "flex", alignItems: "flex-start", gap: "10px", lineHeight: "1.5" }}>
                        <span style={{ color: "#16a34a", fontWeight: "bold", flexShrink: 0 }}>✓</span>
                        Clear text scans and high-resolution images work best.
                      </li>
                      <li style={{ fontSize: "14px", color: "#475569", marginBottom: "14px", display: "flex", alignItems: "flex-start", gap: "10px", lineHeight: "1.5" }}>
                        <span style={{ color: "#16a34a", fontWeight: "bold", flexShrink: 0 }}>✓</span>
                        Accepted formats: JPG, PNG, WebP, PDF
                      </li>
                      <li style={{ fontSize: "14px", color: "#475569", marginBottom: "14px", display: "flex", alignItems: "flex-start", gap: "10px", lineHeight: "1.5" }}>
                        <span style={{ color: "#ef4444", fontWeight: "bold", flexShrink: 0 }}>✗</span>
                        Do not upload password-protected files.
                      </li>
                      <li style={{ fontSize: "14px", color: "#475569", display: "flex", alignItems: "flex-start", gap: "10px", lineHeight: "1.5" }}>
                        <span style={{ color: "#3b82f6", fontWeight: "bold", flexShrink: 0 }}>ℹ</span>
                        You can always upload or update your documents later from your profile settings.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className={styles.footerActions}>
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => router.back()}
                >
                  Back
                </button>

                <div className={styles.rightActions}>
                  <button
                    type="button"
                    className={styles.skipBtn}
                    onClick={handleSkip}
                  >
                    Skip for now
                  </button>
                  <button
                    type="submit"
                    className={styles.continueBtn}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Finish →"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
