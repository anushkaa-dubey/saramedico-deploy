"use client";
import styles from "./DoctorDashboard.module.css";
import Sidebar from "./components/Sidebar";
import { usePathname } from "next/navigation";

export default function DoctorLayout({ children }) {
    const pathname = usePathname();
    const isSettingsPage = pathname?.startsWith("/dashboard/doctor/settings");

    if (isSettingsPage) {
        return <>{children}</>;
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
