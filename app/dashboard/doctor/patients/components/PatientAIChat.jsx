"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./AIChat.module.css";
import { doctorAIChat, patientAIChat, fetchPatientChatHistory, fetchDoctorChatHistory } from "@/services/ai";
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
    const [activeMode, setActiveMode] = useState("doctor"); // "doctor" | "patient"
    const [aiAccess, setAiAccess] = useState(null); // null=checking, true=ok, false=denied
    const [grantingAccess, setGrantingAccess] = useState(false);
    const messagesEndRef = useRef(null);

    // Check AI permission whenever patient changes
    useEffect(() => {
        if (!patientId || !doctorId) return;
        setAiAccess(null);
        checkAIPermission(patientId).then(({ aiAccess: access }) => {
            setAiAccess(access);
        });
    }, [patientId, doctorId]);

    // Reset conversation and messages when mode or patient changes
    useEffect(() => {
        setMessages([]);
        setConversationId(null);
        setError("");
        loadChatHistory();
    }, [patientId, activeMode, doctorId]);

    const loadChatHistory = async () => {
        if (!patientId) return;
        // If doctor mode, we need doctorId
        if (activeMode === "doctor" && !doctorId) return;

        setIsLoading(true);
        try {
            let history;
            if (activeMode === "doctor") {
                history = await fetchDoctorChatHistory(patientId, doctorId);
            } else {
                history = await fetchPatientChatHistory(patientId);
            }

            if (history && Array.isArray(history)) {
                // Determine user role label based on mode
                const userRole = activeMode === "doctor" ? "user" : "patient_user";

                const formattedMessages = history.map((msg, idx) => ({
                    id: idx,
                    role: msg.role || (msg.sender === "ai" ? "assistant" : "user"),
                    text: msg.message || msg.text || msg.query,
                    timestamp: msg.timestamp || msg.created_at,
                    isError: false
                }));
                setMessages(formattedMessages);

                if (history.length > 0 && history[0].conversation_id) {
                    setConversationId(history[0].conversation_id);
                }
            }
        } catch (err) {
            console.error("Failed to load chat history:", err);
            // Don't show error for empty history (404 might mean no history)
            if (err.message && !err.message.includes("404")) {
                setError("Could not load previous conversations");
            }
        } finally {
            setIsLoading(false);
        }
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
            id: Date.now(), // Use timestamp for unique ID locally
            role: "user",
            text: input,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput("");
        setIsLoading(true);
        setError("");

        try {
            const payload = {
                patient_id: patientId,
                query: currentInput, // Backend expects 'query'
                document_id: documentId || null
            };

            if (conversationId) {
                payload.conversation_id = conversationId;
            }

            let response;
            if (activeMode === "doctor") {
                response = await doctorAIChat(payload);
            } else {
                response = await patientAIChat(payload);
            }

            // Update conversation ID if returned
            if (response.conversation_id) {
                setConversationId(response.conversation_id);
            }

            const aiMessage = {
                id: Date.now() + 1,
                role: "assistant",
                text: response.response || response.message || response.answer,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            console.error("AI chat error:", err);

            let parsedMessage = err.message || "Failed to get AI response";
            try {
                // Try to parse the backend JSON error format e.g. {"detail":"..."}
                const errObj = JSON.parse(err.message);
                if (errObj.detail) {
                    parsedMessage = errObj.detail;
                }
            } catch (e) {
                // Not JSON, use as is
            }

            setError(parsedMessage);

            // Add error message to chat
            const errorMessage = {
                id: Date.now() + 2,
                role: "assistant",
                text: `Error: ${parsedMessage}`,
                timestamp: new Date().toISOString(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
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
                        <p className={styles.headerSubtitle}>
                            {activeMode === "doctor" ? "Doctor Clinical Support" : "Patient Q&A Context"}
                        </p>
                    </div>
                </div>

                {/* Mode Toggle */}
                <div className={styles.toggleContainer}>
                    <button
                        className={`${styles.modeBtn} ${activeMode === "doctor" ? styles.activeMode : ""}`}
                        onClick={() => setActiveMode("doctor")}
                    >
                        Doctor
                    </button>
                    <button
                        className={`${styles.modeBtn} ${activeMode === "patient" ? styles.activeMode : ""}`}
                        onClick={() => setActiveMode("patient")}
                    >
                        Patient
                    </button>
                </div>
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

            {/* Messages */}
            <div className={styles.messagesContainer}>
                {messages.length === 0 && !isLoading && (
                    <div style={{
                        padding: "40px 20px",
                        textAlign: "center",
                        opacity: 0.6,
                        fontSize: "14px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "10px"
                    }}>
                        <div style={{ background: "#f0f9ff", padding: "12px", borderRadius: "50%", color: "#0081FE" }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <p>
                            {activeMode === "doctor"
                                ? "Ask clinical questions about this patient's history."
                                : "View or simulate inquiries from the patient's perspective."}
                        </p>
                    </div>
                )}

                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`${styles.message} ${message.role === "user" ? styles.userMessage : styles.aiMessage}`}
                        style={message.isError ? { background: "rgba(244, 67, 54, 0.05)", borderLeft: "3px solid #f44336" } : {}}
                    >
                        <div className={styles.messageContent}>
                            <p>{message.text}</p>
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
                    placeholder={activeMode === "doctor" ? "Ask about patient details..." : "Simulate patient question..."}
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
