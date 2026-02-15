import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css'; // Reusing global styles for consistency

const LandingPage = () => {
    return (
        <div className="landing-container">
            <header className="landing-header">
                <div className="logo">🧠 AI Learning Hub</div>
                <nav>
                    <Link to="/login" className="btn btn-secondary">Login</Link>
                    <Link to="/register" className="btn btn-primary">Get Started</Link>
                </nav>
            </header>

            <section className="hero-section">
                <h1>Unlock Your Potential with AI</h1>
                <p>Experience the future of education with our Real-time Virtual Classroom and local AI Tutor.</p>
                <div className="cta-buttons">
                    <Link to="/register" className="btn btn-lg btn-primary">Join Now</Link>
                    <a href="#features" className="btn btn-lg btn-outline-light">Learn More</a>
                </div>
            </section>

            <section id="features" className="features-section">
                <div className="feature-card">
                    <h3>📹 Virtual Classroom</h3>
                    <p>High-quality real-time video conferencing for seamless interaction.</p>
                </div>
                <div className="feature-card">
                    <h3>🤖 AI Tutor (RAG)</h3>
                    <p>Instant answers from your course materials without leaving the platform.</p>
                </div>
                <div className="feature-card">
                    <h3>🛡️ Secure Exams</h3>
                    <p>Anti-cheat technology ensures generic integrity of every test.</p>
                </div>
            </section>

            <footer className="landing-footer">
                <p>&copy; 2026 AI Learning Hub. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
