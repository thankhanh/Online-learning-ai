import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Form, InputGroup, Modal, Spinner } from 'react-bootstrap';
import { Search, Plus, Edit, Trash2, Filter } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'student', status: 'active' });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users');
            if (res.data.success) {
                setUsers(res.data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleShowModal = (user = null) => {
        if (user) {
            setSelectedUser(user);
            setFormData({ name: user.name, email: user.email, role: user.role, status: user.status || 'active' });
        } else {
            setSelectedUser(null);
            setFormData({ name: '', email: '', role: 'student', status: 'active' });
        }
        setShowModal(true);
    };

    const handleResetPassword = (id) => {
        toast.custom((t) => (
            <div className={`d-flex align-items-center justify-content-center transition-all ${t.visible ? 'opacity-100' : 'opacity-0'}`} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
                <div className="bg-white p-4 rounded-4 shadow-lg text-center mx-3" style={{ maxWidth: '400px', transform: t.visible ? 'scale(1)' : 'scale(0.9)', transition: 'all 0.2s ease-out' }}>
                    <div className="text-info mb-3"><i className="bi bi-key-fill border border-2 border-info rounded-circle p-3 fs-3"></i></div>
                    <h5 className="fw-800 text-dark mb-2">Reset Mật khẩu</h5>
                    <p className="text-muted mb-4">Bạn có chắc muốn đặt lại mật khẩu của người dùng này về <strong>"123456"</strong>?</p>
                    <div className="d-flex gap-2 justify-content-center">
                        <Button variant="light" className="rounded-pill px-4 fw-600" onClick={() => toast.dismiss(t.id)}>Hủy</Button>
                        <Button variant="info" className="rounded-pill px-4 fw-600 text-white shadow-sm" onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                const res = await api.put(`/users/${id}/reset-password`);
                                if (res.data.success) {
                                    toast.success('Đã đặt lại mật khẩu thành công!');
                                }
                            } catch (error) {
                                toast.error('Không thể đặt lại mật khẩu.');
                            }
                        }}>Xác nhận</Button>
                    </div>
                </div>
            </div>
        ), { duration: Infinity, id: `reset-${id}` });
    };

    const handleToggleStatus = (user) => {
        const newStatus = user.status === 'active' ? 'blocked' : 'active';
        const actionText = newStatus === 'active' ? 'mở khóa' : 'khóa';
        const iconClass = newStatus === 'active' ? 'bi-unlock-fill text-success border-success' : 'bi-lock-fill text-warning border-warning';
        
        toast.custom((t) => (
            <div className={`d-flex align-items-center justify-content-center transition-all ${t.visible ? 'opacity-100' : 'opacity-0'}`} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
                <div className="bg-white p-4 rounded-4 shadow-lg text-center mx-3" style={{ maxWidth: '400px', transform: t.visible ? 'scale(1)' : 'scale(0.9)', transition: 'all 0.2s ease-out' }}>
                    <div className="mb-3"><i className={`bi ${iconClass} border border-2 rounded-circle p-3 fs-3`}></i></div>
                    <h5 className="fw-800 text-dark mb-2">Chuyển trạng thái</h5>
                    <p className="text-muted mb-4">Bạn có chắc muốn <strong>{actionText}</strong> tài khoản này?</p>
                    <div className="d-flex gap-2 justify-content-center">
                        <Button variant="light" className="rounded-pill px-4 fw-600" onClick={() => toast.dismiss(t.id)}>Hủy</Button>
                        <Button variant={newStatus === 'active' ? 'success' : 'warning'} className="rounded-pill px-4 fw-600 text-white shadow-sm" onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                const res = await api.put(`/users/${user._id || user.id}`, { status: newStatus });
                                if (res.data.success) {
                                    setUsers(prev => prev.map(u => (u._id === user._id || u.id === user.id) ? { ...u, status: newStatus } : u));
                                    toast.success(`Đã ${actionText} tài khoản thành công.`);
                                }
                            } catch (error) {
                                toast.error(`Không thể ${actionText} tài khoản.`);
                            }
                        }}>Xác nhận</Button>
                    </div>
                </div>
            </div>
        ), { duration: Infinity, id: `toggle-${user._id || user.id}` });
    };

    const handleSave = async () => {
        try {
            if (selectedUser) {
                // Update
                const res = await api.put(`/users/${selectedUser._id || selectedUser.id}`, formData);
                if (res.data.success) {
                    setUsers(users.map(u => (u._id === selectedUser._id || u.id === selectedUser.id) ? { ...u, ...formData } : u));
                    toast.success('Cập nhật người dùng thành công!');
                }
            } else {
                // Add
                const res = await api.post('/users', { ...formData, password: '123456' });
                if (res.data.success) {
                    setUsers([res.data.user, ...users]);
                    toast.success('Thêm người dùng mới thành công! Mật khẩu mặc định: 123456');
                }
            }
            setShowModal(false);
        } catch (error) {
            toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = (id) => {
        toast.custom((t) => (
            <div className={`d-flex align-items-center justify-content-center transition-all ${t.visible ? 'opacity-100' : 'opacity-0'}`} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
                <div className="bg-white p-4 rounded-4 shadow-lg text-center mx-3" style={{ maxWidth: '400px', transform: t.visible ? 'scale(1)' : 'scale(0.9)', transition: 'all 0.2s ease-out' }}>
                    <div className="text-danger mb-3"><i className="bi bi-trash3-fill border border-2 border-danger rounded-circle p-3 fs-3"></i></div>
                    <h5 className="fw-800 text-dark mb-2">Cảnh báo Xóa</h5>
                    <p className="text-muted mb-4">Hành động này không thể hoàn tác. Bạn có chắc muốn <strong>xóa vĩnh viễn</strong> người dùng này?</p>
                    <div className="d-flex gap-2 justify-content-center">
                        <Button variant="light" className="rounded-pill px-4 fw-600" onClick={() => toast.dismiss(t.id)}>Hủy bỏ</Button>
                        <Button variant="danger" className="rounded-pill px-4 fw-600 shadow-sm" onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                const res = await api.delete(`/users/${id}`);
                                if (res.data.success) {
                                    setUsers(prev => prev.filter(u => (u._id !== id && u.id !== id)));
                                    toast.success('Đã xóa người dùng.');
                                }
                            } catch (error) {
                                toast.error('Không thể xóa người dùng.');
                            }
                        }}>Xóa ngay</Button>
                    </div>
                </div>
            </div>
        ), { duration: Infinity, id: `delete-${id}` });
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid p-4">
            <div className="d-flex align-items-center mb-4">
                <div className="bg-primary bg-opacity-10 p-3 rounded-4 me-3 text-primary shadow-sm border border-primary border-opacity-10">
                    <i className="bi bi-people-fill fs-3"></i>
                </div>
                <div>
                    <h2 className="fw-800 mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>Quản lý Tài khoản</h2>
                    <p className="text-muted fw-500 mb-0">Quản lý sinh viên, giảng viên và quyền truy cập vào hệ thống</p>
                </div>
            </div>

            <Card className="bg-white border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <Card.Body className="p-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                        <div className="d-flex gap-2 w-100" style={{ maxWidth: '500px' }}>
                            <InputGroup className="shadow-sm rounded-pill overflow-hidden border border-light">
                                <InputGroup.Text className="bg-light border-0 text-muted px-3">
                                    <Search size={18} />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Tìm kiếm người dùng, email..."
                                    className="bg-light text-dark border-0 shadow-none px-2 py-2 fw-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                            <Button variant="light" className="border-light rounded-pill px-3 shadow-sm text-secondary">
                                <Filter size={18} />
                            </Button>
                        </div>
                        <Button variant="primary" onClick={() => handleShowModal()} className="rounded-pill px-4 fw-bold shadow-sm text-nowrap" style={{ background: 'linear-gradient(135deg, var(--primary-color), #4db8ff)', border: 'none' }}>
                            <Plus size={18} className="me-2 align-text-bottom" /> Thêm mới
                        </Button>
                    </div>

                    <div className="table-responsive">
                        {loading ? (
                            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                        ) : (
                            <Table hover className="align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4 py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Thông tin người dùng</th>
                                        <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Vai trò</th>
                                        <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Trạng thái</th>
                                        <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Ngày tạo</th>
                                        <th className="pe-4 py-3 border-light text-end text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user._id || user.id} className="border-bottom border-light hover-bg-light transition-fast">
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-800 me-3 shadow-sm border border-primary border-opacity-10" style={{ width: '40px', height: '40px' }}>
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="fw-800 text-dark mb-1">{user.name}</div>
                                                        <div className="small text-muted fw-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                {user.role === 'admin' ? <Badge bg="danger" className="bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-2 rounded-pill fw-700 shadow-sm">Admin</Badge> :
                                                    user.role === 'lecturer' ? <Badge bg="info" className="bg-opacity-10 text-info border border-info border-opacity-25 px-3 py-2 rounded-pill fw-700 shadow-sm">Giảng viên</Badge> :
                                                        <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill fw-700 shadow-sm">Sinh viên</Badge>}
                                            </td>
                                            <td className="py-3">
                                                {user.status === 'blocked' ? (
                                                    <Badge bg="danger" className="bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1 rounded-pill fw-600">
                                                        <i className="bi bi-x-circle-fill me-1" style={{ fontSize: '0.5rem' }}></i>Đã khóa
                                                    </Badge>
                                                ) : (
                                                    <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill fw-600">
                                                        <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }}></i>Hoạt động
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="py-3 text-muted small fw-600">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                                            <td className="pe-4 py-3 text-end">
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className={`me-2 rounded-circle shadow-sm ${user.status === 'blocked' ? 'text-success' : 'text-warning'}`}
                                                    style={{ width: '35px', height: '35px', padding: 0 }}
                                                    title={user.status === 'blocked' ? 'Mở khóa' : 'Khóa tài khoản'}
                                                    onClick={() => handleToggleStatus(user)}
                                                >
                                                    {user.status === 'blocked' ? <i className="bi bi-unlock-fill"></i> : <i className="bi bi-lock-fill"></i>}
                                                </Button>
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className="text-info me-2 rounded-circle shadow-sm"
                                                    style={{ width: '35px', height: '35px', padding: 0 }}
                                                    title="Reset mật khẩu"
                                                    onClick={() => handleResetPassword(user._id || user.id)}
                                                >
                                                    <i className="bi bi-key-fill"></i>
                                                </Button>
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className="text-primary me-2 rounded-circle shadow-sm"
                                                    style={{ width: '35px', height: '35px', padding: 0 }}
                                                    title="Chỉnh sửa"
                                                    onClick={() => handleShowModal(user)}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className="text-danger rounded-circle shadow-sm"
                                                    style={{ width: '35px', height: '35px', padding: 0 }}
                                                    title="Xóa"
                                                    onClick={() => handleDelete(user._id || user.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5 text-muted fw-500">Không tìm thấy người dùng nào.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        )}
                    </div>
                </Card.Body>
            </Card>

            {/* Modal Add/Edit User */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="bg-white text-dark shadow-lg rounded-4 border-0">
                <Modal.Header closeButton className="border-bottom bg-light bg-opacity-50 border-light px-4 py-3">
                    <Modal.Title className="fw-800 text-dark">{selectedUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-700 text-secondary">Họ và tên</Form.Label>
                            <Form.Control
                                type="text"
                                className="bg-light text-dark border-light shadow-sm rounded-pill px-3 py-2"
                                placeholder="Nhập họ và tên..."
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-700 text-secondary">Email</Form.Label>
                            <Form.Control
                                type="email"
                                className="bg-light text-dark border-light shadow-sm rounded-pill px-3 py-2"
                                placeholder="Nhập địa chỉ email hợp lệ..."
                                value={formData.email}
                                disabled={!!selectedUser}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-700 text-secondary">Vai trò</Form.Label>
                            <Form.Select
                                className="bg-light text-dark border-light shadow-sm rounded-pill px-3 py-2 fw-600"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="student">Sinh viên</option>
                                <option value="lecturer">Giảng viên</option>
                                <option value="admin">Quản trị viên</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-light bg-light bg-opacity-50 px-4 py-3">
                    <Button variant="light" className="fw-600 rounded-pill px-4" onClick={() => setShowModal(false)}>Hủy</Button>
                    <Button variant="primary" className="fw-600 rounded-pill px-4 shadow-sm" onClick={handleSave}>Lưu thay đổi</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UserManagement;

