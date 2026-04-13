import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Badge, Tab, Tabs, Row, Col, ListGroup, Accordion, Spinner, Form, InputGroup } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import PdfModal from '../../components/ui/PdfModal';

export default function LearningCenter() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [chatLogs, setChatLogs] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // AI Chat States (Split-pane)
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [showChat, setShowChat] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);

    // PDF Modal states
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [previewPdfUrl, setPreviewPdfUrl] = useState('');
    const [previewPdfTitle, setPreviewPdfTitle] = useState('');

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (showChat) {
            scrollToBottom();
        }
    }, [chatHistory, isTyping, showChat]);

    useEffect(() => {
        fetchMaterials();
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const res = await api.get('/ai/history');
            if (res.data.success) {
                // Map the AIChat documents to the UI format
                const mappedLogs = res.data.history.map(h => ({
                    id: h._id,
                    date: new Date(h.createdAt).toLocaleDateString('vi-VN'),
                    subject: h.material?.title || 'Tài liệu học tập',
                    summary: h.question,
                    content: [
                        { sender: 'Me', text: h.question },
                        { sender: 'AI', text: h.answer, source: h.material?.title }
                    ]
                })).reverse(); // Show newest first
                setChatLogs(mappedLogs);
            }
        } catch (err) {
            console.error('Error fetching AI history:', err.message);
        } finally {
            setHistoryLoading(false);
        }
    };

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const res = await api.get('/materials');
            if (res.data.success) {
                setDocuments(res.data.materials);
            }
        } catch (err) {
            console.error('Error fetching materials:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const getFullUrl = (url) => {
        const base = api.defaults.baseURL.replace('/api', '');
        return `${base}${url}`;
    };

    const handleViewMaterial = async (doc) => {
        try {
            await api.post(`/classrooms/${doc.classroom?._id || doc.classroom}/materials/${doc._id}/view`);
        } catch (err) {
            console.error('Error marking material as viewed:', err);
        }
        
        if (doc.fileUrl.toLowerCase().endsWith('.pdf')) {
            setPreviewPdfUrl(doc.fileUrl);
            setPreviewPdfTitle(doc.title);
            setShowPdfModal(true);
        } else {
            window.open(getFullUrl(doc.fileUrl), '_blank');
        }
    };

    const handleOpenChat = async (doc) => {
        setSelectedDoc(doc);
        setChatHistory([]);
        setShowChat(true);

        try {
            const res = await api.get(`/ai/history?materialId=${doc._id}`);
            if (res.data.success) {
                const mappedHistory = res.data.history.flatMap(h => [
                    { sender: 'user', message: h.question },
                    { sender: 'ai', message: h.answer }
                ]);
                setChatHistory(mappedHistory);
            }
        } catch (err) {
            console.error('Error fetching chat history:', err);
            toast.error('Không thể tải lịch sử hỏi đáp.');
        }
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim() || !selectedDoc) return;
        
        const userMsg = { sender: 'user', message: chatInput };
        setChatHistory(prev => [...prev, userMsg]);
        setChatInput('');
        setIsTyping(true);

        try {
            const res = await api.post('/ai/ask', { 
                question: userMsg.message,
                classroomId: selectedDoc.classroom?._id || selectedDoc.classroom,
                materialId: selectedDoc._id
            });

            if (res.data.success) {
                setIsTyping(false); // Stop typing BEFORE adding the final message
                setChatHistory(prev => [...prev, {
                    sender: 'ai',
                    message: res.data.answer
                }]);
            }
        } catch (err) {
            console.error('AI Error:', err);
            setIsTyping(false);
            let errMsg = 'Rất tiếc, tôi không thể kết nối. Vui lòng kiểm tra lại dịch vụ Server hoặc AI Engine.';
            if (err.response?.data?.message) {
                errMsg = err.response.data.message;
            }
            setChatHistory(prev => [...prev, {
                sender: 'ai',
                message: errMsg
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="container-fluid p-4"
        >
            <div className="d-flex align-items-center mb-4">
                <div className="bg-primary bg-opacity-10 p-3 rounded-4 me-3 text-primary shadow-sm">
                    <i className="bi bi-book-half fs-3"></i>
                </div>
                <div>
                    <h2 className="fw-800 mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>Trung tâm Học liệu & Ôn tập</h2>
                    <p className="text-muted fw-500 mb-0">Xem tài liệu và lịch sử trao đổi với AI Tutor từ các lớp bạn tham gia</p>
                </div>
            </div>

            <Row>
                <Col md={12}>
                    <Tabs defaultActiveKey="documents" className="mb-4 custom-tabs-premium border-0">
                        <Tab eventKey="documents" title={<span><i className="bi bi-file-earmark-text me-2"></i>Tài liệu Môn học</span>}>
                            <Row>
                                <Col md={showChat ? 5 : 12} className="transition-all">
                                    <Card className="border-0 shadow-sm bg-white rounded-4 overflow-hidden h-100">
                                        {loading ? (
                                            <div className="py-5 text-center"><Spinner animation="border" variant="primary" /></div>
                                        ) : (
                                            <ListGroup variant="flush" className="custom-scrollbar" style={{ height: showChat ? 'calc(100vh - 250px)' : 'auto', overflowY: 'auto' }}>
                                                {documents.length === 0 ? (
                                                    <ListGroup.Item className="p-5 text-center text-muted fw-500">
                                                        Chưa có tài liệu nào từ các lớp học của bạn.
                                                    </ListGroup.Item>
                                                ) : documents.map(doc => (
                                                    <ListGroup.Item key={doc._id} className="p-4 bg-white border-bottom border-light hover-bg-light transition-fast">
                                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                                            <div className="d-flex align-items-center">
                                                                <div className="bg-light p-3 rounded-3 me-3 text-primary shadow-sm border border-white">
                                                                    <i className={`bi ${doc.fileUrl.endsWith('.pdf') ? 'bi-file-earmark-pdf-fill text-danger' : 'bi-file-earmark-word-fill text-primary'} fs-4`}></i>
                                                                </div>
                                                                <div>
                                                                    <div className="fw-800 text-dark mb-1" style={{ fontSize: '1.05rem' }}>{doc.title}</div>
                                                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                                                        <Badge bg="primary" className="bg-opacity-10 text-primary px-2 py-1 rounded-pill fw-600" style={{ fontSize: '0.7rem' }}>{doc.classroom?.name || 'Môn học'}</Badge>
                                                                        <span className="text-muted small fw-500">• {new Date(doc.createdAt).toLocaleDateString('vi-VN')}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex justify-content-end gap-2 mt-3">
                                                            <Button 
                                                                variant={selectedDoc?._id === doc._id ? "primary" : "outline-primary"}
                                                                size="sm"
                                                                className="rounded-pill px-4 fw-bold shadow-sm"
                                                                onClick={() => handleOpenChat(doc)}
                                                            >
                                                                <i className="bi bi-robot me-1"></i> Hỏi AI
                                                            </Button>
                                                            <Button 
                                                                variant="light" 
                                                                size="sm"
                                                                className="rounded-pill px-4 fw-bold shadow-sm border"
                                                                onClick={() => handleViewMaterial(doc)}
                                                            >
                                                                <i className="bi bi-download me-1"></i> Xem File
                                                            </Button>
                                                        </div>
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        )}
                                    </Card>
                                </Col>
                                {showChat && (
                                    <Col md={7} className="fade-in">
                                        <Card className="h-100 shadow-sm bg-white border-0 rounded-4 overflow-hidden">
                                            <Card.Header className="d-flex justify-content-between align-items-center border-0 px-4 py-3" style={{ background: 'linear-gradient(135deg, var(--primary-color), #4db8ff)'}}>
                                                <h5 className="m-0 fw-800 text-white">
                                                    <i className="bi bi-robot me-2"></i>Hỏi AI: <span className="fw-500 opacity-90">{selectedDoc?.title}</span>
                                                </h5>
                                                <Button variant="link" className="text-white p-0 opacity-75 hover-opacity-100" onClick={() => setShowChat(false)}>
                                                    <i className="bi bi-x-lg fs-5"></i>
                                                </Button>
                                            </Card.Header>
                                            <Card.Body className="d-flex flex-column p-0" style={{ height: 'calc(100vh - 250px)', minHeight: '400px' }}>
                                                <div className="flex-grow-1 overflow-auto p-4 custom-scrollbar bg-light bg-opacity-50">
                                                    {chatHistory.length === 0 && !isTyping ? (
                                                        <div className="text-center py-5">
                                                            <div className="bg-primary bg-opacity-10 text-primary d-inline-flex p-4 rounded-circle mb-3">
                                                                <i className="bi bi-chat-dots fs-1"></i>
                                                            </div>
                                                            <h6 className="fw-700 text-dark">Bắt đầu hỏi AI về tài liệu này</h6>
                                                            <p className="text-muted small">AI sẽ trả lời dựa trên nội dung tri thức đã học được từ file.</p>
                                                        </div>
                                                    ) : (
                                                        <AnimatePresence>
                                                            {chatHistory.map((chat, idx) => (
                                                                <motion.div 
                                                                    key={idx} 
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className={`d-flex mb-4 ${chat.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                                                                >
                                                                    <div className={`p-3 px-4 shadow-sm ${chat.sender === 'user' ? 'bg-primary text-white' : 'bg-white text-dark border border-light'}`} 
                                                                         style={{ maxWidth: '85%', borderRadius: chat.sender === 'user' ? '1.5rem 1.5rem 0.25rem 1.5rem' : '1.5rem 1.5rem 1.5rem 0.25rem' }}>
                                                                        {chat.sender === 'ai' && <div className="fw-800 text-primary small mb-2 d-flex align-items-center"><i className="bi bi-robot me-1 fs-6"></i> AI Tutor</div>}
                                                                        <div className="fw-500 markdown-body" style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
                                                                            {chat.sender === 'user' ? (
                                                                                chat.message 
                                                                            ) : (
                                                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{chat.message}</ReactMarkdown>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                            {isTyping && (
                                                                <motion.div 
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                                    className="d-flex mb-4 justify-content-start"
                                                                >
                                                                    <div className="p-3 px-4 shadow-sm bg-white text-dark border border-light" 
                                                                         style={{ maxWidth: '85%', borderRadius: '1.5rem 1.5rem 1.5rem 0.25rem' }}>
                                                                        <div className="fw-800 text-primary small mb-2 d-flex align-items-center"><i className="bi bi-robot me-1 fs-6"></i> AI Tutor</div>
                                                                        <div className="d-flex align-items-center gap-2 py-2">
                                                                            <Spinner animation="grow" variant="primary" size="sm" />
                                                                            <Spinner animation="grow" variant="primary" size="sm" style={{ animationDelay: '0.2s' }} />
                                                                            <Spinner animation="grow" variant="primary" size="sm" style={{ animationDelay: '0.4s' }} />
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                            <div ref={chatEndRef} />
                                                        </AnimatePresence>
                                                    )}
                                                </div>
                                                <div className="p-4 border-top border-light bg-white">
                                                    <InputGroup className="shadow-sm rounded-pill overflow-hidden border border-primary border-opacity-25">
                                                        <Form.Control
                                                            placeholder={`Hỏi về ${selectedDoc?.title}...`}
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
                        </Tab>

                        <Tab eventKey="chat-history" title={<span><i className="bi bi-robot me-2"></i>Lịch sử hỏi đáp AI</span>}>
                            {historyLoading ? (
                                <div className="py-5 text-center"><Spinner animation="border" variant="success" /></div>
                            ) : (
                                <Accordion defaultActiveKey="0" className="shadow-sm rounded-4 overflow-hidden border-0">
                                    {chatLogs.length === 0 ? (
                                        <Card className="border-0 p-5 text-center text-muted fw-500 rounded-4">
                                            Bạn chưa có lịch sử hỏi đáp nào với AI.
                                        </Card>
                                    ) : chatLogs.map((log, index) => (
                                        <Accordion.Item eventKey={index.toString()} key={log.id} className="border-bottom border-light border-0">
                                            <Accordion.Header className="bg-white border-0 py-2">
                                                <div className="d-flex justify-content-between w-100 align-items-center pe-3">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="bg-success bg-opacity-10 text-success p-2 rounded-circle shadow-sm">
                                                            <i className="bi bi-calendar-check-fill"></i>
                                                        </div>
                                                        <div className="text-start">
                                                            <span className="fw-800 text-dark d-block text-truncate" style={{ fontSize: '0.95rem', maxWidth: '300px' }}>{log.summary}</span>
                                                            <small className="text-muted fw-600">{log.date}</small>
                                                        </div>
                                                    </div>
                                                    <Badge bg="secondary" className="bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-3 py-2 rounded-pill fw-700 text-truncate" style={{ maxWidth: '150px' }}>{log.subject}</Badge>
                                                </div>
                                            </Accordion.Header>
                                            <Accordion.Body className="bg-light bg-opacity-50 p-4 border-top border-light">
                                                {log.content.map((msg, i) => (
                                                    <div key={i} className={`p-3 rounded-4 mb-3 shadow-sm border border-white ${msg.sender === 'AI' ? 'bg-success bg-opacity-10 border-success border-opacity-10 ms-md-4' : 'bg-white border-primary border-opacity-10 me-md-4'}`}>
                                                        <div className="d-flex align-items-center mb-2">
                                                            <div className={`p-2 rounded-circle me-2 shadow-sm ${msg.sender === 'AI' ? 'bg-success text-white' : 'bg-primary text-white'}`} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <i className={`bi ${msg.sender === 'AI' ? 'bi-robot' : 'bi-person-fill'} small`}></i>
                                                            </div>
                                                            <strong className={`fw-800 ${msg.sender === 'AI' ? 'text-success' : 'text-primary'}`} style={{ fontSize: '0.9rem' }}>
                                                                {msg.sender === 'AI' ? '🤖 AI Tutor' : '👤 Bạn'}
                                                            </strong>
                                                        </div>
                                                        <div className="mb-0 text-dark fw-500" style={{ fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                                                        {msg.source && (
                                                            <div className="mt-2 pt-2 border-top border-success border-opacity-10 text-muted small fst-italic d-flex align-items-center">
                                                                <i className="bi bi-link-45deg me-1"></i> Nguồn tham khảo: <span className="ms-1 fw-700 text-success">{msg.source}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    ))}
                                </Accordion>
                            )}
                        </Tab>
                    </Tabs>
                </Col>
            </Row>

            <PdfModal 
                show={showPdfModal} 
                onHide={() => setShowPdfModal(false)} 
                pdfUrl={previewPdfUrl} 
                title={previewPdfTitle} 
            />
        </motion.div>
    );
}
