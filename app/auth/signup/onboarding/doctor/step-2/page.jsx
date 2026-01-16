"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Step2.module.css";
import logo from "@/public/logo.png";

export default function DoctorOnboardingStep2() {
  const router = useRouter();
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      // alert("Please upload a file");
      // return; 
    }
    // Upload logic here?
    router.push("/auth/signup/onboarding/doctor/step-3");
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
              <span className={styles.stepTitle}>STEP 2 OF 3</span>
              <h2 className={styles.mainTitle}>Upload Medical Record</h2>
            </div>
            <div className={styles.progressSection}>
              <span className={styles.progressText}>80% Completed</span>
              <div className={styles.progressBarBg}>
                <div className={styles.progressBarFill} style={{ width: "80%" }}></div>
              </div>
            </div>
          </div>

          <div className={styles.mainContent}>
            <div className={styles.headerBlock}>
              <h1 className={styles.heading}>Upload a Sample Medical Record</h1>
              <p className={styles.subheading}>
                To calibrate the AI to your specific documentation style, please upload a de-identified sample history or lab report.
              </p>
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

                  <a href="#" className={styles.viewSampleLink} onClick={(e) => e.preventDefault()}>
                    <span>📄 View Sample Document</span>
                    <span>→</span>
                  </a>

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
                  onClick={() => router.push("/auth/signup/onboarding/doctor/step-3")}
                >
                  Skip this step
                </button>
                <button
                  type="button"
                  className={styles.continueBtn}
                  onClick={handleSubmit}
                >
                  Continue →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
