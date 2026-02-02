import { useState, useEffect, useRef } from 'react';
import styles from './ChatBox.module.css';

export default function ChatBox({ currentUser, isDoctor, zoomClient }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Initial mock messages
    useEffect(() => {
        setMessages([
            {
                id: 'init-1',
                sender: 'System',
                text: 'Connected to secure session.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isSystem: true
            }
        ]);
    }, []);

    // Listen for Zoom messages
    useEffect(() => {
        if (!zoomClient) return;

        const handleCommand = (payload) => {
            if (!payload || !payload.message) return;
            const { message, senderName } = payload;
            try {
                const msgData = JSON.parse(message);
                setMessages(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    sender: msgData.sender || senderName || 'User',
                    text: msgData.text,
                    time: msgData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isDoctor: !!msgData.isDoctor
                }]);
            } catch (e) {
                // Handle non-JSON messages if any
                setMessages(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    sender: senderName || 'User',
                    text: message,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isDoctor: false
                }]);
            }
        };

        zoomClient.on('command-channel-message', handleCommand);

        return () => {
            zoomClient.off?.('command-channel-message', handleCommand);
        };
    }, [zoomClient]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        const msgData = {
            sender: currentUser,
            text: newMessage,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            isDoctor: isDoctor
        };

        // Send via Zoom Command Channel if connected
        try {
            const channel = zoomClient?.getCommandChannel?.();
            if (channel) {
                channel.send(JSON.stringify(msgData));
            }
        } catch (e) {
            console.warn('Failed to send message:', e);
        }

        // Add to local state
        setMessages(prev => [...prev, {
            id: Date.now() + Math.random(),
            ...msgData
        }]);

        setNewMessage('');
    };

    return (
        <div className={styles.chatContainer}>
            <div className={styles.chatHeader}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>Session Chat</span>
            </div>

            <div className={styles.messagesArea}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`${styles.message} ${msg.isSystem ? styles.systemMessage : (msg.sender === currentUser ? styles.myMessage : styles.theirMessage)}`}
                    >
                        {!msg.isSystem && (
                            <div className={styles.messageHeader}>
                                <span className={styles.sender}>{msg.sender}</span>
                                <span className={styles.time}>{msg.time}</span>
                            </div>
                        )}
                        <div className={msg.isSystem ? styles.systemText : styles.messageText}>{msg.text}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form className={styles.inputArea} onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className={styles.input}
                    disabled={!zoomClient}
                />
                <button type="submit" className={styles.sendButton} disabled={!zoomClient || newMessage.trim() === ''}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </button>
            </form>
        </div>
    );
}
