"use client";
import { useState, useEffect } from "react";
import { fetchPatientForDoctor, addPatientHealthMetric, updatePatientHealthMetric } from "@/services/doctor";

export default function PatientVitals({ patientId }) {
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form states
    const [metricType, setMetricType] = useState("heart_rate");
    const [value, setValue] = useState("");
    const [unit, setUnit] = useState("bpm");
    const [notes, setNotes] = useState("");
    const [isEditing, setIsEditing] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (metricType === "heart_rate") setUnit("bpm");
        if (metricType === "blood_pressure") setUnit("mmHg");
        if (metricType === "weight") setUnit("kg");
        if (metricType === "temperature") setUnit("°C");
        if (metricType === "respiratory_rate") setUnit("breaths/min");
        if (metricType === "oxygen_saturation") setUnit("%");
        
        // Clear value when switching types to avoid confusion (e.g. 120/80 for pulse)
        if (!isEditing) {
            setValue("");
        }
    }, [metricType, isEditing]);

    const getPlaceholder = () => {
        switch(metricType) {
            case "heart_rate": return "e.g. 72";
            case "blood_pressure": return "e.g. 120/80";
            case "weight": return "e.g. 65.5";
            case "temperature": return "e.g. 37.0";
            case "respiratory_rate": return "e.g. 16";
            case "oxygen_saturation": return "e.g. 98";
            default: return "Value";
        }
    };

    useEffect(() => {
        loadMetrics();
    }, [patientId]);

    const loadMetrics = async () => {
        if (!patientId) return;
        setLoading(true);
        try {
            const data = await fetchPatientForDoctor(patientId);
            setMetrics(data.health_metrics || data.health || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load patient vitals.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!value) return;

        setSubmitting(true);
        setError(null);

        const payload = {
            metric_type: metricType,
            value,
            unit,
            notes,
            recorded_at: new Date().toISOString()
        };

        try {
            if (isEditing) {
                await updatePatientHealthMetric(patientId, isEditing, payload);
            } else {
                await addPatientHealthMetric(patientId, payload);
            }
            // Reset form
            setMetricType("heart_rate");
            setValue("");
            setUnit("bpm");
            setNotes("");
            setIsEditing(null);
            loadMetrics();
        } catch (err) {
            setError(err.message || "Failed to save metric.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (metric) => {
        setIsEditing(metric.id);
        setMetricType(metric.metric_type);
        setValue(metric.value);
        setUnit(metric.unit);
        setNotes(metric.notes || "");
    };

    const handleCancelEdit = () => {
        setIsEditing(null);
        setMetricType("heart_rate");
        setValue("");
        setUnit("bpm");
        setNotes("");
    };

    const formatMetricName = (type) => {
        return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <div style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#1e293b", marginBottom: "20px" }}>
                Patient Health Metrics
            </h3>

            {error && (
                <div style={{ padding: "12px", background: "#fef2f2", color: "#ef4444", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
                    {error}
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px" }}>
                {/* List of metrics */}
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                    {loading ? (
                        <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>Loading metrics...</div>
                    ) : metrics.length === 0 ? (
                        <div style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>No health metrics recorded yet.</div>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                            <thead>
                                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "600", color: "#64748b" }}>Metric</th>
                                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "600", color: "#64748b" }}>Value</th>
                                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "600", color: "#64748b" }}>Date</th>
                                    <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: "600", color: "#64748b" }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metrics.map(m => (
                                    <tr key={m.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                        <td style={{ padding: "12px 16px", fontWeight: "600", color: "#0f172a" }}>
                                            {formatMetricName(m.metric_type)}
                                        </td>
                                        <td style={{ padding: "12px 16px", color: "#334155" }}>
                                            {m.value} {m.unit}
                                        </td>
                                        <td style={{ padding: "12px 16px", color: "#64748b" }}>
                                            {new Date(m.recorded_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                                            <button
                                                onClick={() => handleEdit(m)}
                                                style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Form to add/edit metric */}
                <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <h4 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>
                        {isEditing ? "Edit Metric" : "Add New Metric"}
                    </h4>
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Metric Type</label>
                            <select
                                value={metricType}
                                onChange={e => setMetricType(e.target.value)}
                                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                            >
                                <option value="heart_rate">Heart Rate</option>
                                <option value="blood_pressure">Blood Pressure</option>
                                <option value="weight">Weight</option>
                                <option value="temperature">Temperature</option>
                                <option value="respiratory_rate">Respiratory Rate</option>
                                <option value="oxygen_saturation">Oxygen Saturation</option>
                            </select>
                        </div>

                        <div style={{ display: "flex", gap: "8px" }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Value</label>
                                <input
                                    type="text"
                                    value={value}
                                    onChange={e => setValue(e.target.value)}
                                    placeholder={getPlaceholder()}
                                    required
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                                />
                            </div>
                            <div style={{ width: "80px" }}>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Unit</label>
                                <input
                                    type="text"
                                    value={unit}
                                    onChange={e => setUnit(e.target.value)}
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Notes (Optional)</label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Any additional observations..."
                                rows="3"
                                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", resize: "none" }}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                            <button
                                type="submit"
                                disabled={submitting}
                                style={{ flex: 1, padding: "10px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "13px", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}
                            >
                                {submitting ? "Saving..." : isEditing ? "Update Metric" : "Add Metric"}
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    style={{ padding: "10px 16px", background: "white", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: "8px", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
