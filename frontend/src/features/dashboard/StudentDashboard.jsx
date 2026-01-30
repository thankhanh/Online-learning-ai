import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, PlayCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const StudentDashboard = ({ user }) => {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Section */}
            <section className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Learning Space</h1>
                    <p className="text-slate-400">Track your progress and upcoming exams.</p>
                </div>
                <div className="glass-panel px-4 py-2 rounded-full text-sm text-primary-light border-primary/20">
                    Semester 1, 2026
                </div>
            </section>

            {/* Stats Row (Optional) */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex items-center space-x-4">
                    <div className="p-3 bg-primary/20 rounded-full text-primary">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">4</h3>
                        <p className="text-slate-400 text-sm">Active Courses</p>
                    </div>
                </Card>
            </section>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Active Classes */}
                <section>
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <PlayCircle className="mr-2 text-secondary" /> Active Classes
                    </h2>
                    <div className="space-y-4">
                        <Card>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Introduction to AI</h3>
                                    <p className="text-primary-light text-sm">Dr. Alan Turing</p>
                                </div>
                                <span className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-400 border border-green-500/30">
                                    Live Now
                                </span>
                            </div>
                            <p className="text-slate-400 text-sm mb-4">Topic: Neural Networks & Deep Learning Basics</p>
                            <Link to="/classroom/101">
                                <Button variant="primary" className="w-full">Join Live Class</Button>
                            </Link>
                        </Card>
                    </div>
                </section>

                {/* Upcoming Exams */}
                <section>
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <Clock className="mr-2 text-alert" /> Upcoming Exams
                    </h2>
                    <div className="space-y-4">
                        <Card className="border-alert/20 hover:border-alert/50">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Mid-term: Intro to AI</h3>
                                    <p className="text-slate-400 text-sm">Duration: 15 mins</p>
                                </div>
                                <span className="px-2 py-1 text-xs rounded bg-alert/20 text-alert-light border border-alert/30">
                                    Starts in 10m
                                </span>
                            </div>
                            <Link to="/exam/101">
                                <Button variant="alert" className="w-full">Enter Exam Room</Button>
                            </Link>
                        </Card>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default StudentDashboard;
