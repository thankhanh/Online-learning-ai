import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, FileText, Settings, Book, BarChart2 } from 'lucide-react';
import { Card, Row, Col, Button, Badge } from 'react-bootstrap';

const LecturerDashboard = ({ user }) => {
    // Mock Stats
    const stats = [
        { label: 'Tổng số sinh viên', value: '128', icon: Users, color: 'info', bg: 'bg-info' },
        { label: 'Lớp học đang dạy', value: '3', icon: Book, color: 'primary', bg: 'bg-primary' },
        { label: 'Bài chấm chờ duyệt', value: '15', icon: FileText, color: 'warning', bg: 'bg-warning' },
    ];

    const quickActions = [
        { icon: Book, label: 'Tạo lớp học mới', route: '/classroom-management', color: 'primary' },
        { icon: FileText, label: 'Soạn đề thi', route: '/exam-management', color: 'success' },
        { icon: Users, label: 'Quản lý sinh viên', route: '/classroom-management', color: 'info' },
        { icon: BarChart2, label: 'Xem thống kê', route: '/dashboard', color: 'secondary' }, // Placeholder route
    ];

    return (
        <div className="container-fluid p-0">
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-end mb-4 text-white">
                <div>
                    <h1 className="h2 fw-bold mb-1">Chào mừng trở lại, Giảng viên! 👨‍🏫</h1>
                    <p className="text-muted mb-0">Đây là tổng quan tình hình giảng dạy của bạn hôm nay.</p>
                </div>
                <div>
                    <span className="text-light me-2">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {/* Stats Overview */}
            <Row className="g-4 mb-5">
                {stats.map((stat, idx) => (
                    <Col md={4} key={idx}>
                        <Card className="border-0 shadow-sm bg-dark text-white h-100 position-relative overflow-hidden">
                            <Card.Body className="d-flex align-items-center p-4">
                                <div className={`rounded-circle p-3 me-3 ${stat.bg} bg-opacity-10`}>
                                    <stat.icon size={28} className={`text-${stat.color}`} />
                                </div>
                                <div>
                                    <h3 className="mb-0 fw-bold">{stat.value}</h3>
                                    <span className="text-muted">{stat.label}</span>
                                </div>
                                {/* Background Icon Decoration */}
                                <stat.icon
                                    size={100}
                                    className={`position-absolute text-${stat.color} opacity-10`}
                                    style={{ right: '-20px', bottom: '-20px', opacity: 0.05 }}
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row className="g-4">
                {/* Main Content Area */}
                <Col lg={8}>
                    <h4 className="text-white mb-3 fw-bold"><i className="bi bi-mortarboard me-2"></i> Lớp học của bạn</h4>
                    <Card className="bg-dark text-white border-secondary shadow-sm mb-3">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h5 className="card-title fw-bold mb-1">Lớp AI Cơ bản - CS101</h5>
                                    <span className="text-muted small">Học kỳ 1, 2023-2024</span>
                                </div>
                                <Badge bg="success" className="p-2">Đang hoạt động</Badge>
                            </div>
                            <div className="d-flex gap-4 mb-3 text-light">
                                <span><i className="bi bi-people-fill me-2"></i> 45 Sinh viên</span>
                                <span><i className="bi bi-calendar-event me-2"></i> T2, T4 (07:00 - 09:00)</span>
                            </div>
                            <div className="d-flex gap-2">
                                <Link to="/classroom-management">
                                    <Button variant="outline-primary" size="sm">Quản lý lớp</Button>
                                </Link>
                                <Link to="/document-management">
                                    <Button variant="outline-info" size="sm">Tài liệu</Button>
                                </Link>
                                <Link to="/exam-management">
                                    <Button variant="outline-warning" size="sm">Bài thi</Button>
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="bg-dark text-white border-secondary shadow-sm">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h5 className="card-title fw-bold mb-1">Lớp Machine Learning - CS102</h5>
                                    <span className="text-muted small">Học kỳ 1, 2023-2024</span>
                                </div>
                                <Badge bg="secondary" className="p-2">Sắp khai giảng</Badge>
                            </div>
                            <div className="d-flex gap-4 mb-3 text-light">
                                <span><i className="bi bi-people-fill me-2"></i> 38 Sinh viên</span>
                                <span><i className="bi bi-calendar-event me-2"></i> T3, T5 (09:00 - 11:00)</span>
                            </div>
                            <div className="d-flex gap-2">
                                <Button variant="outline-secondary" size="sm">Chi tiết</Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right Sidebar: Quick Actions & Alerts */}
                <Col lg={4}>
                    <h4 className="text-white mb-3 fw-bold"><i className="bi bi-lightning-charge me-2"></i> Thao tác nhanh</h4>
                    <Row className="g-3 mb-4">
                        {quickActions.map((action, idx) => (
                            <Col xs={6} key={idx}>
                                <Link to={action.route} className="text-decoration-none">
                                    <div className={`card bg-dark border-${action.color} text-center p-3 h-100 shadow-sm card-hover`} style={{ borderTop: '3px solid', transition: 'transform 0.2s' }}>
                                        <div className={`text-${action.color} mb-2`}>
                                            <action.icon size={24} />
                                        </div>
                                        <small className="text-white fw-medium">{action.label}</small>
                                    </div>
                                </Link>
                            </Col>
                        ))}
                    </Row>

                    <Card className="bg-dark text-white border-warning shadow-sm">
                        <Card.Header className="bg-transparent border-warning text-warning fw-bold">
                            <i className="bi bi-exclamation-triangle me-2"></i> Cần chú ý
                        </Card.Header>
                        <Card.Body>
                            <ul className="list-group list-group-flush bg-transparent">
                                <li className="list-group-item bg-transparent text-white border-secondary px-0">
                                    <div className="d-flex justify-content-between">
                                        <span>Duyệt 5 bài thi muộn</span>
                                        <Button variant="link" size="sm" className="p-0 text-warning">Xem ngay</Button>
                                    </div>
                                </li>
                                <li className="list-group-item bg-transparent text-white border-secondary px-0">
                                    <div className="d-flex justify-content-between">
                                        <span>Cập nhật đề cương CS101</span>
                                        <Button variant="link" size="sm" className="p-0 text-warning">Chi tiết</Button>
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

export default LecturerDashboard;
