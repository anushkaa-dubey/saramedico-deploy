"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Step1.module.css";
import logo from "@/public/logo2.svg";
import {
  Search, Stethoscope, HeartPulse, ScanFace, Baby, Brain, Bone,
  Activity, BrainCircuit, Scan, Scissors, Siren, Eye, Ear, Wind,
  Droplets, Dna, FlaskConical, Thermometer, Heart, Shield, Microscope,
  Zap, Users, Smile, Hand, Plus, X
} from "lucide-react";
import { SPECIALTIES } from "@/constants/medicalData";

const specialtyIcons = {
  general_medicine: <Stethoscope size={32} />,
  cardiology: <HeartPulse size={32} />,
  dermatology: <ScanFace size={32} />,
  pediatrics: <Baby size={32} />,
  psychiatry: <Brain size={32} />,
  orthopedics: <Bone size={32} />,
  oncology: <Activity size={32} />,
  neurology: <BrainCircuit size={32} />,
  radiology: <Scan size={32} />,
  surgery: <Scissors size={32} />,
  emergency: <Siren size={32} />,
  ophthalmology: <Eye size={32} />,
  ent: <Ear size={32} />,
  pulmonology: <Wind size={32} />,
  nephrology: <Droplets size={32} />,
  endocrinology: <Dna size={32} />,
  gastroenterology: <FlaskConical size={32} />,
  rheumatology: <Thermometer size={32} />,
  hematology: <Heart size={32} />,
  immunology: <Shield size={32} />,
  pathology: <Microscope size={32} />,
  anesthesiology: <Zap size={32} />,
  obstetrics_gynecology: <Users size={32} />,
  dentistry: <Smile size={32} />,
  physiotherapy: <Hand size={32} />,
  geriatrics: <Users size={32} />,
  urology: <Droplets size={32} />,
  plastic_surgery: <Scissors size={32} />,
  vascular_surgery: <Activity size={32} />,
  nuclear_medicine: <Scan size={32} />,
};

const specialties = SPECIALTIES.map(s => ({
  ...s,
  icon: specialtyIcons[s.id] || <Stethoscope size={32} />,
}));

export default function DoctorOnboardingStep1() {
  const router = useRouter();
  const [selectedSpecialty, setSelectedSpecialty] = useState("general_medicine");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualSpecialty, setManualSpecialty] = useState("");
  const [manualError, setManualError] = useState("");
  const [customLabel, setCustomLabel] = useState("");

  const filteredSpecialties = specialties.filter((s) =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleManualAdd = () => {
    const trimmed = manualSpecialty.trim();
    if (!trimmed) {
      setManualError("Please enter a specialty name.");
      return;
    }
    setCustomLabel(trimmed);
    setSelectedSpecialty(`custom_${trimmed.toLowerCase().replace(/\s+/g, "_")}`);
    setShowManualInput(false);
    setManualError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSpecialty) {
      alert("Please select a specialty");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const specialtyLabel = selectedSpecialty.startsWith("custom_")
        ? customLabel
        : specialties.find(s => s.id === selectedSpecialty)?.label || selectedSpecialty;

      const signupData = JSON.parse(sessionStorage.getItem("signup_data") || "{}");
      signupData.specialty = specialtyLabel;
      sessionStorage.setItem("signup_data", JSON.stringify(signupData));

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

          {/* Top Bar */}
          <div className={styles.topBar}>
            <div className={styles.stepInfo}>
              <span className={styles.stepTitle}>STEP 1 OF 3</span>
              <h2 className={styles.mainTitle}>Select Specialty</h2>
            </div>
            <div className={styles.progressSection}>
              <span className={styles.progressText}>
                {selectedSpecialty ? "33% Completed" : "15% Completed"}
              </span>
              <div className={styles.progressBarBg}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: selectedSpecialty ? "33%" : "15%" }}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={styles.mainContent}>
            <h1 className={styles.heading}>
              What is your primary medical speciality?
            </h1>
            <p className={styles.subheading}>
              Saramedico optimizes its clinical AI engine on your field of practice.
            </p>

            {/* Search */}
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Search Specialty"
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Grid */}
            <div className={styles.grid}>
              {filteredSpecialties.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.gridItem} ${selectedSpecialty === item.id ? styles.selected : ""}`}
                  onClick={() => setSelectedSpecialty(item.id)}
                >
                  <div className={styles.iconWrapper}>{item.icon}</div>
                  <span className={styles.gridLabel}>{item.label}</span>
                  {selectedSpecialty === item.id && (
                    <div className={styles.checkMark} />
                  )}
                </button>
              ))}

              {/* Custom specialty tile */}
              {customLabel && (
                <button
                  type="button"
                  className={`${styles.gridItem} ${selectedSpecialty.startsWith("custom_") ? styles.selected : ""}`}
                  onClick={() =>
                    setSelectedSpecialty(
                      `custom_${customLabel.toLowerCase().replace(/\s+/g, "_")}`
                    )
                  }
                >
                  <div className={styles.iconWrapper}>
                    <Plus size={32} />
                  </div>
                  <span className={styles.gridLabel}>{customLabel}</span>
                  {selectedSpecialty.startsWith("custom_") && (
                    <div className={styles.checkMark} />
                  )}
                </button>
              )}
            </div>

            {/* Add it manually */}
            {!showManualInput ? (
              <div className={styles.cantFind}>
                Can't find your specialty?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowManualInput(true);
                    setManualSpecialty("");
                    setManualError("");
                  }}
                >
                  Add it manually
                </a>
              </div>
            ) : (
              <div className={styles.manualInputSection}>
                <p className={styles.manualLabel}>Enter your specialty</p>
                <div className={styles.manualInputRow}>
                  <input
                    type="text"
                    className={styles.manualInput}
                    placeholder="e.g. Sports Medicine"
                    value={manualSpecialty}
                    onChange={(e) => {
                      setManualSpecialty(e.target.value);
                      setManualError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleManualAdd()}
                    autoFocus
                  />
                  <button
                    type="button"
                    className={styles.manualAddBtn}
                    onClick={handleManualAdd}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    className={styles.manualCancelBtn}
                    onClick={() => {
                      setShowManualInput(false);
                      setManualError("");
                    }}
                    aria-label="Cancel"
                  >
                    <X size={16} />
                  </button>
                </div>
                {manualError && (
                  <p className={styles.manualError}>{manualError}</p>
                )}
              </div>
            )}

            {error && <p className={styles.errorText}>{error}</p>}

            {/* Footer Actions */}
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