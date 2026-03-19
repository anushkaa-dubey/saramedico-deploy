"use client";

import { useState, useEffect } from "react";
import styles from "./ManageAccounts.module.css";
import { fetchAdminAccounts, updateAdminAccount, deleteAdminAccount, fetchAdminAccountDetail } from "@/services/admin";
import { Edit2, Trash2 } from "lucide-react";

export default function ManageAccountsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "", email: "", role: "", status: "", phone_number: "",
    specialty: "", license_number: "", department: "",
    organization_display_name: "", gender: "", password: ""
  });

  useEffect(() => { loadAccounts(); }, []);

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
      await loadAccounts();
      alert("Account updated successfully!");
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update account: " + (err.message || "Unknown error"));
    }
  };

  const getRoleLabel = (role) => {
    const map = { doctor: "Doctor", admin: "Admin", patient: "Patient", hospital: "Hospital" };
    return map[role] || role;
  };

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "?");

  return (
    <div className={styles.pageWrapper}>

      {/* Page heading */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.heading}>Account Management</h2>
          <p className={styles.subtext}>Manage all system users and their access</p>
        </div>
      </div>

      {/* ── DESKTOP TABLE ── */}
      <div className={styles.card}>
        {loading ? (
          <div className={styles.loadingState}>Loading accounts…</div>
        ) : users.length === 0 ? (
          <div className={styles.emptyState}>No accounts found.</div>
        ) : (
          <div className={styles.tableWrapper}>
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
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatarSmall}>
                          {getInitial(user.name)}
                        </div>
                        <div>
                          <div className={styles.userName}>{user.name}</div>
                          <div className={styles.userEmail}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.roleTag}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td>
                      <span className={user.status === "active" ? styles.statusActive : styles.statusInactive}>
                        {user.status}
                      </span>
                    </td>
                    <td className={styles.orgCell}>{user.organization_name || "—"}</td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button className={styles.editBtn} onClick={() => openEdit(user)}>
                          <Edit2 size={14} /> Edit
                        </button>
                        <button className={styles.deleteBtn} onClick={() => handleRemove(user.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MOBILE CARD LIST ── */}
      <div className={styles.mobileList}>
        {loading ? (
          <div className={styles.loadingState}>Loading accounts…</div>
        ) : users.length === 0 ? (
          <div className={styles.emptyState}>No accounts found.</div>
        ) : users.map(user => (
          <div key={user.id} className={styles.userCard}>
            <div className={styles.userCardLeft}>
              <div className={styles.avatarMobile}>{getInitial(user.name)}</div>
              <div className={styles.userCardInfo}>
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.userEmail}>{user.email}</span>
                <span className={styles.orgName}>{user.organization_name || "—"}</span>
              </div>
            </div>
            <div className={styles.userCardRight}>
              <span className={user.status === "active" ? styles.statusActive : styles.statusInactive}>
                {user.status}
              </span>
              <span className={styles.roleTag}>{getRoleLabel(user.role)}</span>
              <div className={styles.mobileActions}>
                <button className={styles.editBtn} onClick={() => openEdit(user)}>
                  <Edit2 size={13} />
                </button>
                <button className={styles.deleteBtn} onClick={() => handleRemove(user.id)}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── EDIT MODAL ── */}
      {editingUser && (
        <div className={styles.modalOverlay} onClick={() => setEditingUser(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Edit Account</h3>
              <p>Modifying <strong>{editingUser.email}</strong></p>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input className={styles.input} value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>Phone</label>
                <input className={styles.input} value={editForm.phone_number}
                  onChange={e => setEditForm({ ...editForm, phone_number: e.target.value })}
                  placeholder="+1 (555) 000-0000" />
              </div>
              <div className={styles.formGroup}>
                <label>Role</label>
                <select className={styles.input} value={editForm.role}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Administrator</option>
                  <option value="patient">Patient</option>
                  <option value="hospital">Hospital/Clinic Admin</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select className={styles.input} value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Gender</label>
                <select className={styles.input} value={editForm.gender}
                  onChange={e => setEditForm({ ...editForm, gender: e.target.value })}>
                  <option value="">Not Specified</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Password Override</label>
                <input className={styles.input} type="password" value={editForm.password}
                  onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Leave blank to keep current" />
              </div>
            </div>

            {editForm.role === "doctor" && (
              <div className={styles.sectionBox}>
                <h4 className={styles.sectionBoxTitle}>Medical Credentials</h4>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Specialty</label>
                    <input className={styles.input} value={editForm.specialty}
                      onChange={e => setEditForm({ ...editForm, specialty: e.target.value })}
                      placeholder="e.g. Cardiology" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>License Number</label>
                    <input className={styles.input} value={editForm.license_number}
                      onChange={e => setEditForm({ ...editForm, license_number: e.target.value })}
                      placeholder="MD-XXXX-XXXX" />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Department</label>
                  <input className={styles.input} value={editForm.department}
                    onChange={e => setEditForm({ ...editForm, department: e.target.value })}
                    placeholder="e.g. Emergency Medicine" />
                </div>
              </div>
            )}

            <div className={styles.sectionBoxBlue}>
              <h4 className={styles.sectionBoxTitle} style={{ color: "#0369a1" }}>Organization Name</h4>
              <p className={styles.sectionBoxNote}>⚠️ Renaming updates the clinic for ALL users in this org.</p>
              <div className={styles.formGroup}>
                <label>Clinic / Hospital Name</label>
                <input className={styles.input} value={editForm.organization_display_name}
                  onChange={e => setEditForm({ ...editForm, organization_display_name: e.target.value })}
                  placeholder="e.g. City General Hospital" />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setEditingUser(null)}>
                Discard
              </button>
              <button className={styles.saveBtn} onClick={handleSave}>
                Update Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}