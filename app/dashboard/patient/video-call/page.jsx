"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Topbar from "../components/Topbar";
import VideoBox from "../../doctor/video-call/components/VideoBox";
import ChatBox from "../../doctor/video-call/components/ChatBox";
import styles from "./VideoCall.module.css";
import contactIcon from "@/public/icons/contact.svg";
import { motion } from "framer-motion";

export default function VideoCallPage() {
    const [isCalling, setIsCalling] = useState(true);
    const [zoomClient, setZoomClient] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsCalling(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleEndCall = () => {
        if (zoomClient) {
            zoomClient.leave().catch(console.error);
        }
        router.push("/dashboard/patient");
    };

    if (isCalling) {
        return (
            <div className={styles.screen}>
                <div className={styles.transitionContainer}>
                    <img src={contactIcon.src} alt="Call" className={styles.callIcon} />
                    <h2 style={{ color: 'white' }}>Connecting...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.sessionContainer}>
            <Topbar />

            <div className={styles.patientHeader}>
                <h2 className={styles.sessionTitle}>Consultation with Dr. Sarah Smith</h2>
            </div>

            <main className={styles.patientGrid}>
                <div className={styles.patientVideoArea}>
                    <VideoBox
                        userRole="patient"
                        userName="Benjamin Frank"
                        onClientReady={(client) => setZoomClient(client)}
                        onEndCall={handleEndCall}
                    />
                </div>
                <div className={styles.patientChatArea}>
                    <ChatBox
                        currentUser="Benjamin Frank"
                        isDoctor={false}
                        zoomClient={zoomClient}
                    />
                </div>
            </main>
        </div>
    );
}
