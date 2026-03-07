"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchProfile } from "@/services/doctor";
import styles from "./DoctorDashboard.module.css";
import Sidebar from "./components/Sidebar";

export default function DoctorLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    // const isSettingsPage = pathname?.startsWith("/dashboard/doctor/settings");

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("authToken");
            if (!token) {
                router.replace("/auth/login");
                return;
            }

            try {
                const profile = await fetchProfile().catch(() => null);
                if (!profile) {
                    router.replace("/auth/login");
                    return;
                }

                // Optional: Check role as well
                const role = (profile.role || "").toLowerCase();
                if (role !== 'doctor') {
                    // Redirect to correct dashboard or login
                    if (role === 'patient') router.replace("/dashboard/patient");
                    else if (role === 'admin' || role === 'administrator') router.replace("/dashboard/admin");
                    else if (role === 'hospital') router.replace("/dashboard/hospital");
                    else router.replace("/auth/login");
                    return;
                }

                setIsLoading(false);
            } catch (err) {
                console.error("Auth check failed:", err);
                router.replace("/auth/login");
            }
        };
        checkAuth();
    }, [router]);

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc', color: '#64748b', fontWeight: 'bold' }}>
            Loading Dashboard...
        </div>;
    }

    // if (isSettingsPage) {
    //     return <>{children}</>;
    // }

    return (
        <div className={styles.container}>
            <Sidebar />
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
