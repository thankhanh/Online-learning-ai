import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

const Navbar = ({ user, onLogout, unreadCount }) => {
    const location = useLocation();

    return (
        <nav className="navbar navbar-expand-lg glass-nav px-4 py-3 d-flex justify-content-between align-items-center sticky-top" style={{ zIndex: 1050 }}>
            <div className="navbar-brand d-flex align-items-center">
                <Link to="/dashboard" className="text-decoration-none logo d-flex align-items-center gap-3">
                    <motion.div 
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        className="rounded-4 d-flex justify-content-center align-items-center text-white shadow-sm" 
                        style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, var(--primary-color), #4db8ff)'}}
                    >
                        <i className="bi bi-mortarboard-fill fs-4"></i>
                    </motion.div>
                    <span className="fw-800 d-none d-sm-inline" style={{ letterSpacing: '-0.02em', fontSize: '1.4rem' }}>AI <span style={{ color: 'var(--primary-color)' }}>Hub</span></span>
                </Link>
            </div>

            <div className="d-flex align-items-center gap-4">
                {user ? (
                    <>
                        <div className="d-none d-md-flex align-items-center gap-2 me-2">
                            <Link to="/dashboard">
                                <motion.button 
                                    whileHover={{ backgroundColor: 'rgba(27, 152, 224, 0.08)' }}
                                    className="btn border-0 px-3 py-2 rounded-3 fw-600"
                                    style={{ color: location.pathname === '/dashboard' ? 'var(--primary-color)' : 'var(--text-muted)', fontSize: '0.9rem' }}
                                >
                                    Trang chủ
                                </motion.button>
                            </Link>
                            <Link to="/classroom-management">
                                <motion.button 
                                    whileHover={{ backgroundColor: 'rgba(27, 152, 224, 0.08)' }}
                                    className="btn border-0 px-3 py-2 rounded-3 fw-600"
                                    style={{ color: location.pathname.includes('classroom') ? 'var(--primary-color)' : 'var(--text-muted)', fontSize: '0.9rem' }}
                                >
                                    Khóa học
                                </motion.button>
                            </Link>
                        </div>

                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Link to="/notifications" className="position-relative d-flex align-items-center justify-content-center bg-white border border-light rounded-circle shadow-sm transition-fast hover-bg-light" style={{ width: '42px', height: '42px', color: 'var(--text-main)' }}>
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="position-absolute translate-middle badge rounded-pill bg-danger border border-2 border-white" style={{ top: '8px', right: '-4px', fontSize: '0.65rem', padding: '0.25rem 0.4rem', boxShadow: '0 2px 5px rgba(220, 53, 69, 0.4)' }}>
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </Link>
                        </motion.div>
                        
                        <div className="d-flex align-items-center gap-3 ms-2 ps-3 border-start">
                            <Link to="/profile" className="d-flex align-items-center gap-3 text-decoration-none">
                                <div className="text-end d-none d-lg-block text-dark">
                                    <div className="fw-bold" style={{ fontSize: '0.9rem', lineHeight: '1' }}>{user.displayName || user.name}</div>
                                    <div className="text-primary fw-600" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{user.role}</div>
                                </div>
                                <motion.div 
                                    whileHover={{ scale: 1.05 }}
                                    className="rounded-circle shadow-sm d-flex justify-content-center align-items-center border-2 border-white" 
                                    style={{ width: '42px', height: '42px', background: '#f1f5f9', color: 'var(--primary-color)', cursor: 'pointer' }}
                                >
                                    <i className="bi bi-person-fill fs-4"></i>
                                </motion.div>
                            </Link>
                            
                            <motion.button 
                                whileHover={{ scale: 1.05, backgroundColor: '#fff' }} 
                                whileTap={{ scale: 0.95 }}
                                onClick={onLogout} 
                                className="btn btn-sm px-3 py-2 rounded-pill shadow-sm"
                                style={{ backgroundColor: 'rgba(255, 59, 48, 0.05)', color: '#ff3b30', border: '1px solid rgba(255, 59, 48, 0.1)', fontWeight: 600, fontSize: '0.8rem' }}
                            >
                                <i className="bi bi-box-arrow-right me-1"></i>
                                Thoát
                            </motion.button>
                        </div>
                    </>
                ) : (
                    <div className="d-flex gap-2">
                        <Link to="/login" className="btn px-4 rounded-pill fw-bold" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Đăng nhập</Link>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link to="/register" className="btn btn-primary px-4 py-2 rounded-pill fw-bold shadow-md" style={{ background: 'linear-gradient(135deg, var(--primary-color), #4db8ff)', border: 'none', fontSize: '0.9rem' }}>
                                Tham gia ngay
                            </Link>
                        </motion.div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
