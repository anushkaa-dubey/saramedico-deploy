"use client";
import Image from "next/image";
import Topbar from "../components/Topbar";
import styles from "./LiveConsult.module.css";
import search from "@/public/icons/search.svg"
import mic from "@/public/icons/mic.svg";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LiveConsultPage() {
    const router = useRouter();
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
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
                                <tr>
                                    <td>
                                        <div className={styles.userCell}>
                                            <div className={styles.avatar}></div>
                                            John Von
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.activityCell}>
                                            Lab Results Reviewed
                                        </div>
                                    </td>
                                    <td>Today, 9:15 AM</td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className={styles.userCell}>
                                            <div className={styles.avatar}></div>
                                            John Von
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.activityCell}>
                                            Operation
                                        </div>
                                    </td>
                                    <td>Yesterday, 4:30 PM</td>
                                </tr>
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
