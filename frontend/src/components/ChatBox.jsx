import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatBox = ({ classroomId }) => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: 'Hello! I am your AI Tutor. Ask me anything about the lecture.' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userQ = inputValue;
        const newUserMsg = { id: Date.now(), sender: 'user', text: userQ };
        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');
        setIsLoading(true);

        const tempAiMsgId = Date.now() + 1;
        setMessages(prev => [...prev, { id: tempAiMsgId, sender: 'ai', text: 'Thinking...' }]);

        try {
            const response = await axios.post('http://localhost:5000/api/ai/ask', {
                question: userQ,
                classroomId: classroomId
            });

            setMessages(prev => 
                prev.map(msg => 
                    msg.id === tempAiMsgId ? { ...msg, text: response.data.answer } : msg
                )
            );
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => 
                prev.map(msg => 
                    msg.id === tempAiMsgId ? { ...msg, text: "Sorry, I encountered an error connecting to the AI." } : msg
                )
            );
        } finally {
            setIsLoading(false);
        }
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
                        disabled={isLoading}
                    />
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? 'Wait...' : 'Send'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatBox;
