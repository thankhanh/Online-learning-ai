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
        <div className="card h-100 shadow-sm">
            <div className="card-header bg-primary text-white">
                <h5 className="mb-0">AI Tutor Chat</h5>
            </div>
            <div className="card-body overflow-auto" style={{ height: '400px' }}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`d-flex mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                        <div className={`p-3 rounded-3 ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-light text-dark'}`} style={{ maxWidth: '75%' }}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="card-footer">
                <form className="d-flex gap-2" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        className="form-control"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask a question..."
                    />
                    <button type="submit" className="btn btn-primary">Send</button>
                </form>
            </div>
        </div>
    );
};

export default ChatBox;
