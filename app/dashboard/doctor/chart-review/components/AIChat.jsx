"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./AIChat.module.css";
import { doctorAIChat, fetchDoctorChatHistory } from "@/services/ai";
import { checkAIPermission, requestAIAccess } from "@/services/doctor";

export default function AIChat({ onCitationClick, patientId, doctorId, documentId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [conversationId, setConversationId] = useState(null);
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

    useEffect(() => {
        loadChatHistory();
    }, [patientId, doctorId]);

    const loadChatHistory = async () => {
        if (!patientId || !doctorId) return;

        setIsTyping(true);
        try {
            const history = await fetchDoctorChatHistory(patientId, doctorId);
            if (history && Array.isArray(history) && history.length > 0) {
                const formattedMessages = history.map((msg, idx) => ({
                    id: idx,
                    role: msg.role || (msg.sender === "ai" ? "assistant" : "user"),
                    text: msg.message || msg.text || msg.query,
                    citations: [] // Backend text response doesn't have citations yet
                }));
                setMessages(formattedMessages);

                if (history[0].conversation_id) {
                    setConversationId(history[0].conversation_id);
                }
            } else {
                // Default greeting if no history
                setMessages([{
                    id: 'init',
                    role: "assistant",
                    text: "I've analyzed the document. What would you like to know?",
                    citations: []
                }]);
            }
        } catch (err) {
            console.error("Failed to load chat history:", err);
            // Fallback to greeting
            setMessages([{
                id: 'init',
                role: "assistant",
                text: "I've analyzed the document. What would you like to know?",
                citations: []
            }]);
        } finally {
            setIsTyping(false);
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
        if (!query.trim() || isTyping) return;
        // Block if still checking permissions or if access is denied
        if (aiAccess !== true) return;

        const userMessage = {
            id: Date.now(),
            role: "user",
            text: query,
            citations: []
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        try {
            const payload = {
                patient_id: patientId,
                query: query, // Backend expects 'query'
                document_id: documentId || null // Backend expects singular 'document_id'
            };

            if (conversationId) {
                payload.conversation_id = conversationId;
            }

            const result = await doctorAIChat(payload);

            // Result is { response: "text" } from our updated service
            const aiText = result.response || result.message || "No response received.";

            if (result.conversation_id) {
                setConversationId(result.conversation_id);
            }

            const aiResponse = {
                id: Date.now() + 1,
                role: "assistant",
                text: aiText,
                citations: [] // Backend text response doesn't support citations yet
            };

            setMessages(prev => [...prev, aiResponse]);
        } catch (err) {
            console.error("AI chat error:", err);
            // If backend returns 403 (no AI access), reset the UI to the access-request screen.
            // This handles the case where /permissions/check and /doctor/ai/chat/doctor disagree.
            const isAccessDenied = err.message?.includes('403') ||
                err.message?.toLowerCase().includes('no ai access') ||
                err.message?.toLowerCase().includes('permission denied') ||
                err.message?.toLowerCase().includes('no access');

            if (isAccessDenied) {
                // Remove the user's message we just added and show the access request UI
                setMessages(prev => prev.filter(m => m.id !== userMessage.id));
                setAiAccess(false);
                setRequestSent(false);
            } else {
                const errorMsg = {
                    id: Date.now() + 1,
                    role: "assistant",
                    text: `Error: ${err.message || "Something went wrong"}`,
                    citations: []
                };
                setMessages(prev => [...prev, errorMsg]);
            }
        } finally {
            setIsTyping(false);
        }
    };

    const handleGrantAccess = async () => {
        if (!doctorId) {
            setAccessError("Doctor profile not loaded.");
            return;
        }
        setGrantingAccess(true);
        setAccessError("");
        try {
            await requestAIAccess(patientId);
            // Access request sent — patient must approve.
            // We don't set aiAccess=true here since it's still pending.
            setRequestSent(true);
        } catch (err) {
            // 409 = request already exists, treat as success
            if (err.message?.includes('409') || err.message?.toLowerCase().includes('already')) {
                setRequestSent(true);
            } else {
                setAccessError(err.message || "Failed to send access request");
            }
        } finally {
            setGrantingAccess(false);
        }
    };

    const handleQuestionClick = (question) => {
        handleSend(question);
    };

    // Show access denied UI
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
                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", gap: "16px", padding: "40px 20px",
                    textAlign: "center"
                }}>
                    {requestSent ? (
                        <>
                            <div style={{
                                width: "52px", height: "52px", borderRadius: "50%",
                                background: "rgba(34,197,94,0.1)", display: "flex",
                                alignItems: "center", justifyContent: "center"
                            }}>
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                                    <path d="M20 6L9 17L4 12" />
                                </svg>
                            </div>
                            <div>
                                <p style={{ fontWeight: 600, color: "#16a34a", marginBottom: "6px", fontSize: "15px" }}>Request Sent!</p>
                                <p style={{ fontSize: "13px", color: "#666", maxWidth: "260px" }}>
                                    An access request has been sent to the patient. AI chat will be available once they approve it.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{
                                width: "52px", height: "52px", borderRadius: "50%",
                                background: "rgba(244,67,54,0.1)", display: "flex",
                                alignItems: "center", justifyContent: "center"
                            }}>
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            </div>
                            <div>
                                <p style={{ fontWeight: 600, color: "#d32f2f", marginBottom: "6px", fontSize: "15px" }}>No AI Access</p>
                                <p style={{ fontSize: "13px", color: "#666", maxWidth: "260px" }}>
                                    You don&apos;t have AI access for this patient&apos;s data. Click below to send an access request — the patient will need to approve it.
                                </p>
                            </div>
                            {accessError && <p style={{ fontSize: "12px", color: "#d32f2f" }}>{accessError}</p>}
                            <button
                                onClick={handleGrantAccess}
                                disabled={grantingAccess}
                                style={{
                                    padding: "10px 24px", borderRadius: "8px",
                                    background: grantingAccess ? "#ccc" : "#0081FE",
                                    color: "#fff", border: "none",
                                    cursor: grantingAccess ? "not-allowed" : "pointer",
                                    fontSize: "14px", fontWeight: 600
                                }}
                            >
                                {grantingAccess ? "Sending Request..." : "Request AI Access"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.aiChat}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        <path d="M8 10h.01M12 10h.01M16 10h.01" />
                    </svg>
                </div>
                <div>
                    <h3 className={styles.headerTitle}>AI Assistant</h3>
                    <p className={styles.headerSubtitle}>Ask questions about this document</p>
                </div>
            </div>

            {/* Messages */}
            <div className={styles.messagesContainer}>
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`${styles.message} ${message.role === "user" ? styles.userMessage : styles.aiMessage}`}
                    >
                        <div className={styles.messageContent}>
                            <p>{message.text}</p>
                            {message.citations && message.citations.length > 0 && (
                                <div className={styles.citations}>
                                    {message.citations.map((citation, idx) => (
                                        <button
                                            key={idx}
                                            className={styles.citationBtn}
                                            onClick={() => onCitationClick && onCitationClick(citation.page)}
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                            </svg>
                                            Page {citation.page}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isTyping && (
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

            {/* Sample Questions */}
            {messages.length <= 1 && (
                <div className={styles.sampleQuestions}>
                    <p className={styles.sampleLabel}>Try asking:</p>
                    <div className={styles.questionGrid}>
                        {sampleQuestions.map((question, idx) => (
                            <button
                                key={idx}
                                className={styles.questionBtn}
                                onClick={() => handleQuestionClick(question)}
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className={styles.inputContainer}>
                <input
                    type="text"
                    placeholder="Ask a question about this document..."
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
