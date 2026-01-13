"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Step1.module.css";
import logo from "@/public/logo.png";

const specialties = [
  { id: "general_medicine", label: "General Medicine", icon: "" },
  { id: "cardiology", label: "Cardiology", icon: "" },
  { id: "dermatology", label: "Dermatology", icon: "" },
  { id: "pediatrics", label: "Pediatrics", icon: "" },
  { id: "psychiatry", label: "Psychiatry", icon: "" },
  { id: "orthopedics", label: "Orthopedics", icon: "" },
  { id: "oncology", label: "Oncology", icon: "" },
  { id: "neurology", label: "Neurology", icon: "" },
  { id: "radiology", label: "Radiology", icon: "" },
  { id: "surgery", label: "Surgery", icon: "" },
  { id: "emergency", label: "Emergency", icon: "" },
  { id: "other", label: "Other Speciality", icon: "" },
];

export default function DoctorOnboardingStep1() {
  const router = useRouter();
  const [selectedSpecialty, setSelectedSpecialty] = useState("general_medicine"); // Default selection
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSpecialties = specialties.filter((s) =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSpecialty) {
      alert("Please select a specialty");
      return;
    }
    // Save to state/context here if needed
    router.push("/auth/signup/onboarding/doctor/step-2");
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
              <span className={styles.stepTitle}>STEP 1 OF 3</span>
              <h2 className={styles.mainTitle}>Select Specialty</h2>
            </div>
            <div className={styles.progressSection}>
              <span className={styles.progressText}>33% Completed</span>
              <div className={styles.progressBarBg}>
                <div className={styles.progressBarFill} style={{ width: "33%" }}></div>
              </div>
            </div>
          </div>

          <div className={styles.mainContent}>
            <h1 className={styles.heading}>What is your primary medical speciality?</h1>
            <p className={styles.subheading}>Saramedico optimizes its clinical AI engine on your field of practice.</p>

            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Search patients, reports, notes..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className={styles.grid}>
              {filteredSpecialties.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.gridItem} ${selectedSpecialty === item.id ? styles.selected : ""
                    }`}
                  onClick={() => setSelectedSpecialty(item.id)}
                >
                  <div className={styles.iconWrapper}>{item.icon}</div>
                  <span className={styles.gridLabel}>{item.label}</span>
                  {selectedSpecialty === item.id && <div className={styles.checkMark}></div>}
                </button>
              ))}
            </div>

            <div className={styles.cantFind}>
              Can't find your specialty? <a href="#" onClick={(e) => e.preventDefault()}>Add it manually</a>
            </div>

            <div className={styles.footerActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => router.back()}
              >
                Cancel
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
  );
}
