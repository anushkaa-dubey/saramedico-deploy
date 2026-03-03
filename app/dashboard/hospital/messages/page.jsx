"use client";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { API_BASE_URL, getAuthHeaders } from "@/services/apiConfig";

export default function MessagesPage() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/messages`, {
                    headers: getAuthHeaders(),
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                setMessages(Array.isArray(data) ? data : (data.messages || data.items || []));
            } catch (err) {
                console.error("MessagesPage: Failed to load messages:", err);
                setError("Backend not connected — messages unavailable.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", flexDirection: "column", background: "transparent", padding: 0, minHeight: "100%" }}
        >
            <Topbar title="Messages" />

            <div className={styles.contentWrapper}>
                <div className={styles.card}>
                    <div className={styles.cardTitle}>
                        <span>Inbox</span>
                        <button className={styles.outlineBtn}>Compose</button>
                    </div>

                    {error && (
                        <div style={{ padding: "12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px", margin: "12px 0", fontSize: "13px" }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                        {loading ? (
                            <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>Loading messages...</div>
                        ) : messages.length === 0 ? (
                            <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
                                {error ? error : "No messages found."}
                            </div>
                        ) : messages.map((msg, i) => (
                            <div
                                key={msg.id || i}
                                style={{
                                    padding: "16px",
                                    background: msg.unread || !msg.read ? "#f8fafc" : "white",
                                    border: "1px solid #eef2f7",
                                    borderRadius: "12px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    cursor: "pointer"
                                }}
                            >
                                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                                    <div style={{
                                        width: "40px", height: "40px",
                                        background: "#bfdbfe", borderRadius: "50%",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: "#1e3a8a", fontWeight: "bold", fontSize: "14px"
                                    }}>
                                        {(msg.sender || msg.sender_name || "?")[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: "700", color: "#0f172a" }}>{msg.sender || msg.sender_name || "Anonymous"}</div>
                                        <div style={{ fontSize: "14px", color: "#64748b" }}>{msg.subject || msg.content?.substring(0, 60) || "—"}</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600", whiteSpace: "nowrap" }}>
                                    {msg.time || (msg.created_at ? new Date(msg.created_at).toLocaleDateString() : "—")}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
