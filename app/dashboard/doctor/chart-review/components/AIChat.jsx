"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./AIChat.module.css";
import {
    createAIChatSession,
    fetchAIChatSessions,
    fetchAIChatHistory,
} from "@/services/ai";
import { checkAIPermission, requestAIAccess } from "@/services/doctor";
import { getAuthHeaders, API_BASE_URL } from "@/services/apiConfig";

export default function AIChat({ onCitationClick, patientId, doctorId, documentId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const messagesEndRef = useRef(null);
    const [aiAccess, setAiAccess] = useState(null); // null=checking, true=ok, false=denied
    const [grantingAccess, setGrantingAccess] = useState(false);
    const [accessError, setAccessError] = useState("");
    const [requestSent, setRequestSent] = useState(false);

    const sampleQuestions = [
        "What are the key findings?",
        "Are there any abnormal values?",
        "Summarize the patient's condition",
        "Extract all dates and events"
    ];

    // Check AI permission whenever patient changes
    useEffect(() => {
        if (!patientId || !doctorId) return;
        setAiAccess(null);
        checkAIPermission(patientId).then(({ aiAccess: access }) => {
            setAiAccess(access);
        });
    }, [patientId, doctorId]);

    // Manage AI Session
    useEffect(() => {
        if (!patientId || aiAccess !== true) return;
        initializeSession();
    }, [patientId, aiAccess]);

    const initializeSession = async () => {
        try {
            const sessions = await fetchAIChatSessions(patientId);
            if (sessions && sessions.length > 0) {
                // Use the most recent session
                setSessionId(sessions[0].session_id);
                loadHistory(sessions[0].session_id);
            } else {
                // Create a new session
                const newSession = await createAIChatSession(patientId, "Chart Review Session");
                setSessionId(newSession.session_id);
                setMessages([{
                    id: 'init',
                    role: "assistant",
                    content: "I've analyzed the document. What would you like to know?",
                }]);
            }
        } catch (err) {
            console.error("Failed to initialize AI session:", err);
        }
    };

    const loadHistory = async (sId) => {
        try {
            const data = await fetchAIChatHistory(sId);
            if (data && data.messages) {
                setMessages(data.messages);
            }
        } catch (err) {
            console.error("Failed to load history:", err);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (textInput = null) => {
        const query = textInput || input;
        if (!query.trim() || isTyping || !sessionId) return;
        if (aiAccess !== true) return;

        const userMessage = {
            id: Date.now(),
            role: "doctor",
            content: query,
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        // Add a placeholder for AI response that we will update with tokens
        const aiMessageId = Date.now() + 1;
        setMessages(prev => [...prev, {
            id: aiMessageId,
            role: "assistant",
            content: "",
            isStreaming: true
        }]);

        try {
            const response = await fetch(`${API_BASE_URL}/doctor/ai/chat/message`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    session_id: sessionId,
                    patient_id: patientId,
                    message: query,
                    document_id: documentId || null
                }),
            });

            if (!response.ok) throw new Error("Stream failed");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                fullText += chunk;

                setMessages(prev => prev.map(m =>
                    m.id === aiMessageId ? { ...m, content: fullText } : m
                ));
            }

            // Final update to mark as finished
            setMessages(prev => prev.map(m =>
                m.id === aiMessageId ? { ...m, isStreaming: false } : m
            ));

        } catch (err) {
            console.error("AI stream error:", err);
            setMessages(prev => prev.map(m =>
                m.id === aiMessageId ? { ...m, content: "Error: Failed to get response from AI.", isStreaming: false } : m
            ));
        } finally {
            setIsTyping(false);
        }
    };

    const handleGrantAccess = async () => {
        setGrantingAccess(true);
        setAccessError("");
        try {
            await requestAIAccess(patientId);
            setRequestSent(true);
        } catch (err) {
            if (err.message?.includes('409')) {
                setRequestSent(true);
            } else {
                setAccessError(err.message || "Failed to send access request");
            }
        } finally {
            setGrantingAccess(false);
        }
    };

    if (aiAccess === false) {
        return (
            <div className={styles.aiChat}>
                <div className={styles.header}>
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
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "40px 20px", textAlign: "center" }}>
                    {requestSent ? (
                        <>
                            <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M20 6L9 17L4 12" /></svg>
                            </div>
                            <div>
                                <p style={{ fontWeight: 600, color: "#16a34a", marginBottom: "6px", fontSize: "15px" }}>Request Sent!</p>
                                <p style={{ fontSize: "13px", color: "#666", maxWidth: "260px" }}>An access request has been sent to the patient. AI chat available once approved.</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(244,67,54,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            </div>
                            <div>
                                <p style={{ fontWeight: 600, color: "#d32f2f", marginBottom: "6px", fontSize: "15px" }}>No AI Access</p>
                                <p style={{ fontSize: "13px", color: "#666", maxWidth: "260px" }}>You don&apos;t have AI access for this patient.</p>
                            </div>
                            <button onClick={handleGrantAccess} disabled={grantingAccess} style={{ padding: "10px 24px", borderRadius: "8px", background: grantingAccess ? "#ccc" : "#0081FE", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
                                {grantingAccess ? "Sending..." : "Request Access"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.aiChat}>
            <div className={styles.header}>
                <div className={styles.headerIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                </div>
                <div>
                    <h3 className={styles.headerTitle}>AI Assistant</h3>
                    <p className={styles.headerSubtitle}>Powered by Claude 3.5 Sonnet</p>
                </div>
            </div>

            <div className={styles.messagesContainer}>
                {messages.map((m, idx) => (
                    <div key={m.id || `msg-${idx}`} className={`${styles.message} ${m.role === "doctor" ? styles.userMessage : styles.aiMessage}`}>
                        <div className={styles.messageContent}>
                            <p style={{ whiteSpace: "pre-wrap" }}>{m.content}</p>
                        </div>
                    </div>
                ))}
                {isTyping && messages[messages.length - 1]?.isStreaming !== true && (
                    <div className={`${styles.message} ${styles.aiMessage}`}>
                        <div className={styles.typingIndicator}><span></span><span></span><span></span></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={styles.inputContainer}>
                <input
                    type="text"
                    placeholder="Ask a question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    className={styles.input}
                    disabled={isTyping}
                />
                <button
                    className={styles.sendBtn}
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isTyping}
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
