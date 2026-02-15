import React, { useState } from 'react';
import { Card, ListGroup, Badge, Button, Tab, Tabs, Row, Col } from 'react-bootstrap';

export default function Notification({ user }) {
    const [key, setKey] = useState('all');

    // Mock Notification Data
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'system', title: 'Bảo trì hệ thống', content: 'Hệ thống sẽ bảo trì vào lúc 22:00 ngày 25/10/2023.', time: '10:00 24/10/2023', read: false },
        { id: 2, type: 'course', title: 'Bài tập mới môn AI', content: 'Giảng viên đã đăng bài tập mới cho môn Trí tuệ nhân tạo.', time: '09:30 25/10/2023', read: true },
        { id: 3, type: 'exam', title: 'Nhắc nhở lịch thi', content: 'Kỳ thi giữa kỳ môn AI sẽ bắt đầu vào lúc 08:00 ngày 26/10/2023.', time: '08:00 25/10/2023', read: false },
        { id: 4, type: 'personal', title: 'Cập nhật hồ sơ', content: 'Vui lòng cập nhật thông tin cá nhân của bạn.', time: '14:00 20/10/2023', read: true },
    ]);

    const markAsRead = (id) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const filterNotifications = (filterKey) => {
        if (filterKey === 'all') return notifications;
        if (filterKey === 'unread') return notifications.filter(n => !n.read);
        return notifications.filter(n => n.type === filterKey); // filter by type (system, course, exam)
    };

    const getIcon = (type) => {
        switch (type) {
            case 'system': return <i className="bi bi-gear-fill text-warning"></i>;
            case 'course': return <i className="bi bi-book-half text-info"></i>;
            case 'exam': return <i className="bi bi-pencil-square text-danger"></i>;
            case 'personal': return <i className="bi bi-person-fill text-primary"></i>;
            default: return <i className="bi bi-bell-fill"></i>;
        }
    };

    return (
        <div className="container-fluid p-4">
            <h2 className="mb-4 text-white">🔔 Trung tâm Thông báo</h2>

            <Row>
                <Col md={8} className="mx-auto">
                    <Card className="bg-dark text-white border-secondary shadow-sm">
                        <Card.Header className="d-flex justify-content-between align-items-center border-secondary">
                            <h5 className="m-0">Thông báo của bạn</h5>
                            <Button variant="outline-success" size="sm" onClick={markAllAsRead}>
                                <i className="bi bi-check-all"></i> Đánh dấu đã đọc tất cả
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            <Tabs
                                id="notification-tabs"
                                activeKey={key}
                                onSelect={(k) => setKey(k)}
                                className="mb-3"
                            >
                                <Tab eventKey="all" title="Tất cả" />
                                <Tab eventKey="unread" title="Chưa đọc" />
                                <Tab eventKey="system" title="Hệ thống" />
                                <Tab eventKey="course" title="Học tập" />
                            </Tabs>

                            <ListGroup variant="flush">
                                {filterNotifications(key).length > 0 ? (
                                    filterNotifications(key).map(notif => (
                                        <ListGroup.Item
                                            key={notif.id}
                                            className={`bg-dark text-white border-secondary d-flex justify-content-between align-items-start ${!notif.read ? 'fw-bold' : ''}`}
                                            action
                                            onClick={() => markAsRead(notif.id)}
                                        >
                                            <div className="d-flex w-100 justify-content-between">
                                                <div className="mb-1">
                                                    <div className="d-flex align-items-center mb-1">
                                                        <span className="me-2 fs-5">{getIcon(notif.type)}</span>
                                                        <h6 className="mb-0">{notif.title} {!notif.read && <Badge bg="danger" pill className="ms-2">Mới</Badge>}</h6>
                                                    </div>
                                                    <p className="mb-1 text-muted small">{notif.content}</p>
                                                    <small className="text-secondary">{notif.time}</small>
                                                </div>
                                            </div>
                                        </ListGroup.Item>
                                    ))
                                ) : (
                                    <div className="text-center p-4 text-muted">
                                        <i className="bi bi-bell-slash fs-1 d-block mb-3"></i>
                                        Không có thông báo nào.
                                    </div>
                                )}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}