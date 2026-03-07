"use client";

import { useState, useEffect } from "react";
import styles from "../PatientDashboard.module.css";
import heart_rate from "@/public/icons/heart_rate.svg";
import blood_pressure from "@/public/icons/blood_pressure.svg";
import weight from "@/public/icons/weight.svg";
import { fetchProfile } from "@/services/patient";
import { Thermometer, Wind, Droplet } from "lucide-react";

export default function Vitals() {
  const [vitals, setVitals] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVitals = async () => {
      try {
        const profile = await fetchProfile();
        if (profile && profile.latest_vitals) {
          const lv = profile.latest_vitals;
          setVitals({
            heartRate: lv.hr && lv.hr !== "N/A" ? lv.hr : null,
            bloodPressure: lv.bp && lv.bp !== "N/A" ? lv.bp : null,
            weight: lv.weight && lv.weight !== "N/A" ? lv.weight : null,
            temperature: lv.temp && lv.temp !== "N/A" ? lv.temp : null,
            respiratoryRate: lv.resp && lv.resp !== "N/A" ? lv.resp : null,
            oxygenSaturation: lv.spo2 && lv.spo2 !== "N/A" ? lv.spo2 : null,
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

  const vitalsConfig = [
    { key: "heartRate", label: "HEART RATE", unit: "bpm", icon: <img src={heart_rate.src} alt="Heart Rate" width="20" height="20" /> },
    { key: "bloodPressure", label: "BLOOD PRESSURE", unit: "mmHg", icon: <img src={blood_pressure.src} alt="Blood Pressure" width="20" height="20" /> },
    { key: "weight", label: "WEIGHT", unit: "kg", icon: <img src={weight.src} alt="Weight" width="20" height="20" /> },
    { key: "temperature", label: "TEMPERATURE", unit: "°C", icon: <Thermometer size={20} color="#ef4444" /> },
    { key: "respiratoryRate", label: "RESP. RATE", unit: "breaths/min", icon: <Wind size={20} color="#06b6d4" /> },
    { key: "oxygenSaturation", label: "SPO2", unit: "%", icon: <Droplet size={20} color="#3b82f6" /> },
  ];

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', width: '100%' }}>
        {vitalsConfig.map((v) => (
          <div className={styles.vitalCard} key={v.key} style={{ margin: 0 }}>
            <div className={styles.vitalLeft}>
              <div className={styles.vitalIcon} style={{ background: "#f1f5f9", borderRadius: "8px", width: 36, height: 36 }} />
              <div>
                <div className={styles.vitalLabel}>{v.label}</div>
                <div className={styles.vitalValue} style={{ color: "#cbd5e1" }}>—</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', width: '100%' }}>
      {vitalsConfig.map(v => {
        const val = vitals?.[v.key];
        return (
          <div className={styles.vitalCard} key={v.key} style={{ margin: 0 }}>
            <div className={styles.vitalLeft}>
              <div className={styles.vitalIcon}>
                {v.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div className={styles.vitalLabel}>{v.label}</div>
                {val ? (
                  <div className={styles.vitalValue} style={{ wordBreak: 'break-word', fontSize: '16px' }}>
                    {val} <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal' }}>{v.unit}</span>
                  </div>
                ) : (
                  <div className={styles.vitalValue} style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 500 }}>Not recorded</div>
                )}
              </div>
            </div>
            {val && <span className={styles.status}>On Record</span>}
          </div>
        );
      })}
    </div>
  );
}
