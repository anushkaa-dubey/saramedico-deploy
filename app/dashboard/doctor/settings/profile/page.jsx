"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import styles from "../Settings.module.css";
import lock from "@/public/icons/lock.svg";
import notification from "@/public/icons/notification.svg";
import mfa from "@/public/icons/MFA.svg";
import { motion } from "framer-motion";
import { fetchDoctorProfile, updateDoctorProfile } from "@/services/doctor";
import { API_BASE_URL, getAuthHeaders, handleResponse } from "@/services/apiConfig";

export default function ProfileSettings() {
    const [profile, setProfile] = useState({
        full_name: "",
        email: "",
        credentials: "",
        specialty: "",
        license_number: "",
        avatar_url: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarError, setAvatarError] = useState("");
    const [avatarSuccess, setAvatarSuccess] = useState("");

    useEffect(() => {
        const getProfile = async () => {
            try {
                const data = await fetchDoctorProfile();
                if (data) {
                    setProfile({
                        full_name: data.full_name || data.fullName || "",
                        email: data.email || "",
                        credentials: data.credentials || "",
                        specialty: data.specialty || "",
                        license_number: data.license_number || data.licenseNumber || "",
                        avatar_url: data.avatar_url || ""
                    });
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };
        getProfile();
    }, []);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        setAvatarError("");
        setAvatarSuccess("");
        try {
            let avatarUpdated = false;
            // Avatar upload
            if (avatarFile) {
                const formData = new FormData();
                formData.append("file", avatarFile);

                const headers = getAuthHeaders();
                delete headers["Content-Type"];

                const avatarRes = await fetch(`${API_BASE_URL}/users/me/avatar`, {
                    method: 'POST',
                    headers: headers,
                    body: formData
                });

                if (!avatarRes.ok) {
                    throw new Error("Avatar upload failed");
                }

                const avatarData = await handleResponse(avatarRes);
                setProfile(prev => ({ ...prev, avatar_url: avatarData?.avatar_url || avatarData?.url || prev.avatar_url }));
                setAvatarFile(null);
                avatarUpdated = true;
            }

            // Profile fields upload
            await updateDoctorProfile({
                full_name: profile.full_name,
                specialty: profile.specialty,
                credentials: profile.credentials,
                license_number: profile.license_number
            });

            if (avatarUpdated) {
                setAvatarSuccess("Avatar uploaded and profile updated successfully.");
                window.dispatchEvent(new Event('avatarUpdated'));
            } else {
                setAvatarSuccess("Profile updated successfully!");
                alert("Profile updated successfully!");
            }
        } catch (err) {
            console.error("Failed to update profile", err);
            setAvatarError(err.message || "Failed to update profile or avatar.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading profile...</div>;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Topbar */}
            <div className={styles.topbar}>
                {/* <input
                    className={styles.search}
                    placeholder="Search settings, reports, notes..."
                /> */}
            </div>

            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>My Profile</h1>
                <p className={styles.description}>
                    Manage your personal information and account details.
                </p>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {/* Profile Card */}
                <div className={styles.profileCard}>
                    {/* <h2 className={styles.profileCardTitle}>My Profile</h2> */}
                    <div className={styles.profileCardContent} style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                        <div
                            style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', overflow: 'hidden', cursor: 'pointer',
                                fontSize: '24px', fontWeight: 'bold', color: '#3730a3', marginRight: '20px'
                            }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {avatarPreview || profile.avatar_url ? (
                                <img src={avatarPreview || profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                profile.full_name ? profile.full_name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "DR"
                            )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className={styles.profileInfo} style={{ marginBottom: '8px' }}>
                                <h3>{profile.full_name || "Doctor"}</h3>
                                <p>{profile.credentials}{profile.credentials && profile.specialty ? ', ' : ''}{profile.specialty ? profile.specialty.toUpperCase() : ""}</p>
                            </div>
                            <div>
                                <span style={{ fontSize: '13px', color: '#4f46e5', cursor: 'pointer', fontWeight: '500' }} onClick={() => fileInputRef.current?.click()}>
                                    Upload Avatar
                                </span>
                                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setAvatarFile(file);
                                        setAvatarPreview(URL.createObjectURL(file));
                                        setAvatarSuccess("");
                                        setAvatarError("");
                                    }
                                }} />
                            </div>
                        </div>
                    </div>

                    <div className={styles.formGrid}>
                        <div className={styles.formField}>
                            <label className={styles.label}>FULL NAME</label>
                            <input className={styles.input} name="full_name" placeholder="Your name" value={profile.full_name} onChange={handleChange} />
                        </div>
                        <div className={styles.formField}>
                            <label className={styles.label}>EMAIL ADDRESS</label>
                            <input className={styles.input} name="email" placeholder="Email" value={profile.email} disabled style={{ background: '#f8fafc', cursor: 'not-allowed' }} />
                        </div>
                        <div className={styles.formField}>
                            <label className={styles.label}>CREDENTIALS</label>
                            <input className={styles.input} name="credentials" placeholder="MD, MBBS" value={profile.credentials} onChange={handleChange} />
                        </div>
                        <div className={styles.formField}>
                            <label className={styles.label}>SPECIALTY</label>
                            <input className={styles.input} name="specialty" placeholder="Cardiology" value={profile.specialty} onChange={handleChange} />
                        </div>
                        <div className={styles.formField}>
                            <label className={styles.label}>LICENSE NUMBER</label>
                            <input className={styles.input} name="license_number" placeholder="LIC-123456" value={profile.license_number} onChange={handleChange} />
                        </div>
                    </div>

                    <div className={styles.buttonGroup}>
                        <button className={styles.cancelBtn}>Cancel</button>
                        <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
                    </div>
                    {avatarError && <div style={{ color: '#ef4444', fontSize: '14px', textAlign: 'right', marginTop: '12px', fontWeight: '500' }}>{avatarError}</div>}
                    {avatarSuccess && <div style={{ color: '#22c55e', fontSize: '14px', textAlign: 'right', marginTop: '12px', fontWeight: '500' }}>{avatarSuccess}</div>}
                </div>

                {/* Bottom Cards commented out as requested */}
                {/* 
                <div className={styles.cardsGrid}>
                    <div className={styles.card}>
                        <div className={styles.cardTitleRow}>
                            <span className={styles.cardIcon}><Image src={lock.src} alt="Lock" width={18} height={18} /></span>
                            <h3>Password</h3>
                        </div>
                        <p>Last changed 3 months ago. We recommend changing every 90 days.</p>
                        <button className={styles.cardButton}>Change Password</button>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardTitleRow}>
                            <span className={styles.cardIcon}><Image src={mfa.src} alt="MFA" width={18} height={18} /></span>
                            <h3>MFA Setup</h3>
                            <span className={styles.badge}>Enabled</span>
                        </div>
                        <p>
                            Multi-factor authentication is currently active via authenticator
                            App.
                        </p>
                        <button className={styles.cardButton}>Manage</button>
                    </div>
                </div> 
                */}
            </div>
        </motion.div>
    );
}
