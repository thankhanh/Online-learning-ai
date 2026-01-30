import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ user }) => {
    return (
        <aside className="sidebar">
            <ul className="sidebar-menu">
                <li><Link to="/dashboard">📊 Dashboard</Link></li>
                <li><Link to="/profile">👤 My Profile</Link></li>
                {user.role === 'lecturer' && (
                    <>
                        <li><Link to="/my-classes">📚 My Classes</Link></li>
                        <li><Link to="/exam-bank">📝 Exam Bank</Link></li>
                    </>
                )}
                {user.role === 'student' && (
                    <>
                        <li><Link to="/my-courses">🎓 My Courses</Link></li>
                        <li><Link to="/schedule">📅 Schedule</Link></li>
                    </>
                )}
                <li><Link to="/settings">⚙️ Settings</Link></li>
            </ul>
        </aside>
    );
};

export default Sidebar;
