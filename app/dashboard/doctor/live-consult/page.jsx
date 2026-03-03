"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Topbar from "../components/Topbar";
import styles from "./LiveConsult.module.css";
import search from "@/public/icons/search.svg"
import mic from "@/public/icons/mic.svg";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fetchProfile, fetchRecentPatients } from "@/services/doctor";

export default function LiveConsultPage() {
    const router = useRouter();
    const [recentPatients, setRecentPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const profile = await fetchProfile();
                if (profile && profile.id) {
                    const patients = await fetchRecentPatients(profile.id);
                    setRecentPatients(patients);
                }
            } catch (err) {
                console.error("Failed to load recent patients", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ padding: '0 24px 24px 24px' }}
        >
            <Topbar />

            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>New Consultation Session</h1>
                <p className={styles.pageSub}>
                    Configure session parameters and link to patient record before starting
                </p>
            </div>

            <section className={styles.grid}>
                {/* LEFT COLUMN */}
                <div className={styles.leftCol}>

                    {/* Patient Context Card */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Patient Context</h3>

                        <div className={styles.cardContent}>
                            <label className={styles.label}>LINK TO PATIENT RECORD</label>
                            <div className={styles.searchBox}>
                                <Image src={search} alt="Search" className={styles.searchIcon} />
                                <input
                                    type="text"
                                    placeholder="Search patients, reports, notes..."
                                    className={styles.searchInput}
                                />
                            </div>

                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label className={styles.label}>LANGUAGE</label>
                                    <div className={styles.fakeInput}>English</div>
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>SESSION TYPE</label>
                                    <div className={styles.fakeInput}>General Checkup</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Patients Card */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Recent Patients</h3>

                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>PATIENT</th>
                                    <th>ACTIVITY</th>
                                    <th>DATE/TIME</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>Loading...</td></tr>
                                ) : recentPatients.length === 0 ? (
                                    <tr><td colSpan="3" style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>No recent patients found.</td></tr>
                                ) : (
                                    recentPatients.map((patientRecord, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <div className={styles.userCell}>
                                                    <div className={styles.avatar}></div>
                                                    {patientRecord.patient_name || patientRecord.full_name || patientRecord.name || "Unknown Patient"}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.activityCell}>
                                                    {patientRecord.last_activity || patientRecord.reason || "Consultation"}
                                                </div>
                                            </td>
                                            <td>{patientRecord.last_visit_date ? new Date(patientRecord.last_visit_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : "Recent"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>

                {/* RIGHT COLUMN */}
                <div className={styles.rightCol}>

                    {/* Audio Config Card */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}><Image src={mic} alt="Microphone" /> Audio Configuration</h3>

                        <div className={styles.cardContent}>
                            <label className={styles.label}>INPUT SOURCE</label>
                            <div className={styles.inputBox}>
                                <div className={styles.micPlaceholder}></div>
                                <span className={styles.inputText}>Macbook Pro Microphone</span>
                            </div>

                            <div className={styles.waveBox}>
                                <div className={styles.wavePlaceholder}>
                                    <div className={styles.bar}></div>
                                    <div className={styles.bar}></div>
                                    <div className={styles.bar}></div>
                                    <div className={styles.bar}></div>
                                    <div className={styles.bar}></div>
                                    <div className={styles.bar}></div>
                                    <div className={styles.bar}></div>
                                </div>
                            </div>
                        </div>

                        <button
                            className={styles.startSessionBtn}
                            onClick={() => router.push("/dashboard/doctor/video-call")}
                        >
                            <Image src={mic} alt="Microphone" /> Start Session
                        </button>
                    </div>


                </div>
            </section>
        </motion.div>
    );
}
