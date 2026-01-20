"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./AIChat.module.css";

export default function AIChat({ onCitationClick }) {
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: "assistant",
            text: "I've analyzed the document. What would you like to know?",
            citations: []
        }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const sampleQuestions = [
        "What are the key findings?",
        "Are there any abnormal values?",
        "Summarize the patient's condition",
        "Extract all dates and events"
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage = {
            id: messages.length + 1,
            role: "user",
            text: input,
            citations: []
        };

        setMessages([...messages, userMessage]);
        setInput("");
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const aiResponse = {
                id: messages.length + 2,
                role: "assistant",
                text: "Based on the lab results, the patient's platelet count is slightly low at 180 K/μL (normal range: 150-400). All other CBC values are within normal limits. The WBC count of 7.2 K/μL indicates no signs of infection.",
                citations: [
                    { page: 1, text: "Platelets: 180 K/μL" },
                    { page: 1, text: "WBC: 7.2 K/μL" }
                ]
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    const handleQuestionClick = (question) => {
        setInput(question);
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
            {messages.length === 1 && (
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
                />
                <button
                    className={styles.sendBtn}
                    onClick={handleSend}
                    disabled={!input.trim()}
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
