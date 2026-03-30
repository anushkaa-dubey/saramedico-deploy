import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Copy, User, Phone, Calendar, Mail, Lock, ShieldCheck, Stethoscope } from "lucide-react";
import { onboardPatient } from "@/services/doctor";
import { fetchHospitalStaff } from "@/services/hospital";

export default function CreatePatientModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        date_of_birth: "",
        gender: "male",
        doctorId: "",
        password: Math.random().toString(36).slice(-8) + "!"
    });

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const loadDoctors = async () => {
                setLoadingDoctors(true);
                try {
                    let staff = await fetchHospitalStaff();
                    console.log("Fetched staff for modal:", staff);

                    // Helper to check if a staff member is a doctor
                    const isDoctor = (s) => {
                        const role = (s.system_role || s.role || "").toLowerCase();
                        return role.includes('doctor') || role.includes('member') ||
                            (!["patient", "hospital", "admin"].includes(role) && role.length > 0);
                    };

                    let staffList = [];
                    if (Array.isArray(staff)) {
                        staffList = staff;
                    } else if (staff?.staff && Array.isArray(staff.staff)) {
                        staffList = staff.staff;
                    }

                    let filteredDoctors = staffList.filter(isDoctor);

                    // FALLBACK: If no doctors found via fetchHospitalStaff, try fetchHospitalDoctorStatus
                    if (filteredDoctors.length === 0) {
                        console.log("No doctors found via fetchHospitalStaff, trying fetchHospitalDoctorStatus...");
                        try {
                            const { fetchHospitalDoctorStatus } = await import("@/services/hospital");
                            const statusList = await fetchHospitalDoctorStatus();
                            if (Array.isArray(statusList) && statusList.length > 0) {
                                filteredDoctors = statusList;
                                console.log("Doctors found via status fallback:", filteredDoctors);
                            }
                        } catch (fallbackErr) {
                            console.error("Fallback doctor fetch failed:", fallbackErr);
                        }
                    }

                    console.log("Final doctors list for modal:", filteredDoctors);
                    setDoctors(filteredDoctors);
                } catch (err) {
                    console.error("Failed to load doctors:", err);
                } finally {
                    setLoadingDoctors(false);
                }
            };
            loadDoctors();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.doctorId) {
            setError("Please select a doctor to link this patient to.");
            return;
        }

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
                doctorId: formData.doctorId
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
            const errorMsg = err?.detail || err?.message || "Failed to create patient. Check your role permissions.";
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
            padding: '20px'
        }}>
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                style={{
                    background: 'white',
                    width: '100%',
                    maxWidth: '540px',
                    maxHeight: '90vh',
                    borderRadius: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
            >
                {/* Header - Fixed */}
                <div style={{
                    padding: '24px 32px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(to right, #f8fafc, #ffffff)',
                    flexShrink: 0
                }}>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Onboard New Patient</h2>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Register a new clinical patient record.</p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#f1f5f9',
                            border: 'none',
                            width: '36px',
                            height: '36px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div style={{
                    padding: '32px',
                    overflowY: 'auto',
                    flex: 1,
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#e2e8f0 transparent'
                }}>
                    {!result ? (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Doctor Selection */}
                            <div className="field">
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned Doctor</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <Stethoscope size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                                    <select
                                        required
                                        value={formData.doctorId}
                                        onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px 12px 44px',
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            fontSize: '14px',
                                            outline: 'none',
                                            appearance: 'none',
                                            backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'right 16px center',
                                            backgroundSize: '16px',
                                            cursor: 'pointer',
                                            transition: 'border-color 0.2s'
                                        }}
                                        disabled={loadingDoctors}
                                    >
                                        <option value="">{loadingDoctors ? "Loading doctors..." : "Select a Doctor"}</option>
                                        {doctors.length > 0 ? doctors.map(doc => (
                                            <option key={doc.id} value={doc.id}>
                                                Dr. {doc.full_name || doc.name} ({doc.specialty || "General"})
                                            </option>
                                        )) : (
                                            <option disabled>No doctors found in your hospital staff</option>
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                                gap: '20px'
                            }}>
                                <div className="field">
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>First Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="John"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        style={{ width: '100%', padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                                    />
                                </div>
                                <div className="field">
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Doe"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        style={{ width: '100%', padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                                    />
                                </div>
                            </div>

                            <div className="field">
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input
                                        required
                                        type="email"
                                        placeholder="patient@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        style={{ width: '100%', padding: '12px 16px 12px 44px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                                    />
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                                gap: '20px'
                            }}>
                                <div className="field">
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone Number</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <Phone size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input
                                            required
                                            type="tel"
                                            placeholder="9876543210"
                                            value={formData.phone_number}
                                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                            style={{ width: '100%', padding: '12px 16px 12px 44px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                                        />
                                    </div>
                                </div>
                                <div className="field">
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gender</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            fontSize: '14px',
                                            outline: 'none',
                                            appearance: 'none',
                                            backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'right 16px center',
                                            backgroundSize: '16px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="field">
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date of Birth</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <Calendar size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input
                                        required
                                        type="date"
                                        value={formData.date_of_birth}
                                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                        style={{ width: '100%', padding: '12px 16px 12px 44px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                                    />
                                </div>
                            </div>

                            {/* Patient Login Password */}
                            <div className="field">
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Patient Login Password
                                </label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <Lock size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Min 8 characters (e.g. Abc@1234)"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        style={{ width: '100%', padding: '12px 16px 12px 44px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                                        minLength={8}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div style={{ padding: '14px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', color: '#ef4444', fontSize: '13px', fontWeight: '600', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <X size={16} style={{ flexShrink: 0 }} />
                                    <div>{error}</div>
                                </div>
                            )}

                            <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    style={{ flex: 1, padding: '14px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '16px', color: '#64748b', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
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
                                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {loading ? "Generating ID..." : "Create Patient ID"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '10px 0' }}>
                            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', margin: '0 auto 24px' }}>
                                <Check size={36} />
                            </div>
                            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Successfully Onboarded!</h3>
                            <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '32px' }}>A new patient profile has been created.</p>

                            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', textAlign: 'left', marginBottom: '32px' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>Generated MRN</label>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: '800', color: '#3b82f6', fontSize: '20px' }}>#{result.mrn || "MRN" + Math.floor(Math.random() * 100000)}</span>
                                        <button onClick={() => handleCopy(result.mrn)} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
                                            <Copy size={18} color="#64748b" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>Initial Login Password</label>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '20px', letterSpacing: '1px' }}>{result.password}</span>
                                        <button onClick={() => handleCopy(result.password)} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
                                            <Copy size={18} color="#64748b" />
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px', fontStyle: 'italic' }}>Please share these credentials with the patient.</p>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                style={{ width: '100%', padding: '16px', background: '#0f172a', border: 'none', borderRadius: '18px', color: 'white', fontWeight: '700', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s' }}
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
