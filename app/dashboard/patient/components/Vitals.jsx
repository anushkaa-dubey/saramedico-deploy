"use client";

import { useState, useEffect } from "react";
import styles from "../PatientDashboard.module.css";
import heart_rate from "@/public/icons/heart_rate.svg";
import blood_pressure from "@/public/icons/blood_pressure.svg";
import weight from "@/public/icons/weight.svg";
import { fetchProfile } from "@/services/patient";

export default function Vitals() {
  const [vitals, setVitals] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVitals = async () => {
      try {
        const profile = await fetchProfile();
        if (profile && (profile.heart_rate || profile.blood_pressure || profile.weight)) {
          setVitals({
            heartRate: profile.heart_rate || null,
            bloodPressure: profile.blood_pressure || null,
            weight: profile.weight || null,
          });
        }
      } catch (err) {
        console.error("Failed to load vitals:", err);
      } finally {
        setLoading(false);
      }
    };
    loadVitals();
  }, []);

  if (loading) {
    return (
      <>
        {["HEART RATE", "BLOOD PRESSURE", "WEIGHT"].map((label) => (
          <div className={styles.vitalCard} key={label}>
            <div className={styles.vitalLeft}>
              <div className={styles.vitalIcon} style={{ background: "#f1f5f9", borderRadius: "8px", width: 36, height: 36 }} />
              <div>
                <div className={styles.vitalLabel}>{label}</div>
                <div className={styles.vitalValue} style={{ color: "#cbd5e1" }}>—</div>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (!vitals) {
    return (
      <>
        <div className={styles.vitalCard}>
          <div className={styles.vitalLeft}>
            <div className={styles.vitalIcon}>
              <img src={heart_rate.src} alt="Heart Rate" width="20" height="20" />
            </div>
            <div>
              <div className={styles.vitalLabel}>HEART RATE</div>
              <div className={styles.vitalValue} style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 500 }}>Not recorded</div>
            </div>
          </div>
        </div>

        <div className={styles.vitalCard}>
          <div className={styles.vitalLeft}>
            <div className={styles.vitalIcon}>
              <img src={blood_pressure.src} alt="Blood Pressure" width="20" height="20" />
            </div>
            <div>
              <div className={styles.vitalLabel}>BLOOD PRESSURE</div>
              <div className={styles.vitalValue} style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 500 }}>Not recorded</div>
            </div>
          </div>
        </div>

        <div className={styles.vitalCard}>
          <div className={styles.vitalLeft}>
            <div className={styles.vitalIcon}>
              <img src={weight.src} alt="Weight" width="20" height="20" />
            </div>
            <div>
              <div className={styles.vitalLabel}>WEIGHT</div>
              <div className={styles.vitalValue} style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 500 }}>Not recorded</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.vitalCard}>
        <div className={styles.vitalLeft}>
          <div className={styles.vitalIcon}>
            <img src={heart_rate.src} alt="Heart Rate" width="20" height="20" />
          </div>
          <div>
            <div className={styles.vitalLabel}>HEART RATE</div>
            <div className={styles.vitalValue}>{vitals.heartRate}</div>
          </div>
        </div>
        <span className={styles.status}>On Record</span>
      </div>

      <div className={styles.vitalCard}>
        <div className={styles.vitalLeft}>
          <div className={styles.vitalIcon}>
            <img src={blood_pressure.src} alt="Blood Pressure" width="20" height="20" />
          </div>
          <div>
            <div className={styles.vitalLabel}>BLOOD PRESSURE</div>
            <div className={styles.vitalValue}>{vitals.bloodPressure}</div>
          </div>
        </div>
        <span className={styles.status}>On Record</span>
      </div>

      <div className={styles.vitalCard}>
        <div className={styles.vitalLeft}>
          <div className={styles.vitalIcon}>
            <img src={weight.src} alt="Weight" width="20" height="20" />
          </div>
          <div>
            <div className={styles.vitalLabel}>WEIGHT</div>
            <div className={styles.vitalValue}>{vitals.weight}</div>
          </div>
        </div>
        <span className={styles.status}>On Record</span>
      </div>
    </>
  );
}
