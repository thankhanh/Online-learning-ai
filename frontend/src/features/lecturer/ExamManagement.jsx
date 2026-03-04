import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Badge, Row, Col, Table, Tab, Tabs, Modal } from 'react-bootstrap';
import api from '../../utils/api';

export default function ExamManagement({ user }) {
    const [key, setKey] = useState('overview');
    const [exams, setExams] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [integrityLogs, setIntegrityLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newExam, setNewExam] = useState({
        title: '',
        classroom: '',
        duration: 60,
        maxViolations: 3,
        questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: '', type: 'multiple-choice' }]
    });

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
            const res = await api.post('/exams', newExam);
            if (res.data.success) {
                setExams([...exams, res.data.exam]);
                setShowCreateModal(false);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create exam');
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
                                            <Button variant="outline-info" size="sm" className="me-2">Sửa</Button>
                                            <Button variant="outline-danger" size="sm">Xóa</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card>
                </Tab>
            </Tabs>

            {/* Modal Tạo Đề Thi */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" centered contentClassName="bg-dark text-white border-secondary">
                <Modal.Header closeButton closeVariant="white" className="border-secondary">
                    <Modal.Title>Tạo Đề Thi Mới</Modal.Title>
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
