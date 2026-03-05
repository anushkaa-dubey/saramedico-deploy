"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "../Settings.module.css";
import lock from "@/public/icons/lock.svg";
import notification from "@/public/icons/notification.svg";
import mfa from "@/public/icons/MFA.svg";
import { motion } from "framer-motion";
import { fetchDoctorProfile, updateDoctorProfile } from "@/services/doctor";

export default function ProfileSettings() {
    const [profile, setProfile] = useState({
        full_name: "",
        email: "",
        credentials: "",
        specialty: "",
        license_number: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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
                        license_number: data.license_number || data.licenseNumber || ""
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
        try {
            await updateDoctorProfile({
                full_name: profile.full_name,
                specialty: profile.specialty,
                credentials: profile.credentials,
                license_number: profile.license_number
            });
            alert("Profile updated successfully!");
        } catch (err) {
            console.error("Failed to update profile", err);
            alert("Failed to update profile.");
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
                    <div className={styles.profileCardContent}>
                        {/* <div className={styles.profileAvatar}></div> */}
                        <div className={styles.profileInfo}>
                            <h3>{profile.full_name || "Doctor"}</h3>
                            <p>{profile.credentials}{profile.credentials && profile.specialty ? ', ' : ''}{profile.specialty ? profile.specialty.toUpperCase() : ""}</p>
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
