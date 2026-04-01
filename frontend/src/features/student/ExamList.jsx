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
            <div className="d-flex align-items-center mb-4">
                <div className="bg-primary bg-opacity-10 p-3 rounded-4 me-3 text-primary shadow-sm border border-primary border-opacity-10">
                    <i className="bi bi-journal-check fs-3"></i>
                </div>
                <div>
                    <h2 className="fw-800 mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>Trung tâm Khảo thí & Kiểm tra</h2>
                    <p className="text-muted fw-500 mb-0">Quản lý các kỳ thi sắp tới và kết quả đã hoàn thành</p>
                </div>
            </div>

            <Tabs id="exam-tabs" activeKey={key} onSelect={(k) => setKey(k)} className="mb-4 custom-tabs-premium border-0">
                <Tab eventKey="available" title={<span><i className="bi bi-lightning-charge-fill me-2 text-warning"></i>Kỳ thi khả dụng</span>}>
                    <Card className="bg-white border-0 shadow-sm rounded-4 overflow-hidden">
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
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="ps-4 py-3 border-0 text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Tên kỳ thi</th>
                                                <th className="py-3 border-0 text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Lớp học</th>
                                                <th className="py-3 border-0 text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Thời lượng</th>
                                                <th className="py-3 border-0 text-center text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Số câu</th>
                                                <th className="pe-4 py-3 border-0 text-end text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {availableExams.map(exam => (
                                                <tr key={exam._id} className="border-bottom border-light transition-fast hover-bg-light">
                                                    <td className="ps-4 py-4">
                                                        <div className="fw-800 text-dark mb-1" style={{ fontSize: '1rem' }}>{exam.title}</div>
                                                        <small className="text-muted fw-500">
                                                            <i className="bi bi-person-circle me-1"></i> Tạo bởi: {exam.lecturer?.name || 'Giảng viên'}
                                                        </small>
                                                    </td>
                                                    <td>
                                                        <span className="text-primary fw-bold">
                                                            {exam.classroom?.name}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center bg-light d-inline-flex px-3 py-2 rounded-pill shadow-sm border">
                                                            <Clock size={16} className="text-warning me-2" />
                                                            <span className="fw-700 text-dark" style={{ fontSize: '0.85rem' }}>{exam.duration} phút</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-3 py-2 rounded-pill fw-700">{exam.questions?.length || 0} câu</span>
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

                <Tab eventKey="history" title={<span><i className="bi bi-check-circle-fill me-2 text-success"></i>Lịch sử thi</span>}>
                    <Row>
                        {results.length === 0 ? (
                            <Col className="text-center text-muted py-5">
                                <div className="bg-light rounded-circle d-inline-flex p-4 mb-3 shadow-sm border">
                                    <i className="bi bi-journal-x fs-1 text-secondary opacity-50"></i>
                                </div>
                                <h5 className="fw-800 text-dark">Bạn chưa tham gia kỳ thi nào.</h5>
                            </Col>
                        ) : results.map(res => (
                            <Col md={6} lg={4} key={res._id} className="mb-4">
                                <Card className="bg-white border-0 shadow-sm h-100 overflow-hidden rounded-4 hover-shadow transition-all">
                                    <div className="p-4 border-bottom border-light bg-light bg-opacity-50">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <Badge bg="primary" className="bg-opacity-10 text-primary px-2 py-1 rounded-pill fw-700 border border-primary border-opacity-25" style={{ fontSize: '0.7rem' }}>
                                                {res.exam?.classroom?.name || 'Môn học'}
                                            </Badge>
                                            <small className="text-muted fw-600"><i className="bi bi-calendar3 me-1"></i>{new Date(res.createdAt).toLocaleDateString()}</small>
                                        </div>
                                        <h6 className="card-title fw-800 mb-0 text-truncate text-dark" style={{ fontSize: '1.05rem' }}>{res.exam?.title}</h6>
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

                                        <Button variant="outline-primary" className="w-100 rounded-pill fw-bold border-2 shadow-sm" style={{ fontSize: '0.9rem' }}>
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
