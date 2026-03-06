"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./Step2.module.css";
import logo from "@/public/logo2.svg";
import { extractDoctorCredentials, updateDoctorProfile } from "@/services/doctor";
import { registerUser, loginUser } from "@/services/auth";


export default function DoctorOnboardingStep2() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [specialtySearch, setSpecialtySearch] = useState("");

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem("signup_data") || "{}");
    if (data.specialty) setSpecialtySearch(data.specialty);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please upload your medical certificate");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const signupData = JSON.parse(sessionStorage.getItem("signup_data") || "{}");
      if (!signupData.email) throw new Error("Signup data missing. Please restart registration.");

      // Ensure specialty is updated if they changed it in Step 2
      signupData.specialty = specialtySearch || signupData.specialty;

      // 1. Register User (This is the only time register is hit)
      await registerUser(signupData);

      // 2. Login to get token
      await loginUser({
        email: signupData.email,
        password: signupData.password
      });

      // 3. Extract credentials from the certificate
      if (file) {
        await extractDoctorCredentials(file);
      }

      // 4. Finalize onboarding
      const updatedUser = await updateDoctorProfile({ onboarding_complete: true });

      // 5. Update local storage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...user, ...updatedUser }));

      // 6. Redirect to dashboard
      router.push("/dashboard/doctor");
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      setError(err.message || "Failed to finalize registration. Please try again.");
    } finally {
      setLoading(false);
    }
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
              <span className={styles.stepTitle}>STEP 2 OF 2</span>
              <h2 className={styles.mainTitle}>Medical Certificate</h2>
            </div>
            <div className={styles.progressSection}>
              <span className={styles.progressText}>100% Completed</span>
              <div className={styles.progressBarBg}>
                <div className={styles.progressBarFill} style={{ width: "100%" }}></div>
              </div>
            </div>
          </div>

          <div className={styles.mainContent}>
            <div className={styles.headerBlock}>
              <h1 className={styles.heading}>Finalize your Clinician Profile</h1>
              <p className={styles.subheading}>
                Provide your medical specialty and upload your certificate to complete registration.
              </p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "8px", textTransform: "uppercase" }}>Primary Specialty</label>
              <input
                type="text"
                placeholder="Search Speacility"
                value={specialtySearch}
                onChange={(e) => setSpecialtySearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  fontSize: "15px",
                  background: "#ffffff",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                }}
              />
            </div>

            <div className={styles.cardContent}>
              <form onSubmit={handleSubmit} className={styles.formLayout}>
                {/* Left Side: Upload Area */}
                <div className={styles.uploadSection}>
                  <div className={styles.dropZone}>
                    {file ? (
                      <div className={styles.filePreview}>
                        <div className={styles.fileIcon}></div>
                        <div className={styles.fileDetails}>
                          <p className={styles.fileName}>{file.name}</p>
                          <p className={styles.fileSize}>{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <button type="button" onClick={handleRemoveFile} className={styles.removeBtn}>×</button>
                      </div>
                    ) : (
                      <>
                        <div className={styles.uploadIcon}></div>
                        <h3 className={styles.dropTitle}>Drag and drop your document</h3>
                        <p className={styles.dropSubtitle}>or click to browse your local files</p>
                        <label className={styles.browseButton}>
                          Select Files
                          <input
                            type="file"
                            className={styles.hiddenInput}
                            accept=".pdf,.docx,.txt,.dicom"
                            onChange={handleFileChange}
                          />
                        </label>
                      </>
                    )}
                  </div>
                </div>
                {/* right side */}
                <div className={styles.infoSide}>
                  <div className={styles.infoBlock}>
                    <h4 className={styles.infoTitle}>FILE REQUIREMENTS</h4>
                    <div className={styles.reqRow}>
                      <span>Max Size</span>
                      <span>50 MB</span>
                    </div>
                    <div className={styles.reqRow}>
                      <span>Supported Formats</span>
                    </div>
                    <div className={styles.formats}>
                      <span>PDF</span>
                      <span>DOCX</span>
                      <span>TXT</span>
                      <span>DICOM</span>
                    </div>
                  </div>

                  <div className={styles.divider}></div>

                  <div className={styles.infoBlock}>
                    <h4 className={styles.infoTitle}>BEST PRACTICES</h4>
                    <ul className={styles.bestPracticesList}>
                      <li>
                        <div className={styles.checkIcon}></div>
                        Ensure the sample includes standard headers (HPI, Assessment, Plan).
                      </li>
                      <li>
                        <div className={styles.checkIcon}></div>
                        Clear text scans work best. Handwritten notes are currently in beta.
                      </li>
                      <li>
                        <div className={styles.errorIcon}></div>
                        Do not upload password-protected files.
                      </li>
                    </ul>
                  </div>

                  <div className={styles.divider}></div>

                  {error && <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "12px", fontWeight: "600" }}>{error}</div>}


                </div>
              </form>
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
                  onClick={() => router.push("/dashboard/doctor")}
                >
                  Skip this step
                </button>
                <button
                  type="button"
                  className={styles.continueBtn}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Finish →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
