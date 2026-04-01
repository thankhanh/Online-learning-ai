import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Row, Col, Table, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function ClassroomManagement({ user }) {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [newClass, setNewClass] = useState({ name: '', description: '' });
    const [joinCode, setJoinCode] = useState('');
    const navigate = useNavigate();

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

    const handleCreateClass = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/classrooms', newClass);
            if (res.data.success) {
                setClasses([...classes, res.data.classroom]);
                setShowCreateModal(false);
                setNewClass({ name: '', description: '' });
                alert('Tạo lớp học thành công!');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể tạo lớp học.');
        }
    };

    const handleJoinClass = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/classrooms/join', { code: joinCode });
            if (res.data.success) {
                setClasses([...classes, res.data.classroom]);
                setShowJoinModal(false);
                setJoinCode('');
                alert('Tham gia lớp học thành công!');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể tham gia lớp học. Vui lòng kiểm tra mã code.');
        }
    };

    const handleClassClick = (cls) => {
        setSelectedClass(cls);
        setShowModal(true);
    };

    if (loading) return (
        <div className="vh-100 d-flex flex-column align-items-center justify-content-center bg-light text-dark">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <h5 className="fw-800">Đang tải dữ liệu...</h5>
        </div>
    );

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-4 me-3 text-primary shadow-sm border border-primary border-opacity-10">
                        <i className="bi bi-bank fs-3"></i>
                    </div>
                    <div>
                        <h2 className="fw-800 mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>Quản lý Lớp học</h2>
                        <p className="text-muted fw-500 mb-0">Quản lý các lớp học đang tham gia hoặc giảng dạy</p>
                    </div>
                </div>
                {user?.role === 'lecturer' ? (
                    <Button variant="primary" onClick={() => setShowCreateModal(true)} className="rounded-pill px-4 fw-bold shadow-sm" style={{ background: 'linear-gradient(135deg, var(--primary-color), #4db8ff)', border: 'none' }}>
                        <i className="bi bi-plus-lg me-2"></i>Tạo lớp mới
                    </Button>
                ) : (
                    <Button variant="success" onClick={() => setShowJoinModal(true)} className="rounded-pill px-4 fw-bold shadow-sm" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', border: 'none' }}>
                        <i className="bi bi-door-open me-2"></i>Tham gia lớp học
                    </Button>
                )}
            </div>

            <Row>
                {classes.length === 0 ? (
                    <Col className="text-center text-muted py-5">
                        <div className="bg-light rounded-circle d-inline-flex p-4 mb-3 shadow-sm border">
                            <i className="bi bi-journal-x fs-1 text-secondary opacity-50"></i>
                        </div>
                        <h5 className="fw-800 text-dark">Chưa có lớp học nào.</h5>
                    </Col>
                ) : classes.map(cls => (
                    <Col md={4} key={cls._id} className="mb-4">
                        <Card className="h-100 shadow-sm bg-white border-0 rounded-4 hover-shadow transition-all" role="button" onClick={() => handleClassClick(cls)}>
                            <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <Badge bg="success" className="bg-opacity-10 text-success px-3 py-2 rounded-pill fw-600 border border-success border-opacity-25">
                                        Đang diễn ra
                                    </Badge>
                                    <div className="bg-light px-3 py-1 rounded-pill border">
                                        <small className="text-primary fw-800" style={{ letterSpacing: '0.05em' }}>CODE: {cls.code}</small>
                                    </div>
                                </div>
                                <Card.Title className="fw-800 text-dark mb-2 fs-5">{cls.name}</Card.Title>
                                <Card.Text className="text-muted small fw-500 line-clamp-2" style={{ minHeight: '40px' }}>{cls.description}</Card.Text>
                                <div className="d-flex align-items-center text-dark mt-4 bg-light p-3 rounded-3 border">
                                    <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3 text-primary">
                                        <i className="bi bi-people-fill fs-5"></i>
                                    </div>
                                    <span className="fw-700">{cls.students?.length || 0} Sinh viên</span>
                                </div>
                            </Card.Body>
                            <Card.Footer className="bg-light bg-opacity-50 border-0 p-3 d-flex justify-content-between align-items-center border-top border-light">
                                <Button variant="link" className="text-primary text-decoration-none fw-700 p-0 fs-6">
                                    Xem chi tiết <i className="bi bi-arrow-right align-middle"></i>
                                </Button>
                                <Button 
                                    variant={user?.role === 'lecturer' ? "success" : "primary"} 
                                    size="sm" 
                                    className="px-4 py-2 rounded-pill fw-bold shadow-sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/virtual-classroom/${cls._id}`);
                                    }}
                                >
                                    {user?.role === 'lecturer' ? 'Vào dạy' : 'Vào học'} <i className="bi bi-broadcast ms-1"></i>
                                </Button>
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Modal Tạo lớp học */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered contentClassName="bg-white text-dark shadow-lg rounded-4 border-0">
                <Modal.Header closeButton className="border-bottom bg-light bg-opacity-50 border-light px-4 py-3">
                    <Modal.Title className="fw-800 text-dark">Tạo lớp học mới</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreateClass}>
                    <Modal.Body className="p-4">
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-700 text-secondary">Tên lớp học</Form.Label>
                            <Form.Control
                                type="text"
                                required
                                className="bg-light text-dark border-light shadow-sm rounded-3 px-3 py-2"
                                value={newClass.name}
                                onChange={e => setNewClass({ ...newClass, name: e.target.value })}
                                placeholder="Nhập tên lớp học..."
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-700 text-secondary">Mô tả</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                className="bg-light text-dark border-light shadow-sm rounded-3 px-3 py-2"
                                value={newClass.description}
                                onChange={e => setNewClass({ ...newClass, description: e.target.value })}
                                placeholder="Khái quát nội dung khóa học..."
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-light bg-light bg-opacity-50 px-4 py-3">
                        <Button variant="light" className="fw-600 rounded-pill px-4" onClick={() => setShowCreateModal(false)}>Hủy</Button>
                        <Button variant="primary" type="submit" className="fw-600 rounded-pill px-4 shadow-sm">Xác nhận tạo</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal Tham gia lớp học */}
            <Modal show={showJoinModal} onHide={() => setShowJoinModal(false)} centered contentClassName="bg-white text-dark shadow-lg rounded-4 border-0">
                <Modal.Header closeButton className="border-bottom bg-light bg-opacity-50 border-light px-4 py-3">
                    <Modal.Title className="fw-800 text-dark">Tham gia lớp học</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleJoinClass}>
                    <Modal.Body className="p-5 text-center">
                        <div className="bg-success bg-opacity-10 text-success d-inline-flex p-4 rounded-circle mb-4">
                            <i className="bi bi-door-open fs-1"></i>
                        </div>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-700 text-secondary mb-3">Nhập mã lớp học (6 ký tự)</Form.Label>
                            <Form.Control
                                type="text"
                                required
                                className="bg-light text-primary border-light text-center fw-900 rounded-4 shadow-inner"
                                style={{ fontSize: '2rem', letterSpacing: '0.2em' }}
                                placeholder="ABC123"
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                                maxLength={6}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-light bg-light bg-opacity-50 justify-content-center px-4 py-3">
                        <Button variant="light" className="fw-600 rounded-pill px-4" onClick={() => setShowJoinModal(false)}>Hủy</Button>
                        <Button variant="success" type="submit" className="fw-600 rounded-pill px-5 shadow-sm">Tham gia ngay</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal Danh sách sinh viên */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered contentClassName="bg-white text-dark shadow-lg rounded-4 border-0 overflow-hidden">
                <Modal.Header closeButton className="border-bottom bg-light bg-opacity-50 border-light px-4 py-3">
                    <Modal.Title className="fw-800 text-dark">Danh sách sinh viên - <span className="text-primary">{selectedClass?.name}</span></Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="px-4 py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>#</th>
                                    <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Họ tên</th>
                                    <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Email</th>
                                    <th className="px-4 py-3 border-light text-end text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedClass?.students?.length > 0 ? selectedClass.students.map((student, index) => (
                                    <tr key={student._id} className="hover-bg-light transition-fast">
                                        <td className="px-4 py-3 fw-bold text-muted">{index + 1}</td>
                                        <td className="py-3 fw-600 text-dark">{student.name}</td>
                                        <td className="py-3 text-secondary">{student.email}</td>
                                        <td className="px-4 py-3 text-end">
                                            <Button variant="outline-danger" size="sm" className="rounded-pill px-3 fw-bold shadow-sm">
                                                <i className="bi bi-person-x me-1"></i> Gỡ khỏi lớp
                                            </Button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-5 text-muted fw-600">Lớp học này chưa có sinh viên nào.</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}
