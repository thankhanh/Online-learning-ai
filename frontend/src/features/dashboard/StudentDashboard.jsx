import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, PlayCircle, Award, Calendar, Bell } from 'lucide-react';
import { Card, Row, Col, Button, Badge, ProgressBar } from 'react-bootstrap';

const StudentDashboard = ({ user }) => {
    // Mock Data
    const stats = [
        { label: 'Khóa học đang học', value: '4', icon: BookOpen, color: 'primary', bg: 'bg-primary' },
        { label: 'Bài tập chưa nộp', value: '2', icon: Clock, color: 'warning', bg: 'bg-warning' },
        { label: 'Điểm trung bình', value: '8.5', icon: Award, color: 'success', bg: 'bg-success' },
    ];

    const upcomingExams = [
        { id: 1, title: 'Giữa kỳ: Trí tuệ nhân tạo', time: '10:00 AM - Hôm nay', duration: '60p', status: 'upcoming' },
        { id: 2, title: 'Quiz: Machine Learning', time: '14:00 PM - 20/10', duration: '15p', status: 'later' },
    ];

    return (
        <div className="container-fluid p-0">
            {/* Hero Section */}
            <div className="rounded-3 p-4 mb-4 text-white position-relative overflow-hidden shadow-sm" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%)' }}>
                <div className="position-relative z-1">
                    <h1 className="display-5 fw-bold mb-2">Xin chào, {user.displayName || user.name}! 👋</h1>
                    <p className="lead mb-4">Bạn có <strong>2 bài kiểm tra</strong> và <strong>3 bài tập</strong> cần hoàn thành trong tuần này.</p>
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
                    <Card className="bg-dark text-white border-secondary shadow-sm mb-4">
                        <Card.Body>
                            <div className="d-flex align-items-start mb-3 border-bottom border-secondary pb-3">
                                <div className="bg-gradient bg-primary rounded p-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                    <i className="bi bi-cpu fs-3 text-white"></i>
                                </div>
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between">
                                        <h5 className="card-title fw-bold mb-1">Nhập môn Trí tuệ Nhân tạo</h5>
                                        <Badge bg="success" className="animate-pulse">Đang diễn ra</Badge>
                                    </div>
                                    <p className="card-text text-muted small mb-2">Giảng viên: TS. Nguyễn Văn A</p>
                                    <div className="d-flex align-items-center">
                                        <small className="text-muted me-2">Tiến độ:</small>
                                        <ProgressBar now={65} variant="info" style={{ height: '6px', width: '100px' }} className="me-2" />
                                        <small className="text-info">65%</small>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                                <Link to="/learning-center">
                                    <Button variant="outline-light" size="sm">Tài liệu</Button>
                                </Link>
                                <Link to="/virtual-classroom/1">
                                    <Button variant="primary" size="sm">Vào lớp học</Button>
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="bg-dark text-white border-secondary shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-start mb-3 border-bottom border-secondary pb-3">
                                <div className="bg-gradient bg-success rounded p-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                    <i className="bi bi-graph-up fs-3 text-white"></i>
                                </div>
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between">
                                        <h5 className="card-title fw-bold mb-1">Học máy (Machine Learning)</h5>
                                        <Badge bg="secondary">Sắp tới</Badge>
                                    </div>
                                    <p className="card-text text-muted small mb-2">Giảng viên: ThS. Trần Thị B</p>
                                    <div className="d-flex align-items-center">
                                        <small className="text-muted me-2">Tiến độ:</small>
                                        <ProgressBar now={10} variant="success" style={{ height: '6px', width: '100px' }} className="me-2" />
                                        <small className="text-success">10%</small>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                                <Button variant="outline-light" size="sm" disabled>Tài liệu</Button>
                                <Button variant="outline-secondary" size="sm" disabled>Chưa bắt đầu</Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Sidebar: Exams & Notifications */}
                <Col lg={4}>
                    {/* Upcoming Exams */}
                    <Card className="bg-dark text-white border-danger mb-4 shadow-sm">
                        <Card.Header className="bg-transparent border-danger text-danger fw-bold d-flex align-items-center">
                            <Clock className="me-2" size={18} /> Bài kiểm tra sắp tới
                        </Card.Header>
                        <Card.Body>
                            {upcomingExams.map(exam => (
                                <div key={exam.id} className="d-flex align-items-center mb-3 last:mb-0">
                                    <div className="me-3 text-center">
                                        <h5 className="mb-0 fw-bold text-danger">{exam.time.split(' ')[0]}</h5>
                                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>{exam.time.split(' - ')[1]}</small>
                                    </div>
                                    <div className="flex-grow-1">
                                        <h6 className="mb-0 fw-semibold">{exam.title}</h6>
                                        <small className="text-muted">Thời lượng: {exam.duration}</small>
                                    </div>
                                    {exam.status === 'upcoming' && (
                                        <Link to={`/exam-room/${exam.id}`}>
                                            <Button variant="danger" size="sm" className="rounded-pill px-3">Thi</Button>
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </Card.Body>
                    </Card>

                    {/* Quick Notifications */}
                    <Card className="bg-dark text-white border-secondary shadow-sm">
                        <Card.Header className="bg-transparent border-secondary fw-bold d-flex align-items-center">
                            <Bell className="me-2" size={18} /> Thông báo mới
                        </Card.Header>
                        <Card.Body>
                            <ul className="list-unstyled mb-0">
                                <li className="mb-3">
                                    <div className="d-flex">
                                        <i className="bi bi-info-circle-fill text-info me-2"></i>
                                        <div>
                                            <small>Hệ thống bảo trì vào 12:00 PM mai.</small>
                                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>2 giờ trước</div>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div className="d-flex">
                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                        <div>
                                            <small>Bài tập "Linear Regression" đã được chấm.</small>
                                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>5 giờ trước</div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default StudentDashboard;
