"use client";

import { useEffect, useState, useRef } from "react";
import styles from "../Settings.module.css";
import { motion } from "framer-motion";
import { fetchDoctorProfile, updateDoctorProfile } from "@/services/doctor";
import { API_BASE_URL, getAuthHeaders, handleResponse } from "@/services/apiConfig";
import { deleteMyAccount } from "@/services/auth";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";

export default function ProfileSettings() {
    const router = useRouter();
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

    // Delete account state
    const [showDeleteZone, setShowDeleteZone] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

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
                if (!avatarRes.ok) throw new Error("Avatar upload failed");
                const avatarData = await handleResponse(avatarRes);
                setProfile(prev => ({ ...prev, avatar_url: avatarData?.avatar_url || avatarData?.url || prev.avatar_url }));
                setAvatarFile(null);
                avatarUpdated = true;
            }
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
            setDeleteError(err.message || "Failed to delete account. Please try again.");
            setDeleting(false);
        }
    };

    if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading profile...</div>;

    return (
        <motion.div
            className={styles.main}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className={styles.topbar}></div>

            <div className={styles.header}>
                <h1 className={styles.title}>My Profile</h1>
                <p className={styles.description}>
                    Manage your personal information and account details.
                </p>
            </div>

            <div className={styles.content}>
                <div className={styles.profileCard}>
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

                {/* ─── Danger Zone ─────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        marginTop: "24px",
                        border: "1.5px solid #fee2e2",
                        borderRadius: "16px",
                        background: "#fff",
                        overflow: "hidden"
                    }}
                >
                    <div style={{
                        padding: "20px 24px",
                        background: "#fef2f2",
                        borderBottom: "1px solid #fee2e2",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                    }}>
                        <AlertTriangle size={18} color="#dc2626" />
                        <span style={{ fontWeight: "800", color: "#dc2626", fontSize: "15px" }}>Danger Zone</span>
                    </div>

                    <div style={{ padding: "20px 24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                            <div>
                                <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "15px", marginBottom: "4px" }}>Delete My Account</div>
                                <div style={{ color: "#64748b", fontSize: "13px" }}>
                                    Permanently removes your doctor profile, all consultations, SOAP notes, and documents. Cannot be undone.
                                </div>
                            </div>
                            <button
                                onClick={() => { setShowDeleteZone(!showDeleteZone); setDeleteConfirmText(""); setDeleteError(""); }}
                                style={{
                                    padding: "10px 20px", borderRadius: "10px",
                                    border: "1.5px solid #dc2626", background: "transparent",
                                    color: "#dc2626", fontWeight: "700", fontSize: "14px",
                                    cursor: "pointer", display: "flex", alignItems: "center",
                                    gap: "8px", transition: "all 0.15s"
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
                                    ⚠️ This will permanently delete your account and all data. Type <strong>DELETE</strong> to confirm.
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
                                            cursor: deleteConfirmText === "DELETE" ? "pointer" : "not-allowed",
                                            transition: "all 0.15s"
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
            </div>
        </motion.div>
    );
}
