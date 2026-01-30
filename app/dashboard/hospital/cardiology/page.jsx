"use client";
import Sidebar from "../components/Sidebar";
import styles from "../HospitalDashboard.module.css";
import searchIcon from "@/public/icons/search.svg";
import notificationIcon from "@/public/icons/notification.svg";
import { motion } from "framer-motion";

export default function CardiologyDepartmentPage() {
    const staff = [
        { name: "Dr. Angel Batista", role: "Cardiologist", lastAccessed: "Today, 10:45 AM", status: "Active" },
        { name: "Maria Garcia", role: "Nurse", lastAccessed: "Yesterday, 4:20 PM", status: "Active" },
        { name: "Dr. David Chen", role: "Surgeon", lastAccessed: "Sept 12, 11:30 AM", status: "Active" },
        { name: "Elena Rossi", role: "Staff", lastAccessed: "Sept 10, 9:15 AM", status: "Active" },
        { name: "Dr. Angel Batista", role: "Cardiologist", lastAccessed: "Today, 10:45 AM", status: "Active" },
    ];

    return (
        <div className={styles.container}>
            <Sidebar />
            <main className={styles.main}>
                <div className={styles.topbar}>
                    <div className={styles.searchWrapper}>
                        <img src={searchIcon.src} alt="Search" className={styles.searchIcon} />
                        <input className={styles.search} placeholder="Search staff, reports..." />
                    </div>
                    <div className={styles.topActions}>
                        <button className={styles.iconBtn}>
                            <img src={notificationIcon.src} alt="Notifications" width="20" height="20" />
                        </button>
                        <div className={styles.profile}>
                            <div className={styles.profileInfo}>
                                <span>Cardiology Admin</span>
                                <small>Hospital Admin</small>
                            </div>
                            <div className={styles.avatar}></div>
                        </div>
                    </div>
                </div>

                <div className={styles.headerRow}>
                    <h1 className={styles.pageTitle}>Cardiology Department</h1>
                    <p className={styles.pageSub}>Manage roles, permissions, and staff assignments for the cardiology wing.</p>
                </div>

                <section className={styles.grid}>
                    <div className={styles.leftCol}>
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h3>Staff Directory</h3>
                                <button className={styles.filterBtn}>Filter</button>
                            </div>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>USER</th>
                                        <th>ROLE</th>
                                        <th>LAST ACCESSED</th>
                                        <th>STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staff.map((s, i) => (
                                        <tr key={i}>
                                            <td>
                                                <div className={styles.userCell}>
                                                    <div className={styles.avatarSmall}></div>
                                                    {s.name}
                                                </div>
                                            </td>
                                            <td>{s.role}</td>
                                            <td>{s.lastAccessed}</td>
                                            <td><span className={styles.statusActive}>{s.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className={styles.rightCol}>
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h3>STATISTICS</h3>
                            </div>
                            <div className={styles.statsGrid}>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>Total Staff</span>
                                    <span className={styles.statValue}>72</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>Active Now</span>
                                    <span className={styles.statValue}>18</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h3>QUICK ACTIONS</h3>
                            </div>
                            <div className={styles.actionList}>
                                <button className={styles.actionBtn}>
                                    Add New Staff member <span>→</span>
                                </button>
                                <button className={styles.actionBtn}>
                                    Update Department Roles <span>→</span>
                                </button>
                                <button className={styles.actionBtn}>
                                    Export Audit Logs <span>→</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
