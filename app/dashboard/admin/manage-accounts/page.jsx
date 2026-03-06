"use client";
import { useState, useEffect } from "react";
import styles from "./ManageAccounts.module.css";
import { fetchAdminAccounts, adminRemoveMember, updateAdminAccount } from "@/services/admin";
import { Edit2, Trash2 } from "lucide-react";

export default function ManageAccountsPage() {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "", status: "" });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await fetchAdminAccounts();
      setUsers(data || []);
    } catch (e) {
      console.error(e);
    }
    finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    if (!confirm("Remove this account?")) return;

    await adminRemoveMember(id);

    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const openEdit = (user) => {
    setEditingUser(user);

    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
  };

  const handleSave = async () => {
    await updateAdminAccount(editingUser.id, editForm);

    setUsers(prev => prev.map(u =>
      u.id === editingUser.id ? { ...u, ...editForm } : u
    ));

    setEditingUser(null);
  };

  return (

    <div>

      <h2 className={styles.heading}>Account Management</h2>

      <div className={styles.card}>

        <table className={styles.table}>

          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Organization</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr><td colSpan="5">Loading...</td></tr>
            ) : users.map(user => (
              <tr key={user.id}>

                <td>
                  <div>
                    <strong>{user.name}</strong>
                    <div>{user.email}</div>
                  </div>
                </td>

                <td>{user.role}</td>

                <td>{user.status}</td>

                <td>{user.organization_name}</td>

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

        <div className={styles.modalOverlay}>

          <div className={styles.modal}>

            <h3>Edit Account</h3>

            <input
              value={editForm.name}
              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
            />

            <input
              value={editForm.email}
              onChange={e => setEditForm({ ...editForm, email: e.target.value })}
            />

            <select
              value={editForm.role}
              onChange={e => setEditForm({ ...editForm, role: e.target.value })}
            >
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
              <option value="patient">Patient</option>
            </select>

            <select
              value={editForm.status}
              onChange={e => setEditForm({ ...editForm, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div style={{ display: "flex", gap: "10px" }}>

              <button onClick={() => setEditingUser(null)}>Cancel</button>

              <button onClick={handleSave}>Save</button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}