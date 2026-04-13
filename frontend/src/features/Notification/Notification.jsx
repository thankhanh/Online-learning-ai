import React, { useState } from 'react';
import { Card, ListGroup, Badge, Button, Tab, Tabs, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, Info, AlertTriangle, User, Settings, Trash2 } from 'lucide-react';

export default function Notification({ user, notifications = [], markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications }) {
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
            case 'system': return <Settings size={20} />;
            case 'course': return <Info size={20} />;
            case 'exam': return <AlertTriangle size={20} />;
            case 'personal': return <User size={20} />;
            default: return <Bell size={20} />;
        }
    };

    const getIconColorClass = (type) => {
        switch (type) {
            case 'system': return 'bg-warning text-warning';
            case 'course': return 'bg-info text-info';
            case 'exam': return 'bg-danger text-danger';
            case 'personal': return 'bg-primary text-primary';
            default: return 'bg-secondary text-secondary';
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="container-fluid p-4"
        >
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-4 me-3 text-primary shadow-sm border border-primary border-opacity-10">
                        <Bell size={28} />
                    </div>
                    <div>
                        <h2 className="fw-800 mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>Trung tâm Thông báo</h2>
                        <p className="text-muted fw-500 mb-0">Theo dõi các tin tức và cập nhật mới nhất từ hệ thống</p>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <Button 
                        variant="outline-primary" 
                        onClick={markAllAsRead} 
                        className="rounded-pill px-4 fw-600 border-2 shadow-sm"
                    >
                        <CheckCircle size={18} className="me-2 mb-1" /> Đã đọc hết
                    </Button>
                    <Button 
                        variant="outline-danger" 
                        onClick={deleteAllNotifications} 
                        className="rounded-pill px-4 fw-600 border-2 shadow-sm"
                    >
                        <Trash2 size={18} className="me-2 mb-1" /> Xóa tất cả
                    </Button>
                </div>
            </div>

            <Row>
                <Col lg={10} className="mx-auto">
                    <Card className="bg-white border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                        <Card.Header className="bg-white border-bottom border-light p-0">
                            <Tabs
                                id="notification-tabs"
                                activeKey={key}
                                onSelect={(k) => setKey(k)}
                                className="custom-tabs-premium border-0 px-4"
                            >
                                <Tab eventKey="all" title={<span><Bell size={16} className="me-2" /> Tất cả</span>} />
                                <Tab eventKey="unread" title={<span><i className="bi bi-circle-fill text-danger me-2" style={{ fontSize: '0.5rem' }}></i> Chưa đọc</span>} />
                                <Tab eventKey="system" title={<span><Settings size={16} className="me-2" /> Hệ thống</span>} />
                                <Tab eventKey="course" title={<span><Info size={16} className="me-2" /> Học tập</span>} />
                            </Tabs>
                        </Card.Header>

                        <ListGroup variant="flush">
                            {notifications && filterNotifications(key).length > 0 ? (
                                filterNotifications(key).map(notif => (
                                    <ListGroup.Item
                                        key={notif.id || notif._id}
                                        className={`bg-white text-dark border-bottom border-light p-4 transition-fast hover-bg-light ${!notif.read ? 'bg-primary bg-opacity-5' : ''}`}
                                        action
                                        onClick={() => markAsRead(notif.id || notif._id)}
                                        style={{ 
                                            borderLeft: !notif.read ? '4px solid var(--primary-color)' : '4px solid transparent',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div className="d-flex w-100 justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                                <div className={`me-3 p-3 rounded-circle d-flex align-items-center justify-content-center bg-opacity-10 shadow-sm ${getIconColorClass(notif.type)}`}>
                                                    {getIcon(notif.type)}
                                                </div>
                                                <div>
                                                    <div className="d-flex align-items-center mb-1">
                                                        <h6 className={`mb-0 ${!notif.read ? 'fw-800 text-dark' : 'fw-600 text-secondary'}`} style={{ fontSize: '1.05rem' }}>
                                                            {notif.title}
                                                        </h6>
                                                        {!notif.read && (
                                                            <Badge bg="danger" className="ms-2 px-2 py-1 rounded-pill fw-bold" style={{ fontSize: '0.65rem' }}>
                                                                MỚI
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className={`mb-1 ${!notif.read ? 'text-dark' : 'text-muted'} fw-500`} style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                                                        {notif.content}
                                                    </p>
                                                    <div className="d-flex align-items-center mt-2 opacity-75">
                                                        <i className="bi bi-clock me-1 small"></i>
                                                        <small className="fw-600" style={{ fontSize: '0.75rem' }}>{notif.time || new Date(notif.createdAt).toLocaleString('vi-VN')}</small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                {notif.read ? (
                                                    <div className="text-success opacity-50 px-3">
                                                        <CheckCircle size={22} />
                                                    </div>
                                                ) : (
                                                    <div className="bg-primary rounded-circle mx-3 border border-white shadow-sm" style={{ width: '12px', height: '12px' }}></div>
                                                )}
                                                <Button 
                                                    variant="light" 
                                                    size="sm" 
                                                    className="text-danger rounded-circle shadow-sm border p-0 d-flex align-items-center justify-content-center transition-fast" 
                                                    style={{ width: '38px', height: '38px' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(notif.id || notif._id);
                                                    }}
                                                >
                                                    <Trash2 size={18} />
                                                </Button>
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                ))
                            ) : (
                                <div className="text-center py-5">
                                    <div className="bg-light rounded-circle d-inline-flex p-5 mb-4 shadow-inner border">
                                        <Bell size={64} className="text-secondary opacity-25" />
                                    </div>
                                    <h4 className="fw-800 text-dark">Hết sạch thông báo!</h4>
                                    <p className="text-muted fw-500">Tuyệt vời, bạn đã cập nhật hết mọi tin tức từ hệ thống rồi đó.</p>
                                    <Button variant="outline-primary" className="mt-2 rounded-pill px-4 fw-600 border-2" onClick={() => window.history.back()}>
                                        Quay lại trang chính
                                    </Button>
                                </div>
                            )}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </motion.div>
    );
}