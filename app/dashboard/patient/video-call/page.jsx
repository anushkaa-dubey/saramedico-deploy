"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Topbar from "../components/Topbar";
import styles from "./VideoCall.module.css";
import contactIcon from "@/public/icons/contact.svg";
import { motion } from "framer-motion";
import { fetchAppointments } from "@/services/patient";

export default function VideoCallPage() {
    const [appointment, setAppointment] = useState(null);
    const router = useRouter();

    useEffect(() => {
        loadSession();
    }, []);

    const loadSession = async () => {
        try {
            const appointments = await fetchAppointments();
            const now = new Date();
            // Get most recent next appointment
            const next = appointments
                .filter(a => a.status === 'accepted')
                .sort((a, b) => new Date(a.requested_date) - new Date(b.requested_date))[0];

            if (next) setAppointment(next);
        } catch (err) {
            console.error("Failed to load session link:", err);
        }
    };

    // const handleJoinMeet = () => {
    //     const link = appointment?.meet_link;
    //     if (link) {
    //         window.open(link, "_blank");
    //     } else {
    //         alert("Meeting link not available yet. Please wait for the doctor.");
    //     }
    // };
    const handleJoinMeet = () => {
        const link =
            appointment?.meet_link || appointment?.join_url;

        if (link) {
            window.open(link, "_blank");
        } else {
            alert("Meeting link not available yet. Please wait for the doctor.");
        }
    };



    return (
        <div className={styles.sessionContainer}>
            <Topbar />

            <div className={styles.patientHeader}>
                <h2 className={styles.sessionTitle}>
                    Consultation with {appointment?.doctor_name || "your doctor"}
                </h2>
                <div className={styles.sessionStatus}>
                    <div className={styles.pulseDot}></div>
                    <span>Provider is preparing session</span>
                </div>
            </div>

            <main className={styles.meetJoinArea}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.joinCard}
                >
                    <div className={styles.meetIcon}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                            <path d="M15 8V16H5V8H15M16 6H4C3.45 6 3 6.45 3 7V17C3 17.55 3.45 18 4 18H16C16.55 18 17 17.55 17 17V13.5L21 17.5V6.5L17 10.5V7C17 6.45 16.55 6 16 6Z" fill="#3B82F6" />
                        </svg>
                    </div>
                    <h3>Ready to Join?</h3>
                    <p>This session will take place on Google Meet.</p>

                    <div className={styles.joinActions}>
                        <button
                            className={styles.joinMeetBtn}
                            onClick={handleJoinMeet}
                        >
                            Join Google Meet
                        </button>
                        <button className={styles.secondaryBtn} onClick={() => router.push("/dashboard/patient")}>
                            Back to Dashboard
                        </button>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
