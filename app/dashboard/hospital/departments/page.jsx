"use client";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion } from "framer-motion";

export default function DepartmentsPage() {
    const departments = [
        { name: "Cardiology", doctors: 12, patients: 45, employees: 30, beds: 25, color: "#3b82f6" },
        { name: "Neurology", doctors: 8, patients: 28, employees: 22, beds: 15, color: "#8b5cf6" },
        { name: "Pediatrics", doctors: 10, patients: 52, employees: 35, beds: 30, color: "#10b981" },
        { name: "General Surgery", doctors: 15, patients: 60, employees: 45, beds: 40, color: "#f59e0b" },
        { name: "Emergency", doctors: 20, patients: 85, employees: 55, beds: 50, color: "#ef4444" },
    ];

    const statsGroup = [
        { label: "Total Departments", value: "14", color: "#3b82f6" },
        { label: "Total Doctors", value: "128", color: "#10b981" },
        { label: "Staff Members", value: "342", color: "#8b5cf6" },
        { label: "Patient Capacity", value: "85%", color: "#f59e0b" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.container}
            style={{ flexDirection: 'column', background: 'transparent', padding: 0 }}
        >
            <Topbar title="Departments Overview" />

            <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                    {statsGroup.map((stat, i) => (
                        <div key={i} className={styles.card} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{stat.label}</div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '8px' }}>{stat.value}</div>
                            <div style={{ height: '4px', background: stat.color, borderRadius: '2px', marginTop: '12px', width: '40%', margin: '12px auto 0' }} />
                        </div>
                    ))}
                </div>

                <div className={styles.chartGrid}>
                    {/* Patients Per Department Bar Chart */}
                    <div className={styles.chartCard}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Patients per Department</h3>
                        <div className={styles.statBarContainer}>
                            {departments.map((dept, i) => (
                                <div key={i} className={styles.statBarItem}>
                                    <div className={styles.statBarLabel}>
                                        <span>{dept.name}</span>
                                        <span>{dept.patients} Patients</span>
                                    </div>
                                    <div className={styles.statBarTrack}>
                                        <motion.div
                                            className={styles.statBarFill}
                                            style={{ background: dept.color }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(dept.patients / 85) * 100}%` }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Staff Distribution Donut Chart (Custom SVG implementation) */}
                    <div className={styles.chartCard}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Bed Allocation</h3>
                        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                            <div className={styles.pieWrapper}>
                                <svg width="200" height="200" viewBox="0 0 42 42">
                                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="6"></circle>
                                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="6" strokeDasharray="40 60" strokeDashoffset="25"></circle>
                                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="6" strokeDasharray="30 70" strokeDashoffset="85"></circle>
                                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="6" strokeDasharray="30 70" strokeDashoffset="55"></circle>
                                    <g className="chartText">
                                        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" style={{ fontSize: '5px', fontWeight: '800', fill: '#0f172a' }}>160 Total</text>
                                    </g>
                                </svg>
                            </div>
                            <div className={styles.legendList}>
                                {departments.slice(0, 4).map((dept, i) => (
                                    <div key={i} className={styles.legendItem}>
                                        <div className={styles.legendColor} style={{ background: dept.color }} />
                                        <span>{dept.name}: {dept.beds} Beds</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.card} style={{ marginTop: '24px' }}>
                    <div className={styles.cardTitle}>
                        <span style={{ fontSize: '16px', fontWeight: '700' }}>Department Inventory & Metrics</span>
                        <button className={styles.outlineBtn}>Full Report</button>
                    </div>
                    <div className={styles.activityTableContainer} style={{ marginTop: '20px' }}>
                        <table className={styles.activityTable}>
                            <thead>
                                <tr className={styles.activityHeader}>
                                    <th>DEPARTMENT</th>
                                    <th>DOCTORS</th>
                                    <th>STAFF</th>
                                    <th>PATIENTS</th>
                                    <th style={{ textAlign: 'right' }}>BEDS AVAILABLE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.map((dept, i) => (
                                    <tr key={i} className={styles.activityRow}>
                                        <td style={{ fontWeight: '700' }}>{dept.name}</td>
                                        <td>{dept.doctors}</td>
                                        <td>{dept.employees}</td>
                                        <td>{dept.patients}</td>
                                        <td style={{ textAlign: 'right', color: '#10b981', fontWeight: '700' }}>{dept.beds}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
