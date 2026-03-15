"use client";

import { useState, useEffect } from "react";
import styles from "./ManageAccounts.module.css";

import {
  fetchAdminAccounts,
  updateAdminAccount,
  deleteAdminAccount
} from "@/services/admin";

import { Edit2, Trash2 } from "lucide-react";

export default function ManageAccountsPage() {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingUser, setEditingUser] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "",
    status: "",
    phone_number: "",
    specialty: "",
    license_number: "",
    department: "",
    organization_display_name: "",
    gender: "",
    password: ""
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await fetchAdminAccounts();
      setUsers(data || []);
    } catch (e) {
      console.error("Failed loading accounts", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {

    if (!confirm("Remove this account?")) return;

    try {

      await deleteAdminAccount(id);

      setUsers(prev => prev.filter(u => u.id !== id));

    } catch (err) {

      console.error("Delete failed", err);

    }
  };

  const openEdit = async (user) => {
    setLoading(true);
    try {
      const { fetchAdminAccountDetail } = await import("@/services/admin");
      const detail = await fetchAdminAccountDetail(user.id);
      
      setEditingUser(detail);
      setEditForm({
        name: detail.name || "",
        email: detail.email || "",
        role: detail.role || "",
        status: detail.status || "",
        phone_number: detail.phone_number || "",
        specialty: detail.specialty || "",
        license_number: detail.license_number || "",
        department: detail.department || "",
        organization_display_name: detail.organization_name || "",
        gender: detail.gender || "",
        password: ""
      });
    } catch (err) {
      console.error("Failed to fetch user details", err);
      alert("Could not load full profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateAdminAccount(editingUser.id, editForm);
      setEditingUser(null);
      // ✅ Always re-fetch from server so we see the real saved state
      await loadAccounts();
      alert("Account updated successfully!");
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update account: " + (err.message || "Unknown error"));
    }
  };

  return (

    <div>

      <h2 className={styles.heading}>Account Management</h2>

      <div className={styles.card}>

        <table className={styles.table}>

          <thead>
            <tr>
              <th>USER</th>
              <th>ROLE</th>
              <th>STATUS</th>
              <th>ORGANIZATION</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (

              <tr>
                <td colSpan="5">Loading...</td>
              </tr>

            ) : users.length === 0 ? (

              <tr>
                <td colSpan="5">No accounts found.</td>
              </tr>

            ) : users.map(user => (

              <tr key={user.id}>

                <td>
                  <div>
                    <strong>{user.name}</strong>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      {user.email}
                    </div>
                  </div>
                </td>

                <td>{user.role}</td>

                <td>{user.status}</td>

                <td>{user.organization_name || "—"}</td>

                <td style={{ display: "flex", gap: "8px" }}>

                  <button onClick={() => openEdit(user)}>
                    <Edit2 size={14} />
                  </button>

                  <button onClick={() => handleRemove(user.id)}>
                    <Trash2 size={14} />
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>


      {editingUser && (
        <div className={styles.modalOverlay} onClick={() => setEditingUser(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Edit Account Details</h3>
              <p>Modify credentials and system access for <strong>{editingUser.email}</strong></p>
            </div>
            
            <div className={styles.formGrid} style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: "16px" 
            }}>
                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <input
                    className={styles.input}
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Personal Phone</label>
                  <input
                    className={styles.input}
                    value={editForm.phone_number}
                    onChange={e => setEditForm({ ...editForm, phone_number: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>System Role</label>
                  <select
                    className={styles.input}
                    value={editForm.role}
                    onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                  >
                    <option value="doctor">Doctor</option>
                    <option value="admin">Administrator</option>
                    <option value="patient">Patient</option>
                    <option value="hospital">Hospital/Clinic Admin</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Account Status</label>
                  <select
                    className={styles.input}
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Gender / Sex</label>
                  <select
                    className={styles.input}
                    value={editForm.gender}
                    onChange={e => setEditForm({ ...editForm, gender: e.target.value })}
                  >
                    <option value="">Not Specified</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>System Password Override</label>
                  <input
                    className={styles.input}
                    type="password"
                    value={editForm.password}
                    onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                    placeholder="Leave blank to keep current"
                  />
                </div>
            </div>

            {/* Doctor Specific Fields */}
            {editForm.role === "doctor" && (
                <div className={styles.roleFields} style={{ 
                    marginTop: "16px", 
                    padding: "16px", 
                    background: "#f8fafc", 
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0"
                }}>
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#334155" }}>Medical Professional Credentials</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div className={styles.formGroup}>
                            <label>Medical Specialty</label>
                            <input
                                className={styles.input}
                                value={editForm.specialty}
                                onChange={e => setEditForm({ ...editForm, specialty: e.target.value })}
                                placeholder="e.g. Cardiology"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>License Number</label>
                            <input
                                className={styles.input}
                                value={editForm.license_number}
                                onChange={e => setEditForm({ ...editForm, license_number: e.target.value })}
                                placeholder="MD-XXXX-XXXX"
                            />
                        </div>
                    </div>
                    <div className={styles.formGroup} style={{ marginTop: "12px" }}>
                        <label>Hospital Department</label>
                        <input
                            className={styles.input}
                            value={editForm.department}
                            onChange={e => setEditForm({ ...editForm, department: e.target.value })}
                            placeholder="e.g. Emergency Medicine"
                        />
                    </div>
                </div>
            )}

            {/* Organization Name — visible for ALL roles */}
            <div className={styles.roleFields} style={{ 
                marginTop: "16px", 
                padding: "16px", 
                background: "#f0f9ff", 
                borderRadius: "12px",
                border: "1px solid #bae6fd"
            }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#0369a1" }}>Organization / Clinic Name</h4>
                <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#64748b"}}>⚠️ Renaming this will update the clinic name for ALL users in the same organization.</p>
                <div className={styles.formGroup}>
                    <label>Clinic/Hospital/Organization Name</label>
                    <input
                        className={styles.input}
                        value={editForm.organization_display_name}
                        onChange={e => setEditForm({ ...editForm, organization_display_name: e.target.value })}
                        placeholder="e.g. City General Hospital"
                    />
                </div>
            </div>

            <div className={styles.modalActions}>
              <button 
                className={styles.cancelBtn} 
                onClick={() => setEditingUser(null)}
              >
                Discard Changes
              </button>
              <button 
                className={styles.saveBtn} 
                onClick={handleSave}
              >
                Update Account
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}