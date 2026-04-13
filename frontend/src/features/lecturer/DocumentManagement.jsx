import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Form, ProgressBar, Badge, ListGroup, Row, Col, InputGroup, Spinner } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import PdfModal from '../../components/ui/PdfModal';

export default function DocumentManagement() {
    const [documents, setDocuments] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [title, setTitle] = useState('');
    const fileInputRef = useRef(null);

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
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [matRes, classRes] = await Promise.all([
                api.get('/materials'),
                api.get('/classrooms')
            ]);
            if (matRes.data.success) setDocuments(matRes.data.materials);
            if (classRes.data.success) {
                setClassrooms(classRes.data.classrooms);
                if (classRes.data.classrooms.length > 0) {
                    setSelectedClassId(classRes.data.classrooms[0]._id);
                }
            }
        } catch (err) {
            console.error('Error fetching documents:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!selectedClassId) {
            toast.error('Vui lòng chọn lớp học trước khi tải lên.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('classroomId', selectedClassId);
        formData.append('title', title || file.name);

        setUploading(true);
        try {
            const res = await api.post('/materials/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setDocuments([res.data.material, ...documents]);
                if (fileInputRef.current) fileInputRef.current.value = '';
                setTitle('');
                toast.success('Tải lên tài liệu thành công!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tải lên.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        toast.custom((t) => (
            <div className={`d-flex align-items-center justify-content-center transition-all ${t.visible ? 'opacity-100' : 'opacity-0'}`} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
                <div className="bg-white p-4 rounded-4 shadow-lg text-center mx-3" style={{ maxWidth: '400px', transform: t.visible ? 'scale(1)' : 'scale(0.9)', transition: 'all 0.2s ease-out' }}>
                    <div className="mb-3"><i className="bi bi-trash-fill text-danger border border-2 border-danger rounded-circle p-3 fs-3"></i></div>
                    <h5 className="fw-800 text-dark mb-2">Xóa tài liệu?</h5>
                    <p className="text-muted mb-4">Bạn có chắc muốn xóa tài liệu này? Hành động này không thể hoàn tác.</p>
                    <div className="d-flex gap-2 justify-content-center">
                        <Button variant="light" className="rounded-pill px-4 fw-600" onClick={() => toast.dismiss(t.id)}>Hủy</Button>
                        <Button variant="danger" className="rounded-pill px-4 fw-600 shadow-sm" onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                const res = await api.delete(`/materials/${id}`);
                                if (res.data.success) {
                                    setDocuments(documents.filter(doc => doc._id !== id));
                                    toast.success('Đã xóa tài liệu.');
                                }
                            } catch (err) {
                                toast.error('Không thể xóa tài liệu.');
                            }
                        }}>Xóa</Button>
                    </div>
                </div>
            </div>
        ), { duration: Infinity, id: `del-doc-${id}` });
    };

    const getStatusBadge = (status) => {
        return <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill fw-600"><i className="bi bi-check-circle-fill me-1"></i>Hoàn tất</Badge>;
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
                classroomId: selectedDoc.classroom?._id || selectedClassId,
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
            if (err.response && err.response.data && err.response.data.message) {
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

    if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

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
                <Col md={showChat ? 5 : 12} className="transition-all">
                    <Card className="mb-4 shadow-sm bg-white border-0 rounded-4 overflow-hidden">
                        <Card.Header className="d-flex justify-content-between align-items-center bg-light border-bottom border-light px-4 py-3">
                            <h5 className="m-0 fw-800 text-dark"><i className="bi bi-cloud-arrow-up me-2 text-primary"></i>Upload Tài liệu</h5>
                        </Card.Header>
                        <Card.Body className="p-4 p-md-4">
                            <Form>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-700 text-muted">Chọn lớp học</Form.Label>
                                            <Form.Select 
                                                className="rounded-3 px-3 py-2 border-light shadow-sm bg-light text-dark fw-600"
                                                value={selectedClassId}
                                                onChange={(e) => setSelectedClassId(e.target.value)}
                                            >
                                                {classrooms.map(cls => (
                                                    <option key={cls._id} value={cls._id}>{cls.name}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-700 text-muted">Tên tài liệu (Ghi chú)</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                placeholder="VD: Giáo trình Chương 1..."
                                                className="rounded-3 px-3 py-2 border-light shadow-sm bg-light text-dark fw-600"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <div 
                                    className="border border-primary border-opacity-25 border-dashed rounded-4 p-4 text-center bg-light hover-bg-white transition-fast" 
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <i className="bi bi-file-earmark-arrow-up display-5 text-primary opacity-50 mb-2 d-block"></i>
                                    <h6 className="fw-700 text-dark mb-1">
                                        {uploading ? 'Đang xử lý tài liệu...' : 'Nhấn để chọn file tải lên'}
                                    </h6>
                                    {uploading && <ProgressBar animated now={100} className="mt-2" style={{ height: '5px' }} />}
                                    <p className="text-muted small fw-500 mb-0">PDF, DOCX, PPTX (Tối đa 50MB)</p>
                                    <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" />
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>

                    <Card className="shadow-sm bg-white border-0 rounded-4 overflow-hidden">
                        <Card.Header className="bg-light border-bottom border-light px-4 py-3">
                            <h5 className="m-0 fw-800 text-dark"><i className="bi bi-journal-text me-2 text-primary"></i>Danh sách tài liệu đã học</h5>
                        </Card.Header>
                        <ListGroup variant="flush" className="custom-scrollbar" style={{ height: showChat ? 'calc(100vh - 450px)' : 'auto', minHeight: '300px', overflowY: 'auto' }}>
                            {documents.length === 0 ? (
                                <ListGroup.Item className="text-center py-5 text-muted fw-500">Chưa có tài liệu nào được tải lên.</ListGroup.Item>
                            ) : documents.map(doc => (
                                <ListGroup.Item key={doc._id} className="bg-white text-dark border-bottom border-light px-4 py-4 hover-bg-light transition-fast">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3 text-primary border border-primary border-opacity-10">
                                                <i className={`bi ${(doc.fileUrl && doc.fileUrl.endsWith('.pdf')) ? 'bi-file-earmark-pdf-fill text-danger' : 'bi-file-earmark-word-fill text-primary'} fs-5`}></i>
                                            </div>
                                            <div>
                                                <div className="fw-800 text-dark mb-1" style={{ fontSize: '1.05rem' }}>{doc.title}</div>
                                                <div className="d-flex gap-2 align-items-center">
                                                    <span className="text-secondary fw-700 small px-2 py-1 bg-light rounded-pill border">{doc.classroom?.name || 'Lớp học'}</span>
                                                    <small className="text-muted fw-500"><i className="bi bi-clock me-1"></i>{new Date(doc.createdAt).toLocaleDateString('vi-VN')}</small>
                                                </div>
                                            </div>
                                        </div>
                                        <div>{getStatusBadge('completed')}</div>
                                    </div>
                                    <div className="d-flex justify-content-end gap-2 mt-2">
                                        <Button 
                                            variant={selectedDoc?._id === doc._id ? "primary" : "outline-primary"} 
                                            size="sm" 
                                            className="rounded-pill px-3 fw-bold shadow-sm" 
                                            onClick={() => handleOpenChat(doc)}
                                        >
                                            <i className="bi bi-robot me-1"></i> Test AI
                                        </Button>
                                        {doc.fileUrl && doc.fileUrl.toLowerCase().endsWith('.pdf') && (
                                            <Button 
                                                variant="outline-info" 
                                                size="sm" 
                                                className="rounded-pill px-3 fw-bold shadow-sm" 
                                                onClick={() => {
                                                    setPreviewPdfUrl(doc.fileUrl);
                                                    setPreviewPdfTitle(doc.title);
                                                    setShowPdfModal(true);
                                                }}
                                            >
                                                <i className="bi bi-eye me-1"></i> Xem
                                            </Button>
                                        )}
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm" 
                                            className="rounded-circle shadow-sm" 
                                            style={{ width: '32px', height: '32px', padding: '0' }}
                                            onClick={() => handleDelete(doc._id)}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>
                </Col>

                {showChat && (
                    <Col md={7} className="fade-in">
                        <Card className="h-100 shadow-sm bg-white border-0 rounded-4 overflow-hidden">
                            <Card.Header className="d-flex justify-content-between align-items-center border-0 px-4 py-3" style={{ background: 'linear-gradient(135deg, var(--primary-color), #4db8ff)'}}>
                                <h5 className="m-0 fw-800 text-white">
                                    <i className="bi bi-robot me-2"></i>Test AI: <span className="fw-500 opacity-90">{selectedDoc?.title}</span>
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

            <PdfModal 
                show={showPdfModal} 
                onHide={() => setShowPdfModal(false)} 
                pdfUrl={previewPdfUrl} 
                title={previewPdfTitle} 
            />
        </div>
    );
}