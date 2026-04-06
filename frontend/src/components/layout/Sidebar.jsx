import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ user, unreadCount = 0 }) => {
    const location = useLocation();

    // Menu logic
    const getMenuItems = () => {
        let items = [];
        
        if (user.role === 'lecturer') {
            items = [
                { path: '/classroom-management', icon: 'bi-journal-bookmark-fill', label: 'Lớp học' },
                { path: '/schedule', icon: 'bi-calendar3', label: 'Lịch dạy' },
                { path: '/exam-management', icon: 'bi-card-checklist', label: 'Thi & Câu hỏi' },
                { path: '/document-management', icon: 'bi-folder2-open', label: 'Tài liệu AI' },
            ];
        } else if (user.role === 'student') {
            items = [
                { path: '/classroom-management', icon: 'bi-mortarboard-fill', label: 'Lớp học' },
                { path: '/schedule', icon: 'bi-calendar3', label: 'Lịch học' },
                { path: '/learning-center', icon: 'bi-robot', label: 'AI Center' },
                { path: '/exams', icon: 'bi-clipboard-check-fill', label: 'Khảo thí' },
            ];
        } else if (user.role === 'admin') {

            items = [
                { path: '/admin/users', icon: 'bi-people-fill', label: 'Tài khoản' },
                { path: '/admin/categories', icon: 'bi-grid-3x3-gap-fill', label: 'Danh mục' },
            ];
        }

        items.push({ path: '/notifications', icon: 'bi-bell-fill', label: 'Thông báo', badge: unreadCount });
        return items;
    };

    const menuItems = getMenuItems();

    return (
        <aside className="d-none d-md-block" style={{ width: '280px' }}>
            <div className="h-100 p-4 d-flex flex-column">
                <div className="glass-panel rounded-4 p-3 d-flex flex-column gap-2" style={{ boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)' }}>
                    <div className="px-3 py-2 text-muted fw-bold small text-uppercase" style={{ letterSpacing: '0.05rem' }}>
                        Menu Chính
                    </div>
                    
                    <div className="position-relative">
                        <ul className="nav flex-column gap-2">
                            {menuItems.map((item, index) => {
                                const isActive = location.pathname.startsWith(item.path);
                                return (
                                    <li className="nav-item" key={index}>
                                        <Link to={item.path} className="text-decoration-none">
                                            <motion.div
                                                className="position-relative d-flex align-items-center px-3 py-2 rounded-3 overflow-hidden"
                                                whileHover={{ x: 4 }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                                style={{
                                                    color: isActive ? 'white' : 'var(--text-main)',
                                                    background: isActive ? 'linear-gradient(135deg, var(--primary-color), #4db8ff)' : 'transparent',
                                                    fontWeight: isActive ? 600 : 500,
                                                    boxShadow: isActive ? '0 8px 20px -6px rgba(27, 152, 224, 0.4)' : 'none',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <i className={`bi ${item.icon} me-3 fs-5`}></i>
                                                <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
                                                
                                                {item.badge > 0 && (
                                                    <span 
                                                        className="badge rounded-pill bg-danger border border-2 border-white position-absolute" 
                                                        style={{ 
                                                            right: '12px', 
                                                            fontSize: '0.65rem',
                                                            transform: 'translateY(-50%)',
                                                            top: '50%',
                                                            boxShadow: '0 2px 4px rgba(220, 53, 69, 0.3)'
                                                        }}
                                                    >
                                                        {item.badge > 9 ? '9+' : item.badge}
                                                    </span>
                                                )}

                                                {isActive && (
                                                    <motion.div 
                                                        layoutId="sidebar-active"
                                                        className="position-absolute start-0 h-100 bg-white"
                                                        style={{ width: '4px', top: 0 }}
                                                        transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                                                    />
                                                )}
                                            </motion.div>
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>

                <div className="mt-auto">
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="p-4 rounded-4 text-center mt-4 glass-panel"
                        style={{ 
                            background: 'linear-gradient(135deg, rgba(27, 152, 224, 0.05), rgba(77, 184, 255, 0.1))',
                            border: '1px solid rgba(27, 152, 224, 0.2)'
                        }}
                    >
                        <div className="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle bg-white shadow-sm" style={{ width: '48px', height: '48px' }}>
                            <i className="bi bi-stars fs-3 text-primary"></i>
                        </div>
                        <h6 className="fw-bold mb-1" style={{ color: 'var(--primary-color)' }}>AI Assistant</h6>
                        <p className="text-muted mb-0 small px-2">Luôn sẵn sàng hỗ trợ bạn 24/7</p>
                    </motion.div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
