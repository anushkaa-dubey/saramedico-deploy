"use client";

import { useState, useEffect } from "react";
import styles from "../AdminDashboard.module.css";
import {
  fetchAdminSettings,
  updateAdminProfile,
  uploadAdminAvatar
} from "@/services/admin";

export default function AdminProfilePage() {

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar_url: ""
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const data = await fetchAdminSettings();

    setProfile({
      name: data.profile?.name || "",
      email: data.profile?.email || "",
      avatar_url: data.profile?.avatar_url || ""
    });

    setLoading(false);
  };

  const handleSave = async () => {
    await updateAdminProfile({
      name: profile.name,
      email: profile.email
    });

    alert("Profile updated");
  };

  const handleAvatar = async (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const res = await uploadAdminAvatar(file);

    setProfile(prev => ({
      ...prev,
      avatar_url: res.preview_url
    }));
  };

  if (loading) return null;

  return (

    <div className={styles.profileContainer}>

      <div className={styles.titleRow}>

        <div>
          <h2 className={styles.heading}>My Profile</h2>
          <p className={styles.subtext}>
            Manage your personal information and account details.
          </p>
        </div>

      </div>

      <div className={styles.card}>

        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>

          <div className={styles.avatarLarge}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="" style={{width:"70px",aspectRatio:"1",borderRadius:"100%"}} />
              : profile.name?.charAt(0)}
          </div>

          <div>
            <strong>{profile.name}</strong>
            <br />

            <label style={{ color: "#6366f1", cursor: "pointer" }}>
              Upload Avatar
              <input type="file" hidden onChange={handleAvatar} />
            </label>
          </div>

        </div>

        <div className={styles.profileGrid}>

          <div>
            <label>FULL NAME</label>
            <input
              className={styles.input}
              value={profile.name}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
            />
          </div>

          <div>
            <label>EMAIL ADDRESS</label>
            <input
              className={styles.input}
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
            />
          </div>

        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>

          <button className={styles.secondaryBtn}>
            Cancel
          </button>

          <button
            className={styles.saveBtn}
            onClick={handleSave}
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>

  );
}