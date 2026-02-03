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
        <div className="min-h-screen flex items-center justify-center bg-dark-bg relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-1/2 -left-1/4 w-3/4 h-3/4 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute -bottom-1/2 -right-1/4 w-3/4 h-3/4 bg-secondary/20 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            <Card className="w-full max-w-md z-10 mx-4">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-light to-secondary-light bg-clip-text text-transparent">
                        Chào mừng trở lại
                    </h2>
                    <p className="text-slate-400 mt-2">Đăng nhập vào hệ thống học tập AI của bạn</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-alert/10 border border-alert/20 text-alert-light px-4 py-3 rounded-lg mb-6 text-sm text-center"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
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
                    <Button type="submit" variant="primary" className="w-full py-3 text-lg shadow-lg shadow-primary/20">
                        Đăng nhập
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-sm text-center text-slate-500 mb-4">Dành cho kiểm thử giao diện:</p>
                    <Button
                        type="button"
                        variant="ghost"
                        className="w-full border border-white/10 hover:bg-white/5"
                        onClick={() => onLoginSuccess({ name: 'Demo User', email: 'demo@test.com', role: 'student' })}
                    >
                        👀 Xem Demo (Không cần đăng nhập)
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default Login;
