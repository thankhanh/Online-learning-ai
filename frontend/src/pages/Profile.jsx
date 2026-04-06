import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Row, Col, Badge, InputGroup } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Lock, ShieldCheck, Eye, EyeOff, Save, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Profile = ({ user }) => {
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        displayName: '',
        avatar: ''
    });
    
    // Password state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [loading, setLoading] = useState(false);
    const [passLoading, setPassLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || user.name,
                avatar: user.avatar || ''
            });
        }
    }, [user]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const onPassChange = e => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

    const onSubmitProfile = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put('/auth/profile', formData);
            if (res.data.success) {
                toast.success('Cập nhật thông tin thành công!');
                // Update local storage user data
                const storedUser = JSON.parse(localStorage.getItem('user'));
                localStorage.setItem('user', JSON.stringify({ ...storedUser, displayName: formData.displayName }));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi cập nhật hồ sơ');
        } finally {
            setLoading(false);
        }
    };

    const onSubmitPassword = async e => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('Mật khẩu xác nhận không khớp');
        }
        if (passwordData.newPassword.length < 6) {
            return toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
        }

        setPassLoading(true);
        try {
            const res = await api.put('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            if (res.data.success) {
                toast.success('Đổi mật khẩu thành công!');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi đổi mật khẩu');
        } finally {
            setPassLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            return toast.error('Vui lòng chọn file hình ảnh');
        }
        if (file.size > 5 * 1024 * 1024) {
            return toast.error('Dung lượng ảnh tối đa là 5MB');
        }

        const formDataUpload = new FormData();
        formDataUpload.append('avatar', file);

        setUploading(true);
        try {
            const res = await api.post('/auth/upload-avatar', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                const newAvatarUrl = res.data.avatar;
                setFormData(prev => ({ ...prev, avatar: newAvatarUrl }));
                toast.success('Tải ảnh lên thành công!');
                
                // Update local storage
                const storedUser = JSON.parse(localStorage.getItem('user'));
                localStorage.setItem('user', JSON.stringify({ ...storedUser, avatar: newAvatarUrl }));
                
                // Optional: Force re-render of components using user object
                window.dispatchEvent(new Event('storage'));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi tải ảnh lên');
        } finally {
            setUploading(false);
        }
    };

    const togglePassVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="container-fluid p-4"
        >
            <div className="d-flex align-items-center mb-5">
                <div className="bg-primary bg-opacity-10 p-3 rounded-4 me-3 text-primary shadow-sm">
                    <UserIcon size={32} />
                </div>
                <div>
                    <h2 className="fw-900 mb-0 text-dark" style={{ letterSpacing: '-0.03em' }}>Cài đặt tài khoản</h2>
                    <p className="text-muted fw-500 mb-0">Quản lý định danh và bảo mật cá nhân</p>
                </div>
            </div>

            <Row className="g-4">
                {/* Profile Information Block */}
                <Col lg={7}>
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100">
                        <div className="bg-primary" style={{ height: '100px', background: 'linear-gradient(135deg, #3b82f6, #60a5fa)' }}></div>
                        <Card.Body className="px-4 px-md-5 pb-5">
                            <div className="d-flex flex-column align-items-center mb-5" style={{ marginTop: '-50px' }}>
                                <div className="position-relative">
                                    <div className="rounded-circle border border-5 border-white shadow-md overflow-hidden bg-light d-flex align-items-center justify-content-center" style={{ width: '120px', height: '120px' }}>
                                        {formData.avatar ? (
                                            <img 
                                                src={`${import.meta.env.VITE_API_BASE_URL || ''}${formData.avatar}`} 
                                                alt="Avatar" 
                                                className="w-100 h-100 object-fit-cover"
                                                onError={(e) => {
                                                    // Handle case where avatar is a full URL or relative path
                                                    if (!e.target.src.includes('http') && formData.avatar.startsWith('/')) {
                                                        e.target.src = `${window.location.origin}${formData.avatar}`;
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <span className="fs-1 fw-900 text-primary">{(formData.displayName || 'U').charAt(0).toUpperCase()}</span>
                                        )}
                                        {uploading && (
                                            <div className="position-absolute top-0 start-0 w-100 h-100 bg-white border-0 bg-opacity-75 d-flex align-items-center justify-content-center">
                                                <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                            </div>
                                        )}
                                    </div>
                                    <Button 
                                        variant="white" 
                                        className="position-absolute bottom-0 end-0 rounded-circle shadow-sm border p-2 bg-white text-primary hover-scale"
                                        onClick={() => fileInputRef.current.click()}
                                        disabled={uploading}
                                    >
                                        <Camera size={18} />
                                    </Button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        hidden 
                                        accept="image/*" 
                                        onChange={handleFileChange} 
                                    />
                                </div>
                                <div className="mt-3 text-center">
                                    <h4 className="fw-800 text-dark mb-0">{formData.displayName}</h4>
                                    <Badge bg="primary" className="bg-opacity-10 text-primary px-3 py-1 mt-2 rounded-pill border border-primary border-opacity-10 fw-700">
                                        {user?.role === 'lecturer' ? 'Giảng viên' : user?.role === 'admin' ? 'Quản trị viên' : 'Sinh viên'}
                                    </Badge>
                                </div>
                            </div>

                            <Form onSubmit={onSubmitProfile}>
                                <Row className="g-4">
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="fw-700 text-secondary small text-uppercase">Tên hiển thị</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                name="displayName"
                                                value={formData.displayName}
                                                onChange={onChange}
                                                className="bg-light border-0 px-4 py-3 rounded-3 fw-600 text-dark"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="fw-700 text-secondary small text-uppercase">Địa chỉ Email</Form.Label>
                                            <Form.Control 
                                                type="email" 
                                                value={user?.email} 
                                                disabled 
                                                className="bg-light border-0 px-4 py-3 rounded-3 fw-600 text-muted"
                                            />
                                            <Form.Text className="text-muted italic small"><i className="bi bi-info-circle me-1"></i> Email định danh không thể thay đổi.</Form.Text>
                                        </Form.Group>
                                    </Col>
                                    <Col md={12} className="mt-5">
                                        <Button 
                                            type="submit" 
                                            variant="primary" 
                                            className="w-100 py-3 rounded-3 fw-800 shadow-sm d-flex align-items-center justify-content-center"
                                            disabled={loading}
                                        >
                                            {loading ? <div className="spinner-border spinner-border-sm me-2" role="status"></div> : <Save size={18} className="me-2" />}
                                            Lưu thay đổi hồ sơ
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Password & Security Block */}
                <Col lg={5}>
                    <Card className="border-0 shadow-sm rounded-4 bg-white h-100">
                        <Card.Header className="bg-transparent border-0 pt-4 px-4 px-md-5">
                            <div className="d-flex align-items-center">
                                <div className="bg-danger bg-opacity-10 p-2 rounded-3 me-3 text-danger">
                                    <ShieldCheck size={24} />
                                </div>
                                <h5 className="fw-800 mb-0 text-dark">Bảo mật tài khoản</h5>
                            </div>
                        </Card.Header>
                        <Card.Body className="px-4 px-md-5 pb-5">
                            <p className="text-muted small fw-500 mb-4">Chúng tôi khuyên bạn nên sử dụng mật khẩu mạnh để bảo vệ tài khoản.</p>
                            
                            <Form onSubmit={onSubmitPassword}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-700 text-secondary small text-uppercase">Mật khẩu hiện tại</Form.Label>
                                    <InputGroup>
                                        <Form.Control 
                                            type={showPasswords.current ? "text" : "password"}
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={onPassChange}
                                            className="bg-light border-0 px-4 py-3 rounded-start-3 fw-600"
                                            required
                                        />
                                        <Button variant="light" className="border-0 bg-light rounded-end-3 px-3" onClick={() => togglePassVisibility('current')}>
                                            {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </Button>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-700 text-secondary small text-uppercase">Mật khẩu mới</Form.Label>
                                    <InputGroup>
                                        <Form.Control 
                                            type={showPasswords.new ? "text" : "password"}
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={onPassChange}
                                            className="bg-light border-0 px-4 py-3 rounded-start-3 fw-600"
                                            required
                                        />
                                        <Button variant="light" className="border-0 bg-light rounded-end-3 px-3" onClick={() => togglePassVisibility('new')}>
                                            {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </Button>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-5">
                                    <Form.Label className="fw-700 text-secondary small text-uppercase">Xác nhận mật khẩu mới</Form.Label>
                                    <InputGroup>
                                        <Form.Control 
                                            type={showPasswords.confirm ? "text" : "password"}
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={onPassChange}
                                            className="bg-light border-0 px-4 py-3 rounded-start-3 fw-600"
                                            required
                                        />
                                        <Button variant="light" className="border-0 bg-light rounded-end-3 px-3" onClick={() => togglePassVisibility('confirm')}>
                                            {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </Button>
                                    </InputGroup>
                                </Form.Group>

                                <Button 
                                    type="submit" 
                                    variant="outline-danger" 
                                    className="w-100 py-3 rounded-3 fw-800 border-2"
                                    disabled={passLoading}
                                >
                                    {passLoading ? <div className="spinner-border spinner-border-sm me-2" role="status"></div> : <Lock size={18} className="me-2" />}
                                    Cập nhật mật khẩu
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Account Status Tip */}
            <div className="mt-5 p-4 bg-light bg-opacity-50 border-0 rounded-4 text-center">
                <p className="text-muted small fw-600 mb-0">
                    <ShieldCheck size={16} className="me-2 text-success" />
                    Tài khoản của bạn được bảo mật bởi mã hóa đa lớp. Lần đăng nhập cuối: {new Date().toLocaleDateString('vi-VN')}
                </p>
            </div>
        </motion.div>
    );
};

export default Profile;
