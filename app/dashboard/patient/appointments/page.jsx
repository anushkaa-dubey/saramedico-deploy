"use client";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import RecordsTable from "../records/components/RecordsTable";
import styles from "../records/Records.module.css";
// We are reusing Records styles, but we need some specific layout for the Jane Header.
// Since we don't have a separate CSS, we will use inline styles or reuse .detailsCard structure.

import Link from "next/link";
import janeImage from "@/public/icons/images/Jane.png";

export default function AppointmentsPage() {
    return (
        <div className={styles.container}>
            <Sidebar />

            <main className={styles.main}>
                <Topbar />

                <section className={styles.wrapper}>

                    {/* Back Button */}
                    <div style={{ marginBottom: '20px' }}>
                        <Link href="/dashboard/patient" style={{ textDecoration: 'none', color: '#0f172a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>←</span> Back
                        </Link>
                    </div>

                    {/* Jane Smith Header Card */}
                    <div className={styles.detailsCard} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
                        <img
                            src={janeImage.src}
                            alt="Jane Smith"
                            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                        />

                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>Jane Smith</h2>
                                <div style={{ fontSize: '13px', color: '#64748b' }}>
                                    <div>DOB</div>
                                    <div style={{ fontWeight: '600', color: '#334155' }}>Jan 12, 1980</div>
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '30px' }}>
                                    <div>GENDER</div>
                                    <div style={{ fontWeight: '600', color: '#334155' }}>Female</div>
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '30px' }}>
                                    <div>MRN</div>
                                    <div style={{ fontWeight: '600', color: '#334155' }}>#8823-99</div>
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '30px' }}>
                                    <div>DIAGNOSED BY</div>
                                    <div style={{ fontWeight: '600', color: '#334155' }}>Arrhythmias</div>
                                </div>
                            </div>
                        </div>

                        <button style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            + New Visit
                        </button>
                    </div>

                    {/* Tabs logic is usually needed here but for now just showing table */}
                    <div style={{ display: 'flex', gap: '30px', margin: '30px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '0' }}>
                        <div style={{ paddingBottom: '12px', borderBottom: '2px solid #3b82f6', color: '#3b82f6', fontWeight: '600', cursor: 'pointer' }}>Visits</div>
                        <div style={{ paddingBottom: '12px', color: '#64748b', fontWeight: '500', cursor: 'pointer' }}>Documents</div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3>Visit History</h3>

                            <div className={styles.filters}>
                                <select>
                                    <option>All Types</option>
                                </select>

                                <select>
                                    <option>Last 6 Months</option>
                                </select>
                            </div>
                        </div>

                        <RecordsTable />
                    </div>

                </section>
            </main>
        </div>
    );
}
