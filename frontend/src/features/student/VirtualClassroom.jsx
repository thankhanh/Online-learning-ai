import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Tab, Tabs, Badge } from 'react-bootstrap';

export default function VirtualClassroom() {
    const [activeTab, setActiveTab] = useState('chat');
    const [chatMode, setChatMode] = useState('class'); // 'class' or 'ai'
    const [messages, setMessages] = useState([
        { id: 1, sender: 'Teacher', text: 'Chào cả lớp, hôm nay chúng ta học về Neural Networks.', type: 'class' },
        { id: 2, sender: 'Student A', text: 'Thầy ơi, slide này có trên hệ thống chưa ạ?', type: 'class' },
    ]);
    const [aiMessages, setAiMessages] = useState([
        { id: 1, sender: 'AI Tutor', text: 'Chào bạn! Tôi có thể giúp gì cho bạn về bài học hôm nay?', isAi: true }
    ]);
    const [inputValue, setInputValue] = useState('');

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        if (chatMode === 'class') {
            setMessages([...messages, { id: Date.now(), sender: 'Me', text: inputValue, type: 'class' }]);
        } else {
            const newMsg = { id: Date.now(), sender: 'Me', text: inputValue, isAi: false };
            setAiMessages([...aiMessages, newMsg]);

            // Mock AI Response
            setTimeout(() => {
                setAiMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    sender: 'AI Tutor',
                    text: `Trả lời cho "${inputValue}": Mạng nơ-ron nhân tạo (ANN) là mô hình toán học mô tỏng hoạt động của não bộ...`,
                    source: 'Chuong_2_Machine_Learning_Co_ban.pdf (Trang 12)',
                    isAi: true
                }]);
            }, 1000);
        }
        setInputValue('');
    };

    return (
        <div className="virtual-classroom bg-black vh-100 text-white d-flex flex-column">
            {/* Header */}
            <div className="classroom-header p-2 bg-dark border-bottom border-secondary d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                    <Button variant="outline-light" size="sm" className="me-3"><i className="bi bi-arrow-left"></i> Thoát</Button>
                    <h5 className="m-0">Lớp AI Cơ bản - CS101 (Đang diễn ra)</h5>
                </div>
                <div>
                    <Badge bg="danger" className="me-2 animate-pulse">🔴 LIVE</Badge>
                    <span>01:30:45</span>
                </div>
            </div>

            <div className="flex-grow-1 d-flex overflow-hidden">
                {/* Main Content: Video & Whiteboard */}
                <div className="flex-grow-1 p-3 d-flex flex-column" style={{ maxWidth: '75%' }}>
                    {/* Main Video Stream / Whiteboard */}
                    <div className="flex-grow-1 bg-secondary rounded position-relative mb-3 d-flex align-items-center justify-content-center">
                        {/* Placeholder for Video/Whiteboard */}
                        <div className="text-center">
                            <i className="bi bi-person-video3 display-1"></i>
                            <h3>Màn hình Giảng viên / Bảng trắng</h3>
                        </div>

                        {/* Controls Overlay */}
                        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 p-2 bg-dark rounded-pill bg-opacity-75 d-flex gap-3">
                            <Button variant="danger" className="rounded-circle"><i className="bi bi-mic-mute"></i></Button>
                            <Button variant="secondary" className="rounded-circle"><i className="bi bi-camera-video-off"></i></Button>
                            <Button variant="primary" className="rounded-circle"><i className="bi bi-hand-index-thumb"></i></Button>
                            <Button variant="info" className="rounded-circle"><i className="bi bi-easel"></i></Button>
                        </div>
                    </div>

                    {/* Peer Videos Grid */}
                    <div className="d-flex gap-2 overflow-auto" style={{ height: '120px' }}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="bg-dark border border-secondary rounded" style={{ minWidth: '160px', position: 'relative' }}>
                                <div className="position-absolute bottom-0 start-0 p-1 small bg-black bg-opacity-50 w-100">Student {i}</div>
                                <div className="d-flex w-100 h-100 align-items-center justify-content-center bg-secondary text-muted">
                                    <i className="bi bi-person-fill"></i>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Sidebar: Chat & Tools */}
                <div className="d-flex flex-column border-start border-secondary bg-dark" style={{ width: '25%', minWidth: '300px' }}>
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        className="mb-0 border-bottom border-secondary"
                        variant="pills"
                        fill
                    >
                        <Tab eventKey="chat" title="💬 Chat">
                            <div className="d-flex flex-column h-100" style={{ height: 'calc(100vh - 110px)' }}>
                                {/* Chat Mode Toggle */}
                                <div className="p-2 border-bottom border-secondary d-flex justify-content-center gap-2">
                                    <Button
                                        size="sm"
                                        variant={chatMode === 'class' ? 'primary' : 'outline-primary'}
                                        onClick={() => setChatMode('class')}
                                    >
                                        Hỏi Lớp
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={chatMode === 'ai' ? 'success' : 'outline-success'}
                                        onClick={() => setChatMode('ai')}
                                    >
                                        ✨ Hỏi AI Tutor
                                    </Button>
                                </div>

                                {/* Chat Display */}
                                <div className="flex-grow-1 overflow-auto p-3 custom-scrollbar">
                                    {chatMode === 'class' ? (
                                        messages.map(msg => (
                                            <div key={msg.id} className="mb-2">
                                                <strong>{msg.sender}: </strong>
                                                <span>{msg.text}</span>
                                            </div>
                                        ))
                                    ) : (
                                        aiMessages.map(msg => (
                                            <div key={msg.id} className={`d-flex flex-column mb-3 ${msg.sender === 'Me' ? 'align-items-end' : 'align-items-start'}`}>
                                                <div className={`p-2 rounded ${msg.sender === 'Me' ? 'bg-secondary text-white' : 'bg-success text-white bg-opacity-25 border border-success'}`} style={{ maxWidth: '90%' }}>
                                                    {msg.isAi && <strong>🤖 AI Tutor: </strong>}
                                                    {msg.text}
                                                </div>
                                                {msg.source && (
                                                    <small className="text-info mt-1" style={{ fontSize: '0.75rem' }}>
                                                        <i className="bi bi-journal-bookmark-fill"></i> Nguồn: {msg.source}
                                                    </small>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Input Area */}
                                <div className="p-2 border-top border-secondary">
                                    <InputGroup>
                                        <Form.Control
                                            placeholder={chatMode === 'class' ? "Nhập tin nhắn..." : "Hỏi AI về bài học..."}
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            className="bg-dark text-white border-secondary"
                                        />
                                        <Button variant={chatMode === 'class' ? "primary" : "success"} onClick={handleSendMessage}>
                                            <i className="bi bi-send-fill"></i>
                                        </Button>
                                    </InputGroup>
                                </div>
                            </div>
                        </Tab>
                        <Tab eventKey="people" title="👥 (45)">
                            <div className="p-3">
                                <h6>Giảng viên</h6>
                                <div className="d-flex align-items-center mb-3">
                                    <div className="bg-primary rounded-circle me-2" style={{ width: 30, height: 30 }}></div>
                                    <span>ThS. Nguyễn Văn A</span>
                                </div>
                                <h6>Sinh viên (44)</h6>
                                {/* Demo list */}
                            </div>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
