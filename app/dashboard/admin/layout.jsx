"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchProfile } from "@/services/doctor";
import styles from "./AdminDashboard.module.css";
import AdminSidebar from "./components/Sidebar";
import AdminTopbar from "./components/Topbar";

export default function AdminLayout({ children }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

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
                
                const role = (profile.role || "").toLowerCase();
                if (role !== 'admin' && role !== 'administrator') {
                    if (role === 'doctor') router.replace("/dashboard/doctor");
                    else if (role === 'patient') router.replace("/dashboard/patient");
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

    return (
        <div className={styles.container}>
            <AdminSidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <AdminTopbar />
                <main className={styles.main} style={{ flex: 1, overflowY: 'auto' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
