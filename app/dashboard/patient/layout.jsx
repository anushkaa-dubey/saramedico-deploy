"use client";
import styles from "./PatientDashboard.module.css";
import Sidebar from "./components/Sidebar";

export default function Layout({ children }) {
    return (
        <div className={styles.container}>
            <Sidebar />
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
