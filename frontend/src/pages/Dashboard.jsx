import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = ({ user, onLogout }) => {
    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>Dashboard</h1>
                <div className="user-info">
                    <span>Welcome, {user.name} ({user.role})</span>
                    <Link to="/profile" style={{ marginLeft: '1rem', color: '#61dafb', textDecoration: 'none' }}>My Profile</Link>
                    <button onClick={onLogout} style={{ marginLeft: '1rem' }}>Logout</button>
                </div>
            </header>
            <main className="dashboard-content" style={{ padding: '2rem' }}>
                <div className="class-list" style={{ marginBottom: '2rem' }}>
                    <h2>My Classrooms</h2>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="card" style={{ padding: '1rem', border: '1px solid #555', borderRadius: '8px' }}>
                            <h3>Introduction to AI</h3>
                            <p>Lecturer: Dr. Alan Turing</p>
                            <Link to="/classroom/101">
                                <button style={{ marginTop: '0.5rem' }}>Join Class (Demo)</button>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="exam-list">
                    <h2>Upcoming Exams</h2>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="card" style={{ padding: '1rem', border: '1px solid #555', borderRadius: '8px' }}>
                            <h3>Mid-term Exam: Intro to AI</h3>
                            <p>Duration: 15 mins</p>
                            <Link to="/exam/101">
                                <button style={{ marginTop: '0.5rem', backgroundColor: '#e66465' }}>Take Exam (Demo)</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
