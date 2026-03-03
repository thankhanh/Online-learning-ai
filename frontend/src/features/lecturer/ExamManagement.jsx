import React, { useState } from 'react';
import { Card, Button, Form, Badge, Row, Col, Table, Tab, Tabs, ProgressBar } from 'react-bootstrap';

export default function ExamManagement() {
    const [key, setKey] = useState('overview');

    // Mock Data for Integrity Log
    const integrityLogs = [
        { id: 1, student: 'Nguyễn Văn An', studentId: 'SV001', exam: 'Giữa kỳ AI', violation: 'Chuyển tab (3 lần)', time: '10:15:30 25/10/2023', severity: 'medium' },
        { id: 2, student: 'Trần Thị Bình', studentId: 'SV002', exam: 'Giữa kỳ AI', violation: 'Mất focus (5s)', time: '10:20:12 25/10/2023', severity: 'low' },
        { id: 3, student: 'Lê Hoàng Cường', studentId: 'SV003', exam: 'Giữa kỳ AI', violation: 'Phát hiện thiết bị lạ', time: '10:30:00 25/10/2023', severity: 'high' },
    ];

    // Mock Data for Question Bank
    const questions = [
        { id: 1, type: 'Trắc nghiệm', content: 'AI là viết tắt của từ gì?', difficulty: 'Dễ' },
        { id: 2, type: 'Trắc nghiệm', content: 'Mạng nơ-ron nhân tạo lấy cảm hứng từ đâu?', difficulty: 'Trung bình' },
        { id: 3, type: 'Tự luận', content: 'Trình bày ý nghĩa của hàm Loss trong Deep Learning.', difficulty: 'Khó' },
    ];

    return (
        <div className="container-fluid p-4">
            <h2 className="mb-4 text-white">📝 Quản lý Thi & Chấm bài</h2>

            <Tabs
                id="exam-management-tabs"
                activeKey={key}
                onSelect={(k) => setKey(k)}
                className="mb-4"
            >
                {/* 1. Tổng quan - Dashboard */}
                <Tab eventKey="overview" title="📊 Tổng quan Kỳ thi">
                    <Row>
                        <Col md={4} className="mb-4">
                            <Card className="bg-dark text-white border-secondary h-100">
                                <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                                    <h1 className="display-4 fw-bold text-primary">03</h1>
                                    <p className="text-muted">Kỳ thi đang diễn ra</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-4">
                            <Card className="bg-dark text-white border-secondary h-100">
                                <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                                    <h1 className="display-4 fw-bold text-success">150</h1>
                                    <p className="text-muted">Bài thi đã nộp</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-4">
                            <Card className="bg-dark text-white border-secondary h-100">
                                <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                                    <h1 className="display-4 fw-bold text-danger">12</h1>
                                    <p className="text-muted">Vi phạm bị phát hiện</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Tab>

                {/* 2. Quản lý Phòng thi */}
                <Tab eventKey="exam-rooms" title="📝 Quản lý Phòng thi & Đề thi">
                    <Row>
                        <Col md={4}>
                            <Card className="bg-dark text-white border-secondary mb-4">
                                <Card.Header className="border-secondary">
                                    <h5 className="m-0"><i className="bi bi-plus-circle"></i> Tạo Phòng thi Mới</h5>
                                </Card.Header>
                                <Card.Body>
                                    <Form>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Tên kỳ thi</Form.Label>
                                            <Form.Control type="text" placeholder="VD: Giữa kỳ AI 2024" className="bg-secondary text-white border-0" />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Môn học</Form.Label>
                                            <Form.Select className="bg-secondary text-white border-0">
                                                <option>Chọn môn học...</option>
                                                <option>Trí tuệ nhân tạo (CS101)</option>
                                                <option>Học máy (CS102)</option>
                                            </Form.Select>
                                        </Form.Group>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Thời lượng (phút)</Form.Label>
                                                    <Form.Control type="number" placeholder="60" className="bg-secondary text-white border-0" />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Thời gian bắt đầu</Form.Label>
                                                    <Form.Control type="datetime-local" className="bg-secondary text-white border-0" />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Đề thi (PDF/Word)</Form.Label>
                                            <Form.Control type="file" className="bg-secondary text-white border-0" />
                                            <Form.Text className="text-muted">
                                                Tải lên file đề thi thay vì nhập từng câu.
                                            </Form.Text>
                                        </Form.Group>
                                        <Button variant="success" className="w-100">
                                            <i className="bi bi-check-lg"></i> Tạo Phòng thi
                                        </Button>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={8}>
                            <Card className="bg-dark text-white border-secondary">
                                <Card.Header className="d-flex justify-content-between align-items-center border-secondary">
                                    <h5 className="m-0">Danh sách Phòng thi</h5>
                                    <div className="d-flex gap-2">
                                        <Form.Control size="sm" type="text" placeholder="Tìm kiếm..." className="bg-secondary text-white border-0" style={{ width: '200px' }} />
                                    </div>
                                </Card.Header>
                                <Card.Body className="p-0">
                                    <Table hover variant="dark" className="m-0 align-middle">
                                        <thead>
                                            <tr>
                                                <th>Kỳ thi</th>
                                                <th>Môn học</th>
                                                <th>Thời gian</th>
                                                <th>Trạng thái</th>
                                                <th className="text-end">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { id: 1, name: 'Giữa kỳ AI', subject: 'CS101', time: '10:00 25/10/2023', status: 'live' },
                                                { id: 2, name: 'Quiz Machine Learning', subject: 'CS102', time: '14:00 28/10/2023', status: 'upcoming' },
                                            ].map((exam, idx) => (
                                                <tr key={exam.id}>
                                                    <td>
                                                        <div className="fw-bold">{exam.name}</div>
                                                        <small className="text-muted">Đề thi: de_thi_gk.pdf</small>
                                                    </td>
                                                    <td><Badge bg="info">{exam.subject}</Badge></td>
                                                    <td>{exam.time}</td>
                                                    <td>
                                                        {exam.status === 'live' ? <Badge bg="danger" className="animate-pulse">Đang diễn ra</Badge> : <Badge bg="secondary">Sắp tới</Badge>}
                                                    </td>
                                                    <td className="text-end">
                                                        <Button variant="outline-primary" size="sm" className="me-2"><i className="bi bi-pencil"></i></Button>
                                                        <Button variant="outline-danger" size="sm"><i className="bi bi-trash"></i></Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Tab>

                {/* 3. Báo cáo liêm chính - Integrity Log */}
                <Tab eventKey="integrity" title="🚨 Báo cáo gian lận (Integrity Log)">
                    <Card className="bg-dark text-white border-secondary">
                        <Card.Header className="border-secondary bg-danger text-white">
                            <h5 className="m-0"><i className="bi bi-shield-exclamation"></i> Nhật ký phát hiện gian lận AI Monitor</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table hover variant="dark" className="m-0 align-middle">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Sinh viên</th>
                                        <th>Kỳ thi</th>
                                        <th>Lỗi vi phạm</th>
                                        <th>Mức độ</th>
                                        <th>Thời gian</th>
                                        <th className="text-end">Xử lý</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {integrityLogs.map((log, index) => (
                                        <tr key={log.id}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <div>{log.student}</div>
                                                <small className="text-muted">{log.studentId}</small>
                                            </td>
                                            <td>{log.exam}</td>
                                            <td>{log.violation}</td>
                                            <td>
                                                {log.severity === 'high' ? <Badge bg="danger">Nghiêm trọng</Badge> :
                                                    log.severity === 'medium' ? <Badge bg="warning" text="dark">Trung bình</Badge> :
                                                        <Badge bg="secondary">Nhẹ</Badge>}
                                            </td>
                                            <td>{log.time}</td>
                                            <td className="text-end">
                                                <Button variant="outline-warning" size="sm" className="me-2">Cảnh báo</Button>
                                                <Button variant="outline-danger" size="sm">Hủy bài</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Tab>
            </Tabs>
        </div>
    );
}