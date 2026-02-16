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
            <h2 className="mb-4 text-white">👤 Quản lý Tài khoản</h2>

            <Card className="bg-dark text-white border-secondary mb-4">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="d-flex gap-2">
                            <InputGroup>
                                <InputGroup.Text className="bg-secondary border-secondary text-white">
                                    <Search size={18} />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Tìm kiếm người dùng..."
                                    className="bg-dark text-white border-secondary focus-ring-none"
                                />
                            </InputGroup>
                            <Button variant="outline-secondary">
                                <Filter size={18} />
                            </Button>
                        </div>
                        <Button variant="primary" onClick={() => setShowModal(true)}>
                            <Plus size={18} className="me-2" /> Thêm mới
                        </Button>
                    </div>

                    <Table hover variant="dark" responsive className="align-middle">
                        <thead className="bg-secondary">
                            <tr>
                                <th>Thông tin người dùng</th>
                                <th>Vai trò</th>
                                <th>Trạng thái</th>
                                <th>Đăng nhập cuối</th>
                                <th className="text-end">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="fw-bold">{user.name}</div>
                                        <div className="small text-muted">{user.email}</div>
                                    </td>
                                    <td>
                                        {user.role === 'admin' ? <Badge bg="danger">Admin</Badge> :
                                            user.role === 'lecturer' ? <Badge bg="info">Giảng viên</Badge> :
                                                <Badge bg="success">Sinh viên</Badge>}
                                    </td>
                                    <td>
                                        {user.status === 'active'
                                            ? <Badge bg="success" className="bg-opacity-25 text-success border border-success">Hoạt động</Badge>
                                            : <Badge bg="secondary">Đã khóa</Badge>
                                        }
                                    </td>
                                    <td className="text-muted small">{user.lastLogin}</td>
                                    <td className="text-end">
                                        <Button variant="ghost" size="sm" className="text-info me-2"><Edit size={16} /></Button>
                                        <Button variant="ghost" size="sm" className="text-danger"><Trash2 size={16} /></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Modal Add/Edit User */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="bg-dark text-white border-secondary">
                <Modal.Header closeButton closeVariant="white" className="border-secondary">
                    <Modal.Title>Thêm người dùng mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Họ và tên</Form.Label>
                            <Form.Control type="text" className="bg-secondary text-white border-0" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" className="bg-secondary text-white border-0" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Vai trò</Form.Label>
                            <Form.Select className="bg-secondary text-white border-0">
                                <option value="student">Sinh viên</option>
                                <option value="lecturer">Giảng viên</option>
                                <option value="admin">Quản trị viên</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-secondary">
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
                    <Button variant="primary">Lưu thay đổi</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UserManagement;
