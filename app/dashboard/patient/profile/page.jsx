"use client";

import { useState, useEffect, useRef } from "react";
import Topbar from "../components/Topbar";
import styles from "../records/Records.module.css";
import Image from "next/image";
import basic_information from "@/public/icons/basic_information.svg";
import contact from "@/public/icons/contact.svg";
import { motion } from "framer-motion";
import { fetchProfile } from "@/services/patient";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function ProfilePage() {
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    // Profile data state
    const [profileData, setProfileData] = useState({
        firstName: "",
        lastName: "",
        mrn: "N/A",
        dateOfBirth: "",
        ssn: "N/A",
        email: "",
        mobilePhone: "",
        homePhone: "",
        avatar: ""
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const data = await fetchProfile();
            setProfileData({
                firstName: data.first_name || data.fullName?.split(" ")[0] || "",
                lastName: data.last_name || data.fullName?.split(" ").slice(1).join(" ") || "",
                mrn: data.mrn || "N/A",
                dateOfBirth: data.dateOfBirth || data.dob || "",
                ssn: data.ssn || "***-**-****",
                email: data.email || "",
                mobilePhone: data.phoneNumber || data.phone || "",
                homePhone: data.homePhone || data.home_phone || "",
                avatar: data.avatar || data.avatar_url || ""
            });
        } catch (error) {
            console.error("Failed to load profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const tempUrl = URL.createObjectURL(file);
            setProfileData(prev => ({ ...prev, avatar: tempUrl }));
            // Add backend upload functionality here if needed
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <motion.div variants={itemVariants}>
                <Topbar />
            </motion.div>

            <motion.section className={styles.wrapper} variants={itemVariants}>
                <div className={styles.pageHeader}>
                    <h2>My Profile</h2>
                    <p>Manage your personal information, contact details, and secure identification.</p>
                </div>

                <motion.div className={styles.detailsCard} variants={itemVariants}>
                    {/* Left Avatar */}
                    <div className={styles.avatarSection}>
                        <div
                            style={{ width: '80px', height: '80px', background: '#359aff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '32px', fontWeight: 'bold', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
                            onClick={() => fileInputRef.current?.click()}
                            title="Click to upload profile picture"
                        >
                            {profileData.avatar ? (
                                <img src={profileData.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                (profileData.firstName || profileData.lastName) ? `${profileData.firstName?.[0] || ''}${profileData.lastName?.[0] || ''}`.toUpperCase() : "P"
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleAvatarUpload}
                            />
                        </div>
                        <h3 className={styles.profileName}>{profileData.firstName} {profileData.lastName}</h3>
                        <span className={styles.mrn}>MRN: {profileData.mrn}</span>
                    </div>

                    {/* Right Forms */}
                    <div className={styles.formSection}>
                        {/* Basic Info */}
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionTitle}>
                                <Image src={basic_information} alt="Basic Information" /> Basic Information
                            </span>
                        </div>

                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>LEGAL FIRST NAME</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={profileData.firstName}
                                    readOnly={true}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>LEGAL LAST NAME</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={profileData.lastName}
                                    readOnly={true}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>DATE OF BIRTH</label>
                                <input
                                    type="date"
                                    className={styles.input}
                                    value={profileData.dateOfBirth}
                                    readOnly={true}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>SOCIAL SECURITY NUMBER</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={profileData.ssn}
                                    readOnly={true}
                                />
                            </div>
                        </div>

                        {/* Contact Details */}
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionTitle}>
                                <Image src={contact} alt="Contact Information" />Contact Details
                            </span>
                        </div>

                        <div className={styles.formGrid}>
                            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                                <label className={styles.label}>PRIMARY EMAIL</label>
                                <input
                                    type="email"
                                    className={styles.input}
                                    value={profileData.email}
                                    readOnly={true}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>MOBILE PHONE</label>
                                <PhoneInput
                                    country={"in"}
                                    value={profileData.mobilePhone}
                                    disabled={true}
                                    inputStyle={{
                                        width: "100%",
                                        height: "44px",
                                        borderRadius: "8px",
                                        border: "1px solid #e2e8f0",
                                        backgroundColor: "#f8fafc",
                                        color: "#64748b"
                                    }}
                                    buttonStyle={{
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px 0 0 8px",
                                        backgroundColor: "#f8fafc"
                                    }}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>HOME PHONE</label>
                                <PhoneInput
                                    country={"in"}
                                    value={profileData.homePhone}
                                    disabled={true}
                                    inputStyle={{
                                        width: "100%",
                                        height: "44px",
                                        borderRadius: "8px",
                                        border: "1px solid #e2e8f0",
                                        backgroundColor: "#f8fafc",
                                        color: "#64748b"
                                    }}
                                    buttonStyle={{
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px 0 0 8px",
                                        backgroundColor: "#f8fafc"
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.section>
        </motion.div>
    );
}
