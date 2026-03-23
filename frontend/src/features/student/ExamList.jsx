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
                api.get('/exams/my-results')
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
            <h2 className="mb-4 text-white"><i className="bi bi-journal-check me-2 text-info"></i> Trung tâm Khảo thí & Kiểm tra</h2>

            <Tabs id="exam-tabs" activeKey={key} onSelect={(k) => setKey(k)} className="mb-4 custom-tabs">
                <Tab eventKey="available" title="🔥 Kỳ thi khả dụng">
                    <Card className="text-white border-0 shadow-lg overflow-hidden" style={{ borderRadius: '15px', background: 'none' }}>
                        <Card.Body className="p-0">
                            {availableExams.length === 0 ? (
                                <div className="text-center text-muted py-5">
                                    <i className="bi bi-clipboard-x fs-1 d-block mb-3 opacity-25"></i>
                                    <h5>Hiện không có kỳ thi nào.</h5>
                                    <p className="mb-4 small">Bạn cần tham gia lớp học để xem các kỳ thi dành cho mình.</p>
                                    <Link to="/classroom-management">
                                        <Button variant="outline-info" className="rounded-pill px-4">Tham gia lớp học ngay</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'none' }}>
                                        <thead className="border-bottom border-secondary border-opacity-25">
                                            <tr>
                                                <th className="ps-4 py-3 border-0">Tên kỳ thi</th>
                                                <th className="py-3 border-0">Lớp học</th>
                                                <th className="py-3 border-0">Thời lượng</th>
                                                <th className="py-3 border-0 text-center">Số câu</th>
                                                <th className="pe-4 py-3 border-0 text-end">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {availableExams.map(exam => (
                                                <tr key={exam._id} className="border-bottom border-secondary border-opacity-25 transition-all">
                                                    <td className="ps-4 py-4">
                                                        <div className="fw-bold text-white fs-6">{exam.title}</div>
                                                        <small className="text-muted">Tạo bởi: {exam.lecturer?.name || 'Giảng viên'}</small>
                                                    </td>
                                                    <td>
                                                        <span className="text-info fw-bold">
                                                            {exam.classroom?.name}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <Clock size={16} className="text-warning me-2" />
                                                            <span>{exam.duration} phút</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className="badge bg-secondary bg-opacity-25 text-white">{exam.questions?.length || 0} câu</span>
                                                    </td>
                                                    <td className="pe-4 text-end">
                                                        <Link to={`/exam-room/${exam._id}`}>
                                                            <Button variant="primary" size="sm" className="rounded-pill px-4 fw-bold shadow-sm">
                                                                VÀO THI <i className="bi bi-arrow-right ms-1"></i>
                                                            </Button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="history" title="✅ Lịch sử thi">
                    <Row>
                        {results.length === 0 ? (
                            <Col className="text-center text-muted py-5"><h5>Bạn chưa tham gia kỳ thi nào.</h5></Col>
                        ) : results.map(res => (
                            <Col md={6} lg={4} key={res._id} className="mb-4">
                                <Card className="text-white border-0 shadow h-100 overflow-hidden" style={{ borderRadius: '12px', background: 'none' }}>
                                    <div className="p-3 border-bottom border-secondary border-opacity-25">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span className="text-info fw-bold" style={{ fontSize: '0.85rem' }}>{res.exam?.classroom?.name || 'Môn học'}</span>
                                            <small className="text-muted" style={{ fontSize: '0.7rem' }}>{new Date(res.createdAt).toLocaleDateString()}</small>
                                        </div>
                                        <h6 className="card-title fw-bold mb-0 text-truncate text-white">{res.exam?.title}</h6>
                                    </div>
                                    <Card.Body className="p-3">
                                        <Row className="align-items-center mb-3">
                                            <Col xs={6}>
                                                <div className="text-muted small mb-1">KẾT QUẢ</div>
                                                <div className="d-flex align-items-baseline">
                                                    <span className="fs-3 fw-bold text-success me-1">{res.score || 0}</span>
                                                    <small className="text-muted">/10</small>
                                                </div>
                                            </Col>
                                            <Col xs={6} className="text-end border-start border-secondary border-opacity-25">
                                                <div className="text-muted small mb-1">VI PHẠM</div>
                                                <div className="d-flex align-items-baseline justify-content-end">
                                                    <span className={`fs-4 fw-bold ${res.totalViolations > 0 ? 'text-danger' : 'text-muted'}`}>
                                                        {res.totalViolations || 0}
                                                    </span>
                                                    <small className="text-muted ms-1">lần</small>
                                                </div>
                                            </Col>
                                        </Row>

                                        {res.autoSubmitted && (
                                            <Badge bg="danger" bg-opacity-10 text="danger" className="w-100 py-2 border border-danger border-opacity-25 mb-3">
                                                <i className="bi bi-exclamation-triangle-fill me-2"></i>Tự động nộp bài do vi phạm
                                            </Badge>
                                        )}

                                        <Button variant="outline-light" size="sm" className="w-100 border-secondary" style={{ borderRadius: '8px', fontSize: '0.8rem' }}>
                                            XEM CHI TIẾT <i className="bi bi-chevron-right ms-1"></i>
                                        </Button>
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
