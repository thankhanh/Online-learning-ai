import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Tab, Tabs } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Clock, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

export default function ExamList() {
    const [key, setKey] = useState('available');
    const [availableExams, setAvailableExams] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const [examRes, resultRes] = await Promise.all([
                api.get('/exams'),
                api.get('/exams/results') // This endpoint might need to be specific to user in real app
            ]);
            if (examRes.data.success) setAvailableExams(examRes.data.exams);
            if (resultRes.data.success) setResults(resultRes.data.results);
        } catch (err) {
            console.error('Error fetching exams:', err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center mt-5 text-white">Đang tải danh sách kỳ thi...</div>;

    return (
        <div className="container-fluid p-4">
            <h2 className="mb-4 text-white">📝 Trung tâm Khảo thí & Kiểm tra</h2>

            <Tabs id="exam-tabs" activeKey={key} onSelect={(k) => setKey(k)} className="mb-4">
                <Tab eventKey="available" title="🔥 Kỳ thi khả dụng">
                    <Row>
                        {availableExams.length === 0 ? (
                            <Col className="text-center text-muted py-5"><h5>Hiện không có kỳ thi nào.</h5></Col>
                        ) : availableExams.map(exam => (
                            <Col md={6} lg={4} key={exam._id} className="mb-4">
                                <Card className="bg-dark text-white border-secondary shadow-sm h-100 position-relative">
                                    <Card.Body className="d-flex flex-column">
                                        <div className="mb-3">
                                            <Badge bg="info" className="mb-2">{exam.classroom?.name}</Badge>
                                            <h5 className="card-title fw-bold">{exam.title}</h5>
                                        </div>
                                        <div className="flex-grow-1 text-secondary small mb-4">
                                            <div className="d-flex align-items-center mb-2">
                                                <Clock size={16} className="me-2 text-warning" />
                                                Thời lượng: {exam.duration} phút
                                            </div>
                                            <div className="d-flex align-items-center mb-2">
                                                <AlertCircle size={16} className="me-2 text-info" />
                                                Số câu: {exam.questions?.length} câu
                                            </div>
                                        </div>
                                        <div className="mt-auto">
                                            <Link to={`/exam-room/${exam._id}`}>
                                                <Button variant="danger" className="w-100 fw-bold">Vào phòng thi</Button>
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
                        {results.length === 0 ? (
                            <Col className="text-center text-muted py-5"><h5>Bạn chưa tham gia kỳ thi nào.</h5></Col>
                        ) : results.map(res => (
                            <Col md={6} lg={4} key={res._id} className="mb-4">
                                <Card className="bg-secondary bg-opacity-10 text-white border-secondary h-100">
                                    <Card.Body>
                                        <h6 className="card-title fw-bold mb-2">{res.exam?.title}</h6>
                                        <div className="d-flex justify-content-between align-items-center bg-dark rounded p-2">
                                            <span className="text-secondary small">Điểm:</span>
                                            <span className="fw-bold text-success">{res.score}</span>
                                        </div>
                                        {res.autoSubmitted && <Badge bg="danger" className="mt-2 w-100">Tự động nộp bài (Vi phạm)</Badge>}
                                        <div className="text-end mt-2">
                                            <small className="text-muted">Ngày: {new Date(res.createdAt).toLocaleDateString()}</small>
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
