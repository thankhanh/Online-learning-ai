import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, FileText, Settings, Book, BarChart2 } from 'lucide-react';
import { Card, Row, Col, Button, Badge } from 'react-bootstrap';
import api from '../../utils/api';

const LecturerDashboard = ({ user }) => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await api.get('/classrooms');
            if (res.data.success) {
                setClasses(res.data.classrooms);
            }
        } catch (err) {
            console.error('Error fetching classes:', err.message);
        } finally {
            setLoading(false);
        }
    };

    // Stats
    const stats = [
        { label: 'Tổng số sinh viên', value: classes.reduce((acc, c) => acc + (c.students?.length || 0), 0), icon: Users, color: 'info', bg: 'bg-info' },
        { label: 'Lớp học đang dạy', value: classes.length, icon: Book, color: 'primary', bg: 'bg-primary' },
        { label: 'Bài chấm chờ duyệt', value: '15', icon: FileText, color: 'warning', bg: 'bg-warning' },
    ];

    const quickActions = [
        { icon: Book, label: 'Tạo lớp học mới', route: '/classroom-management', color: 'primary' },
        { icon: FileText, label: 'Soạn đề thi', route: '/exam-management', color: 'success' },
        { icon: Users, label: 'Quản lý sinh viên', route: '/classroom-management', color: 'info' },
        { icon: BarChart2, label: 'Xem thống kê', route: '/dashboard', color: 'secondary' }, 
    ];

    return (
        <div className="container-fluid p-0">
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-end mb-4 text-white">
                <div>
                    <h1 className="h2 fw-bold mb-1">Chào mừng trở lại, {user.name}! 👨‍🏫</h1>
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
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row className="g-4">
                {/* Main Content Area */}
                <Col lg={8}>
                    <h4 className="text-white mb-3 fw-bold"><i className="bi bi-mortarboard me-2"></i> Lớp học của bạn</h4>
                    {loading ? (
                        <div className="text-center py-5 text-muted shadow-sm bg-dark rounded">Đang tải danh sách lớp học...</div>
                    ) : classes.length === 0 ? (
                        <Card className="bg-dark text-white border-secondary shadow-sm mb-3">
                            <Card.Body className="text-center py-4">
                                <p className="text-muted mb-3">Bạn chưa có lớp học nào.</p>
                                <Link to="/classroom-management">
                                    <Button variant="primary">Tạo lớp học ngay</Button>
                                </Link>
                            </Card.Body>
                        </Card>
                    ) : (
                        classes.map(cls => (
                            <Card key={cls._id} className="bg-dark text-white border-secondary shadow-sm mb-3 card-hover border-start border-4 border-primary">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <h5 className="card-title fw-bold mb-1">{cls.name}</h5>
                                            <span className="text-muted small">CODE: {cls.code}</span>
                                        </div>
                                        <Badge bg="success" className="p-2">Đang hoạt động</Badge>
                                    </div>
                                    <div className="d-flex gap-4 mb-3 text-light">
                                        <span><i className="bi bi-people-fill me-2 text-primary"></i> {cls.students?.length || 0} Sinh viên</span>
                                        <span><i className="bi bi-calendar-event me-2 text-info"></i> {cls.description || 'Chưa có mô tả'}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex gap-2">
                                            <Link to="/classroom-management">
                                                <Button variant="outline-primary" size="sm">Quản lý lớp</Button>
                                            </Link>
                                            <Link to="/document-management">
                                                <Button variant="outline-info" size="sm">Tài liệu</Button>
                                            </Link>
                                        </div>
                                        <Link to={`/virtual-classroom/${cls._id}`}>
                                            <Button variant="success" size="sm" className="fw-bold px-3">
                                                Vào dạy học <i className="bi bi-broadcast ms-1"></i>
                                            </Button>
                                        </Link>
                                    </div>
                                </Card.Body>
                            </Card>
                        ))
                    )}
                </Col>

                {/* Right Sidebar */}
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
                </Col>
            </Row>
        </div>
    );
};

export default LecturerDashboard;
