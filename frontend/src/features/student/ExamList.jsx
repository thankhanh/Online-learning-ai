import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Tab, Tabs } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Clock, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

export default function ExamList() {
    const [key, setKey] = useState('available');

    // Mock Exam Data
    const exams = {
        available: [
            { id: 1, title: 'Giữa kỳ: Trí tuệ nhân tạo', subject: 'AI Cơ bản', duration: '60 phút', startTime: 'Dang diễn ra', status: 'live', questions: 40 },
            { id: 2, title: 'Quiz: Machine Learning Tuần 5', subject: 'Học máy', duration: '15 phút', startTime: 'Hôm nay, 14:00', status: 'upcoming', questions: 10 },
        ],
        completed: [
            { id: 101, title: 'Kiểm tra 15 phút', subject: 'Thị giác máy tính', score: '9.5/10', date: '10/10/2023', status: 'passed' },
            { id: 102, title: 'Cuối kỳ: Cấu trúc dữ liệu', subject: 'CTDL & GT', score: '8.0/10', date: '15/09/2023', status: 'passed' },
        ]
    };

    return (
        <div className="container-fluid p-4">
            <h2 className="mb-4 text-white">📝 Trung tâm Khảo thí & Kiểm tra</h2>

            <Tabs
                id="exam-tabs"
                activeKey={key}
                onSelect={(k) => setKey(k)}
                className="mb-4"
            >
                <Tab eventKey="available" title="🔥 Kỳ thi khả dụng">
                    <Row>
                        {exams.available.map(exam => (
                            <Col md={6} lg={4} key={exam.id} className="mb-4">
                                <Card className="bg-dark text-white border-secondary shadow-sm h-100 position-relative overflow-hidden">
                                    {exam.status === 'live' && (
                                        <div className="position-absolute top-0 end-0 bg-danger text-white px-3 py-1 rounded-bottom-start small fw-bold animate-pulse">
                                            LIVE
                                        </div>
                                    )}
                                    <Card.Body className="d-flex flex-column">
                                        <div className="mb-3">
                                            <Badge bg="info" className="mb-2">{exam.subject}</Badge>
                                            <h5 className="card-title fw-bold">{exam.title}</h5>
                                        </div>

                                        <div className="flex-grow-1 text-secondary small mb-4">
                                            <div className="d-flex align-items-center mb-2">
                                                <Clock size={16} className="me-2 text-warning" />
                                                Thời lượng: {exam.duration}
                                            </div>
                                            <div className="d-flex align-items-center mb-2">
                                                <Calendar size={16} className="me-2 text-primary" />
                                                Bắt đầu: {exam.startTime}
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <AlertCircle size={16} className="me-2 text-info" />
                                                Số câu hỏi: {exam.questions} câu
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            <Link to={`/exam-room/${exam.id}`}>
                                                <Button variant={exam.status === 'live' ? "danger" : "primary"} className="w-100 fw-bold">
                                                    {exam.status === 'live' ? "Vào phòng thi ngay" : "Xem chi tiết"}
                                                </Button>
                                            </Link>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Tab>

                <Tab eventKey="history" title="✅ Lịch sử thi">
                    <Row>
                        {exams.completed.map(exam => (
                            <Col md={6} lg={4} key={exam.id} className="mb-4">
                                <Card className="bg-secondary bg-opacity-10 text-white border-secondary h-100">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h6 className="card-title fw-bold mb-0">{exam.title}</h6>
                                            <Badge bg="success">{exam.status === 'passed' ? 'Đậu' : 'Rớt'}</Badge>
                                        </div>
                                        <p className="text-muted small mb-3">{exam.subject}</p>
                                        <div className="d-flex justify-content-between align-items-center bg-dark rounded p-2">
                                            <span className="text-secondary small">Điểm số:</span>
                                            <span className="fw-bold text-success">{exam.score}</span>
                                        </div>
                                        <div className="text-end mt-2">
                                            <small className="text-muted fst-italic">Thi ngày: {exam.date}</small>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Tab>
            </Tabs>
        </div>
    );
}
