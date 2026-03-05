"use client";
import { useState, useEffect } from "react";
import styles from "../AdminDashboard.module.css";
import { motion } from "framer-motion";
import { getAuthHeaders, API_BASE_URL, handleResponse } from "@/services/apiConfig";

// Create a local service function
const fetchTeamStaff = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/team/staff`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data?.staff || data?.members || []);
    } catch (err) {
        console.error("fetchTeamStaff error:", err);
        return [];
    }
};

const fetchPendingInvites = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/team/invites/pending`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("fetchPendingInvites error:", err);
        return [];
    }
};

export default function TeamManagement() {
    const [staff, setStaff] = useState([]);
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const [staffData, invitesData] = await Promise.all([
                fetchTeamStaff(),
                fetchPendingInvites()
            ]);
            setStaff(staffData);
            setInvites(invitesData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
    };

    return (
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div className={styles.titleRow} variants={itemVariants}>
                <div>
                    <h2 className={styles.heading}>Team Management</h2>
                    <p className={styles.subtext}>Manage clinic staff, hospital roles, and pending invitations</p>
                </div>
            </motion.div>

            <motion.div className={styles.managementSection} variants={itemVariants}>
                <div className={styles.contextPanel} style={{ height: 'auto', opacity: 1, padding: "24px" }}>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h3 style={{ fontSize: "16px", color: "#0f172a" }}>Active Staff Members</h3>
                        <a href="/dashboard/admin/manage-accounts/invite" style={{
                            background: "linear-gradient(90deg, #359AFF, #9CCDFF)",
                            color: "white",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            textDecoration: "none",
                            fontSize: "13px",
                            fontWeight: "600"
                        }}>
                            + Invite Team Member
                        </a>
                    </div>

                    <div className={styles.bookingsTableWrapper}>
                        <table className={styles.bookingsTable} style={{ width: "100%", marginBottom: "32px" }}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>Loading team...</td></tr>
                                ) : staff.length === 0 ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No active staff found.</td></tr>
                                ) : staff.map((member, i) => (
                                    <tr key={member.id || i}>
                                        <td style={{ fontWeight: 500, color: "#0f172a" }}>{member.name || member.full_name}</td>
                                        <td>{member.email}</td>
                                        <td><span style={{ background: "#f1f5f9", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", color: "#475569" }}>{member.role || member.department_role || "Staff"}</span></td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles.active}`} style={{ background: "#dcfce7", color: "#166534", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" }}>
                                                {member.status || "Active"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderTop: "1px solid #e2e8f0", paddingTop: "24px" }}>
                        <h3 style={{ fontSize: "16px", color: "#0f172a" }}>Pending Invitations</h3>
                    </div>

                    <div className={styles.bookingsTableWrapper}>
                        <table className={styles.bookingsTable} style={{ width: "100%" }}>
                            <thead>
                                <tr>
                                    <th>Invited User / Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="3" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>Loading invites...</td></tr>
                                ) : invites.length === 0 ? (
                                    <tr><td colSpan="3" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No pending invitations.</td></tr>
                                ) : invites.map((inv, i) => (
                                    <tr key={inv.id || i}>
                                        <td>
                                            <div style={{ fontWeight: 500, color: "#0f172a" }}>{inv.full_name || "Unknown"}</div>
                                            <div style={{ fontSize: "12px", color: "#64748b" }}>{inv.email}</div>
                                        </td>
                                        <td><span style={{ background: "#f1f5f9", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", color: "#475569" }}>{inv.role}</span></td>
                                        <td>
                                            <span style={{ background: "#fef9c3", color: "#ca8a04", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" }}>
                                                Pending
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </motion.div>
        </motion.div>
    );
}
