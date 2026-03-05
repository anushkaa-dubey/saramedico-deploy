"use client";
import { useState } from "react";
import { onboardPatient } from "@/services/doctor";

export default function CreatePatientModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        full_name: "",
        phone_number: "",
        dob: "1990-01-01",
        gender: "other"
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await onboardPatient(formData);
            setResult(data);
            onSuccess();
        } catch (err) {
            console.error("Patient creation failed:", err);
            alert("Failed to create patient record. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '450px' }}>
                {result ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#10b98110', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Patient Record Created</h2>
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>A new patient profile has been generated successfully.</p>

                        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', textAlign: 'left', marginBottom: '24px' }}>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Patient Name</label>
                                <div style={{ fontWeight: '700', color: '#1e293b' }}>{result.full_name || formData.full_name}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Login Password (Initial)</label>
                                <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '18px', letterSpacing: '1px' }}>{result.temporary_password || result.password || "Sent to phone"}</div>
                            </div>
                        </div>

                        <button onClick={() => { setResult(null); onClose(); }} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: '#0f172a', color: 'white', fontWeight: '700' }}>Done</button>
                    </div>
                ) : (
                    <>
                        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>Create Patient ID</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Patient Full Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    placeholder="Enter full name"
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Phone Number</label>
                                <input
                                    required
                                    type="tel"
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    placeholder="+1 (555) 000-0000"
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Date of Birth</label>
                                    <input
                                        required
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Gender</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white' }}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '700' }}>Cancel</button>
                                <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#10b981', color: 'white', fontWeight: '700' }}>
                                    {loading ? 'Creating...' : 'Create Record'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
