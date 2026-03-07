"use client";
import { useState, useEffect, useRef } from "react";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { 
    fetchHospitalSettings, 
    updateHospitalProfile, 
    uploadHospitalAvatar, 
    updateHospitalOrgSettings 
} from "@/services/hospital";
import { Camera, Mail, Building2, User as UserIcon, ShieldCheck, Save, CheckCircle2, AlertCircle, Loader2, Phone, Lock } from "lucide-react";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const fileInputRef = useRef(null);

    // Form state for controlled inputs
    const [profileForm, setProfileForm] = useState({
        name: "",
        email: "",
        phone_number: "",
        password: ""
    });

    const [orgForm, setOrgForm] = useState({
        org_name: "",
        org_email: "",
        timezone: "UTC",
        date_format: "DD/MM/YYYY"
    });

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await fetchHospitalSettings();
            setSettings(data);
            
            // Initialize forms with real-time data
            if (data) {
                setProfileForm({
                    name: data.profile?.name || data.profile?.full_name || "",
                    email: data.profile?.email || "",
                    phone_number: data.profile?.phone_number || data.profile?.phone || "",
                    password: "" // Don't pre-fill password
                });

                setOrgForm({
                    org_name: data.organization?.name || "",
                    org_email: data.organization?.org_email || data.organization?.email || "",
                    timezone: data.organization?.timezone || "UTC",
                    date_format: data.organization?.date_format || "DD/MM/YYYY"
                });
            }
        } catch (err) {
            console.error("Failed to load hospital settings:", err);
            setMessage({ type: "error", text: "Failed to load secure settings." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileForm(prev => ({ ...prev, [name]: value }));
    };

    const handleOrgChange = (e) => {
        const { name, value } = e.target;
        setOrgForm(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });
        try {
            const payload = {
                name: profileForm.name,
                email: profileForm.email,
                phone_number: profileForm.phone_number
            };
            if (profileForm.password) payload.password = profileForm.password;

            await updateHospitalProfile(payload);
            setMessage({ type: "success", text: "Your credentials have been updated successfully." });
            
            // Dispatch event for other components (Topbar) to refresh
            window.dispatchEvent(new CustomEvent("profile-updated"));
            
            // Reload to get fresh data (including decrypted name)
            loadSettings();
        } catch (err) {
            setMessage({ type: "error", text: err.message || "Failed to update profile." });
        } finally {
            setSaving(false);
        }
    };

    const handleOrgUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });
        try {
            const payload = {
                name: orgForm.org_name,
                org_email: orgForm.org_email,
                timezone: orgForm.timezone,
                date_format: orgForm.date_format
            };

            await updateHospitalOrgSettings(payload);
            setMessage({ type: "success", text: "Hospital organization profile updated." });
            loadSettings();
        } catch (err) {
            setMessage({ type: "error", text: err.message || "Failed to update organization settings." });
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSaving(true);
        try {
            await uploadHospitalAvatar(file);
            setMessage({ type: "success", text: "Profile picture set successfully." });
            window.dispatchEvent(new CustomEvent("profile-updated"));
            loadSettings();
        } catch (err) {
            setMessage({ type: "error", text: err.message || "Failed to upload avatar." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.main}>
                <Topbar title="Settings" />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
                    <div style={{ textAlign: 'center' }}>
                        <Loader2 className="animate-spin" size={32} style={{ marginBottom: '12px', opacity: 0.5, color: '#359AFF' }} />
                        <p style={{ fontSize: '14px', fontWeight: '500' }}>Initializing secure settings...</p>
                    </div>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: "profile", label: "My Profile", icon: <UserIcon size={18} /> },
        { id: "organization", label: "Hospital Details", icon: <Building2 size={18} /> },
        { id: "security", label: "Security & Role", icon: <ShieldCheck size={18} /> }
    ];

    const initials = (profileForm.name || "H").split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <div className={styles.main}>
            <Topbar title="Hospital Settings" />

            <div className={styles.contentWrapper}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                        Account & Hospital Settings
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px' }}>
                        Manage your hospital identity, personal credentials, and organization preferences.
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {message.text && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{
                                padding: '16px 20px',
                                borderRadius: '16px',
                                marginBottom: '32px',
                                background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                                color: message.type === 'success' ? '#15803d' : '#b91c1c',
                                border: `1px solid ${message.type === 'success' ? '#dcfce7' : '#fee2e2'}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                fontSize: '14px',
                                fontWeight: '600',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                            }}
                        >
                            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            {message.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
                    {/* Navigation sidebar */}
                    <div style={{ width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setMessage({ type: "", text: "" }); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: activeTab === tab.id ? 'linear-gradient(90deg, #359AFF, #60a5fa)' : 'transparent',
                                    color: activeTab === tab.id ? 'white' : '#64748b',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: activeTab === tab.id ? '0 4px 12px rgba(53, 154, 255, 0.25)' : 'none'
                                }}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Form Container */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ 
                                background: '#ffffff', 
                                borderRadius: '24px', 
                                padding: '40px', 
                                border: '1px solid #f1f5f9',
                                boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
                            }}
                        >
                            {activeTab === 'profile' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Personal Profile</h3>
                                        <p style={{ color: '#94a3b8', fontSize: '13px' }}>Update your personal identity and login email.</p>
                                    </div>

                                    {/* Avatar Section */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{
                                                width: '100px',
                                                height: '100px',
                                                borderRadius: '50%',
                                                overflow: 'hidden',
                                                background: '#f8fafc',
                                                border: '4px solid #fff',
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {settings?.profile?.avatar_url ? (
                                                    <img src={settings.profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#359AFF10', color: '#359AFF', fontSize: '32px', fontWeight: '800' }}>
                                                         {initials}
                                                    </div>
                                                )}
                                            </div>
                                            <button 
                                                onClick={() => fileInputRef.current.click()}
                                                style={{
                                                    position: 'absolute',
                                                    bottom: '0',
                                                    right: '0',
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    background: '#359AFF',
                                                    color: 'white',
                                                    border: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 4px 10px rgba(53, 154, 255, 0.4)',
                                                    transition: 'transform 0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            >
                                                <Camera size={16} />
                                            </button>
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                style={{ display: 'none' }} 
                                                accept="image/*"
                                                onChange={handleAvatarUpload}
                                            />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Profile Photo</h4>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>PNG, JPG or GIF. Max 2MB.</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            <div className={styles.formGroup}>
                                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                                                <div style={{ position: 'relative' }}>
                                                    <UserIcon size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                                    <input 
                                                        name="name" 
                                                        value={profileForm.name}
                                                        onChange={handleProfileChange}
                                                        placeholder="Full Name"
                                                        required 
                                                        style={{ paddingLeft: '44px', width: '100%', borderRadius: '14px', background: '#f8fafc' }}
                                                    />
                                                </div>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                                                <div style={{ position: 'relative' }}>
                                                    <Mail size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                                    <input 
                                                        name="email" 
                                                        type="email" 
                                                        value={profileForm.email}
                                                        onChange={handleProfileChange}
                                                        placeholder="email@hospital.com"
                                                        required 
                                                        style={{ paddingLeft: '44px', width: '100%', borderRadius: '14px', background: '#f8fafc' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            <div className={styles.formGroup}>
                                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personal Phone</label>
                                                <div style={{ position: 'relative' }}>
                                                    <Phone size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                                    <input 
                                                        name="phone_number" 
                                                        value={profileForm.phone_number}
                                                        onChange={handleProfileChange}
                                                        placeholder="+1 234 567 890"
                                                        style={{ paddingLeft: '44px', width: '100%', borderRadius: '14px', background: '#f8fafc' }}
                                                    />
                                                </div>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Password</label>
                                                <div style={{ position: 'relative' }}>
                                                    <Lock size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                                    <input 
                                                        name="password" 
                                                        type="password" 
                                                        value={profileForm.password}
                                                        onChange={handleProfileChange}
                                                        placeholder="Keep blank to stay same" 
                                                        style={{ paddingLeft: '44px', width: '100%', borderRadius: '14px', background: '#f8fafc' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                                            <button 
                                                type="submit" 
                                                disabled={saving} 
                                                className={styles.primaryBtn} 
                                                style={{ height: '48px', padding: '0 32px', fontSize: '14px' }}
                                            >
                                                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} />}
                                                {saving ? "Updating..." : "Save Profile Changes"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'organization' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Hospital Organization</h3>
                                        <p style={{ color: '#94a3b8', fontSize: '13px' }}>Configure how your hospital appears to staff and patients.</p>
                                    </div>

                                    <form onSubmit={handleOrgUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            <div className={styles.formGroup}>
                                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hospital Entity Name</label>
                                                <div style={{ position: 'relative' }}>
                                                    <Building2 size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                                    <input 
                                                        name="org_name" 
                                                        value={orgForm.org_name}
                                                        onChange={handleOrgChange}
                                                        required 
                                                        style={{ paddingLeft: '44px', width: '100%', borderRadius: '14px', background: '#f8fafc' }}
                                                    />
                                                </div>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Public Contact Email</label>
                                                <div style={{ position: 'relative' }}>
                                                    <Mail size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                                    <input 
                                                        name="org_email" 
                                                        value={orgForm.org_email}
                                                        onChange={handleOrgChange}
                                                        required 
                                                        style={{ paddingLeft: '44px', width: '100%', borderRadius: '14px', background: '#f8fafc' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            <div className={styles.formGroup}>
                                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Standard Timezone</label>
                                                <select 
                                                    name="timezone" 
                                                    value={orgForm.timezone}
                                                    onChange={handleOrgChange}
                                                    style={{ width: '100%', borderRadius: '14px', height: '48px', background: '#f8fafc' }}
                                                >
                                                    <option value="UTC">UTC (universal)</option>
                                                    <option value="IST">India Standard Time (IST)</option>
                                                    <option value="EST">Eastern Time (EST)</option>
                                                    <option value="PST">Pacific Time (PST)</option>
                                                </select>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Presentation</label>
                                                <select 
                                                    name="date_format" 
                                                    value={orgForm.date_format}
                                                    onChange={handleOrgChange}
                                                    style={{ width: '100%', borderRadius: '14px', height: '48px', background: '#f8fafc' }}
                                                >
                                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                                            <button 
                                                type="submit" 
                                                disabled={saving} 
                                                className={styles.primaryBtn} 
                                                style={{ height: '48px', padding: '0 32px', fontSize: '14px' }}
                                            >
                                                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} />}
                                                {saving ? "Saving..." : "Update Hospital Details"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Security & Access Control</h3>
                                        <p style={{ color: '#94a3b8', fontSize: '13px' }}>Your account privilege levels and multi-factor authentication status.</p>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ padding: '20px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#359AFF15', color: '#359AFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <ShieldCheck size={20} />
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>System Role</h4>
                                                <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748b' }}>Authorized Hospital Administrator</p>
                                            </div>
                                            <div style={{ marginLeft: 'auto', background: '#ecfdf5', color: '#15803d', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                                                Active
                                            </div>
                                        </div>

                                        <div style={{ padding: '24px', borderRadius: '16px', background: '#fff', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                                            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>Multi-factor authentication (MFA) adds an extra layer of security to your hospital account.</p>
                                            <button disabled style={{ padding: '8px 20px', borderRadius: '10px', background: '#f1f5f9', color: '#94a3b8', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'not-allowed' }}>
                                                Enable MFA (Internal Build Only)
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}