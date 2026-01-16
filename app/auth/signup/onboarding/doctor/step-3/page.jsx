"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Step3.module.css";
import logo from "@/public/logo2.svg";
import mic from "@/public/icons/mic.svg";

export default function DoctorOnboardingStep3() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);

  const handleStartRecording = () => {
    setIsRecording(true);

    setTimeout(() => {
      setIsRecording(false);
    }, 5000);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
              <h2 className={styles.mainTitle}>Audio Check</h2>
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
              <h1 className={styles.heading}>Check your Audio</h1>
              <p className={styles.subheading}>
                To ensure accurate speech recognition, please provide a short, de-identified audio recording for calibration.
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.formLayout}>
              <div className={styles.cardGrid}>
                {/* Left Card: Audio Config */}
                <div className={styles.innerCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}><img src={mic.src} alt="Mic" className={styles.micIcon} /> Audio Configuration</h3>
                  </div>

                  <div className={styles.cardBody}>
                    <label className={styles.label}>INPUT SOURCE</label>
                    <div className={styles.inputWrapper}>
                      <div className={styles.micIconPlaceholder}></div>
                      <select className={styles.selectInput} defaultValue="default">
                        <option value="default">Macbook Pro Microphone</option>
                        <option value="other">Other Microphone</option>
                      </select>
                    </div>

                    <div className={styles.waveBox}>
                      {isRecording ? (
                        <div className={styles.waveActive}>
                          <div className={styles.bar}></div>
                          <div className={styles.bar}></div>
                          <div className={styles.bar}></div>
                          <div className={styles.bar}></div>
                          <div className={styles.bar}></div>
                        </div>
                      ) : (
                        <div className={styles.wavePlaceholder}>
                          {/* Static placeholder wave */}
                          <div className={`${styles.bar} ${styles.static}`}></div>
                          <div className={`${styles.bar} ${styles.static}`}></div>
                          <div className={`${styles.bar} ${styles.static}`}></div>
                          <div className={`${styles.bar} ${styles.static}`}></div>
                          <div className={`${styles.bar} ${styles.static}`}></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Card: Sample Text */}
                <div className={`${styles.innerCard} ${styles.textCard}`}>
                  <div className={styles.cardHeader}>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.sampleText}>
                      I have been experiencing slight chest discomfort after climbing stairs, which goes away after resting. It usually lasts a few minutes and does not happen when I am sitting or lying down. I have not noticed any shortness of breath, dizziness, or sweating along with it.
                    </div>
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
                    onClick={() => router.push("/dashboard/doctor")}
                  >
                    Skip this step
                  </button>
                  <button
                    type="submit"
                    className={styles.continueBtn}
                  >
                    Continue →
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
