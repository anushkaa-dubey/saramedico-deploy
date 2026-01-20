"use client";
import styles from "./AdminDashboard.module.css";
import AdminSidebar from "./components/Sidebar";

import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
    return (
        <div className={styles.container}>
            <AdminSidebar />
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
