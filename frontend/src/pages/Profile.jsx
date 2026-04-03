import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Profile = ({ user }) => {
    const [formData, setFormData] = useState({
        displayName: '',
        avatar: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || user.name,
                avatar: user.avatar || ''
            });
        }
    }, [user]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put('/auth/profile', formData);
            toast.success('Cập nhật hồ sơ thành công!');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (err) {
            toast.error('Lỗi khi cập nhật hồ sơ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="container-fluid p-4"
        >
            <div className="d-flex align-items-center mb-4">
                <div className="bg-primary bg-opacity-10 p-3 rounded-4 me-3 text-primary shadow-sm">
                    <i className="bi bi-person-badge-fill fs-3"></i>
                </div>
                <div>
                    <h2 className="fw-800 mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>Hồ sơ cá nhân</h2>
                    <p className="text-muted fw-500 mb-0">Quản lý thông tin và cài đặt tài khoản của bạn</p>
                </div>
            </div>

            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                        {/* Cover Image */}
                        <div className="bg-primary" style={{ height: '120px', background: 'linear-gradient(135deg, var(--primary-color), #4db8ff)' }}></div>
                        
                        <Card.Body className="position-relative px-4 pb-4 px-md-5 pb-md-5 pt-0">
                            {/* Avatar Section */}
                            <div className="d-flex flex-column flex-sm-row align-items-sm-end mb-4 position-relative" style={{ marginTop: '-45px' }}>
                                <div className="position-relative d-inline-block">
                                    {formData.avatar ? (
                                        <img 
                                            src={formData.avatar} 
                                            alt="Avatar" 
                                            className="rounded-circle border border-4 border-white shadow-sm bg-white object-fit-cover"
                                            style={{ width: '100px', height: '100px' }}
                                        />
                                    ) : (
                                        <div className="rounded-circle border border-4 border-white shadow-sm bg-light text-primary d-flex align-items-center justify-content-center fw-800" style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}>
                                            {(formData.displayName || user?.name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <Badge bg={user?.role === 'lecturer' ? "danger" : user?.role === 'admin' ? 'dark' : "success"} className="position-absolute bottom-0 end-0 translate-middle-x px-3 py-1 rounded-pill border border-2 border-white shadow-sm fw-bold">
                                        {user?.role === 'lecturer' ? 'Giảng viên' : user?.role === 'admin' ? 'Quản trị viên' : 'Sinh viên'}
                                    </Badge>
                                </div>
                                <div className="ms-sm-4 mt-3 mt-sm-0 pt-sm-3">
                                    <h4 className="fw-800 text-dark mb-1">{formData.displayName}</h4>
                                    <p className="text-muted fw-500 mb-0"><i className="bi bi-envelope-fill me-2"></i>{user?.email}</p>
                                </div>
                            </div>

                            <hr className="text-muted opacity-25 mb-4" />

                            <Form onSubmit={onSubmit}>
                                <Row className="g-4">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="fw-700 text-secondary small text-uppercase" style={{ letterSpacing: '0.05em' }}>Email đăng nhập</Form.Label>
                                            <Form.Control 
                                                type="email" 
                                                value={user?.email} 
                                                disabled 
                                                className="bg-light text-muted border-0 shadow-none rounded-pill px-4 py-3 fw-500"
                                            />
                                            <Form.Text className="text-muted"><i className="bi bi-info-circle me-1"></i> Email không thể thay đổi</Form.Text>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="fw-700 text-secondary small text-uppercase" style={{ letterSpacing: '0.05em' }}>Vai trò hệ thống</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                value={user?.role === 'lecturer' ? 'Giảng viên' : user?.role === 'admin' ? 'Quản trị viên' : 'Sinh viên'} 
                                                disabled 
                                                className="bg-light text-muted border-0 shadow-none rounded-pill px-4 py-3 fw-500"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="fw-700 text-dark">Họ và Tên hiển thị</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                name="displayName"
                                                value={formData.displayName}
                                                onChange={onChange}
                                                placeholder="Nhập tên hiển thị..."
                                                className="bg-white border-light shadow-sm rounded-pill px-4 py-3 text-dark fw-bold"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="fw-700 text-dark">URL Ảnh đại diện (Avatar)</Form.Label>
                                            <Form.Control 
                                                type="url" 
                                                name="avatar"
                                                value={formData.avatar}
                                                onChange={onChange}
                                                placeholder="https://example.com/avatar.png"
                                                className="bg-white border-light shadow-sm rounded-pill px-4 py-3 text-secondary"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="d-flex justify-content-end mt-5 pt-3 border-top border-light">
                                    <Button 
                                        type="submit" 
                                        variant="primary" 
                                        className="rounded-pill px-5 py-2 fw-bold shadow-sm d-flex align-items-center"
                                        style={{ background: 'linear-gradient(135deg, var(--primary-color), #4db8ff)', border: 'none' }}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Đang lưu...</>
                                        ) : (
                                            <><i className="bi bi-save2-fill me-2"></i> Lưu thay đổi</>
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </motion.div>
    );
};

export default Profile;
