"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./PatientDashboard.module.css";
import Sidebar from "./components/Sidebar";

export default function PatientLayout({ children }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check auth synchronously from localStorage — no network call
        const token = localStorage.getItem("authToken");
        if (!token) {
            router.replace("/auth/login");
            return;
        }

        let role = "";
        try {
            const cached = localStorage.getItem("user");
            if (cached) {
                const user = JSON.parse(cached);
                const rawRole = user?.role || "";
                role = String(rawRole).split(".").pop().trim().toLowerCase();
            }
        } catch (_) { }

        if (!role) {
            // No cached user — just let them in if token exists
            setIsLoading(false);
            return;
        }

        if (role === "patient") {
            setIsLoading(false);
            return;
        }

        // Wrong role — redirect to correct dashboard
        if (role === "doctor") router.replace("/dashboard/doctor");
        else if (role === "admin" || role === "administrator") router.replace("/dashboard/admin");
        else if (role === "hospital") router.replace("/dashboard/hospital");
        else router.replace("/auth/login");
    }, [router]);

    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
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
        </div>
    );
}