import React, { useState } from 'react';
import { Card, ListGroup, Badge, Button, Tab, Tabs, Row, Col } from 'react-bootstrap';

export default function Notification({ user, notifications, markAsRead, markAllAsRead }) {
    const [key, setKey] = useState('all');

    const filterNotifications = (filterKey) => {
        if (filterKey === 'all') return notifications;
        if (filterKey === 'unread') return notifications.filter(n => !n.read);
        if (filterKey === 'system') return notifications.filter(n => n.type === 'system');
        if (filterKey === 'course') return notifications.filter(n => n.type === 'course');
        return notifications;
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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-white m-0"><i className="bi bi-bell-fill me-2 text-warning"></i> Trung tâm Thông báo</h2>
                <Button variant="outline-success" size="sm" onClick={markAllAsRead} className="rounded-pill px-3">
                    <i className="bi bi-check-all me-1"></i> Đọc tất cả
                </Button>
            </div>

            <Row>
                <Col md={10} className="mx-auto">
                    <Card className="bg-dark text-white border-0 shadow-lg" style={{ borderRadius: '15px' }}>
                        <Card.Body className="p-0">
                            <div className="p-3 border-bottom border-secondary border-opacity-25">
                                <Tabs
                                    id="notification-tabs"
                                    activeKey={key}
                                    onSelect={(k) => setKey(k)}
                                    className="custom-tabs"
                                >
                                    <Tab eventKey="all" title="🔔 Tất cả" />
                                    <Tab eventKey="unread" title="🔴 Chưa đọc" />
                                    <Tab eventKey="system" title="⚙️ Hệ thống" />
                                    <Tab eventKey="course" title="📖 Học tập" />
                                </Tabs>
                            </div>

                            <ListGroup variant="flush">
                                {filterNotifications(key).length > 0 ? (
                                    filterNotifications(key).map(notif => (
                                        <ListGroup.Item
                                            key={notif.id}
                                            className={`bg-dark text-white border-secondary border-opacity-25 p-4 transition-all hover-glow ${!notif.read ? 'bg-primary bg-opacity-10' : ''}`}
                                            action
                                            onClick={() => markAsRead(notif.id)}
                                            style={{ borderLeft: !notif.read ? '4px solid #0d6efd' : '4px solid transparent' }}
                                        >
                                            <div className="d-flex w-100 justify-content-between align-items-start">
                                                <div className="d-flex">
                                                    <div className="me-4 fs-3 bg-secondary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                                        {getIcon(notif.type)}
                                                    </div>
                                                    <div>
                                                        <div className="d-flex align-items-center mb-1">
                                                            <h6 className={`mb-0 ${!notif.read ? 'fw-bold text-white' : 'text-muted'}`}>{notif.title}</h6>
                                                            {!notif.read && <Badge bg="danger" pill className="ms-2" style={{ fontSize: '0.6rem' }}>MỚI</Badge>}
                                                        </div>
                                                        <p className={`mb-1 ${!notif.read ? 'text-light' : 'text-muted'} small`}>{notif.content}</p>
                                                        <div className="d-flex align-items-center mt-2">
                                                            <i className="bi bi-clock me-1 small text-muted"></i>
                                                            <small className="text-muted" style={{ fontSize: '0.7rem' }}>{notif.time}</small>
                                                        </div>
                                                    </div>
                                                </div>
                                                {notif.read && <i className="bi bi-check2-all text-success fs-5"></i>}
                                            </div>
                                        </ListGroup.Item>
                                    ))
                                ) : (
                                    <div className="text-center p-5 text-muted">
                                        <div className="bg-secondary bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3">
                                            <i className="bi bi-bell-slash fs-1 text-secondary"></i>
                                        </div>
                                        <h5 className="fw-bold">Hết sạch thông báo!</h5>
                                        <p className="small mb-0">Bạn đã cập nhật hết mọi tin tức rồi đó.</p>
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