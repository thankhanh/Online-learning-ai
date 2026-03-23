import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, PlayCircle, Award, Calendar, Bell } from 'lucide-react';
import { Card, Row, Col, Button, Badge, ProgressBar } from 'react-bootstrap';
import api from '../../utils/api';

const StudentDashboard = ({ user }) => {
    const [courses, setCourses] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [courseRes, examRes] = await Promise.all([
                    api.get('/classrooms'),
                    api.get('/exams')
                ]);
                if (courseRes.data.success) setCourses(courseRes.data.classrooms);
                if (examRes.data.success) setExams(examRes.data.exams);
            } catch (err) {
                console.error('Error fetching dashboard data:', err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const stats = [
        { label: 'Khóa học đang học', value: courses.length, icon: BookOpen, color: 'primary', bg: 'bg-primary' },
        { label: 'Bài thi hiện có', value: exams.length, icon: Clock, color: 'warning', bg: 'bg-warning' },
        { label: 'Điểm trung bình', value: 'N/A', icon: Award, color: 'success', bg: 'bg-success' },
    ];

    return (
        <div className="container-fluid p-0">
            {/* Hero Section */}
            <div className="rounded-3 p-4 mb-4 text-white position-relative overflow-hidden shadow-sm" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%)' }}>
                <div className="position-relative z-1">
                    <h1 className="display-5 fw-bold mb-2">Xin chào, {user.displayName || user.name}! 👋</h1>
                    <p className="lead mb-4">Bạn đang tham gia <strong>{courses.length} khóa học</strong> và có <strong>{exams.length} bài kiểm tra</strong> đang chờ.</p>
                    <div className="d-flex gap-3">
                        <Button variant="light" className="text-primary fw-bold shadow-sm">
                            <i className="bi bi-play-circle-fill me-2"></i> Tiếp tục học
                        </Button>
                        <Button variant="outline-light" className="fw-bold">
                            Xem lịch học
                        </Button>
                    </div>
                </div>
                {/* Decorative Pattern */}
                <div className="position-absolute top-0 end-0 opacity-25" style={{ transform: 'translate(20%, -20%)' }}>
                    <i className="bi bi-mortarboard-fill" style={{ fontSize: '15rem' }}></i>
                </div>
            </div>

            {/* Stats Components */}
            <Row className="g-4 mb-4">
                {stats.map((stat, idx) => (
                    <Col md={4} key={idx}>
                        <Card className="border-0 shadow-sm bg-dark text-white h-100">
                            <Card.Body className="d-flex align-items-center">
                                <div className={`rounded-circle p-3 me-3 ${stat.bg} bg-opacity-25`}>
                                    <stat.icon size={24} className={`text-${stat.color}`} />
                                </div>
                                <div className="text-white text-bottom">
                                    <h4 className="mb-0 fw-bold">{stat.value}</h4>
                                    <small className="text-white">{stat.label}</small>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row className="g-4">
                {/* Active Courses */}
                <Col lg={8}>
                    <h4 className="text-white mb-3 fw-bold"><i className="bi bi-collection-play me-2"></i> Khóa học của tôi</h4>
                    {courses.length === 0 ? (
                        <Card className="bg-dark text-white border-secondary shadow-sm mb-4">
                            <Card.Body className="text-center py-5">
                                <h5 className="text-muted">Bạn chưa tham gia khóa học nào.</h5>
                                <Link to="/classroom-management">
                                    <Button variant="primary" className="mt-3">Tham gia ngay</Button>
                                </Link>
                            </Card.Body>
                        </Card>
                    ) : courses.map(course => (
                        <Card key={course._id} className="bg-dark text-white border-secondary shadow-sm mb-4">
                            <Card.Body>
                                <div className="d-flex align-items-start mb-3 border-bottom border-secondary pb-3">
                                    <div className="bg-gradient bg-primary rounded p-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                        <i className="bi bi-cpu fs-3 text-white"></i>
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between">
                                            <h5 className="card-title fw-bold mb-1">{course.name}</h5>
                                            <Badge bg="success">Đang diễn ra</Badge>
                                        </div>
                                        <p className="card-text text-muted small mb-2">Giảng viên: {course.lecturer?.name || 'Chưa cập nhật'}</p>
                                        <div className="d-flex align-items-center">
                                            <small className="text-muted me-2">Tiến độ:</small>
                                            <ProgressBar now={0} variant="info" style={{ height: '6px', width: '100px' }} className="me-2" />
                                            <small className="text-info">0%</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-end gap-2">
                                    <Link to="/learning-center">
                                        <Button variant="outline-light" size="sm">Tài liệu</Button>
                                    </Link>
                                    <Link to={`/virtual-classroom/${course._id}`}>
                                        <Button variant="primary" size="sm">Vào lớp học</Button>
                                    </Link>
                                </div>
                            </Card.Body>
                        </Card>
                    ))}
                </Col>

                {/* Sidebar: Exams & Notifications */}
                <Col lg={4}>
                    {/* Upcoming Exams */}
                    <Card className="bg-dark text-white border-0 shadow-lg mb-4 overflow-hidden" style={{ borderRadius: '15px' }}>
                        <Card.Header className="bg-danger bg-opacity-10 border-0 text-danger fw-bold d-flex align-items-center p-3">
                            <Clock className="me-2" size={20} /> Bài kiểm tra sắp tới
                        </Card.Header>
                        <Card.Body className="p-3">
                            {exams.length === 0 ? (
                                <div className="text-center py-4">
                                    <i className="bi bi-calendar-x fs-2 text-muted d-block mb-2"></i>
                                    <p className="text-muted small m-0">Không có bài thi sắp tới</p>
                                </div>
                            ) : exams.slice(0, 3).map(exam => (
                                <div key={exam._id} className="d-flex align-items-center mb-3 p-2 rounded hover-bg-secondary transition-all" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    <div className="me-3 text-center bg-danger bg-opacity-10 rounded p-2" style={{ minWidth: '55px' }}>
                                        <h5 className="mb-0 fw-bold text-danger">{exam.duration}</h5>
                                        <div className="text-muted" style={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>phút</div>
                                    </div>
                                    <div className="flex-grow-1 overflow-hidden">
                                        <h6 className="mb-0 fw-bold text-truncate" style={{ fontSize: '0.9rem' }}>{exam.title}</h6>
                                        <small className="text-muted d-block text-truncate" style={{ fontSize: '0.75rem' }}>{exam.classroom?.name}</small>
                                    </div>
                                    <Link to={`/exam-room/${exam._id}`} className="ms-2">
                                        <Button variant="danger" size="sm" className="rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '32px', height: '32px' }}>
                                            <i className="bi bi-play-fill fs-5"></i>
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>

                    {/* Quick Notifications */}
                    <Card className="bg-dark text-white border-0 shadow-lg" style={{ borderRadius: '15px' }}>
                        <Card.Header className="bg-primary bg-opacity-10 border-0 text-primary fw-bold d-flex align-items-center p-3">
                            <Bell className="me-2" size={20} /> Thông báo mới
                        </Card.Header>
                        <Card.Body className="p-3">
                            <ul className="list-unstyled mb-0">
                                <li className="mb-3 p-2 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    <div className="d-flex align-items-start">
                                        <div className="bg-info bg-opacity-20 p-2 rounded me-3">
                                            <i className="bi bi-info-circle-fill text-info"></i>
                                        </div>
                                        <div>
                                            <h6 className="mb-1 fw-bold" style={{ fontSize: '0.85rem' }}>Bảo trì hệ thống</h6>
                                            <p className="text-muted mb-1" style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>Hệ thống bảo trì vào 12:00 PM mai.</p>
                                            <small className="text-secondary" style={{ fontSize: '0.65rem' }}>2 giờ trước</small>
                                        </div>
                                    </div>
                                </li>
                                <li className="p-2 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    <div className="d-flex align-items-start">
                                        <div className="bg-success bg-opacity-20 p-2 rounded me-3">
                                            <i className="bi bi-check-circle-fill text-success"></i>
                                        </div>
                                        <div>
                                            <h6 className="mb-1 fw-bold" style={{ fontSize: '0.85rem' }}>Kết quả bài tập</h6>
                                            <p className="text-muted mb-1" style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>Bài tập "Linear Regression" đã được chấm.</p>
                                            <small className="text-secondary" style={{ fontSize: '0.65rem' }}>5 giờ trước</small>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            <div className="text-center mt-3 pt-2 border-top border-secondary border-opacity-25">
                                <Link to="/notifications" className="text-decoration-none small text-primary fw-bold">
                                    Xem tất cả <i className="bi bi-arrow-right"></i>
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default StudentDashboard;
