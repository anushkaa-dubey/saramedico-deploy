"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "./DoctorDashboard.module.css";
import Sidebar from "./components/Sidebar";
import { getAccessToken, getUser } from "@/services/tokenService";
import MeetingReminder from "../components/MeetingReminder";

export default function DoctorLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check auth synchronously via tokenService — no network call
        const token = getAccessToken();
        if (!token) {
            router.replace("/auth/login");
            return;
        }

        let role = "";
        try {
            const cached = getUser();
            if (cached) {
                const rawRole = cached?.role || "";
                role = String(rawRole).split(".").pop().trim().toLowerCase();
            }
        } catch (_) { }

        if (!role) {
            // No cached user — just let them in if token exists (API pages handle their own auth)
            setIsLoading(false);
            return;
        }

        if (role === "doctor") {
            setIsLoading(false);
            return;
        }

        // Wrong role — redirect to correct dashboard
        if (role === "patient") router.replace("/dashboard/patient");
        else if (role === "admin" || role === "administrator") router.replace("/dashboard/admin");
        else if (role === "hospital") router.replace("/dashboard/hospital");
        else router.replace("/auth/login");
    }, [router]);

    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f8fafc", color: "#64748b", fontWeight: "bold" }}>
                Loading Dashboard...
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Sidebar />
            <main className={styles.main}>
                {children}
            </main>
            <MeetingReminder />
        </div>
    );
}
