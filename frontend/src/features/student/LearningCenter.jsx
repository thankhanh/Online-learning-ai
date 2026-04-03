import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Tab, Tabs, Row, Col, ListGroup, Accordion, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import api from '../../utils/api';

export default function LearningCenter() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [chatLogs, setChatLogs] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

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
        window.open(getFullUrl(doc.fileUrl), '_blank');
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
                            <Card className="border-0 shadow-sm bg-white rounded-4 overflow-hidden">
                                {loading ? (
                                    <div className="py-5 text-center"><Spinner animation="border" variant="primary" /></div>
                                ) : (
                                    <ListGroup variant="flush">
                                        {documents.length === 0 ? (
                                            <ListGroup.Item className="p-5 text-center text-muted fw-500">
                                                Chưa có tài liệu nào từ các lớp học của bạn.
                                            </ListGroup.Item>
                                        ) : documents.map(doc => (
                                            <ListGroup.Item key={doc._id} className="p-4 bg-white border-bottom border-light d-flex justify-content-between align-items-center hover-bg-light transition-fast">
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-light p-3 rounded-3 me-3 text-primary shadow-sm border border-white">
                                                        <i className={`bi ${doc.fileUrl.endsWith('.pdf') ? 'bi-file-earmark-pdf-fill text-danger' : 'bi-file-earmark-word-fill text-primary'} fs-4`}></i>
                                                    </div>
                                                    <div>
                                                        <div className="fw-800 text-dark mb-1" style={{ fontSize: '1.05rem' }}>{doc.title}</div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <Badge bg="primary" className="bg-opacity-10 text-primary px-2 py-1 rounded-pill fw-600" style={{ fontSize: '0.7rem' }}>{doc.classroom?.name || 'Môn học'}</Badge>
                                                            <span className="text-muted small fw-500">• {new Date(doc.createdAt).toLocaleDateString('vi-VN')}</span>
                                                            <span className="text-muted small fw-500">• GV: {doc.uploadedBy?.name}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button 
                                                    variant="outline-primary" 
                                                    className="rounded-pill px-4 fw-bold shadow-sm border-2"
                                                    onClick={() => handleViewMaterial(doc)}
                                                >
                                                    <i className="bi bi-download me-2"></i> Xem / Tải về
                                                </Button>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </Card>
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
        </motion.div>
    );
}
