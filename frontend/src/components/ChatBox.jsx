import React, { useState, useEffect, useRef } from 'react';

const ChatBox = () => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: 'Hello! I am your AI Tutor. Ask me anything about the lecture.' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newUserMsg = { id: Date.now(), sender: 'user', text: inputValue };
        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');

        // Simulate AI response
        setTimeout(() => {
            const newAiMsg = { id: Date.now() + 1, sender: 'ai', text: 'Thinking... (This is a mock response)' };
            setMessages(prev => [...prev, newAiMsg]);
        }, 1000);
    };

    return (
        <div className="chat-box">
            <div className="chat-header">
                <h3>AI Tutor Chat</h3>
            </div>
            <div className="chat-messages">
                {messages.map((msg) => (
                    <div key={msg.id} className={`message ${msg.sender}`}>
                        <div className="message-bubble">
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form className="chat-input-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask a question..."
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default ChatBox;
