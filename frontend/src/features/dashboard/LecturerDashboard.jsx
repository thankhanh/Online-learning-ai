import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, FileText, Settings, Book, BarChart2, TrendingUp } from 'lucide-react';
import { Card, Row, Col, Button, Badge, Spinner } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../../utils/api';

const LecturerDashboard = ({ user }) => {
    const [classes, setClasses] = useState([]);
    const [statsData, setStatsData] = useState({ pendingGrading: 0 });
    const [chartData, setChartData] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('all');
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await api.get('/dashboard/stats');
            if (res.data.success) {
                setChartData(res.data.stats.examPerformance || []);
                // Get unique classrooms from engagement stats or create from examPerformance
                const uniqueClasses = res.data.stats.engagement || [];
                setClassrooms(uniqueClasses);
            }
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
        fetchStats();
    }, []);

    const fetchClasses = async () => {
        try {
            const [classRes, statsRes] = await Promise.all([
                api.get('/classrooms'),
                api.get('/exams/stats/lecturer')
            ]);
            
            if (classRes.data.success) {
                setClasses(classRes.data.classrooms);
            }
            if (statsRes.data.success) {
                setStatsData({ pendingGrading: statsRes.data.pendingGrading });
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err.message);
        } finally {
            setLoading(false);
        }
    };

    // Stats
    const stats = [
        { label: 'Tổng số sinh viên', value: classes.reduce((acc, c) => acc + (c.students?.length || 0), 0), icon: Users, color: 'info', bg: 'bg-info' },
        { label: 'Lớp học đang dạy', value: classes.length, icon: Book, color: 'primary', bg: 'bg-primary' },
        { label: 'Bài chấm chờ duyệt', value: statsData.pendingGrading, icon: FileText, color: 'warning', bg: 'bg-warning' },
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
            <div className="rounded-4 p-4 p-md-5 mb-4 text-white position-relative overflow-hidden shadow-sm" style={{ background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)' }}>
                <div className="position-relative z-1 d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-2">
                    <div>
                        <h1 className="display-6 fw-800 mb-2" style={{ letterSpacing: '-0.02em' }}>Chào mừng trở lại, {user.name}! 👨‍🏫</h1>
                        <p className="lead fw-500 mb-0" style={{ fontSize: '1.1rem', opacity: 0.9 }}>Đây là tổng quan tình hình giảng dạy của bạn hôm nay.</p>
                    </div>
                    <div className="mt-3 mt-md-0">
                        <span className="bg-white bg-opacity-25 px-3 py-2 rounded-pill fw-600 shadow-sm border border-white border-opacity-50">
                            <i className="bi bi-calendar3 me-2"></i>
                            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </div>
                {/* Decorative Pattern */}
                <div className="position-absolute top-0 end-0 opacity-25" style={{ transform: 'translate(10%, -20%)' }}>
                    <i className="bi bi-briefcase-fill" style={{ fontSize: '15rem' }}></i>
                </div>
            </div>

            {/* Stats Overview */}
            <Row className="g-4 mb-4">
                {stats.map((stat, idx) => (
                    <Col md={4} key={idx}>
                        <Card className="border-0 shadow-sm bg-white h-100 rounded-4 transition-fast hover-shadow-md">
                            <Card.Body className="d-flex align-items-center p-4">
                                <div className={`rounded-circle p-3 me-4 ${stat.bg} bg-opacity-10`}>
                                    <stat.icon size={32} className={`text-${stat.color}`} />
                                </div>
                                <div className="text-dark">
                                    <h3 className="mb-0 fw-800 text-dark" style={{ letterSpacing: '-0.03em' }}>{stat.value}</h3>
                                    <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>{stat.label}</small>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Performance Charts */}
            <Row className="g-4 mb-5">
                <Col lg={12}>
                    <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
                        <Card.Header className="bg-white border-0 pt-4 px-4 pb-0">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="fw-900 text-dark mb-0 d-flex align-items-center">
                                    <div className="bg-success bg-opacity-10 text-success rounded-circle p-2 me-2" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <TrendingUp size={20} />
                                    </div>
                                    Phân tích kết quả thi
                                </h5>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="text-muted small fw-700 d-none d-md-inline">CHỌN LỚP HỌC:</span>
                                    <select 
                                        className="form-select form-select-sm rounded-pill px-3 border-light shadow-sm fw-600 bg-light"
                                        style={{ width: '200px' }}
                                        value={selectedClassId}
                                        onChange={(e) => setSelectedClassId(e.target.value)}
                                    >
                                        <option value="all">Tất cả lớp học</option>
                                        {classrooms.map((cls, idx) => (
                                            <option key={idx} value={cls._id || cls.name}>{cls.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-4" style={{ height: '350px' }}>
                            {statsLoading ? (
                                <div className="h-100 d-flex align-items-center justify-content-center">
                                    <Spinner animation="border" variant="success" />
                                </div>
                            ) : (chartData.filter(item => selectedClassId === 'all' || item.classroomId === selectedClassId || item.classroomName === selectedClassId).length > 0) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData.filter(item => selectedClassId === 'all' || item.classroomId === selectedClassId || item.classroomName === selectedClassId)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 500 }} dy={10} />
                                        <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', shadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                            cursor={{ fill: '#f8fafc' }}
                                        />
                                        <Bar dataKey="avgScore" radius={[6, 6, 0, 0]} barSize={40}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.avgScore >= 8 ? '#10b981' : entry.avgScore >= 5 ? '#3b82f6' : '#ef4444'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted opacity-50">
                                    <i className="bi bi-bar-chart-line fs-1 mb-2"></i>
                                    <p className="fw-500">Chưa có đủ dữ liệu bài thi để hiển thị phân tích.</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4">
                {/* Main Content Area */}
                <Col lg={8}>
                    <h5 className="text-dark mb-3 fw-800 d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-2 me-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                            <i className="bi bi-mortarboard-fill fs-5"></i>
                        </div>
                        Lớp học của bạn
                    </h5>
                    
                    {loading ? (
                        <Card className="bg-white border-0 shadow-sm rounded-4"><Card.Body className="text-center py-5 text-muted fw-500"><div className="spinner-border spinner-border-sm text-primary me-2"></div> Đang tải danh sách lớp học...</Card.Body></Card>
                    ) : classes.length === 0 ? (
                        <Card className="bg-white border-0 shadow-sm mb-3 rounded-4">
                            <Card.Body className="text-center py-5">
                                <div className="text-muted mb-3"><i className="bi bi-journal-x display-4 text-secondary opacity-50"></i></div>
                                <h5 className="text-dark fw-bold mb-2">Bạn chưa có lớp học nào.</h5>
                                <p className="text-muted small">Hãy bắt đầu bằng cách tạo lớp học đầu tiên của bạn.</p>
                                <Link to="/classroom-management">
                                    <Button variant="primary" className="mt-2 rounded-pill px-4 fw-600 shadow-sm">Tạo lớp học ngay</Button>
                                </Link>
                            </Card.Body>
                        </Card>
                    ) : (
                        classes.map(cls => (
                            <Card key={cls._id} className="bg-white border-0 shadow-sm mb-3 rounded-4 transition-fast hover-shadow-md" style={{ borderLeft: '4px solid #10b981' }}>
                                <Card.Body className="p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-3 border-bottom pb-3">
                                        <div className="d-flex align-items-start">
                                            <div className="bg-success bg-opacity-10 rounded-4 p-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                                                <i className="bi bi-book fs-3 text-success"></i>
                                            </div>
                                            <div>
                                                <h5 className="card-title fw-800 mb-1 text-dark">{cls.name}</h5>
                                                <span className="bg-light px-2 py-1 rounded small fw-600 text-muted border">MÃ LỚP: <span className="text-dark">{cls.code}</span></span>
                                            </div>
                                        </div>
                                        <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill fw-600">Đang hoạt động</Badge>
                                    </div>
                                    <div className="d-flex flex-wrap gap-4 mb-3 text-dark">
                                        <span className="d-flex align-items-center bg-light px-3 py-2 rounded-3 text-muted fw-500 font-monospace" style={{ fontSize: '0.9rem' }}>
                                            <i className="bi bi-people-fill me-2 text-primary fs-5"></i> <span className="text-dark fw-bold me-1">{cls.students?.length || 0}</span> Học viên
                                        </span>
                                        <span className="d-flex align-items-center bg-light px-3 py-2 rounded-3 text-muted fw-500 text-truncate" style={{ fontSize: '0.9rem', maxWidth: '300px' }}>
                                            <i className="bi bi-calendar-event me-2 text-info fs-5"></i> {cls.description || 'Chưa có mô tả'}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center pt-2">
                                        <div className="d-flex gap-2">
                                            <Link to="/classroom-management">
                                                <Button variant="outline-success" size="sm" className="rounded-pill px-3 fw-600 border-2">Quản lý lớp</Button>
                                            </Link>
                                            <Link to="/document-management">
                                                <Button variant="outline-info" size="sm" className="rounded-pill px-3 fw-600 border-2">Tài liệu</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        ))
                    )}
                </Col>

                {/* Right Sidebar */}
                <Col lg={4}>
                    <h5 className="text-dark mb-3 fw-800 d-flex align-items-center">
                        <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-2 me-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                            <i className="bi bi-lightning-charge-fill fs-5"></i>
                        </div>
                        Thao tác nhanh
                    </h5>
                    
                    <Row className="g-3 mb-4">
                        {quickActions.map((action, idx) => (
                            <Col xs={6} key={idx}>
                                <Link to={action.route} className="text-decoration-none">
                                    <div className={`card bg-white border-0 text-center p-3 h-100 shadow-sm transition-fast hover-shadow-md rounded-4`} style={{ borderBottom: `4px solid var(--bs-${action.color})` }}>
                                        <div className={`text-${action.color} mb-2 bg-${action.color} bg-opacity-10 d-inline-flex p-3 rounded-circle mx-auto`}>
                                            <action.icon size={26} />
                                        </div>
                                        <small className="text-dark fw-bold mt-1 d-block">{action.label}</small>
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
