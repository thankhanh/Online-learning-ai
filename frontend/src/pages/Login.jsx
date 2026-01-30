import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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
        <div className="login-container">
            <h2>Login</h2>
            {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={onSubmit}>
                <div>
                    <input
                        type="email"
                        placeholder="Email Address"
                        name="email"
                        value={email}
                        onChange={onChange}
                        required
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        required
                    />
                </div>
                <button type="submit">Login</button>
                <p style={{ marginTop: '1rem' }}>
                    Don't have an account? <Link to="/register" style={{ color: '#61dafb' }}>Register here</Link>
                </p>

                <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                    <p style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '0.5rem' }}>For UI Testing only:</p>
                    <button
                        type="button"
                        onClick={() => onLoginSuccess({ name: 'Demo User', email: 'demo@test.com', role: 'student' })}
                        style={{ backgroundColor: '#2a2a2a', border: '1px solid #555' }}
                    >
                        👀 View Demo (No Auth)
                    </button>
                    <button
                        type="button"
                        onClick={() => onLoginSuccess({ name: 'Demo User', email: 'demo@test.com', role: 'lecturer' })}
                        style={{ backgroundColor: '#2a2a2a', border: '1px solid #555', marginTop: '0.5rem' }}
                    >
                        👀 View Demo (Lecturer)
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Login;
