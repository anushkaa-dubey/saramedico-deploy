"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./AdminDashboard.module.css";
import AdminSidebar from "./components/Sidebar";
import AdminTopbar from "./components/Topbar";

export default function AdminLayout({ children }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
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

        if (!role) { setIsLoading(false); return; }

        if (role === "admin" || role === "administrator") {
            setIsLoading(false);
            return;
        }

        if (role === "doctor") router.replace("/dashboard/doctor");
        else if (role === "patient") router.replace("/dashboard/patient");
        else if (role === "hospital") router.replace("/dashboard/hospital");
        else router.replace("/auth/login");
    }, [router]);

    if (isLoading) {
        return (
            <div style={{
                display: "flex", justifyContent: "center", alignItems: "center",
                height: "100vh", background: "#f8fafc",
                color: "#64748b", fontWeight: "bold"
            }}>
                Loading Dashboard...
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <AdminSidebar />

            <div className={styles.contentWrapper}>
                <AdminTopbar />
                <main className={styles.main}>
                    {children}
                </main>
            </div>
        </div>
    );
}