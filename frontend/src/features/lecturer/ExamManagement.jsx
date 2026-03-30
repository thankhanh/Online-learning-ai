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

    if (loading) return <div className="text-center mt-5 text-white">Đang tải dữ liệu thi cử...</div>;

    return (
        <div className="container-fluid p-4">
            <h2 className="mb-4 text-white">📝 Quản lý Thi & Chấm bài</h2>

            <Tabs id="exam-management-tabs" activeKey={key} onSelect={(k) => setKey(k)} className="mb-4">
                <Tab eventKey="overview" title="📊 Tổng quan">
                    <Row>
                        <Col md={4} className="mb-4">
                            <Card className="bg-dark text-white border-secondary h-100 text-center">
                                <Card.Body>
                                    <h1 className="display-4 fw-bold text-primary">{exams.length}</h1>
                                    <p className="text-muted">Đề thi đã tạo</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Tab>

                <Tab eventKey="exam-rooms" title="📝 Quản lý Đề thi">
                    <div className="d-flex justify-content-end mb-3">
                        <Button variant="success" onClick={() => setShowCreateModal(true)}>
                            <i className="bi bi-plus-lg me-2"></i>Tạo Đề thi Mới
                        </Button>
                    </div>
                    <Card className="bg-dark text-white border-secondary">
                        <Table hover variant="dark" className="m-0 align-middle">
                            <thead>
                                <tr>
                                    <th>Tên kỳ thi</th>
                                    <th>Lớp học</th>
                                    <th>Thời gian</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exams.map(exam => (
                                    <tr key={exam._id}>
                                        <td>{exam.title}</td>
                                        <td>{exam.classroom?.name}</td>
                                        <td>{exam.duration} phút</td>
                                        <td>
                                            <Button variant="outline-info" size="sm" className="me-2" onClick={() => handleEditClick(exam)}>Sửa</Button>
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDeleteExam(exam._id)}>Xóa</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card>
                </Tab>
                <Tab eventKey="monitoring" title="📡 Giám sát Trực tiếp">
                    <div className="p-3 bg-dark border border-secondary rounded">
                        <Row className="mb-4 align-items-end">
                            <Col md={4}>
                                <Form.Label className="text-white">Chọn kỳ thi để giám sát:</Form.Label>
                                <Form.Select 
                                    className="bg-secondary text-white border-0"
                                    value={selectedMonitorExam}
                                    onChange={(e) => handleJoinMonitor(e.target.value)}
                                >
                                    <option value="">Chọn đề thi...</option>
                                    {exams.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
                                </Form.Select>
                            </Col>
                            <Col md={8}>
                                {selectedMonitorExam && (
                                    <>
                                        <Badge bg="danger" className="p-2 pulse-animation me-2">
                                            <i className="bi bi-broadcast me-2"></i> Đang giám sát trực tiếp...
                                        </Badge>
                                        <Badge bg={socket.connected ? "success" : "secondary"} className="p-2 me-2">
                                            Socket: {socket.connected ? "Kết nối" : "Ngắt kết nối"}
                                        </Badge>
                                        <Button variant="outline-dark" size="sm" onClick={() => handleJoinMonitor(selectedMonitorExam)}>
                                            <i className="bi bi-arrow-clockwise me-1"></i> Làm mới
                                        </Button>
                                    </>
                                )}
                            </Col>
                        </Row>

                        {!selectedMonitorExam ? (
                            <div className="text-center py-5 text-muted">Vui lòng chọn một kỳ thi để bắt đầu giám sát học viên.</div>
                        ) : (
                            <Table hover variant="dark" className="align-middle">
                                <thead>
                                    <tr>
                                        <th>Thời gian</th>
                                        <th>Sinh viên</th>
                                        <th>Loại vi phạm</th>
                                        <th>Tổng số lần</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(monitoringExams[selectedMonitorExam] || []).length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4 text-muted">Chưa phát hiện vi phạm nào trong phiên này.</td>
                                        </tr>
                                    ) : (
                                        monitoringExams[selectedMonitorExam].map((v, i) => (
                                            <tr key={v.userId || i} className="animate__animated animate__fadeInDown border-bottom border-secondary">
                                                <td className="text-muted small">{new Date(v.timestamp).toLocaleTimeString()}</td>
                                                <td>
                                                    <div className="fw-bold text-white">{v.username}</div>
                                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{v.email}</div>
                                                </td>
                                                <td>
                                                    <Badge bg={v.isPostSubmission ? "danger" : "warning"} text={v.isPostSubmission ? "white" : "dark"}>
                                                        {v.type}
                                                    </Badge>
                                                </td>
                                                <td className="text-center">
                                                    <span className={`fs-5 fw-bold ${v.totalViolations >= 3 ? 'text-danger' : 'text-primary'}`}>
                                                        {v.totalViolations}
                                                    </span>
                                                </td>
                                                <td>
                                                    {v.totalViolations >= 3 || v.status === 'Đã đình chỉ' ? 
                                                        <Badge bg="danger" className="px-3 py-2">ĐÃ ĐÌNH CHỈ</Badge> : 
                                                        <Badge bg="success" className="px-3 py-2 text-dark">ĐANG THI</Badge>
                                                    }
                                                </td>
                                                <td>
                                                    <Button 
                                                        variant="outline-primary" 
                                                        size="sm" 
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
                        )}
                    </div>
                </Tab>
            </Tabs>

            {/* Modal Tạo Đề Thi */}
            <Modal show={showCreateModal} onHide={() => { setShowCreateModal(false); setIsEditing(false); }} size="lg" centered contentClassName="bg-dark text-white border-secondary">
                <Modal.Header closeButton closeVariant="white" className="border-secondary">
                    <Modal.Title>{isEditing ? 'Chỉnh sửa Đề thi' : 'Tạo Đề Thi Mới'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreateExam}>
                    <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên kỳ thi</Form.Label>
                            <Form.Control
                                type="text" required className="bg-secondary text-white border-0"
                                value={newExam.title} onChange={e => setNewExam({ ...newExam, title: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Chọn Lớp học</Form.Label>
                            <Form.Select
                                required className="bg-secondary text-white border-0"
                                value={newExam.classroom} onChange={e => setNewExam({ ...newExam, classroom: e.target.value })}
                            >
                                <option value="">Chọn lớp...</option>
                                {classrooms.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Thời lượng (phút)</Form.Label>
                                    <Form.Control type="number" className="bg-secondary text-white border-0" value={newExam.duration} onChange={e => setNewExam({ ...newExam, duration: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Số vi phạm tối đa</Form.Label>
                                    <Form.Control type="number" className="bg-secondary text-white border-0" value={newExam.maxViolations} onChange={e => setNewExam({ ...newExam, maxViolations: e.target.value })} />
                                </Form.Group>
                            </Col>
                        </Row>

                        <hr className="border-secondary" />
                        <h5>Câu hỏi</h5>
                        {newExam.questions.map((q, idx) => (
                            <div key={idx} className="mb-4 p-3 border border-secondary rounded">
                                <Form.Group className="mb-2">
                                    <Form.Label>Câu {idx + 1}</Form.Label>
                                    <Form.Control
                                        type="text" required className="bg-secondary text-white border-0"
                                        value={q.questionText} onChange={e => {
                                            const qs = [...newExam.questions];
                                            qs[idx].questionText = e.target.value;
                                            setNewExam({ ...newExam, questions: qs });
                                        }}
                                    />
                                </Form.Group>
                                <Row>
                                    {q.options.map((opt, oIdx) => (
                                        <Col md={6} key={oIdx}>
                                            <Form.Control
                                                size="sm" placeholder={`Đáp án ${String.fromCharCode(65 + oIdx)}`}
                                                className="bg-secondary text-white border-0 mb-2"
                                                value={opt} onChange={e => {
                                                    const qs = [...newExam.questions];
                                                    qs[idx].options[oIdx] = e.target.value;
                                                    setNewExam({ ...newExam, questions: qs });
                                                }}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                                <Form.Control
                                    size="sm" placeholder="Đáp án đúng (nhập chính xác nội dung đáp án)"
                                    className="bg-info text-dark border-0"
                                    value={q.correctAnswer} onChange={e => {
                                        const qs = [...newExam.questions];
                                        qs[idx].correctAnswer = e.target.value;
                                        setNewExam({ ...newExam, questions: qs });
                                    }}
                                />
                            </div>
                        ))}
                        <Button variant="outline-info" size="sm" onClick={addQuestion}>+ Thêm câu hỏi</Button>
                    </Modal.Body>
                    <Modal.Footer className="border-secondary">
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Hủy</Button>
                        <Button variant="success" type="submit">Lưu Đề thi</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
}
