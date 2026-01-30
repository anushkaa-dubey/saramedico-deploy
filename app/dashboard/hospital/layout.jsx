"use client";
import styles from "./HospitalDashboard.module.css";
import Sidebar from "./components/Sidebar";

export default function HospitalLayout({ children }) {
    return (
        <div className={styles.container}>
            <Sidebar />
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
