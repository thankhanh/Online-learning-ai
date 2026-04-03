import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Row, Col, Table, Modal, Form, Tabs, Tab } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ClassroomManagement({ user }) {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [newClass, setNewClass] = useState({ name: '', description: '', category: '' });
    const [categories, setCategories] = useState([]);
    const [joinCode, setJoinCode] = useState('');
    const [schedule, setSchedule] = useState([]);
    const [isSavingSchedule, setIsSavingSchedule] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchClasses();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            if (res.data.success) {
                setCategories(res.data.categories);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

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
                setNewClass({ name: '', description: '', category: '' });
                toast.success('Tạo lớp học thành công!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Không thể tạo lớp học.');
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
                toast.success('Tham gia lớp học thành công!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Không thể tham gia lớp học. Vui lòng kiểm tra mã code.');
        }
    };

    const handleClassClick = (cls) => {
        setSelectedClass(cls);
        setSchedule(cls.schedule || []);
        setShowModal(true);
    };

    const handleUpdateSchedule = async () => {
        setIsSavingSchedule(true);
        try {
            const res = await api.put(`/classrooms/${selectedClass._id}/schedule`, { schedule });
            if (res.data.success) {
                toast.success('Cập nhật lịch học thành công!');
                setClasses(classes.map(c => c._id === selectedClass._id ? { ...c, schedule: res.data.schedule } : c));
            }
        } catch (err) {
            toast.error('Không thể cập nhật lịch học.');
        } finally {
            setIsSavingSchedule(false);
        }
    };

    const addScheduleItem = () => {
        setSchedule([...schedule, { dayOfWeek: 'Thứ 2', startTime: '08:00', endTime: '10:00' }]);
    };

    const removeScheduleItem = (index) => {
        setSchedule(schedule.filter((_, i) => i !== index));
    };

    const updateScheduleItem = (index, field, value) => {
        const newSchedule = [...schedule];
        newSchedule[index][field] = value;
        setSchedule(newSchedule);
    };

    const handleRemoveStudent = async (studentId) => {
        if (!window.confirm('Bạn có chắc chắn muốn gỡ sinh viên này khỏi lớp học?')) return;
        
        try {
            const res = await api.delete(`/classrooms/${selectedClass._id}/students/${studentId}`);
            if (res.data.success) {
                toast.success('Đã gỡ sinh viên khỏi lớp.');
                // Update local state
                const updatedStudents = selectedClass.students.filter(s => s._id !== studentId);
                const updatedClass = { ...selectedClass, students: updatedStudents };
                setSelectedClass(updatedClass);
                setClasses(classes.map(c => c._id === selectedClass._id ? updatedClass : c));
            }
        } catch (err) {
            toast.error('Không thể gỡ sinh viên.');
        }
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
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-700 text-secondary">Danh mục môn học</Form.Label>
                            <Form.Select
                                required
                                className="bg-light text-dark border-light shadow-sm rounded-3 px-3 py-2"
                                value={newClass.category}
                                onChange={e => setNewClass({ ...newClass, category: e.target.value })}
                            >
                                <option value="">-- Chọn danh mục --</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </Form.Select>
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
                    <Tabs defaultActiveKey="students" className="px-4 pt-2 border-bottom-0">
                        <Tab eventKey="students" title={<span><i className="bi bi-people me-2"></i>Sinh viên ({selectedClass?.students?.length || 0})</span>}>
                            <div className="table-responsive">
                                <Table hover className="align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="px-4 py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>#</th>
                                            <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Họ tên</th>
                                            <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Email</th>
                                            {user?.role === 'lecturer' && <th className="px-4 py-3 border-light text-end text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Hành động</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedClass?.students?.length > 0 ? selectedClass.students.map((student, index) => (
                                            <tr key={student._id} className="hover-bg-light transition-fast">
                                                <td className="px-4 py-3 fw-bold text-muted">{index + 1}</td>
                                                <td className="py-3 fw-600 text-dark">{student.name}</td>
                                                <td className="py-3 text-secondary">{student.email}</td>
                                                {user?.role === 'lecturer' && (
                                                    <td className="px-4 py-3 text-end">
                                                        <Button variant="outline-danger" size="sm" className="rounded-pill px-3 fw-bold shadow-sm" onClick={() => handleRemoveStudent(student._id)}>
                                                            <i className="bi bi-person-x me-1"></i> Gỡ khỏi lớp
                                                        </Button>
                                                    </td>
                                                )}
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-5 text-muted fw-600">Lớp học này chưa có sinh viên nào.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Tab>
                        <Tab eventKey="schedule" title={<span><i className="bi bi-calendar3 me-2"></i>Lịch học</span>}>
                            <div className="p-4 bg-light bg-opacity-50">
                                {user?.role === 'lecturer' ? (
                                    <div className="bg-white p-4 rounded-4 shadow-sm border">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h6 className="fw-800 text-dark mb-0">Quản lý lịch học hàng tuần</h6>
                                            <Button variant="outline-primary" size="sm" onClick={addScheduleItem} className="rounded-pill px-3 fw-bold">
                                                <i className="bi bi-plus-lg me-2"></i>Thêm buổi học
                                            </Button>
                                        </div>
                                        {schedule.map((item, idx) => (
                                            <div key={idx} className="d-flex gap-3 align-items-center mb-3 p-3 bg-light rounded-4 border border-white shadow-inner">
                                                <div className="flex-grow-1">
                                                    <Form.Label className="small fw-700 text-muted mb-1 uppercase">Thứ</Form.Label>
                                                    <Form.Select 
                                                        size="sm" 
                                                        className="rounded-pill border-light fw-600"
                                                        value={item.dayOfWeek}
                                                        onChange={(e) => updateScheduleItem(idx, 'dayOfWeek', e.target.value)}
                                                    >
                                                        {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'].map(d => <option key={d} value={d}>{d}</option>)}
                                                    </Form.Select>
                                                </div>
                                                <div style={{ width: '120px' }}>
                                                    <Form.Label className="small fw-700 text-muted mb-1 uppercase">Bắt đầu</Form.Label>
                                                    <Form.Control 
                                                        type="time" 
                                                        size="sm" 
                                                        className="rounded-pill border-light fw-600"
                                                        value={item.startTime}
                                                        onChange={(e) => updateScheduleItem(idx, 'startTime', e.target.value)}
                                                    />
                                                </div>
                                                <div style={{ width: '120px' }}>
                                                    <Form.Label className="small fw-700 text-muted mb-1 uppercase">Kết thúc</Form.Label>
                                                    <Form.Control 
                                                        type="time" 
                                                        size="sm" 
                                                        className="rounded-pill border-light fw-600"
                                                        value={item.endTime}
                                                        onChange={(e) => updateScheduleItem(idx, 'endTime', e.target.value)}
                                                    />
                                                </div>
                                                <Button variant="outline-danger" size="sm" onClick={() => removeScheduleItem(idx)} className="rounded-circle mt-4" style={{ width: '32px', height: '32px', padding: 0 }}>
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            </div>
                                        ))}
                                        {schedule.length > 0 && (
                                            <Button variant="primary" onClick={handleUpdateSchedule} disabled={isSavingSchedule} className="mt-2 rounded-pill px-4 fw-bold shadow-sm">
                                                {isSavingSchedule ? 'Đang lưu...' : 'Lưu lịch học'}
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-white p-4 rounded-4 shadow-sm border">
                                        <h6 className="fw-800 text-dark mb-4">Lịch học hàng tuần của lớp</h6>
                                        {selectedClass?.schedule?.length > 0 ? (
                                            <div className="row g-3">
                                                {selectedClass.schedule.map((s, i) => (
                                                    <div key={i} className="col-md-6">
                                                        <div className="d-flex align-items-center p-3 rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-10 text-primary">
                                                            <div className="bg-white rounded-circle p-2 me-3 shadow-sm text-center" style={{ width: '45px', height: '45px'}}>
                                                                <i className="bi bi-clock-fill fw-bold"></i>
                                                            </div>
                                                            <div>
                                                                <div className="fw-900 fs-5 mb-0" style={{ letterSpacing: '-0.02em'}}>{s.dayOfWeek}</div>
                                                                <small className="fw-700 opacity-75">{s.startTime} - {s.endTime}</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-5 text-muted fw-600">Lớp học này chưa cập nhật lịch học.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Tab>
                    </Tabs>
                </Modal.Body>
            </Modal>
        </div>
    );
}
