import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import StudentDashboard from '../features/dashboard/StudentDashboard';
import LecturerDashboard from '../features/dashboard/LecturerDashboard';
import Button from '../components/ui/Button';

const Dashboard = ({ user, onLogout }) => {
    return (
        <div className="min-vh-100 bg-dark text-white">


            {/* Main Content */}
            <main className="container py-5">
                {user.role === 'lecturer' ? (
                    <LecturerDashboard user={user} />
                ) : (
                    <StudentDashboard user={user} />
                )}
            </main>
        </div>
    );
};

export default Dashboard;
