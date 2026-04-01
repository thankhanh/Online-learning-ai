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
            case 'completed': return <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill fw-600"><i className="bi bi-check-circle-fill me-1"></i>Hoàn tất</Badge>;
            case 'vectorizing': return <Badge bg="info" className="bg-opacity-10 text-info border border-info border-opacity-25 px-2 py-1 rounded-pill fw-600"><i className="bi bi-hdd-network me-1"></i>Đang Vector hóa</Badge>;
            case 'processing': return <Badge bg="warning" className="bg-opacity-10 text-warning border border-warning border-opacity-25 px-2 py-1 rounded-pill fw-600"><i className="bi bi-gear-fill me-1"></i>Đang xử lý Text</Badge>;
            case 'uploading': return <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1 rounded-pill fw-600"><i className="bi bi-cloud-arrow-up-fill me-1"></i>Đang tải lên</Badge>;
            default: return <Badge bg="secondary" className="px-2 py-1 rounded-pill">Unknown</Badge>;
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
            <div className="d-flex align-items-center mb-4">
                <div className="bg-primary bg-opacity-10 p-3 rounded-4 me-3 text-primary shadow-sm border border-primary border-opacity-10">
                    <i className="bi bi-folder-symlink fs-3"></i>
                </div>
                <div>
                    <h2 className="fw-800 mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>Quản lý Kho tài liệu AI</h2>
                    <p className="text-muted fw-500 mb-0">Tải lên tài liệu và xây dựng Knowledge Base cho trợ lý AI</p>
                </div>
            </div>

            <Row>
                {/* Left Column: Upload & Document List */}
                <Col md={showChat ? 5 : 12} className="transition-all">
                    <Card className="mb-4 shadow-sm bg-white border-0 rounded-4 overflow-hidden">
                        <Card.Header className="d-flex justify-content-between align-items-center bg-light border-bottom border-light px-4 py-3">
                            <h5 className="m-0 fw-800 text-dark"><i className="bi bi-cloud-arrow-up me-2 text-primary"></i>Upload Tài liệu</h5>
                        </Card.Header>
                        <Card.Body className="p-4 p-md-5 text-center">
                            <div className="border border-primary border-opacity-25 border-dashed rounded-4 p-5 bg-light hover-bg-light transition-fast" style={{ cursor: 'pointer' }}>
                                <i className="bi bi-file-earmark-arrow-up display-3 text-primary opacity-50 mb-3 d-block"></i>
                                <h5 className="fw-700 text-dark mb-2">Kéo thả hoặc nhấn để tải lên</h5>
                                <p className="text-muted small fw-500 mb-4">Hỗ trợ các định dạng PDF, DOCX (Tối đa 50MB)</p>
                                <Button variant="primary" className="rounded-pill px-4 fw-bold shadow-sm" style={{ background: 'linear-gradient(135deg, var(--primary-color), #4db8ff)', border: 'none' }}>
                                    <i className="bi bi-folder2-open me-2"></i> Chọn File
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="shadow-sm bg-white border-0 rounded-4 overflow-hidden">
                        <Card.Header className="bg-light border-bottom border-light px-4 py-3">
                            <h5 className="m-0 fw-800 text-dark"><i className="bi bi-journal-text me-2 text-primary"></i>Danh sách tài liệu đã học</h5>
                        </Card.Header>
                        <ListGroup variant="flush">
                            {documents.map(doc => (
                                <ListGroup.Item key={doc.id} className="bg-white text-dark border-bottom border-light px-4 py-4 hover-bg-light transition-fast">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3 text-primary border border-primary border-opacity-10">
                                                <i className={`bi ${doc.name.endsWith('.pdf') ? 'bi-file-earmark-pdf-fill text-danger' : 'bi-file-earmark-word-fill text-primary'} fs-5`}></i>
                                            </div>
                                            <div>
                                                <div className="fw-800 text-dark mb-1" style={{ fontSize: '1.05rem' }}>{doc.name}</div>
                                                <span className="text-secondary fw-600 small px-2 py-1 bg-light rounded-pill border">{doc.size}</span>
                                            </div>
                                        </div>
                                        <div>{getStatusBadge(doc.status)}</div>
                                    </div>
                                    <ProgressBar
                                        now={doc.progress}
                                        variant={doc.status === 'completed' ? 'success' : 'primary'}
                                        animated={doc.status !== 'completed'}
                                        style={{ height: '6px' }}
                                        className="rounded-pill mb-3"
                                    />
                                    <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted fw-500"><i className="bi bi-clock me-1"></i>{doc.date}</small>
                                        <div className="d-flex gap-2">
                                            <Button variant="outline-primary" size="sm" className="rounded-pill px-3 fw-bold" onClick={() => setShowChat(true)}>
                                                <i className="bi bi-robot me-1"></i> Test AI
                                            </Button>
                                            <Button variant="outline-danger" size="sm" className="rounded-circle" style={{ width: '32px', height: '32px', padding: '0' }}>
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
                        <Card className="h-100 shadow-sm bg-white border-0 rounded-4 overflow-hidden">
                            <Card.Header className="d-flex justify-content-between align-items-center border-0 px-4 py-3" style={{ background: 'linear-gradient(135deg, var(--primary-color), #4db8ff)'}}>
                                <h5 className="m-0 fw-800 text-white"><i className="bi bi-robot me-2"></i>Test AI Knowledge Base</h5>
                                <Button variant="link" className="text-white p-0 opacity-75 hover-opacity-100" onClick={() => setShowChat(false)}>
                                    <i className="bi bi-x-lg fs-5"></i>
                                </Button>
                            </Card.Header>
                            <Card.Body className="d-flex flex-column p-0" style={{ height: '650px' }}>
                                <div className="flex-grow-1 overflow-auto p-4 custom-scrollbar bg-light bg-opacity-50">
                                    <div className="text-center mb-4 mt-2">
                                        <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill fw-600">
                                            Không gian mô phỏng AI RAG
                                        </Badge>
                                    </div>
                                    {chatHistory.map((chat, idx) => (
                                        <div key={idx} className={`d-flex mb-4 ${chat.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                                            <div className={`p-3 px-4 shadow-sm ${chat.sender === 'user' ? 'bg-primary text-white' : 'bg-white text-dark border border-light'}`} 
                                                 style={{ maxWidth: '85%', borderRadius: chat.sender === 'user' ? '1.5rem 1.5rem 0.25rem 1.5rem' : '1.5rem 1.5rem 1.5rem 0.25rem' }}>
                                                {chat.sender === 'ai' && <div className="fw-800 text-primary small mb-2 d-flex align-items-center"><i className="bi bi-robot me-1 fs-6"></i> AI Tutor</div>}
                                                <div className="fw-500" style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>{chat.message}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 border-top border-light bg-white">
                                    <InputGroup className="shadow-sm rounded-pill overflow-hidden border border-primary border-opacity-25">
                                        <Form.Control
                                            placeholder="Hỏi thử nội dung trong tài liệu..."
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            className="bg-white text-dark border-0 px-4 py-3 fw-500 shadow-none"
                                        />
                                        <Button variant="primary" onClick={handleSendMessage} className="px-4 fw-bold border-0" style={{ background: 'linear-gradient(135deg, var(--primary-color), #4db8ff)'}}>
                                            <i className="bi bi-send-fill fs-5"></i>
                                        </Button>
                                    </InputGroup>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                )}
            </Row>
        </div>
    );
}