import styles from "./AdminDashboard.module.css";
import AdminSidebar from "./components/Sidebar";
import notificationIcon from "@/public/icons/notification.svg";

// ...
<div className={styles.topActions}>
  <button className={styles.iconBtn}>
    <img src={notificationIcon.src} alt="Notifications" width="20" height="20" />
  </button>

  <div className={styles.profile}>
    <div className={styles.avatar}></div>
    <span>Dr. Sarah Smith</span>
    <small>Admin</small>
  </div>
</div>
        </div >

  {/* Title + Invite */ }
  < div className = { styles.titleRow } >
          <div>
            <h2 className={styles.heading}>Dashboard Overview</h2>
            <p className={styles.subtext}>
              Access to your clinic’s workspace securely
            </p>
          </div>

          <button className={styles.inviteBtn}>Invite User</button>
        </div >

  <div className={styles.grid}>
    {/* LEFT COLUMN */}
    <div className={styles.leftCol}>
      {/* Recent Activity (TABLE) */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>Recent Activity</h3>
          <span className={styles.link}>View Logs</span>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>USER</th>
              <th>EVENT</th>
              <th>DATE/TIME</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className={styles.userCell}>
                  <div className={styles.avatarSmall}></div>
                  John Von
                </div>
              </td>
              <td>Viewed Lab Results</td>
              <td>Today, 9:15 AM</td>
              <td>
                <span className={styles.success}>Completed</span>
              </td>
            </tr>
            <tr>
              <td>
                <div className={styles.userCell}>
                  <div className={styles.avatarSmall}></div>
                  John Von
                </div>
              </td>
              <td>Started a session</td>
              <td>Yesterday, 4:30 PM</td>
              <td>
                <span className={styles.warning}>In Review</span>
              </td>
            </tr>
            <tr>
              <td>
                <div className={styles.userCell}>
                  <div className={styles.avatarSmall}></div>
                  John Von
                </div>
              </td>
              <td>Joined a session</td>
              <td>Sept 12, 2:10 PM</td>
              <td>
                <span className={styles.success}>Completed</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Security (SIMPLE ROW LIKE UI) */}
      <div className={styles.card}>
        <div className={styles.securityHeader}>
          <h3>Security</h3>
        </div>

        <div className={styles.securityRow}>
          <div>
            <strong>Password</strong>
            <p>Last changed 3 months ago</p>
          </div>
          <button className={styles.changeBtn}>Change</button>
        </div>
      </div>
    </div>

    {/* RIGHT COLUMN */}
    <div className={styles.rightCol}>
      {/* Alerts */}
      <div className={`${styles.card} ${styles.alertCard}`}>
        <h3>Alerts</h3>

        <div className={styles.alertList}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div className={styles.alert} key={i}>
              <strong>Consultation summary ready</strong>
              <p>
                Patient Daniel Koshear - AI Analysis complete. Key vitals
                extracted.
              </p>
              <span>42m ago</span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.card}>
        <h3>Quick Actions</h3>
        <div className={styles.quickEmpty}></div>
      </div>
    </div>
  </div>
      </main >
    </div >
  );
}
