"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Topbar from "../components/Topbar";
import styles from "./Schedule.module.css";
import { motion } from "framer-motion";
import { fetchPatients, bookAppointmentByDoctor } from "@/services/doctor";
import { User, Calendar, MessageSquare, Info, CheckCircle2 } from "lucide-react";
import Alert from "@/app/dashboard/components/Alert";

export default function DoctorCreateAppointment() {
    const router = useRouter();
    const [patients, setPatients] = useState([]);
    const [formData, setFormData] = useState({
        patient_id: "",
        requested_date: "",
        reason: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [error, setError] = useState("");
    const [alertConfig, setAlertConfig] = useState({ open: false, title: "", message: "", type: "info", onConfirm: null });

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        setLoadingPatients(true);
        setError("");
        try {
            const data = await fetchPatients();
            let patientsArray = [];
            if (Array.isArray(data)) {
                patientsArray = data;
            } else if (data && typeof data === 'object') {
                patientsArray = data.patients || data.items || data.data || [];
            }
            setPatients(patientsArray);
        } catch (err) {
            console.error("Failed to load patients:", err);
            setError(err.message || "Failed to load available patients.");
        } finally {
            setLoadingPatients(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.patient_id) {
            setAlertConfig({ open: true, title: "Patient Selection", message: "Please select a patient before scheduling.", type: "warning" });
            return;
        }
        if (!formData.requested_date) {
            setAlertConfig({ open: true, title: "Missing Date", message: "Please select a date and time for the consultation.", type: "warning" });
            return;
        }
        setSubmitting(true);
        setError("");

        try {
            const payload = {
                ...formData,
                requested_date: new Date(formData.requested_date).toISOString()
            };

            await bookAppointmentByDoctor(payload);
            setAlertConfig({ 
                open: true, 
                title: "Request Sent", 
                message: "The appointment request has been sent to the patient for approval.", 
                type: "success",
                onConfirm: () => router.push("/dashboard/doctor/appointments")
            });
        } catch (error) {
            console.error("Failed to schedule appointment:", error);
            setError(error.message || "Failed to schedule appointment. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.pageWrapper}
        >
            <div className={styles.topbarWrap}>
                <Topbar />
            </div>

            <div className={styles.inner}>
                <div className={styles.pageHeader}>
                    <h2 className={styles.pageTitle}>Schedule Appointment</h2>
                    <p className={styles.pageSub}>Create a new consultation request for a patient</p>
                </div>

                <div className={styles.grid}>
                    <div className={styles.leftCol}>
                        <form onSubmit={handleSubmit} className={styles.card}>
                            <h3 className={styles.cardTitle}>
                                <Calendar size={18} color="#3b82f6" />
                                Appointment Details
                            </h3>

                            {error && (
                                <div style={{ color: "#ef4444", background: "#fef2f2", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", border: "1px solid #fee2e2" }}>
                                    {error}
                                </div>
                            )}

                            <div className={styles.field}>
                                <label className={styles.label}>Select Patient</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        required
                                        className={styles.select}
                                        value={formData.patient_id}
                                        onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                                        disabled={loadingPatients}
                                    >
                                        <option value="">Choose a patient...</option>
                                        {patients.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name || p.full_name || (p.first_name ? `${p.first_name} ${p.last_name}` : "Unknown")}
                                            </option>
                                        ))}
                                    </select>
                                    {loadingPatients && (
                                        <div style={{ position: 'absolute', right: '35px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: '#64748b' }}>
                                            Loading...
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.row} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0' }}>
                                <div className={styles.field}>
                                    <label className={styles.label}>Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className={styles.input}
                                        value={formData.requested_date}
                                        onChange={(e) => setFormData({ ...formData, requested_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>Reason for Consultation</label>
                                <textarea
                                    required
                                    className={styles.textarea}
                                    placeholder="Briefly describe the purpose of this appointment..."
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className={styles.primaryBtn}
                            >
                                {submitting ? (
                                    <>
                                        <motion.span
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                            style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}
                                        />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={18} />
                                        Schedule Appointment
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className={styles.rightCol}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>
                                <Info size={18} color="#3b82f6" />
                                How it works
                            </h3>
                            <div className={styles.infoBox}>
                                <div style={{ marginTop: '2px' }}><MessageSquare size={16} /></div>
                                <div>
                                    <strong>Patient Notification</strong>
                                    <p style={{ margin: '4px 0 0 0', opacity: 0.8 }}>The patient will receive a notification to accept or decline this request.</p>
                                </div>
                            </div>
                            
                            <div className={styles.infoBox} style={{ marginTop: '12px' }}>
                                <div style={{ marginTop: '2px' }}><Calendar size={16} /></div>
                                <div>
                                    <strong>Calendar Sync</strong>
                                    <p style={{ margin: '4px 0 0 0', opacity: 0.8 }}>Once accepted, the session will automatically appear in your health calendar and a Google Meet link will be generated.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <Alert 
                isOpen={alertConfig.open} 
                onClose={() => setAlertConfig({ ...alertConfig, open: false })}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onConfirm={alertConfig.onConfirm}
            />
        </motion.div>
    );
}
