import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatBox = ({ classroomId }) => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: 'Xin chào! Tôi là Trợ lý AI. Hãy hỏi tôi bất kỳ điều gì về bài học.' }
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
        setMessages(prev => [...prev, { id: tempAiMsgId, sender: 'ai', text: 'Đang suy nghĩ...' }]);

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
                    msg.id === tempAiMsgId ? { ...msg, text: "Xin lỗi, tôi đã gặp lỗi khi kết nối với máy chủ AI." } : msg
                )
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden mb-4">
            <div className="card-header text-white border-0 px-4 py-3" style={{ background: 'linear-gradient(135deg, var(--primary-color), #4db8ff)' }}>
                <h5 className="mb-0 fw-800 d-flex align-items-center">
                    <i className="bi bi-robot fs-4 me-2"></i> Trợ lý AI Khóa học
                </h5>
            </div>
            <div className="card-body overflow-auto bg-light bg-opacity-50 p-4 custom-scrollbar" style={{ height: '400px' }}>
                <div className="text-center mb-4">
                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill fw-600">
                        Phiên hỏi đáp hỗ trợ học tập
                    </span>
                </div>
                {messages.map((msg) => (
                    <div key={msg.id} className={`d-flex mb-4 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                        <div 
                            className={`p-3 px-4 shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-white text-dark shadow-sm border border-light'}`} 
                            style={{ 
                                maxWidth: '85%', 
                                borderRadius: msg.sender === 'user' ? '1.5rem 1.5rem 0.25rem 1.5rem' : '1.5rem 1.5rem 1.5rem 0.25rem' 
                            }}
                        >
                            {msg.sender === 'ai' && <div className="fw-800 text-primary small mb-2 d-flex align-items-center"><i className="bi bi-robot me-1"></i> AI Tutor</div>}
                            <div className="fw-500" style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>{msg.text}</div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="card-footer bg-white border-top border-light p-3">
                <form className="d-flex gap-2" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        className="form-control rounded-pill px-4 bg-light border-0 shadow-sm fw-500"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Nhập câu hỏi của bạn..."
                        disabled={isLoading}
                    />
                    <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" disabled={isLoading} style={{ background: 'linear-gradient(135deg, var(--primary-color), #4db8ff)', border: 'none' }}>
                        {isLoading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <i className="bi bi-send-fill fs-5"></i>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatBox;
