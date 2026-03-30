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

    if (loading) return <div className="text-center mt-5 text-white">Đang tải dữ liệu...</div>;

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-white m-0">🏫 Quản lý Lớp học</h2>
                {user?.role === 'lecturer' ? (
                    <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                        <i className="bi bi-plus-lg me-2"></i>Tạo lớp mới
                    </Button>
                ) : (
                    <Button variant="success" onClick={() => setShowJoinModal(true)}>
                        <i className="bi bi-door-open me-2"></i>Tham gia lớp học
                    </Button>
                )}
            </div>

            <Row>
                {classes.length === 0 ? (
                    <Col className="text-center text-muted py-5">
                        <h5>Chưa có lớp học nào.</h5>
                    </Col>
                ) : classes.map(cls => (
                    <Col md={4} key={cls._id} className="mb-4">
                        <Card className="h-100 shadow-sm bg-dark text-white border-secondary card-hover" role="button" onClick={() => handleClassClick(cls)}>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <Badge bg="success">Đang diễn ra</Badge>
                                    <small className="text-info fw-bold">CODE: {cls.code}</small>
                                </div>
                                <Card.Title>{cls.name}</Card.Title>
                                <Card.Text className="text-muted small">{cls.description}</Card.Text>
                                <div className="d-flex align-items-center text-light mt-3">
                                    <i className="bi bi-people-fill me-2 text-primary"></i>
                                    {cls.students?.length || 0} Sinh viên
                                </div>
                            </Card.Body>
                            <Card.Footer className="bg-transparent border-secondary d-flex justify-content-between">
                                <Button variant="outline-primary" size="sm">
                                    Xem chi tiết <i className="bi bi-arrow-right"></i>
                                </Button>
                                <Button 
                                    variant={user?.role === 'lecturer' ? "success" : "primary"} 
                                    size="sm" 
                                    className="px-3"
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
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered contentClassName="bg-dark text-white border-secondary">
                <Modal.Header closeButton closeVariant="white" className="border-secondary">
                    <Modal.Title>Tạo lớp học mới</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreateClass}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên lớp học</Form.Label>
                            <Form.Control
                                type="text"
                                required
                                className="bg-secondary text-white border-0"
                                value={newClass.name}
                                onChange={e => setNewClass({ ...newClass, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Mô tả</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                className="bg-secondary text-white border-0"
                                value={newClass.description}
                                onChange={e => setNewClass({ ...newClass, description: e.target.value })}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-secondary">
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Hủy</Button>
                        <Button variant="primary" type="submit">Xác nhận tạo</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal Tham gia lớp học */}
            <Modal show={showJoinModal} onHide={() => setShowJoinModal(false)} centered contentClassName="bg-dark text-white border-secondary">
                <Modal.Header closeButton closeVariant="white" className="border-secondary">
                    <Modal.Title>Tham gia lớp học</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleJoinClass}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Nhập mã lớp học (6 ký tự)</Form.Label>
                            <Form.Control
                                type="text"
                                required
                                className="bg-secondary text-white border-0 text-center fs-4 fw-bold"
                                placeholder="VD: ABC123"
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                                maxLength={6}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-secondary">
                        <Button variant="secondary" onClick={() => setShowJoinModal(false)}>Hủy</Button>
                        <Button variant="success" type="submit">Tham gia ngay</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal Danh sách sinh viên */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered contentClassName="bg-dark text-white border-secondary">
                <Modal.Header closeButton closeVariant="white" className="border-secondary">
                    <Modal.Title>Danh sách sinh viên - {selectedClass?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table hover variant="dark" className="align-middle">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Họ tên</th>
                                <th>Email</th>
                                <th className="text-end">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedClass?.students?.map((student, index) => (
                                <tr key={student._id}>
                                    <td>{index + 1}</td>
                                    <td>{student.name}</td>
                                    <td>{student.email}</td>
                                    <td className="text-end">
                                        <Button variant="outline-danger" size="sm">
                                            <i className="bi bi-person-x"></i> Gỡ khỏi lớp
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
            </Modal>
        </div>
    );
}
