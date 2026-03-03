import React, { useState } from 'react';
import { Card, Button, Badge, Row, Col, Table, Modal } from 'react-bootstrap';

export default function ClassroomManagement() {
    // Mock Data for Classes
    const [classes] = useState([
        { id: 1, name: 'Lớp AI Cơ bản - CS101', subject: 'Trí tuệ nhân tạo', students: 45, semester: 'HK1 2023-2024', status: 'active' },
        { id: 2, name: 'Lớp Machine Learning - CS102', subject: 'Học máy', students: 38, semester: 'HK1 2023-2024', status: 'active' },
        { id: 3, name: 'Lớp Deep Learning - CS103', subject: 'Học sâu', students: 30, semester: 'HK1 2023-2024', status: 'upcoming' },
        { id: 4, name: 'Lớp Computer Vision - CS104', subject: 'Thị giác máy tính', students: 40, semester: 'HK1 2023-2024', status: 'finished' },
    ]);

    // Mock Data for Students (Simplified for demo)
    const [students, setStudents] = useState([
        { id: 1, name: 'Nguyễn Văn An', studentId: 'SV001', status: 'online', mic: true, cam: true },
        { id: 2, name: 'Trần Thị Bình', studentId: 'SV002', status: 'online', mic: false, cam: true },
        { id: 3, name: 'Lê Hoàng Cường', studentId: 'SV003', status: 'offline', mic: false, cam: false },
        { id: 4, name: 'Phạm Minh Duy', studentId: 'SV004', status: 'online', mic: true, cam: false },
        { id: 5, name: 'Hoàng Thị Ban', studentId: 'SV005', status: 'online', mic: false, cam: false },
    ]);

    const [selectedClass, setSelectedClass] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleClassClick = (cls) => {
        setSelectedClass(cls);
        setShowModal(true);
    };

    const toggleMic = (id) => {
        setStudents(students.map(s => s.id === id ? { ...s, mic: !s.mic } : s));
    };

    const toggleCam = (id) => {
        setStudents(students.map(s => s.id === id ? { ...s, cam: !s.cam } : s));
    };

    const toggleAllMic = (state) => {
        setStudents(students.map(s => ({ ...s, mic: state })));
    };

    const toggleAllCam = (state) => {
        setStudents(students.map(s => ({ ...s, cam: state })));
    };

    return (
        <div className="container-fluid p-4">
            <h2 className="mb-4 text-white">🏫 Quản lý Lớp học</h2>

            <Row>
                {classes.map(cls => (
                    <Col md={4} key={cls.id} className="mb-4">
                        <Card className="h-100 shadow-sm bg-dark text-white border-secondary card-hover" role="button" onClick={() => handleClassClick(cls)}>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <Badge bg={cls.status === 'active' ? 'success' : cls.status === 'upcoming' ? 'info' : 'secondary'}>
                                        {cls.status === 'active' ? 'Đang diễn ra' : cls.status === 'upcoming' ? 'Sắp diễn ra' : 'Đã kết thúc'}
                                    </Badge>
                                    <small className="text-muted text-light">{cls.semester}</small>
                                </div>
                                <Card.Title>{cls.name}</Card.Title>
                                <Card.Subtitle className="mb-3 text-muted">{cls.subject}</Card.Subtitle>
                                <div className="d-flex align-items-center text-light">
                                    <i className="bi bi-people-fill me-2"></i>
                                    {cls.students} Sinh viên
                                </div>
                            </Card.Body>
                            <Card.Footer className="bg-transparent border-secondary text-end">
                                <Button variant="outline-primary" size="sm" onClick={(e) => { e.stopPropagation(); handleClassClick(cls); }}>
                                    Xem chi tiết <i className="bi bi-arrow-right"></i>
                                </Button>
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Modal Danh sách sinh viên */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered contentClassName="bg-dark text-white border-secondary">
                <Modal.Header closeButton closeVariant="white" className="border-secondary">
                    <Modal.Title>Danh sách sinh viên - {selectedClass?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="m-0">Điều khiển nhanh</h5>
                        <div>
                            <Button variant="outline-danger" size="sm" className="me-2" onClick={() => toggleAllCam(false)}>
                                <i className="bi bi-camera-video-off"></i> Tắt hết Cam
                            </Button>
                            <Button variant="outline-warning" size="sm" className="me-2" onClick={() => toggleAllMic(false)}>
                                <i className="bi bi-mic-mute"></i> Tắt hết Mic
                            </Button>
                            <Button variant="outline-success" size="sm" onClick={() => toggleAllMic(true)}>
                                <i className="bi bi-mic"></i> Bật hết Mic
                            </Button>
                        </div>
                    </div>

                    <Table hover variant="dark" className="align-middle">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>MSSV</th>
                                <th>Họ tên</th>
                                <th>Trạng thái</th>
                                <th className="text-center">Mic</th>
                                <th className="text-center">Camera</th>
                                <th className="text-end">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr key={student.id}>
                                    <td>{index + 1}</td>
                                    <td>{student.studentId}</td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-secondary d-flex justify-content-center align-items-center me-2" style={{ width: '30px', height: '30px' }}>
                                                {student.name.charAt(0)}
                                            </div>
                                            {student.name}
                                        </div>
                                    </td>
                                    <td>
                                        {student.status === 'online' ? (
                                            <Badge bg="success">Online</Badge>
                                        ) : (
                                            <Badge bg="secondary">Offline</Badge>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        <i className={`bi ${student.mic ? 'bi-mic-fill text-success' : 'bi-mic-mute-fill text-danger'}`} style={{ fontSize: '1.2rem' }}></i>
                                    </td>
                                    <td className="text-center">
                                        <i className={`bi ${student.cam ? 'bi-camera-video-fill text-success' : 'bi-camera-video-off-fill text-danger'}`} style={{ fontSize: '1.2rem' }}></i>
                                    </td>
                                    <td className="text-end">
                                        <Button
                                            variant={student.mic ? "outline-warning" : "outline-success"}
                                            size="sm"
                                            className="me-2"
                                            onClick={() => toggleMic(student.id)}
                                            disabled={student.status === 'offline'}
                                        >
                                            <i className={`bi ${student.mic ? 'bi-mic-mute' : 'bi-mic'}`}></i>
                                        </Button>
                                        <Button
                                            variant={student.cam ? "outline-danger" : "outline-primary"}
                                            size="sm"
                                            onClick={() => toggleCam(student.id)}
                                            disabled={student.status === 'offline'}
                                        >
                                            <i className={`bi ${student.cam ? 'bi-camera-video-off' : 'bi-camera-video'}`}></i>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer className="border-secondary">
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}