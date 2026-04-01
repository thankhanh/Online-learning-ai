import { useState } from 'react';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const Login = ({ onLoginSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            onLoginSuccess(res.data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden bg-main">
            {/* Elegant Background Effects */}
            <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ zIndex: 0 }}>
                <div className="position-absolute bg-primary rounded-circle"
                    style={{ top: '-40%', left: '-10%', width: '60%', height: '60%', opacity: 0.08, filter: 'blur(100px)' }} />
                <div className="position-absolute rounded-circle"
                    style={{ bottom: '-30%', right: '-10%', width: '70%', height: '70%', backgroundColor: '#4db8ff', opacity: 0.1, filter: 'blur(120px)', animationDelay: '1s' }} />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ zIndex: 10, width: '100%', maxWidth: '420px' }} 
                className="px-3"
            >
                <div className="glass-panel p-4 p-md-5 rounded-4 shadow-premium border border-white">
                    <div className="text-center mb-5">
                        <div className="d-inline-flex justify-content-center align-items-center rounded-circle mb-3 shadow-sm" style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, var(--primary-color), #4db8ff)'}}>
                            <i className="bi bi-mortarboard-fill fs-2 text-white"></i>
                        </div>
                        <h2 className="fw-800 mb-2" style={{ color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
                            Chào mừng trở lại
                        </h2>
                        <p className="text-muted" style={{ fontSize: '0.95rem' }}>Đăng nhập vào hệ thống học tập AI</p>
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
                        <div>
                            <Input
                                type="email"
                                placeholder="Địa chỉ Email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                required
                                className="bg-light border-0 shadow-sm px-4 py-3 rounded-pill"
                            />
                        </div>
                        <div>
                            <Input
                                type="password"
                                placeholder="Mật khẩu"
                                name="password"
                                value={password}
                                onChange={onChange}
                                required
                                className="bg-light border-0 shadow-sm px-4 py-3 rounded-pill"
                            />
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center px-2 mt-1 mb-2">
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" id="rememberMe" />
                                <label className="form-check-label text-muted small scale-95" htmlFor="rememberMe">Ghi nhớ tôi</label>
                            </div>
                            <Link to="#" className="text-primary text-decoration-none small scale-95 fw-600">Quên mật khẩu?</Link>
                        </div>

                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit" 
                            className="btn btn-primary w-100 py-3 rounded-pill fw-bold text-white shadow-md"
                            style={{ background: 'linear-gradient(135deg, var(--primary-color), #4db8ff)', border: 'none', fontSize: '1.05rem', letterSpacing: '0.02em' }}
                        >
                            Đăng nhập
                        </motion.button>
                    </form>

                    <p className="mt-4 text-center text-muted small">
                        Chưa có tài khoản? <Link to="/register" className="text-primary fw-600 text-decoration-none ms-1">Đăng ký ngay</Link>
                    </p>

                    <div className="mt-4 pt-3 border-top border-light border-2">
                        <p className="small text-center text-muted fw-600 mb-3" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dành cho kiểm thử:</p>
                        <motion.button
                            whileHover={{ backgroundColor: '#f1f5f9' }}
                            type="button"
                            className="btn w-100 border border-secondary border-opacity-25 text-primary fw-600 rounded-pill py-2"
                            style={{ background: 'transparent' }}
                            onClick={() => onLoginSuccess({ name: 'Demo User', email: 'demo@test.com', role: 'student' })}
                        >
                            <i className="bi bi-eye-fill me-2"></i> Xem Demo (Không dùng thẻ)
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
