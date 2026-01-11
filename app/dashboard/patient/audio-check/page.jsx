"use client";

import { useRouter } from "next/navigation";
import styles from "./AudioCheck.module.css";
import micIcon from "@/public/icons/mic.svg";
import logo from "@/public/logo.png";

export default function AudioCheck() {
   const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src={logo.src} alt="SaraMedico" className={styles.logo} />
      </div>
      <div className={styles.content}>
        <h1 className={styles.title}>Check your Audio</h1>
        <p className={styles.subtitle}>
          To ensure accurate speech recognition, please provide a short,
          de-identified audio recording for calibration.
        </p>

        <div className={styles.cardWrapper}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Audio Configuration</h3>

            <label className={styles.label}>INPUT SOURCE</label>
            <div className={styles.inputBox}>
              <img src={micIcon.src} alt="Microphone" width="20" height="20" className={styles.iconPlaceholder} />
              <span className={styles.inputText}>Macbook Pro Microphone</span>
            </div>

            <div className={styles.waveBox}>
  <div className={styles.wavePlaceholder}>
    <div className={styles.bar}></div>
    <div className={styles.bar}></div>
    <div className={styles.bar}></div>
    <div className={styles.bar}></div>
    <div className={styles.bar}></div>
  </div>
</div>

          </div>
          <div className={styles.card}>
            <div className={styles.textPreview}>
              I have been experiencing slight chest discomfort after climbing
              stairs, which goes away after resting. It usually lasts a few
              minutes and does not happen when I am sitting or lying down. I
              have not noticed any shortness of breath, dizziness, or sweating
              along with it.
            </div>
          </div>
        </div>
        <div className={styles.footer}>
        <button className={styles.backBtn} onClick={() => router.push("/dashboard/patient")}>
         Back
        </button>

          <div className={styles.actions}>
            <button className={styles.skipBtn}>Skip this step</button>
            <button className={styles.continueBtn}>Continue →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
