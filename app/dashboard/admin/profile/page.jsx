"use client";

import { useState, useEffect, useRef } from "react";
import styles from "../AdminDashboard.module.css";
import { motion } from "framer-motion";
import {
    fetchAdminSettings,
    uploadAdminAvatar
} from "@/services/admin";

import {
    User,
    Mail,
    Shield,
    Camera,
    Save,
    AlertCircle,
    Building2
} from "lucide-react";

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
    visible: { opacity: 1, y: 0 }
};

export default function AdminProfilePage() {

    const [loading, setLoading] = useState(true);

    const fileInputRef = useRef(null);

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const [status, setStatus] = useState({
        type: "",
        message: ""
    });

    const [profileData, setProfileData] = useState({
        fullName: "",
        email: "",
        role: "admin",
        avatar: "",
        organization: ""
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {

        setLoading(true);

        try {

            const settings = await fetchAdminSettings();

            const profile = settings?.profile || {};

            setProfileData({
                fullName: profile.name || profile.full_name || "Admin User",
                email: profile.email || "",
                role: "admin",
                avatar: profile.avatar_url || "",
                organization: settings?.organization?.name || ""
            });

        } catch (err) {

            console.error("Failed loading admin profile", err);

        } finally {

            setLoading(false);

        }
    };

    const handleAvatarUpload = (e) => {

        const file = e.target.files[0];

        if (!file) return;

        setAvatarFile(file);

        const preview = URL.createObjectURL(file);

        setAvatarPreview(preview);

        setStatus({ type: "", message: "" });
    };

    const handleSaveAvatar = async () => {

        if (!avatarFile) return;

        setUploadingAvatar(true);

        try {

            const result = await uploadAdminAvatar(avatarFile);

            setProfileData(prev => ({
                ...prev,
                avatar: result?.avatar_url || prev.avatar
            }));

            setAvatarFile(null);

            setStatus({
                type: "success",
                message: "Profile picture updated successfully"
            });

            window.dispatchEvent(new Event("avatarUpdated"));

        } catch (err) {

            console.error(err);

            setStatus({
                type: "error",
                message: "Failed to upload avatar"
            });

        } finally {

            setUploadingAvatar(false);

        }
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                Loading Profile...
            </div>
        );
    }

    const initials = profileData.fullName
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase();

    return (

        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            style={{ width: "100%" }}
        >

            {/* Title */}

            <motion.div
                className={styles.titleRow}
                variants={itemVariants}
            >

                <div>

                    <h2 className={styles.heading}>
                        Administrator Profile
                    </h2>

                    <p className={styles.subtext}>
                        Manage your administrative account settings and identity
                    </p>

                </div>

            </motion.div>


            {/* Main Grid */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1.5fr 1fr",
                    gap: "24px",
                    marginTop: "24px"
                }}
            >

                {/* Profile Card */}

                <motion.div
                    className={styles.card}
                    variants={itemVariants}
                >

                    <div
                        style={{
                            display: "flex",
                            gap: "24px",
                            alignItems: "center",
                            marginBottom: "24px",
                            borderBottom: "1px solid #f1f5f9",
                            paddingBottom: "24px"
                        }}
                    >

                        <div style={{ position: "relative" }}>

                            {avatarPreview || profileData.avatar ? (

                                <img
                                    src={avatarPreview || profileData.avatar}
                                    style={{
                                        width: "100px",
                                        height: "100px",
                                        borderRadius: "20px",
                                        objectFit: "cover"
                                    }}
                                />

                            ) : (

                                <div
                                    style={{
                                        width: "100px",
                                        height: "100px",
                                        borderRadius: "20px",
                                        background:
                                            "linear-gradient(135deg,#3b82f6,#2563eb)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "32px",
                                        fontWeight: "700",
                                        color: "#fff"
                                    }}
                                >
                                    {initials}
                                </div>

                            )}

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    position: "absolute",
                                    bottom: "-8px",
                                    right: "-8px",
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "50%",
                                    background: "#fff",
                                    border: "1px solid #e2e8f0",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer"
                                }}
                            >
                                <Camera size={16} />
                            </button>

                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: "none" }}
                                onChange={handleAvatarUpload}
                                accept="image/*"
                            />

                        </div>


                        <div>

                            <h3
                                style={{
                                    fontSize: "22px",
                                    fontWeight: "700",
                                    color: "#0f172a"
                                }}
                            >
                                {profileData.fullName}
                            </h3>

                            <div
                                style={{
                                    display: "inline-flex",
                                    gap: "6px",
                                    background: "#eff6ff",
                                    color: "#2563eb",
                                    padding: "4px 12px",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    alignItems: "center"
                                }}
                            >
                                <Shield size={14} />
                                ADMIN
                            </div>

                        </div>

                    </div>


                    {avatarFile && (

                        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>

                            <button
                                className={styles.inviteBtn}
                                onClick={handleSaveAvatar}
                                disabled={uploadingAvatar}
                            >
                                {uploadingAvatar ? "Uploading..." : "Save New Photo"}
                            </button>

                            <button
                                className={styles.secondaryBtn}
                                onClick={() => {
                                    setAvatarFile(null);
                                    setAvatarPreview(null);
                                }}
                            >
                                Cancel
                            </button>

                        </div>

                    )}


                    {status.message && (

                        <div
                            style={{
                                marginBottom: "20px",
                                padding: "12px",
                                borderRadius: "8px",
                                display: "flex",
                                gap: "8px",
                                alignItems: "center",
                                background:
                                    status.type === "error"
                                        ? "#fef2f2"
                                        : "#f0fdf4"
                            }}
                        >
                            {status.type === "error"
                                ? <AlertCircle size={16} />
                                : <Save size={16} />}

                            {status.message}

                        </div>

                    )}


                    {/* Details */}

                    <div style={{ display: "grid", gap: "20px" }}>

                        <Detail icon={<Mail size={18} />} label="Email Address" value={profileData.email} />

                        <Detail icon={<User size={18} />} label="Full Name" value={profileData.fullName} />

                        <Detail icon={<Shield size={18} />} label="Account Role" value={profileData.role} />

                        {profileData.organization && (
                            <Detail
                                icon={<Building2 size={18} />}
                                label="Organization"
                                value={profileData.organization}
                            />
                        )}

                    </div>

                </motion.div>


                {/* Security Card */}

                <motion.div
                    className={styles.card}
                    variants={itemVariants}
                >

                    <h3>Account Security</h3>

                    <p style={{ color: "#64748b", marginBottom: "16px" }}>
                        Update your password and manage security preferences
                    </p>

                    <SecurityItem title="Change Password" button="Update" />

                    <SecurityItem title="Two-Factor Authentication" button="Enable" />

                    <SecurityItem title="Session Management" button="View" />

                </motion.div>

            </div>

        </motion.div>
    );
}


function Detail({ icon, label, value }) {

    return (

        <div style={{ display: "flex", gap: "16px" }}>

            <div
                style={{
                    width: "40px",
                    height: "40px",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                {icon}
            </div>

            <div>

                <label
                    style={{
                        fontSize: "11px",
                        textTransform: "uppercase",
                        color: "#94a3b8",
                        fontWeight: "700"
                    }}
                >
                    {label}
                </label>

                <div
                    style={{
                        fontSize: "14px",
                        fontWeight: "600"
                    }}
                >
                    {value}
                </div>

            </div>

        </div>

    );
}


function SecurityItem({ title, button }) {

    return (

        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px",
                background: "#f8fafc",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                marginTop: "12px"
            }}
        >

            <div>

                <h4 style={{ margin: 0 }}>{title}</h4>

                <p
                    style={{
                        fontSize: "12px",
                        color: "#64748b",
                        margin: 0
                    }}
                >
                    Manage security settings
                </p>

            </div>

            <button className={styles.secondaryBtn}>
                {button}
            </button>

        </div>

    );
}