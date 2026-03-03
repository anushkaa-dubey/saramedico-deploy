"use client";
import { useState, useEffect } from "react";
import styles from "./ManageAccounts.module.css";
import Link from "next/link";
import notificationIcon from "@/public/icons/notification.svg";
import searchIcon from "@/public/icons/search.svg";
import { fetchAdminAccounts, adminRemoveMember, fetchDepartmentStaff, fetchPendingInvites } from "@/services/admin";
import { fetchProfile } from "@/services/doctor";

export default function ManageAccountsPage() {
  const [users, setUsers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminUser, setAdminUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [profile, staff, invites] = await Promise.all([
          fetchProfile(),
          fetchDepartmentStaff(),
          fetchPendingInvites(),
        ]);
        setAdminUser(profile);
        setUsers(staff);
        setPendingInvites(invites);
      } catch (err) {
        console.error("ManageAccounts init error:", err);
        setError("Backend not connected — could not load team data.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleRemove = async (id) => {
    if (!confirm("Are you sure you want to remove this account?")) return;
    setRemoving(id);
    try {
      await adminRemoveMember(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert("Failed to remove account: " + (err.message || "Backend not connected."));
    } finally {
      setRemoving(null);
    }
  };

  const getStatusClass = (status = "") => {
    switch ((status || "").toLowerCase()) {
      case "active":
        return styles.statusActive;
      case "inactive":
      case "disabled":
        return styles.statusInactive;
      case "pending":
        return styles.statusPending;
      default:
        return styles.statusPending;
    }
  };

  const filtered = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.full_name || u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q)
    );
  });

  const adminName = adminUser?.full_name || "Admin";

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {/* Topbar */}
        <div className={styles.topbar}>
          <div className={styles.searchWrapper}>
            <img src={searchIcon.src} alt="Search" className={styles.searchIcon} />
            <input
              className={styles.search}
              placeholder="Search settings, reports, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.topActions}>
            <button className={styles.iconBtn}>
              <img src={notificationIcon.src} alt="Notifications" width="20" height="20" />
            </button>

            <div className={styles.profile}>
              <div className={styles.profileInfo}>
                <span>{adminName}</span>
                <small>{adminUser?.role || "Admin"}</small>
              </div>
              <div className={styles.avatar}></div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className={styles.headingSection}>
          <h2 className={styles.heading}>Account Management</h2>
        </div>

        {/* Search Row + Invite */}
        <div className={styles.titleRow}>
          <div className={styles.searchWrapper}>
            <img src={searchIcon.src} alt="Search" className={styles.searchIcon} />
            <input
              className={styles.search}
              placeholder="Search accounts by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Link href="/dashboard/admin/manage-accounts/invite" className={styles.inviteBtn}>
            <div className={styles.inviteIconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="17" y1="11" x2="23" y2="11" />
              </svg>
            </div>
            <span className={styles.inviteBtnText}>Invite User</span>
          </Link>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{ padding: "14px 20px", background: "#fef2f2", color: "#b91c1c", borderRadius: "10px", marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>
            {error}
          </div>
        )}

        {/* Modal / Table Card */}
        <div className={styles.card}>
          <div className={styles.tableHeader}>
            <div className={styles.filterGroup}>
              <select className={styles.filterSelect}>
                <option>All Types</option>
                <option>doctor</option>
                <option>admin</option>
                <option>patient</option>
              </select>
              <select className={styles.filterSelect}>
                <option>All Statuses</option>
                <option>active</option>
                <option>inactive</option>
                <option>pending</option>
              </select>
            </div>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>USER</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th>LAST LOGIN</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
                    Loading team members...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
                    {users.length === 0 ? "Backend not connected — no staff members found." : "No members match your search."}
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatarSmall}></div>
                        <div>
                          <div>{user.name || user.full_name || "—"}</div>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>{user.email || ""}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textTransform: "capitalize" }}>{user.role || "—"}</td>
                    <td>
                      <span className={getStatusClass(user.status)}>
                        {user.status || "Active"}
                      </span>
                    </td>
                    <td>
                      {user.last_accessed ? new Date(user.last_accessed).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <Link href={`/dashboard/admin/manage-accounts/edit/${user.id}`} className={styles.editBtn}>Edit</Link>
                        <button
                          onClick={() => handleRemove(user.id)}
                          disabled={removing === user.id}
                          style={{ background: "none", border: "1px solid #fee2e2", color: "#ef4444", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                        >
                          {removing === user.id ? "..." : "Remove"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile Only List */}
          <div className={styles.mobileListHeader}>
            <div className={styles.headerUser}>USER</div>
            <div className={styles.headerRole}>ROLE</div>
            <div className={styles.headerStatus}>STATUS</div>
          </div>

          <div className={styles.mobileList}>
            {loading ? (
              <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>Loading...</div>
            ) : filtered.map((user) => (
              <div key={user.id} className={styles.userCard}>
                <div className={styles.userInfo}>{user.full_name || user.name || "—"}</div>
                <div className={styles.userRole} style={{ textTransform: "capitalize" }}>{user.role || "—"}</div>
                <div className={styles.userStatus}>
                  <span className={getStatusClass(user.status || (user.is_active ? "active" : "inactive"))}>
                    {user.status || (user.is_active ? "Active" : "Inactive")}
                  </span>
                  <span className={styles.chevronIcon}>›</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination info */}
          {/* Pending Invitations Section */}
          {pendingInvites.length > 0 && (
            <div style={{ marginTop: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Pending Invitations</h3>
              <div className={styles.card}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>EMAIL</th>
                      <th>ROLE</th>
                      <th>STATUS</th>
                      <th>EXPIRES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingInvites.map((invite) => (
                      <tr key={invite.id}>
                        <td>{invite.email}</td>
                        <td>{invite.role}</td>
                        <td>
                          <span className={styles.statusPending}>{invite.status}</span>
                        </td>
                        <td>{invite.expires_at ? new Date(invite.expires_at).toLocaleDateString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
