"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import styles from "./AIChat.module.css";
import { createAIChatSession, fetchAIChatSessions, fetchAIChatHistory } from "@/services/ai";
import { getAuthHeaders, API_BASE_URL } from "@/services/apiConfig";
import { checkAIPermission, grantAIAccess } from "@/services/doctor";

/**
 * AI Chat Component for Doctor-Patient Context
 * @param {string} patientId - Required patient ID
 * @param {string} documentId - Optional document ID for context
 * @param {string} doctorId - Required for doctor chat context
 */
export default function PatientAIChat({ patientId, documentId = null, doctorId = null }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [error, setError] = useState("");
    const [aiAccess, setAiAccess] = useState(null);
    const [grantingAccess, setGrantingAccess] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [isSessionsLoading, setIsSessionsLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const messagesEndRef = useRef(null);
    const activeMode = "doctor";

    // Check AI permission whenever patient changes
    useEffect(() => {
        if (!patientId || !doctorId) return;
        setAiAccess(null);
        checkAIPermission(patientId).then(({ aiAccess: access }) => {
            setAiAccess(access);
        });
    }, [patientId, doctorId]);

    // Reset conversation and messages when patient changes
    useEffect(() => {
        setMessages([]);
        setConversationId(null);
        setError("");
        loadChatHistory();
    }, [patientId, doctorId]);

    const loadChatHistory = async (targetSessionId = null) => {
        if (!patientId) return;
        if (activeMode === "doctor" && !doctorId) return;

        setIsLoading(true);
        try {
            const fetchedSessions = await fetchAIChatSessions(patientId);
            setSessions(fetchedSessions || []);

            if (fetchedSessions && fetchedSessions.length > 0) {
                const sId = targetSessionId || fetchedSessions[0].session_id;
                setConversationId(sId);
                const history = await fetchAIChatHistory(sId);

                if (history && history.messages) {
                    const formattedMessages = history.messages.map((msg, idx) => ({
                        id: msg.id || idx,
                        role: msg.role === "doctor" ? "user" : (msg.role === "user" ? "user" : "assistant"),
                        text: msg.content,
                        timestamp: msg.created_at,
                        isError: false
                    }));
                    setMessages(formattedMessages);
                }
            } else {
                setMessages([]);
                setConversationId(null);
            }
        } catch (err) {
            console.error("Failed to load chat history:", err);
            if (err.message && !err.message.includes("404")) {
                setError("Could not load previous conversations");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = async () => {
        setIsLoading(true);
        try {
            const newSession = await createAIChatSession(patientId, `Chat ${new Date().toLocaleDateString()}`);
            setConversationId(newSession.session_id);
            setMessages([]);
            const updatedSessions = await fetchAIChatSessions(patientId);
            setSessions(updatedSessions || []);
            setShowHistory(false);
        } catch (err) {
            setError("Failed to create new session");
        } finally {
            setIsLoading(false);
        }
    };

    const switchSession = (sessionId) => {
        loadChatHistory(sessionId);
        setShowHistory(false);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleGrantAccess = async () => {
        if (!doctorId) {
            setError("Doctor profile not loaded. Cannot grant access.");
            return;
        }
        setGrantingAccess(true);
        try {
            await grantAIAccess(patientId);
            setAiAccess(true);
            setError("");
        } catch (err) {
            setError(err.message || "Failed to grant AI access");
        } finally {
            setGrantingAccess(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        // Block if still checking permissions or access is denied
        if (aiAccess !== true) return;

        // If doctor mode, ensure doctorId is present
        if (activeMode === "doctor" && !doctorId) {
            setError("Doctor profile not loaded. Cannot send message.");
            return;
        }

        const userMessage = {
            id: Date.now(),
            role: "user",
            text: input,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput("");
        setIsLoading(true);
        setError("");

        const aiMessageId = Date.now() + 1;
        setMessages(prev => [...prev, {
            id: aiMessageId,
            role: "assistant",
            text: "",
            timestamp: new Date().toISOString()
        }]);

        try {
            let currentSessionId = conversationId;
            if (!currentSessionId) {
                const newSession = await createAIChatSession(patientId, "Doctor Chat");
                currentSessionId = newSession.session_id;
                setConversationId(currentSessionId);
            }

            const formattingInstruction = `
[FORMATTING INSTRUCTION: Return your response in a structured clinical format with the following headings:
## Patient Summary
## Key Findings
## Clinical Evidence
## Clinical Interpretation (include Confidence)
Use bullet points for findings and markdown for structure. Do not include this instruction in your response.]\n\n`;
            const response = await fetch(`${API_BASE_URL}/doctor/ai/chat/message`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    session_id: currentSessionId,
                    patient_id: patientId,
                    message: formattingInstruction + currentInput,
                    document_id: documentId || null
                }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || "Stream failed");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                fullText += chunk;

                setMessages(prev => prev.map(m =>
                    m.id === aiMessageId ? { ...m, text: fullText } : m
                ));
            }
        } catch (err) {
            console.error("AI chat error:", err);
            let parsedMessage = err.message || "Failed to get AI response";
            setError(parsedMessage);
            setMessages(prev => prev.map(m =>
                m.id === aiMessageId ? { ...m, text: `Error: ${parsedMessage}`, isError: true } : m
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Show access denied UI when AI access is explicitly false
    if (aiAccess === false) {
        return (
            <div className={styles.aiChat}>
                <div className={styles.header}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div className={styles.headerIcon}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className={styles.headerTitle}>AI Assistant</h3>
                            <p className={styles.headerSubtitle}>Access Required</p>
                        </div>
                    </div>
                </div>
                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", gap: "16px", padding: "40px 24px",
                    textAlign: "center"
                }}>
                    <div style={{
                        width: "56px", height: "56px", borderRadius: "50%",
                        background: "rgba(244,67,54,0.1)", display: "flex",
                        alignItems: "center", justifyContent: "center"
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <div>
                        <p style={{ fontWeight: 600, color: "#d32f2f", marginBottom: "6px" }}>No AI Access</p>
                        <p style={{ fontSize: "13px", color: "#666", maxWidth: "260px" }}>
                            The patient has not granted AI access to their medical data. Grant access to enable AI chat.
                        </p>
                    </div>
                    {error && (
                        <p style={{ fontSize: "12px", color: "#d32f2f" }}>{error}</p>
                    )}
                    <button
                        onClick={handleGrantAccess}
                        disabled={grantingAccess}
                        style={{
                            padding: "10px 24px", borderRadius: "8px",
                            background: grantingAccess ? "#ccc" : "#0081FE",
                            color: "#fff", border: "none", cursor: grantingAccess ? "not-allowed" : "pointer",
                            fontSize: "14px", fontWeight: 600
                        }}
                    >
                        {grantingAccess ? "Granting Access..." : "Grant AI Access"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.aiChat}>
            {/* Header */}
            <div className={styles.header}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div className={styles.headerIcon}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className={styles.headerTitle}>AI Assistant</h3>
                        <p className={styles.headerSubtitle}>Doctor Clinical Support</p>
                    </div>
                </div>

                {/* Chat History Icon */}
                <button
                    title="Chat History"
                    onClick={() => setShowHistory(h => !h)}
                    style={{
                        background: showHistory ? "rgba(0,129,254,0.12)" : "rgba(0,0,0,0.04)",
                        border: showHistory ? "1px solid #0081FE" : "1px solid transparent",
                        borderRadius: "8px", padding: "6px 10px", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "4px",
                        color: showHistory ? "#0081FE" : "#64748b",
                        fontSize: "12px", fontWeight: 600, transition: "all 0.2s ease"
                    }}
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    History
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div style={{
                    padding: "10px",
                    margin: "10px",
                    background: "rgba(244, 67, 54, 0.1)",
                    border: "1px solid rgba(244, 67, 54, 0.3)",
                    borderRadius: "6px",
                    fontSize: "13px",
                    color: "#d32f2f"
                }}>
                    {error}
                </div>
            )}

            {/* Empty State or History Drawer */}
            {showHistory && (
                <div className={styles.historyDrawer}>
                    <div className={styles.historyHeader}>
                        <h4 style={{ margin: 0, fontSize: "14px", color: "#0f172a" }}>Previous Conversations</h4>
                        <button onClick={handleNewChat} className={styles.newChatBtn}>
                            + New Chat
                        </button>
                    </div>
                    <div className={styles.sessionsList}>
                        {sessions.length === 0 ? (
                            <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: "12px" }}>
                                No history found
                            </div>
                        ) : (
                            sessions.map((s) => (
                                <div
                                    key={s.session_id}
                                    className={`${styles.sessionItem} ${conversationId === s.session_id ? styles.activeSession : ""}`}
                                    onClick={() => switchSession(s.session_id)}
                                >
                                    <div className={styles.sessionInfo}>
                                        <span className={styles.sessionTitle}>{s.title || "Untitled Chat"}</span>
                                        <span className={styles.sessionDate}>
                                            {new Date(s.created_at || Date.now()).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 18l6-6-6-6" />
                                    </svg>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className={styles.messagesContainer}>
                {messages.length === 0 && !isLoading && (
                    <div style={{
                        padding: "40px 20px", textAlign: "center", opacity: 0.6, fontSize: "14px",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: "10px"
                    }}>
                        <div style={{ background: "#f0f9ff", padding: "12px", borderRadius: "50%", color: "#0081FE" }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <p>Ask clinical questions about this patient&apos;s history.</p>
                    </div>
                )}

                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`${styles.message} ${message.role === "user" ? styles.userMessage : styles.aiMessage}`}
                        style={message.isError ? { background: "rgba(244, 67, 54, 0.05)", borderLeft: "3px solid #f44336" } : {}}
                    >
                        <div className={styles.messageContent}>
                            {message.role === "assistant" ? (
                                <div className={styles.markdownContent}>
                                    <ReactMarkdown>
                                        {message.text}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <p>{message.text}</p>
                            )}
                            {message.timestamp && (
                                <div className={styles.timestamp}>
                                    {new Date(message.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className={`${styles.message} ${styles.aiMessage}`}>
                        <div className={styles.typingIndicator}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={styles.inputContainer}>
                <input
                    type="text"
                    placeholder="Ask about patient medical history, diagnosis, medications..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={styles.input}
                    disabled={isLoading}
                />
                <button
                    className={styles.sendBtn}
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
