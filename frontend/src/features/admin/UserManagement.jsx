import React, { useState } from 'react';
import { Card, Table, Button, Badge, Form, InputGroup, Modal } from 'react-bootstrap';
import { Search, Plus, Edit, Trash2, Filter } from 'lucide-react';

const UserManagement = () => {
    const [showModal, setShowModal] = useState(false);

    // Mock Data
    const users = [
        { id: 1, name: 'Nguyễn Văn An', email: 'an.nguyen@student.edu.vn', role: 'student', status: 'active', lastLogin: '2 giờ trước' },
        { id: 2, name: 'Trần Thị Bình', email: 'binh.tran@lecturer.edu.vn', role: 'lecturer', status: 'active', lastLogin: '1 ngày trước' },
        { id: 3, name: 'Admin User', email: 'admin@system.edu.vn', role: 'admin', status: 'active', lastLogin: 'Vừa xong' },
        { id: 4, name: 'Lê Hoàng Cường', email: 'cuong.le@student.edu.vn', role: 'student', status: 'inactive', lastLogin: '1 tháng trước' },
    ];

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
                                />
                            </InputGroup>
                            <Button variant="light" className="border-light rounded-pill px-3 shadow-sm text-secondary">
                                <Filter size={18} />
                            </Button>
                        </div>
                        <Button variant="primary" onClick={() => setShowModal(true)} className="rounded-pill px-4 fw-bold shadow-sm text-nowrap" style={{ background: 'linear-gradient(135deg, var(--primary-color), #4db8ff)', border: 'none' }}>
                            <Plus size={18} className="me-2 align-text-bottom" /> Thêm mới
                        </Button>
                    </div>

                    <div className="table-responsive">
                        <Table hover className="align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4 py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Thông tin người dùng</th>
                                    <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Vai trò</th>
                                    <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Trạng thái</th>
                                    <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Đăng nhập cuối</th>
                                    <th className="pe-4 py-3 border-light text-end text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="border-bottom border-light hover-bg-light transition-fast">
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
                                            {user.status === 'active'
                                                ? <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill fw-600"><i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }}></i>Hoạt động</Badge>
                                                : <Badge bg="secondary" className="bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1 rounded-pill fw-600"><i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }}></i>Đã khóa</Badge>
                                            }
                                        </td>
                                        <td className="py-3 text-muted small fw-600">{user.lastLogin}</td>
                                        <td className="pe-4 py-3 text-end">
                                            <Button variant="light" size="sm" className="text-primary me-2 rounded-circle shadow-sm" style={{ width: '35px', height: '35px', padding: 0 }}><Edit size={16} /></Button>
                                            <Button variant="light" size="sm" className="text-danger rounded-circle shadow-sm" style={{ width: '35px', height: '35px', padding: 0 }}><Trash2 size={16} /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Modal Add/Edit User */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="bg-white text-dark shadow-lg rounded-4 border-0">
                <Modal.Header closeButton className="border-bottom bg-light bg-opacity-50 border-light px-4 py-3">
                    <Modal.Title className="fw-800 text-dark">Thêm người dùng mới</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-700 text-secondary">Họ và tên</Form.Label>
                            <Form.Control type="text" className="bg-light text-dark border-light shadow-sm rounded-pill px-3 py-2" placeholder="Nhập họ và tên..." />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-700 text-secondary">Email</Form.Label>
                            <Form.Control type="email" className="bg-light text-dark border-light shadow-sm rounded-pill px-3 py-2" placeholder="Nhập địa chỉ email hợp lệ..." />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-700 text-secondary">Vai trò</Form.Label>
                            <Form.Select className="bg-light text-dark border-light shadow-sm rounded-pill px-3 py-2 fw-600">
                                <option value="student">Sinh viên</option>
                                <option value="lecturer">Giảng viên</option>
                                <option value="admin">Quản trị viên</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-light bg-light bg-opacity-50 px-4 py-3">
                    <Button variant="light" className="fw-600 rounded-pill px-4" onClick={() => setShowModal(false)}>Hủy</Button>
                    <Button variant="primary" className="fw-600 rounded-pill px-4 shadow-sm">Lưu thay đổi</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UserManagement;
