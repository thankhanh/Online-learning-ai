import { useState } from 'react';
import axios from 'axios';
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
            const res = await axios.post('http://localhost:5000/api/auth/register', formData);
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
        <div className="login-container">
            <h2>Register</h2>
            {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={onSubmit}>
                <div>
                    <input
                        type="text"
                        placeholder="Full Name"
                        name="name"
                        value={name}
                        onChange={onChange}
                        required
                    />
                </div>
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
                <div>
                    <select
                        name="role"
                        value={role}
                        onChange={onChange}
                        style={{
                            width: '100%',
                            padding: '12px',
                            marginBottom: '1rem',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: 'white'
                        }}
                    >
                        <option value="student" style={{ color: 'black' }}>Student</option>
                        <option value="lecturer" style={{ color: 'black' }}>Lecturer</option>
                    </select>
                </div>
                <button type="submit">Register</button>
            </form>
            <p style={{ marginTop: '1rem' }}>
                Already have an account? <Link to="/login" style={{ color: '#61dafb' }}>Login</Link>
            </p>
        </div>
    );
};

export default Register;
