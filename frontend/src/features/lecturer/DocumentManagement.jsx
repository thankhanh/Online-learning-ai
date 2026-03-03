import React, { useState } from 'react';
import { Card, Button, Form, ProgressBar, Badge, ListGroup, Row, Col, InputGroup } from 'react-bootstrap';

export default function DocumentManagement() {
    // Mock Data for Documents
    const [documents, setDocuments] = useState([
        { id: 1, name: 'Gioi_thieu_Tri_tue_Nhan_tao.pdf', size: '2.5 MB', status: 'completed', progress: 100, date: '2023-10-25' },
        { id: 2, name: 'Chuong_2_Machine_Learning_Co_ban.docx', size: '1.8 MB', status: 'vectorizing', progress: 75, date: '2023-10-26' },
        { id: 3, name: 'Bai_tap_Python_Numpy.pdf', size: '0.5 MB', status: 'processing', progress: 45, date: '2023-10-27' },
        { id: 4, name: 'De_cuong_mon_hoc.pdf', size: '1.2 MB', status: 'uploading', progress: 20, date: '2023-10-27' },
    ]);

    // Mock Data for Chat
    const [chatHistory, setChatHistory] = useState([
        { sender: 'user', message: 'Tài liệu chương 2 nói về gì?' },
        { sender: 'ai', message: 'Dựa trên tài liệu "Chuong_2_Machine_Learning_Co_ban.docx", chương 2 giới thiệu về các khái niệm cơ bản của Machine Learning bao gồm: Supervised Learning, Unsupervised Learning và Reinforcement Learning. Nó cũng đề cập đến quy trình xây dựng mô hình huấn luyện.' },
    ]);

    const [chatInput, setChatInput] = useState('');
    const [showChat, setShowChat] = useState(false);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed': return <Badge bg="success">Hoàn tất</Badge>;
            case 'vectorizing': return <Badge bg="info">Đang Vector hóa</Badge>;
            case 'processing': return <Badge bg="warning" text="dark">Đang xử lý Text</Badge>;
            case 'uploading': return <Badge bg="primary">Đang tải lên</Badge>;
            default: return <Badge bg="secondary">Unknown</Badge>;
        }
    };

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;
        const newMsg = { sender: 'user', message: chatInput };
        setChatHistory([...chatHistory, newMsg]);
        setChatInput('');

        // Mock AI Response
        setTimeout(() => {
            setChatHistory(prev => [...prev, {
                sender: 'ai',
                message: `(Mô phỏng trả lời từ AI Vector DB) Tôi đã tìm thấy thông tin liên quan đến "${newMsg.message}" trong tài liệu "Gioi_thieu_Tri_tue_Nhan_tao.pdf" trang 15.`
            }]);
        }, 1000);
    };

    return (
        <div className="container-fluid p-4">
            <h2 className="mb-4 text-white">📂 Quản lý Kho tài liệu AI (Knowledge Base)</h2>

            <Row>
                {/* Left Column: Upload & Document List */}
                <Col md={showChat ? 5 : 12} className="transition-all">
                    <Card className="mb-4 shadow-sm bg-dark text-white border-secondary">
                        <Card.Header className="d-flex justify-content-between align-items-center border-secondary">
                            <h5 className="m-0">Upload Tài liệu</h5>
                            <Button variant="primary" size="sm">
                                <i className="bi bi-cloud-upload"></i> Tải lên PDF/Docx
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group controlId="formFile" className="mb-3">
                                <Form.Label>Chọn file để training cho AI</Form.Label>
                                <Form.Control type="file" className="bg-secondary text-white border-secondary" />
                            </Form.Group>
                        </Card.Body>
                    </Card>

                    <Card className="shadow-sm bg-dark text-white border-secondary">
                        <Card.Header className="border-secondary">
                            <h5 className="m-0">Danh sách tài liệu đã học</h5>
                        </Card.Header>
                        <ListGroup variant="flush">
                            {documents.map(doc => (
                                <ListGroup.Item key={doc.id} className="bg-dark text-white border-secondary">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div>
                                            <strong>{doc.name}</strong> <span className="text-muted small">({doc.size})</span>
                                        </div>
                                        {getStatusBadge(doc.status)}
                                    </div>
                                    <ProgressBar
                                        now={doc.progress}
                                        variant={doc.status === 'completed' ? 'success' : 'info'}
                                        animated={doc.status !== 'completed'}
                                        style={{ height: '5px' }}
                                    />
                                    <div className="d-flex justify-content-between mt-2">
                                        <small className="text-muted">{doc.date}</small>
                                        <div>
                                            <Button variant="outline-info" size="sm" className="me-2" onClick={() => setShowChat(true)}>
                                                Test AI
                                            </Button>
                                            <Button variant="outline-danger" size="sm">
                                                <i className="bi bi-trash"></i>
                                            </Button>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>
                </Col>

                {/* Right Column: AI Chat Test */}
                {showChat && (
                    <Col md={7} className="fade-in">
                        <Card className="h-100 shadow-sm bg-dark text-white border-secondary">
                            <Card.Header className="d-flex justify-content-between align-items-center border-secondary bg-primary text-white">
                                <h5 className="m-0">🤖 Test AI Knowledge Base</h5>
                                <Button variant="close" onClick={() => setShowChat(false)} white></Button>
                            </Card.Header>
                            <Card.Body className="d-flex flex-column" style={{ height: '500px' }}>
                                <div className="flex-grow-1 overflow-auto mb-3 p-3 border border-secondary rounded custom-scrollbar">
                                    {chatHistory.map((chat, idx) => (
                                        <div key={idx} className={`d-flex mb-3 ${chat.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                                            <div className={`p-3 rounded-3 ${chat.sender === 'user' ? 'bg-primary text-white' : 'bg-secondary text-white'}`} style={{ maxWidth: '80%' }}>
                                                {chat.sender === 'ai' && <strong className="d-block mb-1">🤖 AI Tutor:</strong>}
                                                {chat.message}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <InputGroup>
                                    <Form.Control
                                        placeholder="Hỏi thử nội dung trong tài liệu..."
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        className="bg-dark text-white border-secondary"
                                    />
                                    <Button variant="primary" onClick={handleSendMessage}>
                                        Gửi câu hỏi
                                    </Button>
                                </InputGroup>
                            </Card.Body>
                        </Card>
                    </Col>
                )}
            </Row>
        </div>
    );
}   