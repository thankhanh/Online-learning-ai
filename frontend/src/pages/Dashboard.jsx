import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import StudentDashboard from '../features/dashboard/StudentDashboard';
import LecturerDashboard from '../features/dashboard/LecturerDashboard';
import Button from '../components/ui/Button';

const Dashboard = ({ user, onLogout }) => {
    return (
        <div className="min-h-screen bg-dark-bg text-gray-100 font-sans selection:bg-primary/30">
            {/* Header */}
            {/* <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-dark-bg/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">
                            AI
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary-light to-secondary-light bg-clip-text text-transparent hidden sm:block">
                            Hệ thống học tập
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                                <User size={16} className="text-slate-200" />
                            </div>
                            <div className="text-sm">
                                <p className="font-medium text-slate-200 leading-none">{user.name}</p>
                                <p className="text-xs text-primary-light capitalize mt-0.5">{user.role}</p>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            onClick={onLogout}
                            className="text-slate-400 hover:text-alert-light hover:bg-alert/10"
                            title="Đăng xuất"
                        >
                            <LogOut size={20} />
                            <span className="sr-only">Đăng xuất</span>
                        </Button>
                    </div>
                </div>
            </header> */}

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
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
