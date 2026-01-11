import styles from "./ManageAccounts.module.css";
import logo from "@/public/logo.png";
import dashboardIcon from "@/public/icons/dashboard.svg";
import manageIcon from "@/public/icons/manage.svg";
import settingsIcon from "@/public/icons/settings.svg";
import Link from "next/link";

export default function ManageAccountsPage() {

  const users = [
    {
      id: 1,
      name: "Dr. Smith Sara",
      role: "Doctor",
      status: "Active",
      lastLogin: "01/12/80",
    },
    {
      id: 2,
      name: "Dr. Angel Batista",
      role: "Doctor",
      status: "Inactive",
      lastLogin: "08/08/80",
    },
    {
      id: 3,
      name: "Dr. Smith Sara",
      role: "Doctor",
      status: "Pending",
      lastLogin: "12/10/80",
    },
    {
      id: 4,
      name: "Dr. Smith Sara",
      role: "Doctor",
      status: "Active",
      lastLogin: "12/10/80",
    },
    {
      id: 5,
      name: "Dr. Smith Sara",
      role: "Doctor",
      status: "Active",
      lastLogin: "12/10/80",
    },
    {
      id: 6,
      name: "Dr. Smith Sara",
      role: "Doctor",
      status: "Active",
      lastLogin: "12/10/80",
    },
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case "Active":
        return styles.statusActive;
      case "Inactive":
        return styles.statusInactive;
      case "Pending":
        return styles.statusPending;
      default:
        return "";
    }
  };

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logoRow}>
          <img src={logo.src} alt="Logo" />
        </div>

        <div className={styles.navGroup}>
          <Link href="/dashboard/admin" className={styles.navItem}>
            <img src={dashboardIcon.src} alt="Dashboard" width="18" height="18" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/admin/manage-accounts"
            className={`${styles.navItem} ${styles.active}`}
          >
            <img src={manageIcon.src} alt="Manage" width="18" height="18" />
            Manage Accounts
          </Link>
          <Link href="/dashboard/admin/settings" className={styles.navItem}>
            <img src={settingsIcon.src} alt="Settings" width="18" height="18" />
            Settings
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {/* Topbar */}
        <div className={styles.topbar}>
          <input
            className={styles.search}
            placeholder="Search settings, reports, notes..."
          />

          <div className={styles.topActions}>
            <button className={styles.iconBtn}>
              <div className={styles.iconPlaceholder}></div>
            </button>

            <div className={styles.profile}>
              <div className={styles.avatar}></div>
              <span>Dr. Sarah Smith</span>
              <small>Admin</small>
            </div>
          </div>
        </div>

        {/* Title + Invite */}
        <div className={styles.titleRow}>
          <div>
            <h2 className={styles.heading}>Account Management</h2>
            <p className={styles.subtext}>
              Grant access you your clinic's workspace securely
            </p>
          </div>

          <Link
            href="/dashboard/admin/manage-accounts/invite"
            className={styles.inviteBtn}
          >
            ↓ Invite User
          </Link>
        </div>

        {/* Table Card */}
        <div className={styles.card}>
          <div className={styles.tableHeader}>
            <div className={styles.filterGroup}>
              <select className={styles.filterSelect}>
                <option>All Types</option>
              </select>
              <select className={styles.filterSelect}>
                <option>Last 6 Months</option>
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
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatarSmall}></div>
                      {user.name}
                    </div>
                  </td>
                  <td>{user.role}</td>
                  <td>
                    <span className={getStatusClass(user.status)}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.lastLogin}</td>
                  <td>
                    <button className={styles.actionBtn}>⋮</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className={styles.pagination}>
            <span>Showing 1 to 5 of 12 results</span>
            <div className={styles.paginationButtons}>
              <button className={styles.paginationBtn}>←</button>
              <button className={`${styles.paginationBtn} ${styles.active}`}>
                1
              </button>
              <button className={styles.paginationBtn}>2</button>
              <button className={styles.paginationBtn}>3</button>
              <button className={styles.paginationBtn}>→</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
