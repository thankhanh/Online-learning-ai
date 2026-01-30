import React from 'react';
import { Plus, Users, FileText, Settings } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const LecturerDashboard = ({ user }) => {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <section className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Lecturer Command Center</h1>
                    <p className="text-slate-400">Manage your classes, materials, and exams.</p>
                </div>
                <Button variant="primary" className="flex items-center space-x-2">
                    <Plus size={18} />
                    <span>Create New Class</span>
                </Button>
            </section>

            {/* Quick Actions */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { icon: Users, label: 'Manage Students', color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { icon: FileText, label: 'Upload Materials', color: 'text-purple-400', bg: 'bg-purple-400/10' },
                    { icon: Settings, label: 'System Settings', color: 'text-slate-400', bg: 'bg-slate-400/10' },
                ].map((action, idx) => (
                    <Card key={idx} className="flex flex-col items-center justify-center p-4 hover:bg-white/10 cursor-pointer">
                        <div className={`p-3 rounded-full mb-2 ${action.bg} ${action.color}`}>
                            <action.icon size={24} />
                        </div>
                        <span className="text-sm font-medium text-slate-300">{action.label}</span>
                    </Card>
                ))}
            </section>

            {/* Main Management Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Class Management */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold text-white">Your Classes</h2>
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Introduction to AI</h3>
                            <span className="text-sm text-slate-400">45 Students Enrolled</span>
                        </div>
                        <div className="flex space-x-3">
                            <Button variant="secondary" className="text-sm py-1">Start Live Session</Button>
                            <Button variant="ghost" className="text-sm py-1">View Reports</Button>
                        </div>
                    </Card>
                </div>

                {/* Exam Management */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">Exam Drafts</h2>
                    <Card className="border-dashed border-slate-600 bg-transparent opacity-70 hover:opacity-100">
                        <div className="text-center py-4">
                            <Plus size={32} className="mx-auto text-slate-500 mb-2" />
                            <p className="text-slate-400">Create New Exam</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LecturerDashboard;
