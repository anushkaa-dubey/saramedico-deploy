"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchProfile } from "@/services/patient";
import styles from "./PatientDashboard.module.css";
import Sidebar from "./components/Sidebar";

export default function Layout({ children }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("authToken");

        if (!token) {
            router.replace("/auth/login");
            return;
        }

        const checkAuth = async () => {
            try {
                const profile = await fetchProfile();
                if (!profile) {
                    router.replace("/auth/login");
                    return;
                }

                const role = (profile.role || "").toLowerCase();

                if (role !== "patient") {
                    if (role === "doctor") router.replace("/dashboard/doctor");
                    else if (role === "admin" || role === "administrator") router.replace("/dashboard/admin");
                    else if (role === "hospital") router.replace("/dashboard/hospital");
                    else router.replace("/auth/login");
                    return;
                }

                setIsLoading(false);
            } catch (err) {
                router.replace("/auth/login");
            }
        };

        checkAuth();
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