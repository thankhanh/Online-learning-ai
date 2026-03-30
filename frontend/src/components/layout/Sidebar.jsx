import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ user }) => {
    return (
        <aside className="d-none d-md-block bg-dark border-end" style={{ width: '250px' }}>
            <ul className="nav flex-column p-2">
                <li className="nav-item">
                    {/* <Link to="/dashboard" className="nav-link text-light">📊 Trang chủ</Link> */}
                </li>
                <li className="nav-item">
                    {/* <Link to="/profile" className="nav-link text-light">👤 Tài khoản</Link> */}
                </li>
                {user.role === 'lecturer' && (
                    <>
                        <li className="nav-item"><Link to="/classroom-management" className="nav-link text-light">📚 Quản lý Lớp học</Link></li>
                        <li className="nav-item"><Link to="/exam-management" className="nav-link text-light">📝 Quản lý Thi & Câu hỏi</Link></li>
                        <li className="nav-item"><Link to="/document-management" className="nav-link text-light">📂 Quản lý Tài liệu AI</Link></li>
                    </>
                )}
                {user.role === 'student' && (
                    <>
                        <li className="nav-item"><Link to="/classroom-management" className="nav-link text-light">🎓 Khóa học</Link></li>
                        <li className="nav-item"><Link to="/schedule" className="nav-link text-light">📅 Lịch học</Link></li>
                        <li className="nav-item"><Link to="/learning-center" className="nav-link text-light">📚 Trung tâm học liệu & AI</Link></li>
                        <li className="nav-item"><Link to="/exams" className="nav-link text-light">📝 Trung tâm Khảo thí</Link></li>
                    </>
                )}
                {user.role === 'admin' && (
                    <>
                        <li className="nav-item"><Link to="/admin/users" className="nav-link text-light">👤 Quản lý tài khoản</Link></li>
                        <li className="nav-item"><Link to="/admin/categories" className="nav-link text-light">📂 Quản lý danh mục</Link></li>
                    </>
                )}
                <li className="nav-item"><Link to="/notifications" className="nav-link text-light">🔔 Thông báo</Link></li>

                {/* <li className="nav-item">
                    <Link to="/settings" className="nav-link text-light">⚙️ Cài đặt</Link>
                </li> */}
            </ul>
        </aside >
    );
};

export default Sidebar;
