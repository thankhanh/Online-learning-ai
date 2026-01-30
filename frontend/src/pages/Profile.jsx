import { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = ({ user }) => {
    const [formData, setFormData] = useState({
        displayName: '',
        avatar: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || user.name,
                avatar: user.avatar || ''
            });
        }
    }, [user]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('http://localhost:5000/api/auth/profile', formData, {
                headers: { 'x-auth-token': token }
            });
            setMessage('Profile updated successfully!');
            // Ideally check middleware to refresh user context in App.jsx
        } catch (err) {
            setMessage('Error updating profile');
        }
    };

    return (
        <div className="dashboard-content" style={{ maxWidth: '500px', margin: '2rem auto' }}>
            <div className="card" style={{ padding: '2rem', background: '#1a1a1a', borderRadius: '12px' }}>
                <h2>User Profile</h2>
                {message && <p style={{ color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}

                <form onSubmit={onSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '.5rem' }}>Email (Read only)</label>
                        <input type="text" value={user?.email} disabled style={{ width: '100%', padding: '0.5rem', background: '#333', border: 'none', color: '#888' }} />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '.5rem' }}>Role (Read only)</label>
                        <input type="text" value={user?.role} disabled style={{ width: '100%', padding: '0.5rem', background: '#333', border: 'none', color: '#888' }} />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '.5rem' }}>Display Name</label>
                        <input
                            type="text"
                            name="displayName"
                            value={formData.displayName}
                            onChange={onChange}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #555', background: '#222', color: 'white' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '.5rem' }}>Avatar URL</label>
                        <input
                            type="text"
                            name="avatar"
                            value={formData.avatar}
                            onChange={onChange}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #555', background: '#222', color: 'white' }}
                        />
                    </div>

                    <button type="submit" style={{ width: '100%', padding: '1rem', background: '#646cff', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem' }}>Update Profile</button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
