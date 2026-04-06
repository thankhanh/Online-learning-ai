import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Spinner, Button } from 'react-bootstrap';
import { Calendar, Clock, BookOpen, ChevronRight, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const Schedule = () => {
    const [scheduleData, setScheduleData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')) || {};

    const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const res = await api.get('/classrooms');
                if (res.data.success) {
                    const classrooms = res.data.classrooms;
                    const allSchedules = [];

                    classrooms.forEach(cls => {
                        if (cls.schedule && Array.isArray(cls.schedule)) {
                            cls.schedule.forEach(item => {
                                allSchedules.push({
                                    ...item,
                                    className: cls.name,
                                    classId: cls._id,
                                    lecturer: cls.lecturer?.name || 'Chưa cập nhật',
                                    studentCount: cls.students?.length || 0,
                                    color: cls.color || '#3b82f6' // Default primary color
                                });
                            });
                        }
                    });

                    // Sort by time within each day
                    allSchedules.sort((a, b) => a.startTime.localeCompare(b.startTime));
                    setScheduleData(allSchedules);
                }
            } catch (err) {
                console.error('Error fetching schedule:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, []);

    const getDaySchedule = (day) => {
        return scheduleData.filter(item => item.dayOfWeek === day);
    };

    if (loading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center pt-5" style={{ minHeight: '60vh' }}>
                <Spinner animation="grow" variant="primary" />
                <p className="mt-3 fw-600 text-muted">Đang sắp xếp lịch biểu của bạn...</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="container-fluid p-4"
        >
            {/* Header */}
            <div className="d-flex align-items-center mb-5">
                <div className="bg-primary bg-opacity-10 p-3 rounded-4 me-3 text-primary shadow-sm" style={{ background: user.role === 'lecturer' ? 'rgba(16, 185, 129, 0.1)' : '', color: user.role === 'lecturer' ? '#10b981' : '' }}>
                    <Calendar size={32} />
                </div>
                <div>
                    <h2 className="fw-900 mb-1 text-dark" style={{ letterSpacing: '-0.03em' }}>{user.role === 'lecturer' ? 'Lịch dạy của tôi' : 'Lịch học của tôi'}</h2>
                    <p className="text-muted fw-500 mb-0">{user.role === 'lecturer' ? 'Theo dõi các tiết dạy bạn phụ trách trong tuần.' : 'Theo dõi thời khóa biểu hàng tuần từ các lớp bạn tham gia.'}</p>
                </div>
            </div>

            {/* Timetable List */}
            <Row className="g-4">
                {daysOfWeek.map((day, dayIdx) => {
                    const dayLessons = getDaySchedule(day);
                    
                    return (
                        <Col lg={12} key={dayIdx}>
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: dayIdx * 0.1 }}
                            >
                                <div className="d-flex align-items-center mb-3">
                                    <h5 className="fw-800 text-dark mb-0 me-3">{day}</h5>
                                    <div className="flex-grow-1 border-bottom" style={{ opacity: 0.1 }}></div>
                                    <Badge bg="primary" className="bg-opacity-10 text-primary ms-3 px-3 py-2 rounded-pill border border-primary border-opacity-10 fw-700" style={{ background: user.role === 'lecturer' ? 'rgba(16, 185, 129, 0.1)' : '', color: user.role === 'lecturer' ? '#10b981' : '', borderColor: user.role === 'lecturer' ? 'rgba(16, 185, 129, 0.1)' : '' }}>
                                        {dayLessons.length} {user.role === 'lecturer' ? 'tiết dạy' : 'tiết học'}
                                    </Badge>
                                </div>

                                {dayLessons.length === 0 ? (
                                    <div className="ps-4 border-start border-2 border-light mb-5">
                                        <p className="text-muted small fw-500 italic mb-0">Không có lịch trong ngày này.</p>
                                    </div>
                                ) : (
                                    <div className="ps-4 border-start border-2 border-primary border-opacity-25 mb-4" style={{ borderColor: user.role === 'lecturer' ? '#10b981' : '' }}>
                                        <Row className="g-3">
                                            {dayLessons.map((lesson, lessonIdx) => (
                                                <Col md={6} xl={4} key={lessonIdx}>
                                                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden h-100 transition-all hover-shadow">
                                                        <Card.Body className="p-4">
                                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                                <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3" style={{ background: user.role === 'lecturer' ? 'rgba(16, 185, 129, 0.1)' : '', color: user.role === 'lecturer' ? '#10b981' : '' }}>
                                                                    <Clock size={18} />
                                                                </div>
                                                                <Badge bg="white" className="text-dark border px-3 py-2 rounded-pill fw-700 shadow-sm">
                                                                    {lesson.startTime} - {lesson.endTime}
                                                                </Badge>
                                                            </div>
                                                            
                                                            <h5 className="fw-900 text-dark mb-2 text-truncate-2" style={{ lineHeight: '1.4' }}>
                                                                {lesson.className}
                                                            </h5>
                                                            
                                                            <div className="d-flex align-items-center text-muted small fw-600 mb-3">
                                                                {user.role === 'lecturer' ? (
                                                                    <><i className="bi bi-people-fill me-2"></i> DSSV: {lesson.studentCount} sinh viên</>
                                                                ) : (
                                                                    <><i className="bi bi-person-badge-fill me-2"></i> GV: {lesson.lecturer}</>
                                                                )}
                                                            </div>

                                                            <div className="mt-auto pt-3 border-top border-light d-flex justify-content-between align-items-center">
                                                                <span className="small text-muted fw-500 d-flex align-items-center">
                                                                    <i className="bi bi-geo-alt-fill me-1"></i> Virtual
                                                                </span>
                                                                {(() => {
                                                                    const now = new Date();
                                                                    const dayMap = { 'Chủ Nhật': 0, 'Thứ 2': 1, 'Thứ 3': 2, 'Thứ 4': 3, 'Thứ 5': 4, 'Thứ 6': 5, 'Thứ 7': 6 };
                                                                    
                                                                    const currentDay = now.getDay();
                                                                    const lessonDay = dayMap[lesson.dayOfWeek];
                                                                    const prevDay = (currentDay - 1 + 7) % 7;
                                                                    
                                                                    const [startH, startM] = lesson.startTime.split(':').map(Number);
                                                                    const [endH, endM] = lesson.endTime.split(':').map(Number);
                                                                    const isOvernight = (endH < startH) || (endH === startH && endM < startM);

                                                                    // Check if it's the right day OR if it's the next day of an overnight class
                                                                    let isActiveBoundary = false;
                                                                    let statusMessage = '';

                                                                    if (currentDay === lessonDay) {
                                                                        const startTime = new Date();
                                                                        startTime.setHours(startH, startM, 0, 0);
                                                                        const endTime = new Date();
                                                                        endTime.setHours(endH, endM, 0, 0);
                                                                        if (isOvernight) endTime.setDate(endTime.getDate() + 1);

                                                                        const earlyAccessTime = new Date(startTime.getTime() - 5 * 60 * 1000);
                                                                        
                                                                        if (now < earlyAccessTime) {
                                                                            statusMessage = `Vào lớp sau ${Math.ceil((earlyAccessTime - now) / 60000)}p`;
                                                                        } else if (now > endTime) {
                                                                            statusMessage = 'Đã kết thúc';
                                                                        } else {
                                                                            isActiveBoundary = true;
                                                                        }
                                                                    } else if (currentDay === (lessonDay + 1) % 7 && isOvernight) {
                                                                        // Check the "tail" of an overnight class from yesterday
                                                                        const endTime = new Date();
                                                                        endTime.setHours(endH, endM, 0, 0);
                                                                        if (now <= endTime) {
                                                                            isActiveBoundary = true;
                                                                        } else {
                                                                            statusMessage = 'Đã kết thúc';
                                                                        }
                                                                    } else {
                                                                        statusMessage = 'Chưa đến ngày';
                                                                    }

                                                                    if (isActiveBoundary) {
                                                                        return (
                                                                            <Button 
                                                                                variant="link" 
                                                                                className="p-0 text-primary fw-800 text-decoration-none shadow-none d-flex align-items-center"
                                                                                onClick={() => navigate(`/virtual-classroom/${lesson.classId}`)}
                                                                                style={{ color: user.role === 'lecturer' ? '#10b981' : '' }}
                                                                            >
                                                                                Vào lớp <ChevronRight size={16} className="ms-1" />
                                                                            </Button>
                                                                        );
                                                                    } else {
                                                                        return <Badge bg="light" className="text-muted border px-2 py-1">{statusMessage}</Badge>;
                                                                    }
                                                                })()}
                                                            </div>
                                                        </Card.Body>
                                                        {(() => {
                                                            // Simple overlap detection for the current day view
                                                            const dayLessons = getDaySchedule(lesson.dayOfWeek);
                                                            const isOverlapping = dayLessons.some(l => {
                                                                if (l.classId === lesson.classId && l.startTime === lesson.startTime && l.endTime === lesson.endTime) return false;
                                                                const [s1, e1] = [lesson.startTime, lesson.endTime];
                                                                const [s2, e2] = [l.startTime, l.endTime];
                                                                // Cross-midnight overlap is complex, but for same-day list:
                                                                return (s1 < e2 && e1 > s2);
                                                            });
                                                            return isOverlapping && (
                                                                <div className="position-absolute top-0 end-0 m-2">
                                                                    <Badge bg="warning" className="text-dark border-0 shadow-sm px-2 py-1" style={{ fontSize: '0.65rem' }}>
                                                                        <i className="bi bi-exclamation-triangle-fill me-1"></i> Trùng lịch
                                                                    </Badge>
                                                                </div>
                                                            );
                                                        })()}
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    </div>
                                )}
                            </motion.div>
                        </Col>
                    );
                })}
            </Row>

            {/* Footer Tip */}
            <div className="mt-5 p-4 bg-light bg-opacity-50 rounded-4 border border-white text-center">
                <p className="text-muted small fw-600 mb-0">
                    <i className="bi bi-info-circle me-2"></i> Lịch này được cập nhật trực tiếp từ hệ thống quản lý lớp học.
                </p>
            </div>
        </motion.div>
    );
};

export default Schedule;
