import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Form, InputGroup, Modal, Spinner } from 'react-bootstrap';
import { Search, Plus, Edit, Trash2, Folder, Layers } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', status: 'active' });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get('/categories');
            if (res.data.success) {
                setCategories(res.data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleShowModal = (cat = null) => {
        if (cat) {
            setSelectedCategory(cat);
            setFormData({ name: cat.name, description: cat.description || '', status: cat.status });
        } else {
            setSelectedCategory(null);
            setFormData({ name: '', description: '', status: 'active' });
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) return toast.error('Vui lòng nhập tên danh mục');
        
        try {
            if (selectedCategory) {
                // Update
                const res = await api.put(`/categories/${selectedCategory._id}`, formData);
                if (res.data.success) {
                    setCategories(categories.map(c => c._id === selectedCategory._id ? res.data.category : c));
                }
            } else {
                // Add
                const res = await api.post('/categories', formData);
                if (res.data.success) {
                    setCategories([res.data.category, ...categories]);
                }
            }
            setShowModal(false);
            toast.success(selectedCategory ? 'Đã cập nhật danh mục' : 'Đã thêm danh mục mới');
        } catch (error) {
            toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
        try {
            const res = await api.delete(`/categories/${id}`);
            if (res.data.success) {
                setCategories(categories.filter(c => c._id !== id));
                toast.success('Đã xóa danh mục');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể xóa danh mục.');
        }
    };

    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid p-4">
            <div className="d-flex align-items-center mb-4">
                <div className="bg-primary bg-opacity-10 p-3 rounded-4 me-3 text-primary shadow-sm border border-primary border-opacity-10">
                    <i className="bi bi-stack fs-3"></i>
                </div>
                <div>
                    <h2 className="fw-800 mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>Quản lý Danh mục</h2>
                    <p className="text-muted fw-500 mb-0">Phân loại và tổ chức các môn học/khóa học trong hệ thống</p>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-4">
                    <Card className="bg-white border-0 shadow-sm rounded-4 h-100 p-2 hover-shadow transition-fast">
                        <Card.Body className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 p-4 rounded-circle me-4 shadow-inner">
                                <Layers size={28} className="text-primary" />
                            </div>
                            <div>
                                <h2 className="mb-0 fw-900 text-dark display-6">{categories.length}</h2>
                                <div className="text-secondary fw-700 text-uppercase" style={{ letterSpacing: '0.05em', fontSize: '0.8rem' }}>Tổng số danh mục</div>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            <Card className="bg-white border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <Card.Body className="p-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                        <InputGroup className="shadow-sm rounded-pill overflow-hidden border border-light" style={{ maxWidth: '350px' }}>
                            <InputGroup.Text className="bg-light border-0 text-muted px-3">
                                <Search size={18} />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Tìm kiếm danh mục..."
                                className="bg-light text-dark border-0 shadow-none px-2 py-2 fw-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <Button variant="primary" onClick={() => handleShowModal()} className="rounded-pill px-4 py-2 fw-bold shadow-sm" style={{ background: 'linear-gradient(135deg, var(--primary-color), #4db8ff)', border: 'none' }}>
                            <Plus size={18} className="me-2 align-text-bottom" /> Thêm danh mục
                        </Button>
                    </div>

                    <div className="table-responsive">
                        {loading ? (
                            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                        ) : (
                            <Table hover className="align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4 py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Tên danh mục</th>
                                        <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Slug (Đường dẫn)</th>
                                        <th className="py-3 border-light text-center text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Số khóa học</th>
                                        <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Trạng thái</th>
                                        <th className="pe-4 py-3 border-light text-end text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCategories.map(cat => (
                                        <tr key={cat._id} className="border-bottom border-light hover-bg-light transition-fast">
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center">
                                                    <Folder size={18} className="text-warning me-3" />
                                                    <span className="fw-800 text-dark">{cat.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 text-secondary fst-italic">/{cat.slug}</td>
                                            <td className="py-3 text-center">
                                                <Badge bg="light" text="dark" className="border shadow-sm px-3 py-2 rounded-pill fw-600">{cat.coursesCount || 0} khóa</Badge>
                                            </td>
                                            <td className="py-3">
                                                {cat.status === 'active'
                                                    ? <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill fw-600"><i className="bi bi-eye-fill me-1"></i>Hiển thị</Badge>
                                                    : <Badge bg="secondary" className="bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1 rounded-pill fw-600"><i className="bi bi-eye-slash-fill me-1"></i>Ẩn</Badge>
                                                }
                                            </td>
                                            <td className="pe-4 py-3 text-end">
                                                <Button 
                                                    variant="light" 
                                                    size="sm" 
                                                    className="text-primary me-2 rounded-circle shadow-sm" 
                                                    style={{ width: '35px', height: '35px', padding: 0 }}
                                                    onClick={() => handleShowModal(cat)}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                                <Button 
                                                    variant="light" 
                                                    size="sm" 
                                                    className="text-danger rounded-circle shadow-sm" 
                                                    style={{ width: '35px', height: '35px', padding: 0 }}
                                                    onClick={() => handleDelete(cat._id)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredCategories.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5 text-muted fw-500">Chưa có danh mục nào.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        )}
                    </div>
                </Card.Body>
            </Card>

            {/* Modal Add/Edit Category */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="bg-white text-dark shadow-lg rounded-4 border-0">
                <Modal.Header closeButton className="border-bottom bg-light bg-opacity-50 border-light px-4 py-3">
                    <Modal.Title className="fw-800 text-dark">{selectedCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 p-md-5">
                    <Form>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-700 text-secondary">Tên danh mục</Form.Label>
                            <Form.Control 
                                type="text" 
                                className="bg-light text-dark border-light shadow-sm rounded-pill px-3 py-2 fw-500" 
                                placeholder="VD: Khoa học máy tính" 
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-700 text-secondary">Mô tả</Form.Label>
                            <Form.Control 
                                as="textarea"
                                rows={2}
                                className="bg-light text-dark border-light shadow-sm rounded-4 px-3 py-2 fw-500" 
                                placeholder="Nhập mô tả ngắn..." 
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Check
                            type="switch"
                            id="custom-switch"
                            label="Hiển thị danh mục"
                            checked={formData.status === 'active'}
                            onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'hidden' })}
                            className="fw-600 text-dark"
                        />
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-light bg-light bg-opacity-50 px-4 py-3">
                    <Button variant="light" className="fw-600 rounded-pill px-4" onClick={() => setShowModal(false)}>Hủy</Button>
                    <Button variant="primary" className="fw-600 rounded-pill px-4 shadow-sm text-nowrap" onClick={handleSave}>
                        {selectedCategory ? 'Cập nhật' : 'Tạo danh mục'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CategoryManagement;

