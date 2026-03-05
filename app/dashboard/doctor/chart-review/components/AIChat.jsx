"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import styles from "./AIChat.module.css";
import {
    createAIChatSession,
    fetchAIChatSessions,
    fetchAIChatHistory,
} from "@/services/ai";
import { checkAIPermission, requestAIAccess } from "@/services/doctor";
import { getAuthHeaders, API_BASE_URL } from "@/services/apiConfig";
import { MessageSquare, History, ChevronRight, Check, AlertCircle, Send, Plus } from "lucide-react";

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
    const [sessions, setSessions] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

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

    const initializeSession = async (targetSessionId = null) => {
        try {
            const fetchedSessions = await fetchAIChatSessions(patientId);
            setSessions(fetchedSessions || []);

            if (fetchedSessions && fetchedSessions.length > 0) {
                const sId = targetSessionId || fetchedSessions[0].session_id;
                setSessionId(sId);
                loadHistory(sId);
            } else {
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

    const handleNewChat = async () => {
        try {
            const newSession = await createAIChatSession(patientId, `Review ${new Date().toLocaleDateString()}`);
            setSessionId(newSession.session_id);
            setMessages([]);
            const updatedSessions = await fetchAIChatSessions(patientId);
            setSessions(updatedSessions || []);
            setShowHistory(false);
        } catch (err) {
            console.error("Failed to create new session");
        }
    };

    const switchSession = (sId) => {
        setSessionId(sId);
        loadHistory(sId);
        setShowHistory(false);
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
            const formattingInstruction = `
[FORMATTING INSTRUCTION: Return your response in a structured clinical format with the following headings:
## Summary
## Observations
## Notable Trends
## Interpretation
Use bullet points and markdown for structure. Do not include this instruction in your response.]\n\n`;

            const response = await fetch(`${API_BASE_URL}/doctor/ai/chat/message`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    session_id: sessionId,
                    patient_id: patientId,
                    message: formattingInstruction + query,
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
                        <MessageSquare size={20} />
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
                                <Check size={26} color="#16a34a" />
                            </div>
                            <div>
                                <p style={{ fontWeight: 600, color: "#16a34a", marginBottom: "6px", fontSize: "15px" }}>Request Sent!</p>
                                <p style={{ fontSize: "13px", color: "#666", maxWidth: "260px" }}>An access request has been sent to the patient. AI chat available once approved.</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(244,67,54,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <AlertCircle size={26} color="#d32f2f" />
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
                    <MessageSquare size={20} />
                </div>
                <div>
                    <h3 className={styles.headerTitle}>AI Assistant</h3>
                    <p className={styles.headerSubtitle}>Powered by Claude 3.5 Sonnet</p>
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
                        fontSize: "12px", fontWeight: 600, transition: "all 0.2s ease",
                        marginLeft: "auto"
                    }}
                >
                    <History size={15} />
                    History
                </button>
            </div>

            {/* Empty State or History Drawer */}
            {showHistory && (
                <div className={styles.historyDrawer}>
                    <div className={styles.historyHeader}>
                        <h4 style={{ margin: 0, fontSize: "14px", color: "#0f172a" }}>Previous Reviews</h4>
                        <button onClick={handleNewChat} className={styles.newChatBtn}>
                            <Plus size={14} style={{ marginRight: '4px' }} /> New Session
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
                                    className={`${styles.sessionItem} ${sessionId === s.session_id ? styles.activeSession : ""}`}
                                    onClick={() => switchSession(s.session_id)}
                                >
                                    <div className={styles.sessionInfo}>
                                        <span className={styles.sessionTitle}>{s.title || "Untitled Session"}</span>
                                        <span className={styles.sessionDate}>
                                            {new Date(s.created_at || Date.now()).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <ChevronRight size={14} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <div className={styles.messagesContainer}>
                {messages.map((m, idx) => (
                    <div key={m.id || `msg-${idx}`} className={`${styles.message} ${m.role === "doctor" ? styles.userMessage : styles.aiMessage}`}>
                        <div className={styles.messageContent}>
                            {m.role === "assistant" ? (
                                <div className={styles.markdownContent}>
                                    <ReactMarkdown>{m.content}</ReactMarkdown>
                                </div>
                            ) : (
                                <p style={{ whiteSpace: "pre-wrap" }}>{m.content}</p>
                            )}
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
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}
