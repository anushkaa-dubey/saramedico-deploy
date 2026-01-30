"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Step1.module.css";
import Image from "next/image";
import logo from "@/public/logo2.svg";
import search from "@/public/icons/search.svg";
import { updateDoctorProfile } from "@/services/doctor";

import genMedIcon from "@/public/icons/speciality/general_medicine.svg";
import cardiologyIcon from "@/public/icons/speciality/cardiology.svg";
import dermatologyIcon from "@/public/icons/speciality/dermatology.svg";
import pediatricsIcon from "@/public/icons/speciality/pediatrics.svg";
import psychiatryIcon from "@/public/icons/speciality/Psyc.svg";
import orthopedicsIcon from "@/public/icons/speciality/orthopedics.svg";
import oncologyIcon from "@/public/icons/speciality/oncology.svg";
import neurologyIcon from "@/public/icons/speciality/neurology.svg";
import radiologyIcon from "@/public/icons/speciality/radiology.svg";
import surgeryIcon from "@/public/icons/speciality/surgery.svg";
import emergencyIcon from "@/public/icons/speciality/emergency.svg";
import otherIcon from "@/public/icons/speciality/other.svg";

const specialties = [
  { id: "general_medicine", label: "General Medicine", icon: <img src={genMedIcon.src} alt="" width="40" height="40" /> },
  { id: "cardiology", label: "Cardiology", icon: <img src={cardiologyIcon.src} alt="" width="40" height="40" /> },
  { id: "dermatology", label: "Dermatology", icon: <img src={dermatologyIcon.src} alt="" width="40" height="40" /> },
  { id: "pediatrics", label: "Pediatrics", icon: <img src={pediatricsIcon.src} alt="" width="40" height="40" /> },
  { id: "psychiatry", label: "Psychiatry", icon: <img src={psychiatryIcon.src} alt="" width="40" height="40" /> },
  { id: "orthopedics", label: "Orthopedics", icon: <img src={orthopedicsIcon.src} alt="" width="40" height="40" /> },
  { id: "oncology", label: "Oncology", icon: <img src={oncologyIcon.src} alt="" width="40" height="40" /> },
  { id: "neurology", label: "Neurology", icon: <img src={neurologyIcon.src} alt="" width="40" height="40" /> },
  { id: "radiology", label: "Radiology", icon: <img src={radiologyIcon.src} alt="" width="40" height="40" /> },
  { id: "surgery", label: "Surgery", icon: <img src={surgeryIcon.src} alt="" width="40" height="40" /> },
  { id: "emergency", label: "Emergency", icon: <img src={emergencyIcon.src} alt="" width="40" height="40" /> },
  { id: "other", label: "Other Speciality", icon: <img src={otherIcon.src} alt="" width="40" height="40" /> },
];

export default function DoctorOnboardingStep1() {
  const router = useRouter();
  const [selectedSpecialty, setSelectedSpecialty] = useState("general_medicine"); // Default selection
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredSpecialties = specialties.filter((s) =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSpecialty) {
      alert("Please select a specialty");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Find the label for the selected ID
      const specialtyLabel = specialties.find(s => s.id === selectedSpecialty)?.label || selectedSpecialty;

      const updatedUser = await updateDoctorProfile({ specialty: specialtyLabel });

      // Update local storage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...user, ...updatedUser }));

      router.push("/auth/signup/onboarding/doctor/step-2");
    } catch (err) {
      console.error("Failed to update specialty:", err);
      setError(err.message || "Failed to save specialty. Please try again.");
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
              <span className={styles.searchIcon}><Image src={search.src} alt="Search" width="18" height="18" />  </span>
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
                disabled={loading}
              >
                {loading ? "Saving..." : "Continue →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
