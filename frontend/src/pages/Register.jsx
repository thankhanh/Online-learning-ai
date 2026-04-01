import { useState } from 'react';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const Register = ({ onLoginSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student'
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { name, email, password, role } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/register', formData);
            // Auto login on successful register
            localStorage.setItem('token', res.data.token);
            if (onLoginSuccess) {
                onLoginSuccess(res.data.user);
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden bg-main">
            {/* Elegant Background Effects */}
            <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ zIndex: 0 }}>
                <div className="position-absolute bg-primary rounded-circle"
                    style={{ top: '10%', right: '-10%', width: '50%', height: '50%', opacity: 0.08, filter: 'blur(100px)' }} />
                <div className="position-absolute rounded-circle"
                    style={{ bottom: '-20%', left: '-10%', width: '60%', height: '60%', backgroundColor: '#4db8ff', opacity: 0.1, filter: 'blur(120px)', animationDelay: '1s' }} />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ zIndex: 10, width: '100%', maxWidth: '450px' }} 
                className="px-3 py-5"
            >
                <div className="glass-panel p-4 p-md-5 rounded-4 shadow-premium border border-white">
                    <div className="text-center mb-4">
                        <div className="d-inline-flex justify-content-center align-items-center rounded-circle mb-3 shadow-sm" style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, var(--primary-color), #4db8ff)'}}>
                            <i className="bi bi-person-plus-fill fs-3 text-white"></i>
                        </div>
                        <h2 className="fw-800 mb-2" style={{ color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
                            Tạo tài khoản mới
                        </h2>
                        <p className="text-muted small">Tham gia cộng đồng học thuật AI ngay hôm nay</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="alert alert-danger border-0 shadow-sm text-center mb-4 py-2 small fw-500 rounded-3 text-danger bg-danger bg-opacity-10"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={onSubmit} className="d-flex flex-column gap-3">
                        <div className="mb-1">
                            <input
                                type="text"
                                className="form-control bg-light border-0 shadow-sm px-4 py-3 rounded-pill"
                                placeholder="Họ và Tên"
                                name="name"
                                value={name}
                                onChange={onChange}
                                required
                            />
                        </div>
                        <div className="mb-1">
                            <input
                                type="email"
                                className="form-control bg-light border-0 shadow-sm px-4 py-3 rounded-pill"
                                placeholder="Địa chỉ Email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                required
                            />
                        </div>
                        <div className="mb-1">
                            <input
                                type="password"
                                className="form-control bg-light border-0 shadow-sm px-4 py-3 rounded-pill"
                                placeholder="Mật khẩu"
                                name="password"
                                value={password}
                                onChange={onChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <select
                                name="role"
                                className="form-select bg-light border-0 shadow-sm px-4 py-3 rounded-pill"
                                value={role}
                                onChange={onChange}
                            >
                                <option value="student">Tôi là Học viên</option>
                                <option value="lecturer">Tôi là Giảng viên</option>
                            </select>
                        </div>
                        
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit" 
                            className="btn btn-primary w-100 py-3 rounded-pill fw-bold text-white shadow-md mt-2"
                            style={{ background: 'linear-gradient(135deg, var(--primary-color), #4db8ff)', border: 'none', fontSize: '1.05rem', letterSpacing: '0.02em' }}
                        >
                            Đăng ký
                        </motion.button>
                    </form>

                    <p className="mt-4 text-center text-muted small">
                        Đã có tài khoản? <Link to="/login" className="text-primary fw-600 text-decoration-none ms-1">Đăng nhập</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
