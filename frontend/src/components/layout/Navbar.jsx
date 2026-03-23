import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, onLogout, unreadCount }) => {
    return (
        <nav className="navbar navbar-expand navbar-dark bg-dark border-bottom px-3 d-flex justify-content-between p-2">
            <div className="navbar-brand">
                <Link to="/dashboard" className="text-decoration-none text-white fw-bold">AI Hub</Link>
            </div>
            <div className="d-flex align-items-center gap-3">
                {user ? (
                    <>
                        <Link to="/notifications" className="text-light me-3 position-relative">
                            <i className="bi bi-bell-fill fs-5"></i>
                            {unreadCount > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                                    {unreadCount}
                                </span>
                            )}
                        </Link>
                        <span className="text-light me-2">Hi, {user.displayName || user.name}</span>
                        <Link to="/dashboard" className="text-light text-decoration-none">Dashboard</Link>
                        <Link to="/profile" className="text-light text-decoration-none">Profile</Link>
                        <button onClick={onLogout} className="btn btn-outline-danger btn-sm">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn btn-outline-light me-2">Login</Link>
                        <Link to="/register" className="btn btn-primary">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
