"use client";
import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetchOrganizationMembers, fetchHospitalDirectory } from "@/services/hospital";

export default function DepartmentsPage() {
    const [stats, setStats] = useState({
        totalDepts: 14,
        totalDoctors: 0,
        staffMembers: 0,
        capacity: "85%"
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [directoryData, invites] = await Promise.all([
                    fetchHospitalDirectory(),
                    fetchPendingInvites(),
                ]);

                const docs = directoryData.doctors || [];

                const departmentDoctors = docs.filter(
                    d => (d.specialty || "").toLowerCase() === displayName.toLowerCase()
                );

                setDoctors(departmentDoctors);
                setPendingInvites(invites);
            } catch (err) {
                console.error("DepartmentPage load error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const departments = [
        { name: "Cardiology", capacity: "90%", wait: "12m", status: "Active", patients: 45, color: "#3b82f6", doctors: 12, employees: 30, beds: 25 },
        { name: "Neurology", capacity: "75%", wait: "18m", status: "Active", patients: 28, color: "#8b5cf6", doctors: 8, employees: 22, beds: 15 },
        { name: "Pediatrics", capacity: "95%", wait: "5m", status: "Active", patients: 52, color: "#10b981", doctors: 10, employees: 35, beds: 30 },
        { name: "Radiology", capacity: "40%", wait: "45m", status: "Delayed", patients: 15, color: "#f59e0b", doctors: 5, employees: 12, beds: 0 },
        { name: "Emergency", capacity: "100%", wait: "2m", status: "Critical", patients: 85, color: "#ef4444", doctors: 20, employees: 55, beds: 50 },
    ];

    const statsGroup = [
        { label: "Total Departments", value: stats.totalDepts, color: "#3b82f6" },
        { label: "Total Doctors", value: stats.totalDoctors || (loading ? "..." : "Backend Error"), color: "#10b981" },
        { label: "Staff Members", value: stats.staffMembers || (loading ? "..." : "Backend Error"), color: "#8b5cf6" },
        { label: "Patient Capacity", value: stats.capacity, color: "#f59e0b" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', background: 'transparent', padding: 0, minHeight: '100%' }}
        >
            <Topbar title="Departments Overview" />

            <div className={styles.contentWrapper}>
                <div className={styles.inlineGrid4} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                    {statsGroup.map((stat, i) => (
                        <div key={i} className={styles.card} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{stat.label}</div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '8px' }}>{stat.value}</div>
                            <div style={{ height: '4px', background: stat.color, borderRadius: '2px', marginTop: '12px', width: '40%', margin: '12px auto 0' }} />
                        </div>
                    ))}
                </div>

                <div className={styles.tableScrollWrapper}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', marginBottom: '32px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #f1f5f9', textAlign: 'left' }}>
                                <th style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>DEPARTMENT</th>
                                <th style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>CAPACITY</th>
                                <th style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>AVG WAIT</th>
                                <th style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>STATUS</th>
                                <th style={{ textAlign: 'right', padding: '16px 24px', color: '#94a3b8', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map((dept, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                                    <td style={{ padding: '20px 24px', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap' }}>{dept.name}</td>
                                    <td style={{ fontWeight: '600', color: '#475569', whiteSpace: 'nowrap' }}>{dept.capacity}</td>
                                    <td style={{ fontWeight: '500', color: '#64748b', whiteSpace: 'nowrap' }}>{dept.wait}</td>
                                    <td>
                                        <span style={{
                                            background: dept.status === 'Delayed' || dept.status === 'Critical' ? '#fff1f2' : '#ecfdf5',
                                            color: dept.status === 'Delayed' || dept.status === 'Critical' ? '#e11d48' : '#059669',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {dept.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '20px 24px' }}>
                                        <Link href={`/dashboard/hospital/departments/${dept.name.toLowerCase().replace(/\s+/g, '-')}`}>
                                            <button
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#359aff',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    fontSize: '13px'
                                                }}
                                            >
                                                Manage
                                            </button>
                                        </Link>                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
                        <div className={styles.tableScrollWrapper}>
                            <table className={styles.activityTable}>
                                <thead>
                                    <tr className={styles.activityHeader}>
                                        <th style={{ whiteSpace: 'nowrap' }}>DEPARTMENT</th>
                                        <th style={{ whiteSpace: 'nowrap' }}>DOCTORS</th>
                                        <th style={{ whiteSpace: 'nowrap' }}>STAFF</th>
                                        <th style={{ whiteSpace: 'nowrap' }}>PATIENTS</th>
                                        <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>BEDS AVAILABLE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {departments.map((dept, i) => (
                                        <tr key={i} className={styles.activityRow}>
                                            <td style={{ fontWeight: '700', whiteSpace: 'nowrap' }}>{dept.name}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>{dept.doctors}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>{dept.employees}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>{dept.patients}</td>
                                            <td style={{ textAlign: 'right', color: '#10b981', fontWeight: '700', whiteSpace: 'nowrap' }}>{dept.beds}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
