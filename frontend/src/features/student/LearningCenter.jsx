import React, { useState } from 'react';
import { Card, Button, Badge, Tab, Tabs, Row, Col, ListGroup, Accordion } from 'react-bootstrap';
import { motion } from 'framer-motion';

export default function LearningCenter() {
    // Mock Documents
    const documents = [
        { id: 1, subject: 'Trí tuệ nhân tạo', name: 'Slide_Chuong_1_Gioi_thieu.pdf', date: '2023-10-01', size: '2.4 MB' },
        { id: 2, subject: 'Trí tuệ nhân tạo', name: 'Bai_tap_Tuan_1.docx', date: '2023-10-05', size: '0.5 MB' },
        { id: 3, subject: 'Học máy', name: 'Giao_trinh_Machine_Learning.pdf', date: '2023-10-10', size: '15.2 MB' },
    ];

    // Mock Chat Logs
    const chatLogs = [
        {
            id: 1,
            date: '24/10/2023',
            subject: 'Trí tuệ nhân tạo',
            summary: 'Hỏi về Backpropagation',
            content: [
                { sender: 'Me', text: 'Backpropagation hoạt động như thế nào?' },
                { sender: 'AI', text: 'Backpropagation (Lan truyền ngược) là thuật toán cốt lõi để huấn luyện mạng nơ-ron. Nó tính toán gradient của hàm mất mát (loss function) theo từng trọng số...', source: 'Chuong_3_Neural_Network.pdf' }
            ]
        },
        {
            id: 2,
            date: '20/10/2023',
            subject: 'Học máy',
            summary: 'Giải thích về Overfitting',
            content: [
                { sender: 'Me', text: 'Làm sao để tránh Overfitting?' },
                { sender: 'AI', text: 'Để tránh Overfitting, bạn có thể sử dụng các kỹ thuật như: 1. Regularization (L1, L2), 2. Dropout, 3. Early Stopping...', source: 'Bai_giang_Overfitting.pptx' }
            ]
        }
    ];

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
                    <p className="text-muted fw-500 mb-0">Quản lý tài liệu và xem lại lịch sử trao đổi với AI Tutor</p>
                </div>
            </div>

            <Row>
                <Col md={12}>
                    <Tabs defaultActiveKey="documents" className="mb-4 custom-tabs-premium border-0">
                        <Tab eventKey="documents" title={<span><i className="bi bi-file-earmark-text me-2"></i>Tài liệu Môn học</span>}>
                            <Card className="border-0 shadow-sm bg-white rounded-4 overflow-hidden">
                                <ListGroup variant="flush">
                                    {documents.map(doc => (
                                        <ListGroup.Item key={doc.id} className="p-4 bg-white border-bottom border-light d-flex justify-content-between align-items-center hover-bg-light transition-fast">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-light p-3 rounded-3 me-3 text-primary shadow-sm border border-white">
                                                    <i className={`bi ${doc.name.endsWith('.pdf') ? 'bi-file-earmark-pdf-fill text-danger' : 'bi-file-earmark-word-fill text-primary'} fs-4`}></i>
                                                </div>
                                                <div>
                                                    <div className="fw-800 text-dark mb-1" style={{ fontSize: '1.05rem' }}>{doc.name}</div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <Badge bg="primary" className="bg-opacity-10 text-primary px-2 py-1 rounded-pill fw-600" style={{ fontSize: '0.7rem' }}>{doc.subject}</Badge>
                                                        <span className="text-muted small fw-500">• {doc.date}</span>
                                                        <span className="text-muted small fw-500">• {doc.size}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="outline-primary" className="rounded-pill px-4 fw-bold shadow-sm border-2">
                                                <i className="bi bi-download me-2"></i> Tải về
                                            </Button>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Card>
                        </Tab>

                        <Tab eventKey="chat-history" title={<span><i className="bi bi-robot me-2"></i>Lịch sử hỏi đáp AI</span>}>
                            <Accordion defaultActiveKey="0" className="shadow-sm rounded-4 overflow-hidden border-0">
                                {chatLogs.map((log, index) => (
                                    <Accordion.Item eventKey={index.toString()} key={log.id} className="border-bottom border-light border-0">
                                        <Accordion.Header className="bg-white border-0 py-2">
                                            <div className="d-flex justify-content-between w-100 align-items-center pe-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-success bg-opacity-10 text-success p-2 rounded-circle shadow-sm">
                                                        <i className="bi bi-calendar-check-fill"></i>
                                                    </div>
                                                    <div>
                                                        <span className="fw-800 text-dark d-block" style={{ fontSize: '0.95rem' }}>{log.summary}</span>
                                                        <small className="text-muted fw-600">{log.date}</small>
                                                    </div>
                                                </div>
                                                <Badge bg="secondary" className="bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-3 py-2 rounded-pill fw-700">{log.subject}</Badge>
                                            </div>
                                        </Accordion.Header>
                                        <Accordion.Body className="bg-light bg-opacity-50 p-4 border-top border-light">
                                            {log.content.map((msg, i) => (
                                                <div key={i} className={`p-3 rounded-4 mb-3 shadow-sm border border-white ${msg.sender === 'AI' ? 'bg-success bg-opacity-10 border-success border-opacity-10 ms-4' : 'bg-white border-primary border-opacity-10 me-4'}`}>
                                                    <div className="d-flex align-items-center mb-2">
                                                        <div className={`p-2 rounded-circle me-2 shadow-sm ${msg.sender === 'AI' ? 'bg-success text-white' : 'bg-primary text-white'}`} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <i className={`bi ${msg.sender === 'AI' ? 'bi-robot' : 'bi-person-fill'} small`}></i>
                                                        </div>
                                                        <strong className={`fw-800 ${msg.sender === 'AI' ? 'text-success' : 'text-primary'}`} style={{ fontSize: '0.9rem' }}>
                                                            {msg.sender === 'AI' ? '🤖 AI Tutor' : '👤 Bạn'}
                                                        </strong>
                                                    </div>
                                                    <p className="mb-0 text-dark fw-500" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{msg.text}</p>
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
                        </Tab>
                    </Tabs>
                </Col>
            </Row>
        </motion.div>
    );
}
