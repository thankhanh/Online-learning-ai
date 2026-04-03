import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, PlayCircle, Award, Calendar, Bell } from 'lucide-react';
import { Card, Row, Col, Button, Badge, ProgressBar } from 'react-bootstrap';
import api from '../../utils/api';

const StudentDashboard = ({ user }) => {
    const [courses, setCourses] = useState([]);
    const [exams, setExams] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [statsData, setStatsData] = useState({ gpa: 'N/A', examCount: 0 });
    const [courseProgress, setCourseProgress] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [courseRes, examRes, notifRes, statsRes] = await Promise.all([
                    api.get('/classrooms'),
                    api.get('/exams'),
                    api.get('/notifications'),
                    api.get('/exams/stats/me')
                ]);
                if (courseRes.data.success) {
                    setCourses(courseRes.data.classrooms);
                    // Fetch progress for each course
                    courseRes.data.classrooms.forEach(async (course) => {
                        try {
                            const pRes = await api.get(`/classrooms/${course._id}/progress`);
                            if (pRes.data.success) {
                                setCourseProgress(prev => ({ ...prev, [course._id]: pRes.data.progress }));
                            }
                        } catch (err) {
                            console.error(`Error fetching progress for ${course._id}:`, err);
                        }
                    });
                }
                if (examRes.data.success) setExams(examRes.data.exams);
                if (notifRes.data.success) setNotifications(notifRes.data.notifications.slice(0, 3));
                if (statsRes.data.success) setStatsData(statsRes.data.stats);
            } catch (err) {
                console.error('Error fetching dashboard data:', err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getNotifIcon = (type) => {
        switch (type) {
            case 'system': return <i className="bi bi-info-circle-fill"></i>;
            case 'course': return <i className="bi bi-journal-check"></i>;
            case 'exam': return <i className="bi bi-pencil-square"></i>;
            default: return <i className="bi bi-bell-fill"></i>;
        }
    };

    const getNotifBg = (type) => {
        switch (type) {
            case 'system': return 'bg-info border-info';
            case 'course': return 'bg-success border-success';
            case 'exam': return 'bg-danger border-danger';
            default: return 'bg-primary border-primary';
        }
    };

    const stats = [
        { label: 'Khóa học đang học', value: courses.length, icon: BookOpen, color: 'primary', bg: 'bg-primary' },
        { label: 'Bài thi hiện có', value: exams.length, icon: Clock, color: 'warning', bg: 'bg-warning' },
        { label: 'Điểm trung bình', value: statsData.gpa, icon: Award, color: 'success', bg: 'bg-success' },
    ];

    return (
        <div className="container-fluid p-0">
            {/* Hero Section */}
            <div className="rounded-4 p-4 p-md-5 mb-4 text-white position-relative overflow-hidden shadow-sm" style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, #4db8ff 100%)' }}>
                <div className="position-relative z-1">
                    <h1 className="display-6 fw-800 mb-2" style={{ letterSpacing: '-0.02em' }}>Xin chào, {user.displayName || user.name}! 👋</h1>
                    <p className="lead fw-500 mb-4" style={{ fontSize: '1.1rem', opacity: 0.9 }}>Bạn đang tham gia <strong>{courses.length} khóa học</strong> và có <strong>{exams.length} bài kiểm tra</strong> đang chờ.</p>
                    <div className="d-flex gap-3 mt-2">
                        <Button variant="light" className="text-primary fw-bold px-4 rounded-pill shadow-sm">
                            <i className="bi bi-play-circle-fill me-2"></i> Tiếp tục học
                        </Button>
                        <Button variant="outline-light" className="fw-bold px-4 rounded-pill">
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
                        <Card className="border-0 shadow-sm bg-white h-100 rounded-4 transition-fast hover-shadow-md">
                            <Card.Body className="d-flex align-items-center p-4">
                                <div className={`rounded-circle p-3 me-3 ${stat.bg} bg-opacity-10`}>
                                    <stat.icon size={28} className={`text-${stat.color}`} />
                                </div>
                                <div className="text-dark">
                                    <h3 className="mb-0 fw-800 text-dark" style={{ letterSpacing: '-0.03em' }}>{stat.value}</h3>
                                    <small className="text-muted fw-600 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>{stat.label}</small>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row className="g-4">
                {/* Active Courses */}
                <Col lg={8}>
                    <h5 className="text-dark mb-3 fw-800 d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-2 me-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                            <i className="bi bi-journal-bookmark-fill fs-5"></i>
                        </div>
                        Khóa học của tôi
                    </h5>
                    
                    {courses.length === 0 ? (
                        <Card className="bg-white border-0 shadow-sm mb-4 rounded-4">
                            <Card.Body className="text-center py-5">
                                <div className="text-muted mb-3"><i className="bi bi-folder-x display-4 text-secondary opacity-50"></i></div>
                                <h5 className="text-dark fw-bold">Bạn chưa tham gia khóa học nào.</h5>
                                <p className="text-muted small">Hãy khám phá các khóa học hấp dẫn trong hệ thống.</p>
                                <Link to="/classroom-management">
                                    <Button variant="primary" className="mt-2 rounded-pill px-4 fw-600 shadow-sm">Tham gia ngay</Button>
                                </Link>
                            </Card.Body>
                        </Card>
                    ) : courses.map(course => (
                        <Card key={course._id} className="bg-white border-0 shadow-sm mb-3 rounded-4 transition-fast" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-start mb-3 border-bottom pb-3">
                                    <div className="bg-light rounded-4 p-3 me-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '64px', height: '64px' }}>
                                        <i className="bi bi-laptop fs-2 text-primary"></i>
                                    </div>
                                    <div className="flex-grow-1 pt-1">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <h5 className="card-title fw-800 mb-1 text-dark">{course.name}</h5>
                                            <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill fw-600 small">Đang học</Badge>
                                        </div>
                                        <p className="card-text text-muted small mb-3">
                                            <i className="bi bi-person-video3 me-1"></i> Giảng viên: <span className="fw-600 text-dark">{course.lecturer?.name || 'Chưa cập nhật'}</span>
                                        </p>
                                        <div className="d-flex align-items-center bg-light p-2 rounded-3">
                                            <small className="text-muted fw-600 me-2" style={{ fontSize: '0.75rem' }}>TIẾN ĐỘ</small>
                                            <ProgressBar now={courseProgress[course._id] || 0} className="flex-grow-1 mx-2 bg-white" style={{ height: '8px' }}>
                                                <ProgressBar variant="primary" now={courseProgress[course._id] || 0} />
                                            </ProgressBar>
                                            <small className="text-primary fw-800">{courseProgress[course._id] || 0}%</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-end gap-2 mt-2">
                                    <Link to="/learning-center">
                                        <Button variant="outline-primary" size="sm" className="rounded-pill px-3 fw-600 border-2 shadow-sm">
                                            <i className="bi bi-folder2-open me-1"></i> Tài liệu
                                        </Button>
                                    </Link>
                                    <Link to={`/virtual-classroom/${course._id}`}>
                                        <Button variant="primary" size="sm" className="rounded-pill px-4 fw-600 shadow-sm border-0 d-flex align-items-center" style={{ background: 'linear-gradient(135deg, var(--primary-color), #4db8ff)'}}>
                                            Vào lớp <i className="bi bi-arrow-right-short fs-5 ms-1"></i>
                                        </Button>
                                    </Link>
                                </div>
                            </Card.Body>
                        </Card>
                    ))}
                </Col>

                {/* Sidebar: Exams & Notifications */}
                <Col lg={4}>
                    {/* Upcoming Exams */}
                    <Card className="bg-white border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
                        <Card.Header className="bg-white border-bottom-0 pt-4 pb-2 px-4">
                            <h6 className="fw-800 text-dark mb-0 d-flex align-items-center">
                                <div className="bg-danger bg-opacity-10 text-danger rounded-circle p-1 me-2" style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Clock size={16} />
                                </div>
                                Kiểm tra sắp tới
                            </h6>
                        </Card.Header>
                        <Card.Body className="p-4 pt-2">
                            {exams.length === 0 ? (
                                <div className="text-center py-4 bg-light rounded-3">
                                    <i className="bi bi-calendar-check fs-2 text-muted d-block mb-2 opacity-50"></i>
                                    <p className="text-muted small fw-500 m-0">Tuyệt vời! Không có bài thi nào sắp tới</p>
                                </div>
                            ) : exams.slice(0, 3).map(exam => (
                                <div key={exam._id} className="d-flex align-items-center mb-3 p-3 rounded-4 bg-light border border-white shadow-sm transition-fast hover-shadow">
                                    <div className="me-3 text-center bg-white rounded-3 p-2 shadow-sm border border-danger border-opacity-10" style={{ minWidth: '60px' }}>
                                        <h4 className="mb-0 fw-800 text-danger" style={{ letterSpacing: '-0.05em' }}>{exam.duration}</h4>
                                        <div className="text-muted fw-bold" style={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>phút</div>
                                    </div>
                                    <div className="flex-grow-1 overflow-hidden">
                                        <h6 className="mb-1 fw-bold text-dark text-truncate" style={{ fontSize: '0.95rem' }}>{exam.title}</h6>
                                        <small className="text-muted d-block text-truncate fw-500" style={{ fontSize: '0.8rem' }}>
                                            <i className="bi bi-journal-text me-1"></i> {exam.classroom?.name}
                                        </small>
                                    </div>
                                    <Link to={`/exam-room/${exam._id}`} className="ms-2">
                                        <Button variant="danger" size="sm" className="rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #dc3545, #fd7e14)', border: 'none' }}>
                                            <i className="bi bi-play-fill fs-5 text-white" style={{ marginLeft: '2px' }}></i>
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>

                    {/* Quick Notifications */}
                    <Card className="bg-white border-0 shadow-sm rounded-4 h-100">
                        <Card.Header className="bg-white border-bottom-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center">
                            <h6 className="fw-800 text-dark mb-0 d-flex align-items-center">
                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-1 me-2" style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Bell size={16} />
                                </div>
                                Thông báo mới
                            </h6>
                            {notifications.length > 0 && <Badge bg="danger" pill className="fw-bold px-2 py-1" style={{ fontSize: '0.65rem' }}>{notifications.filter(n => !n.read).length} MỚI</Badge>}
                        </Card.Header>
                        <Card.Body className="p-4 pt-2">
                            <ul className="list-unstyled mb-0">
                                {notifications.length > 0 ? (
                                    notifications.map((notif, idx) => (
                                        <li key={notif._id || idx} className={`mb-3 p-3 rounded-4 border border-opacity-25 transition-fast hover-bg-light ${getNotifBg(notif.type)} bg-opacity-10`}>
                                            <div className="d-flex align-items-start">
                                                <div className="bg-white p-2 rounded-circle shadow-sm me-3 mt-1 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', minWidth: '32px' }}>
                                                    <span className={`text-${notif.type === 'system' ? 'info' : notif.type === 'course' ? 'success' : notif.type === 'exam' ? 'danger' : 'primary'}`}>
                                                        {getNotifIcon(notif.type)}
                                                    </span>
                                                </div>
                                                <div className="overflow-hidden">
                                                    <h6 className="mb-1 fw-800 text-dark text-truncate" style={{ fontSize: '0.9rem' }}>{notif.title}</h6>
                                                    <p className="text-secondary mb-1 fw-500 text-truncate-2" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>{notif.content}</p>
                                                    <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>{new Date(notif.createdAt).toLocaleDateString('vi-VN')}</small>
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <div className="text-center py-4 opacity-50">
                                        <i className="bi bi-bell-slash fs-3 mb-2 d-block"></i>
                                        <small className="fw-600">Không có thông báo mới nào</small>
                                    </div>
                                )}
                            </ul>
                            <div className="text-center mt-auto pt-3">
                                <Link to="/notifications" className="btn btn-light w-100 rounded-pill text-primary fw-bold text-decoration-none shadow-sm transition-fast hover-bg-primary hover-text-white" style={{ fontSize: '0.85rem' }}>
                                    Xem tất cả <i className="bi bi-arrow-right ms-1"></i>
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
