"use client";
import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import styles from "../HospitalDashboard.module.css";
import { motion } from "framer-motion";
import { API_BASE_URL, getAuthHeaders, handleResponse } from "@/services/apiConfig";

async function fetchMessages() {
    try {
        const res = await fetch(`${API_BASE_URL}/messages`, { headers: getAuthHeaders() });
        const data = await handleResponse(res);
        return Array.isArray(data) ? data : (data?.messages || data?.items || []);
    } catch {
        return [];
    }
}

export default function MessagesPage() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await fetchMessages();
                setMessages(data);
            } catch (err) {
                console.error("MessagesPage: Failed to load:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = messages.filter(m => {
        const q = search.toLowerCase();
        return (
            (m.sender || m.sender_name || "").toLowerCase().includes(q) ||
            (m.subject || m.content || "").toLowerCase().includes(q)
        );
    });

    const initials = (name) => (name || "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", flexDirection: "column", background: "transparent", padding: 0, minHeight: "100%" }}
        >
            <Topbar title="Messages" />

            <div className={styles.contentWrapper}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                        <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Messages</h1>
                        <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>
                            Internal communication between hospital staff.
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ padding: "9px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "13px", outline: "none", width: "220px" }}
                        />
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "20px", minHeight: "500px" }}>
                    {/* Message List */}
                    <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9", overflow: "hidden" }}>
                        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", fontWeight: "800", fontSize: "13px", color: "#475569" }}>
                            INBOX ({filtered.length})
                        </div>
                        <div style={{ overflowY: "auto", maxHeight: "600px" }}>
                            {loading ? (
                                <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>Loading messages...</div>
                            ) : filtered.length === 0 ? (
                                <div style={{ padding: "48px 20px", textAlign: "center", color: "#94a3b8" }}>
                                    <div style={{ fontSize: "36px", marginBottom: "12px" }}>💬</div>
                                    <div style={{ fontWeight: "700", marginBottom: "6px" }}>No messages found</div>
                                    <div style={{ fontSize: "12px" }}>Internal messaging between staff appears here.</div>
                                </div>
                            ) : filtered.map((msg, i) => {
                                const isSelected = selected?.id === msg.id || selected === i;
                                const name = msg.sender || msg.sender_name || "System";
                                const preview = msg.subject || (msg.content || "").substring(0, 60) || "—";
                                const time = msg.created_at ? new Date(msg.created_at).toLocaleDateString() : msg.time || "";
                                const unread = msg.unread || !msg.read;

                                return (
                                    <div
                                        key={msg.id || i}
                                        onClick={() => setSelected(msg.id !== undefined ? msg : i)}
                                        style={{
                                            padding: "16px 20px", cursor: "pointer",
                                            borderBottom: "1px solid #f8fafc",
                                            background: isSelected ? "#eff6ff" : unread ? "#fafbff" : "white",
                                            transition: "background 0.1s",
                                        }}
                                    >
                                        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                            <div style={{
                                                width: "38px", height: "38px", borderRadius: "10px",
                                                background: isSelected ? "#3b82f6" : "#f1f5f9",
                                                color: isSelected ? "white" : "#64748b",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontWeight: "800", fontSize: "12px", flexShrink: 0,
                                            }}>
                                                {initials(name)}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <div style={{ fontWeight: unread ? "800" : "600", color: "#0f172a", fontSize: "13px" }}>{name}</div>
                                                    <div style={{ fontSize: "11px", color: "#94a3b8", flexShrink: 0, marginLeft: "8px" }}>{time}</div>
                                                </div>
                                                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {preview}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Message Detail */}
                    <div style={{
                        background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        minHeight: "400px", padding: "32px",
                    }}>
                        {selected && typeof selected === "object" ? (
                            <div style={{ width: "100%" }}>
                                <div style={{ marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px solid #f1f5f9" }}>
                                    <div style={{ fontWeight: "800", fontSize: "20px", color: "#0f172a", marginBottom: "6px" }}>
                                        {selected.subject || "Message"}
                                    </div>
                                    <div style={{ color: "#64748b", fontSize: "13px" }}>
                                        From: <strong>{selected.sender || selected.sender_name || "System"}</strong>
                                        {selected.created_at && (
                                            <> · {new Date(selected.created_at).toLocaleString()}</>
                                        )}
                                    </div>
                                </div>
                                <div style={{ color: "#374151", lineHeight: "1.7", fontSize: "14px" }}>
                                    {selected.content || selected.body || "No content available."}
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: "center", color: "#94a3b8" }}>
                                <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
                                <div style={{ fontWeight: "700", fontSize: "16px", color: "#64748b" }}>Select a message</div>
                                <div style={{ fontSize: "13px", marginTop: "6px" }}>Click a message from the list to read it here.</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}