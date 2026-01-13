"use client";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import RecordsTable from "../records/components/RecordsTable";
import styles from "../records/Records.module.css"; // Reusing styles as layout is identical for table

export default function AppointmentsPage() {
    return (
        <div className={styles.container}>
            <Sidebar />

            <main className={styles.main}>
                <Topbar />

                <section className={styles.wrapper}>

                    <div className={styles.pageHeader}>
                        <h2>Appointments</h2>
                        <p>View your past and upcoming appointment history.</p>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3>Visit History</h3>

                            <div className={styles.filters}>
                                <select>
                                    <option>All Types</option>
                                </select>

                                <select>
                                    <option>Last 6 Months</option>
                                </select>
                            </div>
                        </div>

                        <RecordsTable />
                    </div>

                </section>
            </main>
        </div>
    );
}
