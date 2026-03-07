"use client";
import styles from "./Settings.module.css";
import Sidebar from "./components/Sidebar";

export default function SettingsLayout({ children }) {
    return (
        <div className={styles.pageWrapper}>
            <Sidebar />
            <div className={styles.contentWrapper}>
                {children}
            </div>
        </div>
    );
}
