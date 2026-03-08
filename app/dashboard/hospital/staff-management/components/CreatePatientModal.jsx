"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Copy, User, Phone, Calendar, Mail, Lock, ShieldCheck } from "lucide-react";
import { onboardPatient, fetchDoctorProfile } from "@/services/doctor";

export default function CreatePatientModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        date_of_birth: "",
        gender: "male",
        password: Math.random().toString(36).slice(-8) + "!" // Generate temp password
    });

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Use camelCase to match the official PatientOnboard schema in openapi.json
            const payload = {
                fullName: `${formData.first_name} ${formData.last_name}`,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phone_number.startsWith('+') ? formData.phone_number : `+91${formData.phone_number.replace(/\D/g, "")}`,
                dateOfBirth: formData.date_of_birth,
                gender: formData.gender,
            };

            const data = await onboardPatient(payload);
            setResult({
                ...data,
                email: formData.email,
                password: formData.password
            });
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Patient creation failed:", err);
            // Enhanced error message reporting
            const errorMsg = err?.detail || err?.message || "Failed to create patient. Note: This action typically requires a Doctor role in the system.";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        if (typeof window !== 'undefined') {
            // alert("Copied to clipboard!");
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px'
        }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                style={{
                    background: 'white',
                    width: '100%',
                    maxWidth: '500px',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(to right, #f8fafc, #ffffff)'
                }}>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Onboard New Patient</h2>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>Register a new clinical patient record.</p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '12px', cursor: 'pointer', color: '#64748b' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '24px' }}>
                    {!result ? (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="field">
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>First Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="John"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        style={{ width: '100%', padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>
                                <div className="field">
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Last Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Doe"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        style={{ width: '100%', padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div className="field">
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Email Address</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: '16px', color: '#94a3b8' }} />
                                    <input
                                        required
                                        type="email"
                                        placeholder="patient@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        style={{ width: '100%', padding: '12px 16px 12px 44px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                                <div className="field">
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Phone Number</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <Phone size={16} style={{ position: 'absolute', left: '16px', color: '#94a3b8' }} />
                                        <input
                                            required
                                            type="tel"
                                            placeholder="9876543210"
                                            value={formData.phone_number}
                                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                            style={{ width: '100%', padding: '12px 16px 12px 44px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                </div>
                                <div className="field">
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Gender</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        style={{ width: '100%', padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="field">
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Date of Birth</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <Calendar size={16} style={{ position: 'absolute', left: '16px', color: '#94a3b8' }} />
                                    <input
                                        required
                                        type="date"
                                        value={formData.date_of_birth}
                                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                        style={{ width: '100%', padding: '12px 16px 12px 44px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#ef4444', fontSize: '12px', fontWeight: '500', display: 'flex', gap: '8px' }}>
                                    <X size={16} style={{ flexShrink: 0 }} />
                                    <div>{error}</div>
                                </div>
                            )}

                            <div style={{ marginTop: '8px', display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    style={{ flex: 1, padding: '14px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', color: '#64748b', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        flex: 2,
                                        padding: '14px',
                                        background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                                        border: 'none',
                                        borderRadius: '16px',
                                        color: 'white',
                                        fontWeight: '700',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                                    }}
                                >
                                    {loading ? "Generating ID..." : "Create Patient ID"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '10px 0' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', margin: '0 auto 20px' }}>
                                <Check size={32} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Successfully Onboarded!</h3>
                            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>A new patient profile has been created.</p>

                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', textAlign: 'left', marginBottom: '24px' }}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Generated MRN</label>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: '700', color: '#3b82f6', fontSize: '18px' }}>#{result.mrn || "MRN" + Math.floor(Math.random() * 100000)}</span>
                                        <button onClick={() => handleCopy(result.mrn)} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}>
                                            <Copy size={16} color="#64748b" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Initial Login Password</label>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '18px', letterSpacing: '1px' }}>{result.password}</span>
                                        <button onClick={() => handleCopy(result.password)} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}>
                                            <Copy size={16} color="#64748b" />
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', fontStyle: 'italic' }}>Please share these credentials with the patient.</p>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                style={{ width: '100%', padding: '14px', background: '#0f172a', border: 'none', borderRadius: '16px', color: 'white', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
