import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Form, Badge, Row, Col, Table, Tab, Tabs, Modal } from 'react-bootstrap';
import api from '../../utils/api';
import socket from '../../utils/socket';

export default function ExamManagement({ user }) {
    const [key, setKey] = useState('overview');
    const [exams, setExams] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [monitoringExams, setMonitoringExams] = useState({}); // { examId: [violations] }
    const [selectedMonitorExam, setSelectedMonitorExam] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newExam, setNewExam] = useState({
        title: '',
        classroom: '',
        duration: 60,
        maxViolations: 3,
        questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: '', type: 'multiple-choice' }]
    });

    useEffect(() => {
        const onConnect = () => console.log('MONITOR SOCKET CONNECTED:', socket.id);
        const onDisconnect = () => console.log('MONITOR SOCKET DISCONNECTED');

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        socket.on('student-violation', (data) => {
            console.log('LECTURER RECEIVED VIOLATION:', data);
            setMonitoringExams(prev => {
                const current = prev[data.examId] || [];
                // Update student if exists, otherwise prepend
                const existingIdx = current.findIndex(v => v.userId === data.userId);
                let newList;
                if (existingIdx !== -1) {
                    newList = [...current];
                    newList[existingIdx] = { ...data, timestamp: new Date() };
                } else {
                    newList = [data, ...current];
                }
                return { ...prev, [data.examId]: newList.slice(0, 50) };
            });
        });

        socket.on('initial-monitor-data', ({ examId, data }) => {
            console.log('Received initial monitor data:', data);
            setMonitoringExams(prev => ({ ...prev, [examId]: data }));
        });

        socket.on('student-violation-reset', ({ userId }) => {
            setMonitoringExams(prev => {
                const updated = { ...prev };
                for (let eId in updated) {
                    updated[eId] = updated[eId].filter(v => v.userId !== userId);
                }
                return updated;
            });
        });

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('student-violation');
            socket.off('initial-monitor-data');
            socket.off('student-violation-reset');
        };
    }, []);

    const handleJoinMonitor = (examId) => {
        setSelectedMonitorExam(examId);
        socket.emit('join-exam-monitor', { examId });
    };

    const handleResetViolation = (userId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử vi phạm của sinh viên này để thử nghiệm lại không?')) {
            socket.emit('reset-student-violation', { examId: selectedMonitorExam, userId });
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch Exams
            api.get('/exams')
                .then(res => {
                    if (res.data.success) setExams(res.data.exams);
                })
                .catch(err => console.error('Error fetching exams:', err.message));

            // Fetch Classrooms
            api.get('/classrooms')
                .then(res => {
                    if (res.data.success) setClassrooms(res.data.classrooms);
                })
                .catch(err => console.error('Error fetching classrooms:', err.message));
        } catch (err) {
            console.error('Data fetching error:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                const res = await api.put(`/exams/${editingId}`, newExam);
                if (res.data.success) {
                    setExams(exams.map(ex => ex._id === editingId ? res.data.exam : ex));
                    setShowCreateModal(false);
                    setIsEditing(false);
                    setEditingId(null);
                }
            } else {
                const res = await api.post('/exams', newExam);
                if (res.data.success) {
                    setExams([...exams, res.data.exam]);
                    setShowCreateModal(false);
                }
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save exam');
        }
    };

    const handleEditClick = (exam) => {
        setIsEditing(true);
        setEditingId(exam._id);
        setNewExam({
            title: exam.title,
            classroom: exam.classroom?._id || exam.classroom,
            duration: exam.duration,
            maxViolations: exam.maxViolations,
            questions: exam.questions.map(q => ({ ...q }))
        });
        setShowCreateModal(true);
    };

    const handleDeleteExam = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đề thi này không?')) return;
        try {
            const res = await api.delete(`/exams/${id}`);
            if (res.data.success) {
                setExams(exams.filter(ex => ex._id !== id));
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete exam');
        }
    };

    const addQuestion = () => {
        setNewExam({
            ...newExam,
            questions: [...newExam.questions, { questionText: '', options: ['', '', '', ''], correctAnswer: '', type: 'multiple-choice' }]
        });
    };

    if (loading) return (
        <div className="vh-100 d-flex flex-column align-items-center justify-content-center bg-light text-dark">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <h5 className="fw-800">Đang tải dữ liệu thi cử...</h5>
        </div>
    );

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-4 me-3 text-primary shadow-sm border border-primary border-opacity-10">
                        <i className="bi bi-file-earmark-text fs-3"></i>
                    </div>
                    <div>
                        <h2 className="fw-800 mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>Quản lý Thi & Chấm bài</h2>
                        <p className="text-muted fw-500 mb-0">Tạo đề thi, theo dõi gian lận trực tiếp</p>
                    </div>
                </div>
            </div>

            <Tabs id="exam-management-tabs" activeKey={key} onSelect={(k) => setKey(k)} className="mb-4 custom-tabs-premium border-0">
                <Tab eventKey="overview" title={<span><i className="bi bi-bar-chart-fill me-2 text-info"></i>Tổng quan</span>}>
                    <Row>
                        <Col md={4} className="mb-4">
                            <Card className="bg-white border-0 shadow-sm rounded-4 h-100 text-center overflow-hidden hover-shadow transition-all">
                                <Card.Body className="p-5">
                                    <h1 className="display-3 fw-900 text-primary mb-3">{exams.length}</h1>
                                    <p className="text-secondary fw-700 text-uppercase mb-0" style={{ letterSpacing: '0.05em' }}>Đề thi đã tạo</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={8} className="mb-4 d-none d-md-block">
                            <Card className="bg-white border-0 shadow-sm rounded-4 h-100 overflow-hidden d-flex flex-column justify-content-center px-5">
                                <div className="d-flex align-items-center">
                                    <div className="bg-success bg-opacity-10 p-4 rounded-circle me-4 text-success">
                                        <i className="bi bi-shield-check fs-1"></i>
                                    </div>
                                    <div>
                                        <h4 className="fw-800 text-dark mb-2">Hệ thống Giám sát Chống gian lận</h4>
                                        <p className="text-secondary fw-500 mb-0">Theo dõi trực tiếp quá trình làm bài của sinh viên. Phát hiện chuyển tab, mở tab mới, sử dụng công cụ gian lận với độ chính xác cao.</p>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Tab>

                <Tab eventKey="exam-rooms" title={<span><i className="bi bi-journal-plus me-2 text-success"></i>Quản lý Đề thi</span>}>
                    <div className="d-flex justify-content-end mb-4">
                        <Button variant="primary" onClick={() => setShowCreateModal(true)} className="rounded-pill px-4 fw-bold shadow-sm" style={{ background: 'linear-gradient(135deg, var(--primary-color), #4db8ff)', border: 'none' }}>
                            <i className="bi bi-plus-lg me-2"></i>Tạo Đề thi Mới
                        </Button>
                    </div>
                    <Card className="bg-white border-0 shadow-sm rounded-4 overflow-hidden">
                        {exams.length === 0 ? (
                            <div className="text-center text-muted py-5">
                                <div className="bg-light rounded-circle d-inline-flex p-4 mb-3 shadow-sm border">
                                    <i className="bi bi-clipboard-x fs-1 text-secondary opacity-50"></i>
                                </div>
                                <h5 className="fw-800 text-dark">Chưa có đề thi nào được tạo.</h5>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover className="m-0 align-middle">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="ps-4 py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Tên kỳ thi</th>
                                            <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Lớp học</th>
                                            <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Thời gian</th>
                                            <th className="pe-4 py-3 border-light text-end text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {exams.map(exam => (
                                            <tr key={exam._id} className="border-bottom border-light transition-fast hover-bg-light">
                                                <td className="ps-4 py-3 fw-800 text-dark">{exam.title}</td>
                                                <td className="py-3">
                                                    <Badge bg="primary" className="bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-600 border border-primary border-opacity-25">
                                                        {exam.classroom?.name}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 fw-600 text-secondary">{exam.duration} phút</td>
                                                <td className="pe-4 py-3 text-end">
                                                    <Button variant="outline-primary" size="sm" className="me-2 rounded-pill px-3 fw-bold" onClick={() => handleEditClick(exam)}><i className="bi bi-pencil-square me-1"></i> Sửa</Button>
                                                    <Button variant="outline-danger" size="sm" className="rounded-pill px-3 fw-bold" onClick={() => handleDeleteExam(exam._id)}><i className="bi bi-trash"></i> Xóa</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card>
                </Tab>

                <Tab eventKey="monitoring" title={<span><i className="bi bi-broadcast me-2 text-danger"></i>Giám sát Trực tiếp</span>}>
                    <div className="bg-white border-0 shadow-sm rounded-4 p-4 p-md-5">
                        <Row className="mb-5 align-items-end">
                            <Col md={5} className="mb-3 mb-md-0">
                                <Form.Label className="text-secondary fw-700 mb-2">Chọn kỳ thi để giám sát:</Form.Label>
                                <Form.Select 
                                    className="bg-light text-dark border-light shadow-sm rounded-pill px-3 py-2 fw-600"
                                    value={selectedMonitorExam}
                                    onChange={(e) => handleJoinMonitor(e.target.value)}
                                >
                                    <option value="">Chọn đề thi...</option>
                                    {exams.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
                                </Form.Select>
                            </Col>
                            <Col md={7} className="text-md-end">
                                {selectedMonitorExam && (
                                    <div className="d-flex align-items-center justify-content-md-end gap-2 flex-wrap">
                                        <Badge bg="danger" className="px-3 py-2 rounded-pill pulse-animation fs-6 shadow-sm">
                                            <i className="bi bi-broadcast me-2"></i> Đang giám sát trực tiếp...
                                        </Badge>
                                        <Badge bg={socket.connected ? "success" : "secondary"} className="px-3 py-2 rounded-pill bg-opacity-10 text-success border border-success border-opacity-25 shadow-sm fw-700">
                                            Socket: {socket.connected ? "Kết nối" : "Ngắt kết nối"}
                                        </Badge>
                                        <Button variant="outline-primary" size="sm" className="rounded-pill px-3 py-2 fw-bold" onClick={() => handleJoinMonitor(selectedMonitorExam)}>
                                            <i className="bi bi-arrow-clockwise me-1"></i> Làm mới
                                        </Button>
                                    </div>
                                )}
                            </Col>
                        </Row>

                        {!selectedMonitorExam ? (
                            <div className="text-center py-5 text-muted">
                                <div className="bg-light rounded-circle d-inline-flex p-4 mb-3 shadow-sm border">
                                    <i className="bi bi-webcam fs-1 text-secondary opacity-50"></i>
                                </div>
                                <h5 className="fw-800 text-dark">Vui lòng chọn một kỳ thi để bắt đầu giám sát học viên.</h5>
                            </div>
                        ) : (
                            <div className="table-responsive bg-white border border-light rounded-4 overflow-hidden">
                                <Table hover className="align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="ps-4 py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Thời gian</th>
                                            <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Sinh viên</th>
                                            <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Loại vi phạm</th>
                                            <th className="py-3 border-light text-center text-secondary fw-700 text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Tổng số lần</th>
                                            <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Trạng thái</th>
                                            <th className="pe-4 py-3 border-light text-end text-secondary fw-700 text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(monitoringExams[selectedMonitorExam] || []).length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-5 text-success fw-700">
                                                    <i className="bi bi-shield-check fs-4 d-block mb-2"></i>
                                                    Chưa phát hiện vi phạm nào trong phiên này.
                                                </td>
                                            </tr>
                                        ) : (
                                            monitoringExams[selectedMonitorExam].map((v, i) => (
                                                <tr key={v.userId || i} className="animate__animated animate__fadeInDown border-bottom border-light hover-bg-light transition-fast">
                                                    <td className="ps-4 py-3 text-muted small fw-600">{new Date(v.timestamp).toLocaleTimeString()}</td>
                                                    <td>
                                                        <div className="fw-800 text-dark">{v.username}</div>
                                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{v.email}</div>
                                                    </td>
                                                    <td>
                                                        <Badge bg={v.isPostSubmission ? "danger" : "warning"} text={v.isPostSubmission ? "white" : "dark"} className="px-2 py-1 rounded-pill fw-600 shadow-sm border">
                                                            {v.type}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className={`fs-5 fw-900 ${v.totalViolations >= 3 ? 'text-danger' : 'text-primary'}`}>
                                                            {v.totalViolations}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {v.totalViolations >= 3 || v.status === 'Đã đình chỉ' ? 
                                                            <Badge bg="danger" className="px-3 py-2 rounded-pill shadow-sm border border-danger">ĐÃ ĐÌNH CHỈ</Badge> : 
                                                            <Badge bg="success" className="px-3 py-2 rounded-pill bg-opacity-10 text-success border border-success border-opacity-25 shadow-sm fw-700">ĐANG THI</Badge>
                                                        }
                                                    </td>
                                                    <td className="pe-4 py-3 text-end">
                                                        <Button 
                                                            variant="outline-secondary" 
                                                            size="sm" 
                                                            className="rounded-pill px-3 fw-bold"
                                                            onClick={() => handleResetViolation(v.userId)}
                                                            title="Xóa dữ liệu vi phạm của sinh viên này để test lại"
                                                        >
                                                            <i className="bi bi-arrow-counterclockwise"></i> Reset (Test)
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </div>
                </Tab>
            </Tabs>

            {/* Modal Tạo Đề Thi */}
            <Modal show={showCreateModal} onHide={() => { setShowCreateModal(false); setIsEditing(false); }} size="lg" centered contentClassName="bg-white text-dark shadow-lg rounded-4 border-0">
                <Modal.Header closeButton className="border-bottom bg-light bg-opacity-50 border-light px-4 py-3">
                    <Modal.Title className="fw-800 text-dark">{isEditing ? 'Chỉnh sửa Đề thi' : 'Tạo Đề Thi Mới'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreateExam}>
                    <Modal.Body className="p-4 custom-scrollbar" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-700 text-secondary">Tên kỳ thi</Form.Label>
                            <Form.Control
                                type="text" required className="bg-light text-dark border-light shadow-sm rounded-pill px-3 py-2"
                                value={newExam.title} onChange={e => setNewExam({ ...newExam, title: e.target.value })}
                                placeholder="Nhập tên kiểm tra giữa kỳ, cuối kỳ..."
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-700 text-secondary">Chọn Lớp học</Form.Label>
                            <Form.Select
                                required className="bg-light text-dark border-light shadow-sm rounded-pill px-3 py-2"
                                value={newExam.classroom} onChange={e => setNewExam({ ...newExam, classroom: e.target.value })}
                            >
                                <option value="">Chọn lớp...</option>
                                {classrooms.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Row className="mb-4">
                            <Col md={6} className="mb-3 mb-md-0">
                                <Form.Group>
                                    <Form.Label className="fw-700 text-secondary">Thời lượng (phút)</Form.Label>
                                    <Form.Control type="number" className="bg-light text-dark border-light shadow-sm rounded-pill px-3 py-2" value={newExam.duration} onChange={e => setNewExam({ ...newExam, duration: e.target.value })} min={1} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-700 text-secondary">Số vi phạm tối đa</Form.Label>
                                    <Form.Control type="number" className="bg-light text-dark border-light shadow-sm rounded-pill px-3 py-2" value={newExam.maxViolations} onChange={e => setNewExam({ ...newExam, maxViolations: e.target.value })} min={1} />
                                </Form.Group>
                            </Col>
                        </Row>

                        <hr className="border-light opacity-50 my-4" />
                        <h5 className="fw-800 text-dark mb-4">Danh sách Câu hỏi</h5>
                        {newExam.questions.map((q, idx) => (
                            <div key={idx} className="mb-4 p-4 bg-light rounded-4 border border-light shadow-sm position-relative">
                                <div className="position-absolute top-0 start-0 bg-primary bg-opacity-10 text-primary fw-800 px-3 py-1 rounded-bottom-end-custom" style={{ borderBottomRightRadius: '15px' }}>
                                    Câu {idx + 1}
                                </div>
                                <Form.Group className="mb-3 mt-3">
                                    <Form.Control
                                        type="text" required className="bg-white text-dark border-0 shadow-sm rounded-3 px-3 py-2 fw-600"
                                        placeholder="Nhập nội dung câu hỏi..."
                                        value={q.questionText} onChange={e => {
                                            const qs = [...newExam.questions];
                                            qs[idx].questionText = e.target.value;
                                            setNewExam({ ...newExam, questions: qs });
                                        }}
                                    />
                                </Form.Group>
                                <Row className="mb-3">
                                    {q.options.map((opt, oIdx) => (
                                        <Col md={6} key={oIdx}>
                                            <Form.Control
                                                size="sm" placeholder={`Đáp án ${String.fromCharCode(65 + oIdx)}`}
                                                className="bg-white text-dark border-light mb-3 shadow-inner rounded-3"
                                                value={opt} onChange={e => {
                                                    const qs = [...newExam.questions];
                                                    qs[idx].options[oIdx] = e.target.value;
                                                    setNewExam({ ...newExam, questions: qs });
                                                }}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                                <Form.Group>
                                    <Form.Label className="fw-700 text-success small mb-1"><i className="bi bi-check-circle-fill me-1"></i>Đáp án đúng</Form.Label>
                                    <Form.Control
                                        size="sm" placeholder="Nhập chính xác nội dung đáp án đúng..."
                                        className="bg-success bg-opacity-10 text-dark border-success border-opacity-25 rounded-3 fw-bold"
                                        value={q.correctAnswer} onChange={e => {
                                            const qs = [...newExam.questions];
                                            qs[idx].correctAnswer = e.target.value;
                                            setNewExam({ ...newExam, questions: qs });
                                        }}
                                    />
                                </Form.Group>
                            </div>
                        ))}
                        <div className="text-center mt-4">
                            <Button variant="outline-primary" className="rounded-pill px-4 fw-bold border-2 shadow-sm" onClick={addQuestion}>
                                <i className="bi bi-plus-circle-fill me-2"></i> Thêm câu hỏi
                            </Button>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="border-light bg-light bg-opacity-50 px-4 py-3">
                        <Button variant="light" className="fw-600 rounded-pill px-4" onClick={() => setShowCreateModal(false)}>Hủy</Button>
                        <Button variant="success" type="submit" className="fw-600 rounded-pill px-5 shadow-sm">Lưu Đề thi</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
}
