import React, { useState } from 'react';
import { Card, Button, Badge, Tab, Tabs, Row, Col, ListGroup, Accordion } from 'react-bootstrap';

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
        <div className="container-fluid p-4">
            <h2 className="mb-4 text-white">📚 Trung tâm Học liệu & Ôn tập</h2>

            <Row>
                <Col md={12}>
                    <Tabs defaultActiveKey="documents" className="mb-3">
                        <Tab eventKey="documents" title="📄 Tài liệu Môn học">
                            <Card className="bg-dark text-white border-secondary">
                                <ListGroup variant="flush">
                                    {documents.map(doc => (
                                        <ListGroup.Item key={doc.id} className="bg-dark text-white border-secondary d-flex justify-content-between align-items-center">
                                            <div>
                                                <div className="fw-bold">{doc.name}</div>
                                                <small className="text-muted"><Badge bg="info">{doc.subject}</Badge> • {doc.date} • {doc.size}</small>
                                            </div>
                                            <Button variant="outline-primary" size="sm">
                                                <i className="bi bi-download"></i> Tải về
                                            </Button>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Card>
                        </Tab>

                        <Tab eventKey="chat-history" title="🤖 Lịch sử hỏi đáp AI">
                            <Accordion defaultActiveKey="0">
                                {chatLogs.map((log, index) => (
                                    <Accordion.Item eventKey={index.toString()} key={log.id} className="bg-dark text-white border-secondary">
                                        <Accordion.Header>
                                            <div className="d-flex justify-content-between w-100 me-3">
                                                <span>📅 {log.date} - {log.summary}</span>
                                                <Badge bg="secondary">{log.subject}</Badge>
                                            </div>
                                        </Accordion.Header>
                                        <Accordion.Body className="bg-secondary bg-opacity-10">
                                            {log.content.map((msg, i) => (
                                                <div key={i} className={`mb-2 ${msg.sender === 'AI' ? 'text-success' : 'text-white'}`}>
                                                    <strong>{msg.sender === 'AI' ? '🤖 AI Tutor' : '👤 Bạn'}:</strong> {msg.text}
                                                    {msg.source && <div className="small text-muted mt-1 fst-italic">Source: {msg.source}</div>}
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
        </div>
    );
}
