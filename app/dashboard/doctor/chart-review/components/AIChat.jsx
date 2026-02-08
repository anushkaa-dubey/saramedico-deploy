"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./AIChat.module.css";
import { doctorAIChat, fetchDoctorChatHistory } from "@/services/ai";

export default function AIChat({ onCitationClick, patientId, doctorId, documentId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);

    const sampleQuestions = [
        "What are the key findings?",
        "Are there any abnormal values?",
        "Summarize the patient's condition",
        "Extract all dates and events"
    ];

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
                query: query
            };

            if (documentId) {
                payload.document_id = documentId;
            }

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
            const errorMsg = {
                id: Date.now() + 1,
                role: "assistant",
                text: `Error: ${err.message || "Something went wrong"}`,
                citations: []
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleQuestionClick = (question) => {
        handleSend(question);
    };

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
