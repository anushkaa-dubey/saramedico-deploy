"use client";

import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import styles from "../records/Records.module.css";
import Image from "next/image";
import benjaminImage from "@/public/icons/images/benjamin frank.png";
import basic_information from "@/public/icons/basic_information.svg";
import contact from "@/public/icons/contact.svg";
import { motion } from "framer-motion";
// TODO: Uncomment when connecting backend
// import { fetchProfile, updateProfile } from "@/services/patient";

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
    const [isEditingBasic, setIsEditingBasic] = useState(false);
    const [isEditingContact, setIsEditingContact] = useState(false);
    const [loading, setLoading] = useState(false);

    // Profile data state
    const [profileData, setProfileData] = useState({
        firstName: "Benjamin",
        lastName: "Frank",
        mrn: "849-221-009",
        dateOfBirth: "04/12/1985",
        ssn: "***-**-****",
        email: "mymail@gmail.com",
        mobilePhone: "(555) 123-4567",
        homePhone: "",
        avatar: benjaminImage.src
    });

    useEffect(() => {
        loadProfile();
    }, []);

    /**
     * Load user profile from backend
     */
    const loadProfile = async () => {
        setLoading(true);
        try {
            // TODO: Replace with actual API call
            // const data = await fetchProfile();
            // setProfileData(data);

            console.log("fetchProfile called");
            // Using dummy data for now
        } catch (error) {
            console.error("Failed to load profile:", error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Save basic information
     */
    const handleSaveBasic = async () => {
        if (!isEditingBasic) {
            setIsEditingBasic(true);
            return;
        }

        try {
            // TODO: Replace with actual API call
            // await updateProfile({
            //   first_name: profileData.firstName,
            //   last_name: profileData.lastName,
            //   date_of_birth: profileData.dateOfBirth,
            //   ssn: profileData.ssn
            // });

            console.log("updateProfile (basic) called with:", {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                dateOfBirth: profileData.dateOfBirth
            });

            setIsEditingBasic(false);
            alert("Basic information updated successfully!");
        } catch (error) {
            console.error("Failed to update basic info:", error);
            alert("Failed to update information");
        }
    };

    /**
     * Save contact details
     */
    const handleSaveContact = async () => {
        if (!isEditingContact) {
            setIsEditingContact(true);
            return;
        }

        try {
            // TODO: Replace with actual API call
            // await updateProfile({
            //   email: profileData.email,
            //   mobile_phone: profileData.mobilePhone,
            //   home_phone: profileData.homePhone
            // });

            console.log("updateProfile (contact) called with:", {
                email: profileData.email,
                mobilePhone: profileData.mobilePhone,
                homePhone: profileData.homePhone
            });

            setIsEditingContact(false);
            alert("Contact details updated successfully!");
        } catch (error) {
            console.error("Failed to update contact details:", error);
            alert("Failed to update information");
        }
    };

    const handleInputChange = (field, value) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
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
                        <img src={profileData.avatar} alt={`${profileData.firstName} ${profileData.lastName}`} className={styles.bigAvatar} style={{ objectFit: "cover" }} />
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
                            <button className={styles.editBtn} onClick={handleSaveBasic}>
                                {isEditingBasic ? "Save" : "Edit"}
                            </button>
                        </div>

                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>LEGAL FIRST NAME</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={profileData.firstName}
                                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                                    readOnly={!isEditingBasic}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>LEGAL LAST NAME</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={profileData.lastName}
                                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                                    readOnly={!isEditingBasic}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>DATE OF BIRTH</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={profileData.dateOfBirth}
                                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                                    readOnly={!isEditingBasic}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>SOCIAL SECURITY NUMBER</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={profileData.ssn}
                                    onChange={(e) => handleInputChange("ssn", e.target.value)}
                                    readOnly={!isEditingBasic}
                                />
                            </div>
                        </div>

                        {/* Contact Details */}
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionTitle}>
                                <Image src={contact} alt="Contact Information" />Contact Details
                            </span>
                            <button
                                className={styles.editBtn}
                                onClick={handleSaveContact}
                            >
                                {isEditingContact ? "Save" : "Edit"}
                            </button>
                        </div>

                        <div className={styles.formGrid}>
                            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                                <label className={styles.label}>PRIMARY EMAIL</label>
                                <input
                                    type="email"
                                    className={styles.input}
                                    value={profileData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    readOnly={!isEditingContact}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>MOBILE PHONE</label>
                                <input
                                    type="tel"
                                    className={styles.input}
                                    value={profileData.mobilePhone}
                                    onChange={(e) => handleInputChange("mobilePhone", e.target.value)}
                                    readOnly={!isEditingContact}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>HOME PHONE</label>
                                <input
                                    type="tel"
                                    className={styles.input}
                                    value={profileData.homePhone}
                                    onChange={(e) => handleInputChange("homePhone", e.target.value)}
                                    placeholder="Add home phone"
                                    readOnly={!isEditingContact}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.section>
        </motion.div>
    );
}
