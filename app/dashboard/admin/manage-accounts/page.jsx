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
    status: ""
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

    try {

      await updateAdminAccount(editingUser.id, editForm);

      setUsers(prev =>
        prev.map(u =>
          u.id === editingUser.id ? { ...u, ...editForm } : u
        )
      );

      setEditingUser(null);

    } catch (err) {

      console.error("Update failed", err);

    }
  };

  return (

    <div className="overflow-hidden" style={{overflow:"hidden"}} >

      <h2 className={`${styles.heading}`} style={{padding:"35px"}} >Account Management</h2>

      <div className={styles.card} style={{overflow:"hidden"}}>

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

          <tbody style={{overflowY:"auto"}} >

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

        <div className={styles.modalOverlay}>

          <div className={styles.modal}>

            <h3>Edit Account</h3>

            <input
              value={editForm.name}
              onChange={e =>
                setEditForm({ ...editForm, name: e.target.value })
              }
            />

            <input
              value={editForm.email}
              disabled
            />

            <select
              value={editForm.role}
              onChange={e =>
                setEditForm({ ...editForm, role: e.target.value })
              }
            >
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
              <option value="patient">Patient</option>
            </select>

            <select
              value={editForm.status}
              onChange={e =>
                setEditForm({ ...editForm, status: e.target.value })
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div style={{ display: "flex", gap: "10px" }}>

              <button onClick={() => setEditingUser(null)}>
                Cancel
              </button>

              <button onClick={handleSave}>
                Save
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}