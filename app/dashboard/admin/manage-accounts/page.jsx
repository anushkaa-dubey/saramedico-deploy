import styles from "./ManageAccounts.module.css";

import Link from "next/link";
import notificationIcon from "@/public/icons/notification.svg";
import searchIcon from "@/public/icons/search.svg";

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


      {/* Main */}
      <main className={styles.main}>
        {/* Topbar */}
        <div className={styles.topbar}>
          <div className={styles.searchWrapper}>
            <img src={searchIcon.src} alt="Search" className={styles.searchIcon} />
            <input
              className={styles.search}
              placeholder="Search settings, reports, notes..."
            />
          </div>

          <div className={styles.topActions}>
            <button className={styles.iconBtn}>
              <img src={notificationIcon.src} alt="Notifications" width="20" height="20" />
            </button>

            <div className={styles.profile}>
              <div className={styles.profileInfo}>
                <span>Dr. Sarah Smith</span>
                <small>Admin</small>
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
              placeholder="Search patients, reports, notes..."
            />
          </div>

          <Link
            href="/dashboard/admin/manage-accounts/invite"
            className={styles.inviteBtn}
          >
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

        {/* Modal / Table Card */}
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
                    <Link href={`/dashboard/admin/manage-accounts/edit/${user.id}`} className={styles.editBtn}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Only List */}
          <div className={styles.mobileListHeader}>
            <div className={styles.headerUser}>USER</div>
            <div className={styles.headerRole}>ROLE</div>
            <div className={styles.headerStatus}>STATUS</div>
          </div>

          <div className={styles.mobileList}>
            {users.map((user) => (
              <div key={user.id} className={styles.userCard}>
                <div className={styles.userInfo}>{user.name}</div>
                <div className={styles.userRole}>{user.role}</div>
                <div className={styles.userStatus}>
                  <span className={getStatusClass(user.status)}>{user.status}</span>
                  <span className={styles.chevronIcon}>›</span>
                </div>
              </div>
            ))}
          </div>

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
