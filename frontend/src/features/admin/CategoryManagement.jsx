import React, { useState } from 'react';
import { Card, Table, Button, Badge, Form, InputGroup, Modal } from 'react-bootstrap';
import { Search, Plus, Edit, Trash2, Folder, Layers } from 'lucide-react';

const CategoryManagement = () => {
    const [showModal, setShowModal] = useState(false);

    // Mock Data
    const categories = [
        { id: 1, name: 'Công nghệ thông tin', slug: 'cntt', courses: 15, status: 'active' },
        { id: 2, name: 'Kinh tế & Quản lý', slug: 'kinh-te', courses: 8, status: 'active' },
        { id: 3, name: 'Ngoại ngữ', slug: 'ngoai-ngu', courses: 12, status: 'active' },
        { id: 4, name: 'Kỹ năng mềm', slug: 'ky-nang', courses: 5, status: 'hidden' },
    ];

    return (
        <div className="container-fluid p-4">
            <h2 className="mb-4 text-white">📂 Quản lý Danh mục</h2>

            <div className="row">
                <div className="col-md-4 mb-4">
                    <Card className="bg-dark text-white border-secondary h-100">
                        <Card.Body className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-25 p-3 rounded-circle me-3">
                                <Layers size={24} className="text-primary" />
                            </div>
                            <div>
                                <h3 className="mb-0 fw-bold">4</h3>
                                <div className="text-white">Tổng số danh mục</div>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            <Card className="bg-dark text-white border-secondary">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <InputGroup style={{ maxWidth: '300px' }}>
                            <InputGroup.Text className="bg-secondary border-secondary text-white">
                                <Search size={18} />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Tìm danh mục..."
                                className="bg-dark text-white border-secondary"
                            />
                        </InputGroup>
                        <Button variant="success" onClick={() => setShowModal(true)}>
                            <Plus size={18} className="me-2" /> Thêm danh mục
                        </Button>
                    </div>

                    <Table hover variant="dark" responsive className="align-middle">
                        <thead className="bg-secondary">
                            <tr>
                                <th>Tên danh mục</th>
                                <th>Slug (Đường dẫn)</th>
                                <th>Số khóa học</th>
                                <th>Trạng thái</th>
                                <th className="text-end">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className='text-white'>
                            {categories.map(cat => (
                                <tr key={cat.id}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <Folder size={18} className="text-warning me-2" />
                                            <span className="fw-bold text-white">{cat.name}</span>
                                        </div>
                                    </td>
                                    <td className="text-white fst-italic">/{cat.slug}</td>
                                    <td>
                                        <Badge bg="secondary" pill>{cat.courses} khóa</Badge>
                                    </td>
                                    <td>
                                        {cat.status === 'active'
                                            ? <Badge bg="success">Hiển thị</Badge>
                                            : <Badge bg="secondary">Ẩn</Badge>
                                        }
                                    </td>
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

            {/* Modal Add/Edit Category */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="bg-dark text-white border-secondary">
                <Modal.Header closeButton closeVariant="white" className="border-secondary">
                    <Modal.Title>Thêm danh mục mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên danh mục</Form.Label>
                            <Form.Control type="text" className="bg-secondary text-white border-0" placeholder="VD: Khoa học máy tính" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Slug (Tự động tạo)</Form.Label>
                            <Form.Control type="text" className="bg-dark text-muted border-secondary" disabled placeholder="khoa-hoc-may-tinh" />
                        </Form.Group>
                        <Form.Check
                            type="switch"
                            id="custom-switch"
                            label="Hiển thị ngay trên trang chủ"
                            defaultChecked
                            className="text-white"
                        />
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-secondary">
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
                    <Button variant="success">Tạo danh mục</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CategoryManagement;
