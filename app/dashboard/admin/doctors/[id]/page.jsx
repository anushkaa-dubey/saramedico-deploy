"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchAdminDoctorDetails } from "@/services/admin";
import Link from "next/link";
import styles from "../../AdminDashboard.module.css";

export default function AdminDoctorDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDoctor = async () => {
            setLoading(true);
            try {
                const details = await fetchAdminDoctorDetails(id);
                if (!details) throw new Error("Could not fetch doctor details");
                setDoctor(details);
            } catch (err) {
                console.error(err);
                setError("Failed to load doctor details.");
            } finally {
                setLoading(false);
            }
        };
        if (id) loadDoctor();
    }, [id]);

    if (loading) {
        return (
            <>
                <div style={{ padding: "40px", color: "#64748b" }}>Loading doctor details...</div>
            </>
        );
    }

    if (error || !doctor) {
        return (
            <>
                <div style={{ padding: "40px", color: "#ef4444" }}>{error || "Doctor not found."}</div>
                <Link href="/dashboard/admin" style={{ marginLeft: "40px", color: "#3b82f6", textDecoration: "underline" }}>Return to Dashboard</Link>
            </>
        );
    }

    return (
        <>
            <div className={styles.mobileHeader}>
                <button onClick={() => router.back()} className={styles.backArrow}>← Back</button>
                <div className={styles.mobileTitle}>Doctor Details</div>
                <div className={styles.headerPlaceholder}></div>
            </div>

            <div className={styles.titleRow} style={{ marginTop: "24px" }}>
                <div>
                    <h2 className={styles.heading}>{doctor.first_name} {doctor.last_name}</h2>
                    <p className={styles.subtext}>{doctor.specialty || "Specialty not specified"}</p>
                </div>
                <span className={styles.statusBadge} style={{ background: doctor.status === "active" ? "#dcfce7" : "#fee2e2", color: doctor.status === "active" ? "#166534" : "#991b1b", padding: "8px 16px", borderRadius: "16px", fontWeight: "bold" }}>
                    {doctor.status || "Unknown Status"}
                </span>
            </div>

            <div className={styles.summaryCards} style={{ marginTop: "24px" }}>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryInfo}>
                        <span className={styles.summaryLabel}>Total Patients</span>
                        <h3 className={styles.summaryValue}>{doctor.stats?.totalPatients || 0}</h3>
                    </div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryInfo}>
                        <span className={styles.summaryLabel}>Consultations</span>
                        <h3 className={styles.summaryValue}>{doctor.stats?.consultations || 0}</h3>
                    </div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryInfo}>
                        <span className={styles.summaryLabel}>Rating</span>
                        <h3 className={styles.summaryValue}>{doctor.stats?.rating || "N/A"}</h3>
                    </div>
                </div>
            </div>

            <section className={styles.dashboardGrid} style={{ marginTop: "24px" }}>
                <div className={styles.leftCol}>
                    <div className={styles.card}>
                        <h3>Contact & License Info</h3>
                        <div style={{ marginTop: "16px", display: "grid", gap: "12px", fontSize: "14px", color: "#334155" }}>
                            <div><strong>Email:</strong> {doctor.email || "N/A"}</div>
                            <div><strong>Phone:</strong> {doctor.phone || "N/A"}</div>
                            <div><strong>License:</strong> {doctor.license || "N/A"}</div>
                            <div><strong>Joined:</strong> {doctor.joinedDate ? new Date(doctor.joinedDate).toLocaleDateString() : "N/A"}</div>
                        </div>
                    </div>

                    <div className={styles.card} style={{ marginTop: "24px" }}>
                        <h3>Upcoming Appointments</h3>
                        <table className={styles.table} style={{ marginTop: "16px" }}>
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!doctor.appointments || doctor.appointments.length === 0 ? (
                                    <tr><td colSpan="3" style={{ textAlign: "center", color: "#94a3b8", padding: "16px" }}>No upcoming appointments</td></tr>
                                ) : doctor.appointments.map(apt => (
                                    <tr key={apt.id}>
                                        <td>{apt.patientName}</td>
                                        <td>{new Date(apt.time).toLocaleString()}</td>
                                        <td>{apt.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={styles.rightCol}>
                    <div className={styles.card}>
                        <h3>Recent Patients</h3>
                        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                            {!doctor.patients || doctor.patients.length === 0 ? (
                                <div style={{ color: "#94a3b8", fontSize: "14px", textAlign: "center" }}>No recent patients</div>
                            ) : doctor.patients.map(p => (
                                <div key={p.id} style={{ padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}>
                                    <div style={{ fontWeight: "600", color: "#0f172a" }}>{p.name}</div>
                                    <div style={{ color: "#64748b", fontSize: "12px", marginTop: "4px" }}>{p.condition || "Unknown condition"}</div>
                                    <div style={{ color: "#94a3b8", fontSize: "11px", marginTop: "8px" }}>Last Visit: {new Date(p.lastVisit).toLocaleDateString()}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
