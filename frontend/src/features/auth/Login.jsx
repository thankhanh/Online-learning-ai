import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
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
            const res = await axios.post('http://localhost:5000/api/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            onLoginSuccess(res.data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark position-relative overflow-hidden">
            {/* Background Effects */}
            <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ zIndex: 0 }}>
                <div className="position-absolute bg-primary rounded-circle"
                    style={{ top: '-50%', left: '-25%', width: '75%', height: '75%', opacity: 0.2, filter: 'blur(120px)' }} />
                <div className="position-absolute bg-secondary rounded-circle"
                    style={{ bottom: '-50%', right: '-25%', width: '75%', height: '75%', opacity: 0.2, filter: 'blur(120px)', animationDelay: '1s' }} />
            </div>

            <div style={{ zIndex: 10, width: '100%', maxWidth: '400px' }} className="px-3">
                <Card>
                    <div className="text-center mb-4">
                        <h2 className="fw-bold" style={{ background: 'linear-gradient(to right, #6610f2, #0d6efd)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                            Chào mừng trở lại
                        </h2>
                        <p className="text-muted mt-2">Đăng nhập vào hệ thống học tập AI của bạn</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="alert alert-danger text-center mb-4 py-2 small"
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
                            />
                        </div>
                        <Button type="submit" variant="primary" className="w-100 py-2 fs-5 shadow-sm">
                            Đăng nhập
                        </Button>
                    </form>

                    <div className="mt-4 pt-3 border-top border-secondary">
                        <p className="small text-center text-muted mb-3">Dành cho kiểm thử giao diện:</p>
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-100 border border-secondary text-light hover-bg-dark"
                            onClick={() => onLoginSuccess({ name: 'Demo User', email: 'demo@test.com', role: 'student' })}
                        >
                            👀 Xem Demo (Không cần đăng nhập)
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Login;
