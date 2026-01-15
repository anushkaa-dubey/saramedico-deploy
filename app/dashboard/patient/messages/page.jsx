"use client";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import styles from "../PatientDashboard.module.css";

export default function Messages() {
    const notifications = [
        {
            id: 1,
            title: "Appointment Reminder",
            time: "2 hours ago",
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        },
        {
            id: 2,
            title: "Lab Results Available",
            time: "Yesterday",
            content: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
        {
            id: 3,
            title: "System Update",
            time: "2 days ago",
            content: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo."
        },
        {
            id: 4,
            title: "Welcome to SaraMedico",
            time: "3 days ago",
            content: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet."
        }
    ];

    return (
        <div className={styles.container}>
            <Sidebar />

            <main className={styles.main}>
                <Topbar />

                <section className={styles.header}>
                    <div>
                        <h2 className={styles.greeting}>Messages</h2>
                        <p className={styles.sub}>You have {notifications.length} new notifications</p>
                    </div>
                </section>

                <section className={styles.grid}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: '1 / -1' }}>
                        {notifications.map((item) => (
                            <div
                                key={item.id}
                                className={styles.card}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>{item.title}</h3>
                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{item.time}</span>
                                </div>
                                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
                                    {item.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
