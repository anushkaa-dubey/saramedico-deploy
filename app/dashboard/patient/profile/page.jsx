"use client";

import { useState, useEffect, useRef } from "react";
import Topbar from "../components/Topbar";
import styles from "./Profile.module.css";
import { motion } from "framer-motion";
import { fetchProfile } from "@/services/patient";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { API_BASE_URL, getAuthHeaders, handleResponse } from "@/services/apiConfig";
import { deleteMyAccount } from "@/services/auth";
import { useRouter } from "next/navigation";
import {
    User,
    Phone,
    Mail,
    Calendar,
    ShieldCheck,
    Camera,
    BadgeCheck,
    Home,
    AlertTriangle,
    Trash2,
} from "lucide-react";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarError, setAvatarError] = useState("");
    const [avatarSuccess, setAvatarSuccess] = useState("");
    // Delete account state
    const [showDeleteZone, setShowDeleteZone] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const [profileData, setProfileData] = useState({
        firstName: "",
        lastName: "",
        mrn: "N/A",
        dateOfBirth: "",
        ssn: "N/A",
        email: "",
        mobilePhone: "",
        homePhone: "",
        streetAddress: "N/A",
        avatar: "",
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const data = await fetchProfile();
            const BACKEND_HOST = process.env.NEXT_PUBLIC_API_URL
                ? new URL(process.env.NEXT_PUBLIC_API_URL).hostname
                : "localhost";

            let avatarUrl = data.avatar_url || data.avatar || "";
            if (avatarUrl && (avatarUrl.includes("minio:9000") || avatarUrl.includes(":9000"))) {
                avatarUrl = avatarUrl
                    .replace(/^https?:\/\/minio:9000\//, `http://${BACKEND_HOST}:9010/`)
                    .replace(/^https?:\/\/[^/]+:9000\//, `http://${BACKEND_HOST}:9010/`);
            }

            setProfileData({
                firstName: data.first_name || data.full_name?.split(" ")[0] || data.fullName?.split(" ")[0] || "",
                lastName: data.last_name || (data.full_name || data.fullName)?.split(" ").slice(1).join(" ") || "",
                mrn: data.mrn || "N/A",
                dateOfBirth: data.date_of_birth || data.dateOfBirth || data.dob || "",
                ssn: data.ssn || "***-**-****",
                email: data.email || "",
                mobilePhone: data.phone_number || data.phoneNumber || data.phone || "",
                homePhone: data.home_phone || data.homePhone || "",
                streetAddress: data.address?.street || data.address?.address_street || "N/A",
                avatar: avatarUrl,
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
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            setAvatarError("");
            setAvatarSuccess("");
        }
    };

    const handleSaveAvatar = async () => {
        if (!avatarFile) return;
        setUploadingAvatar(true);
        setAvatarError("");
        setAvatarSuccess("");
        try {
            const formData = new FormData();
            formData.append("file", avatarFile);
            const headers = getAuthHeaders();
            delete headers["Content-Type"];

            const avatarRes = await fetch(`${API_BASE_URL}/users/me/avatar`, {
                method: "POST",
                headers,
                body: formData,
            });
            if (!avatarRes.ok) throw new Error("Avatar upload failed");

            const avatarData = await handleResponse(avatarRes);
            const BACKEND_HOST = process.env.NEXT_PUBLIC_API_URL
                ? new URL(process.env.NEXT_PUBLIC_API_URL).hostname
                : "localhost";

            let newAvatar =
                avatarData?.preview_url || avatarData?.avatar_url || avatarData?.url || profileData.avatar;
            if (newAvatar && (newAvatar.includes("minio:9000") || newAvatar.includes(":9000"))) {
                newAvatar = newAvatar
                    .replace(/^https?:\/\/minio:9000\//, `http://${BACKEND_HOST}:9010/`)
                    .replace(/^https?:\/\/[^/]+:9000\//, `http://${BACKEND_HOST}:9010/`);
            }

            setProfileData((prev) => ({ ...prev, avatar: newAvatar }));
            setAvatarFile(null);
            setAvatarSuccess("Avatar uploaded successfully!");
            window.dispatchEvent(new Event("avatarUpdated"));
        } catch (err) {
            setAvatarError(err.message || "Failed to upload avatar.");
        } finally {
            setUploadingAvatar(false);
        }
    };

    const initials =
        `${profileData.firstName?.[0] || ""}${profileData.lastName?.[0] || ""}`.toUpperCase() || "P";

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== "DELETE") {
            setDeleteError("Please type DELETE exactly to confirm.");
            return;
        }
        setDeleting(true);
        setDeleteError("");
        try {
            await deleteMyAccount();
            router.push("/auth/login");
        } catch (err) {
            setDeleteError(err.message || "Failed to delete account.");
            setDeleting(false);
        }
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <motion.div variants={itemVariants}>
                <Topbar />
            </motion.div>

            <motion.section className={styles.wrapper} variants={itemVariants}>
                {/* Page Header */}
                <div className={styles.pageHeader}>
                    <h2>My Profile</h2>
                    <p>Manage your personal information, contact details, and secure identification.</p>
                </div>

                <motion.div className={styles.detailsCard} variants={itemVariants}>

                    {/* ── Avatar Section ── */}
                    <div className={styles.avatarSection}>
                        {/* Avatar circle */}
                        <div
                            className={styles.avatarRing}
                            onClick={() => fileInputRef.current?.click()}
                            title="Click to upload profile picture"
                        >
                            {avatarPreview || profileData.avatar ? (
                                <img src={avatarPreview || profileData.avatar} alt="Avatar" />
                            ) : (
                                initials
                            )}
                            <div className={styles.cameraOverlay}>
                                <Camera size={14} color="#fff" />
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: "none" }}
                                accept="image/*"
                                onChange={handleAvatarUpload}
                            />
                        </div>

                        {/* Name + MRN + upload controls */}
                        <div className={styles.avatarMeta}>
                            <h3 className={styles.profileName}>
                                {profileData.firstName} {profileData.lastName}
                            </h3>
                            <span className={styles.mrn}>
                                <BadgeCheck size={13} color="#3b82f6" />
                                MRN: {profileData.mrn}
                            </span>

                            <div className={styles.uploadArea}>
                                <span
                                    className={styles.uploadLink}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Camera size={13} /> Upload Image / Avatar
                                </span>

                                {avatarFile && (
                                    <button
                                        className={styles.saveBtn}
                                        onClick={handleSaveAvatar}
                                        disabled={uploadingAvatar}
                                    >
                                        {uploadingAvatar ? "Saving..." : "Save"}
                                    </button>
                                )}
                                {avatarError && <p className={styles.errorMsg}>{avatarError}</p>}
                                {avatarSuccess && <p className={styles.successMsg}>{avatarSuccess}</p>}
                            </div>
                        </div>
                    </div>

                    {/* ── Form Section ── */}
                    <div className={styles.formSection}>

                        {/* Basic Information */}
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionTitle}>
                                <span className={`${styles.iconPill} ${styles.iconPillBlue}`}>
                                    <User size={15} color="#3b82f6" />
                                </span>
                                Basic Information
                            </span>
                        </div>

                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>LEGAL FIRST NAME</label>
                                <input type="text" className={styles.input} value={profileData.firstName} readOnly />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>LEGAL LAST NAME</label>
                                <input type="text" className={styles.input} value={profileData.lastName} readOnly />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    <Calendar size={12} color="#94a3b8" /> DATE OF BIRTH
                                </label>
                                <input type="date" className={styles.input} value={profileData.dateOfBirth} readOnly />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    <Home size={12} color="#94a3b8" /> STREET ADDRESS
                                </label>
                                <input type="text" className={styles.input} value={profileData.streetAddress} readOnly />
                            </div>
                        </div>

                        <div className={styles.sectionDivider} />

                        {/* Contact Details */}
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionTitle}>
                                <span className={`${styles.iconPill} ${styles.iconPillGreen}`}>
                                    <Phone size={15} color="#22c55e" />
                                </span>
                                Contact Details
                            </span>
                        </div>

                        <div className={styles.formGrid}>
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>
                                    <Mail size={12} color="#94a3b8" /> PRIMARY EMAIL
                                </label>
                                <input type="email" className={styles.input} value={profileData.email} readOnly />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    <Phone size={12} color="#94a3b8" /> MOBILE PHONE
                                </label>
                                <PhoneInput
                                    country={"in"}
                                    value={profileData.mobilePhone}
                                    disabled
                                    inputStyle={{
                                        width: "100%", height: 44, borderRadius: 8,
                                        border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", color: "#64748b",
                                    }}
                                    buttonStyle={{
                                        border: "1px solid #e2e8f0", borderRadius: "8px 0 0 8px", backgroundColor: "#f8fafc",
                                    }}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    <Home size={12} color="#94a3b8" /> HOME PHONE
                                </label>
                                <PhoneInput
                                    country={"in"}
                                    value={profileData.homePhone}
                                    disabled
                                    inputStyle={{
                                        width: "100%", height: 44, borderRadius: 8,
                                        border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", color: "#64748b",
                                    }}
                                    buttonStyle={{
                                        border: "1px solid #e2e8f0", borderRadius: "8px 0 0 8px", backgroundColor: "#f8fafc",
                                    }}
                                />
                            </div>
                        </div>

                    </div>
                </motion.div>

                {/* ─── Danger Zone ─────────────────────────────────────────────── */}
                <motion.div
                    variants={itemVariants}
                    style={{
                        marginTop: "24px",
                        border: "1.5px solid #fee2e2",
                        borderRadius: "16px",
                        background: "#fff",
                        overflow: "hidden"
                    }}
                >
                    <div style={{
                        padding: "18px 24px",
                        background: "#fef2f2",
                        borderBottom: "1px solid #fee2e2",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                    }}>
                        <AlertTriangle size={16} color="#dc2626" />
                        <span style={{ fontWeight: "800", color: "#dc2626", fontSize: "14px" }}>Danger Zone</span>
                    </div>
                    <div style={{ padding: "20px 24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                            <div>
                                <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "15px", marginBottom: "4px" }}>Delete My Account</div>
                                <div style={{ color: "#64748b", fontSize: "13px" }}>
                                    Permanently removes your patient profile, medical records, consultations, and all associated data.
                                </div>
                            </div>
                            <button
                                onClick={() => { setShowDeleteZone(!showDeleteZone); setDeleteConfirmText(""); setDeleteError(""); }}
                                style={{
                                    padding: "10px 20px", borderRadius: "10px",
                                    border: "1.5px solid #dc2626", background: "transparent",
                                    color: "#dc2626", fontWeight: "700", fontSize: "14px",
                                    cursor: "pointer", display: "flex", alignItems: "center", gap: "8px"
                                }}
                            >
                                <Trash2 size={15} /> Delete Account
                            </button>
                        </div>
                        {showDeleteZone && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px dashed #fca5a5" }}
                            >
                                <p style={{ color: "#7f1d1d", fontSize: "13px", fontWeight: "600", marginBottom: "12px" }}>
                                    ⚠️ This action is irreversible. All your data will be permanently deleted. Type <strong>DELETE</strong> to confirm.
                                </p>
                                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                                    <input
                                        value={deleteConfirmText}
                                        onChange={e => { setDeleteConfirmText(e.target.value); setDeleteError(""); }}
                                        placeholder="Type DELETE here"
                                        style={{
                                            flex: 1, minWidth: "200px", padding: "10px 14px",
                                            borderRadius: "8px", border: "1.5px solid #fca5a5",
                                            fontSize: "14px", fontWeight: "600", outline: "none",
                                            background: "#fff7f7", color: "#7f1d1d"
                                        }}
                                    />
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={deleting || deleteConfirmText !== "DELETE"}
                                        style={{
                                            padding: "10px 20px", borderRadius: "8px", border: "none",
                                            background: deleteConfirmText === "DELETE" ? "#dc2626" : "#fca5a5",
                                            color: "white", fontWeight: "700", fontSize: "14px",
                                            cursor: deleteConfirmText === "DELETE" ? "pointer" : "not-allowed"
                                        }}
                                    >
                                        {deleting ? "Deleting..." : "Confirm Delete"}
                                    </button>
                                </div>
                                {deleteError && (
                                    <p style={{ color: "#dc2626", fontSize: "13px", fontWeight: "600", marginTop: "10px" }}>{deleteError}</p>
                                )}
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </motion.section>
        </motion.div>
    );
}