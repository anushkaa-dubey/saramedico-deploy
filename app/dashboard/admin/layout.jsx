"use client";
import styles from "./AdminDashboard.module.css";
import AdminSidebar from "./components/Sidebar";
import AdminTopbar from "./components/Topbar";

import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
    return (
        <div className={styles.container}>
            <AdminSidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' }}>
                <AdminTopbar />
                <main className={styles.main} style={{ flex: 1, overflowY: 'auto' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
