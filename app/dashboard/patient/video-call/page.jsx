"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Topbar from "../components/Topbar";
import styles from "./VideoCall.module.css";
import contactIcon from "@/public/icons/contact.svg";
import { motion } from "framer-motion";

export default function VideoCallPage() {
    const [isCalling, setIsCalling] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsCalling(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    if (isCalling) {
        return (
            <div className={styles.screen}>
                <div className={styles.transitionContainer}>
                    <div className={styles.callSymbol}>
                        <img src={contactIcon.src} alt="Call" className={styles.callIcon} />
                        <span className={styles.statusText}>Connecting to session...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Topbar />

            <div className={styles.grid} style={{ gridTemplateColumns: '1fr' }}>
                <div className={styles.leftCol}>
                    <div className={styles.videoCard}>
                        <div style={{ color: 'white', opacity: 0.8, fontSize: '14px' }}>Connecting to Dr. Sarah Smith...</div>
                    </div>

                    <div className={styles.controlsCard} style={{ justifyContent: 'center' }}>
                        <button
                            className={styles.endCallBtn}
                            onClick={() => router.push("/dashboard/patient")}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg>
                            End Call
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
