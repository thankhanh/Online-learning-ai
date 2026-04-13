import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Form, Badge, Row, Col, Table, Tab, Tabs, Modal, Spinner, Alert } from 'react-bootstrap';
import { CheckCircle, XCircle, FileText, Search, Plus, ShieldCheck, Activity, Download, Trash, Edit, RefreshCw } from 'lucide-react';
import api from '../../utils/api';
import socket from '../../utils/socket';
import toast from 'react-hot-toast';

export default function ExamManagement({ user }) {
    const [key, setKey] = useState('overview');
    const [exams, setExams] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [monitoringExams, setMonitoringExams] = useState({}); // { examId: [violations] }
    const [selectedMonitorExam, setSelectedMonitorExam] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newExam, setNewExam] = useState({
        title: '',
        classroom: '',
        duration: 60,
        maxViolations: 3,
        startTime: '',
        endTime: '',
        questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: '', type: 'multiple-choice' }]
    });
    const [selectedResultExam, setSelectedResultExam] = useState('');
    const [selectedExamResults, setSelectedExamResults] = useState([]);
    const [resultsLoading, setResultsLoading] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [reviewData, setReviewData] = useState(null);
    const [selectedResultClassroom, setSelectedResultClassroom] = useState('');

    // AI Integration States
    const [selectedFile, setSelectedFile] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [numAiQuestions, setNumAiQuestions] = useState(10);
    const abortControllerRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleAIGenerateExam = async () => {
        if (!selectedFile) {
            toast.error("Vui lòng chọn File PDF bài giảng trước!");
            return;
        }

        if (!newExam.classroom) {
            toast.error("Bạn chưa chọn lớp học nào để gán đề thi!");
            return;
        }

        // Initialize AbortController
        abortControllerRef.current = new AbortController();
        
        setIsGenerating(true);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('classroomId', newExam.classroom);
            formData.append('userId', user?._id || user?.id);
            formData.append('title', selectedFile.name);

            await api.post('/ai/ingest', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                signal: abortControllerRef.current.signal
            });

            const response = await api.post('/quiz/generate', {
                classroomId: newExam.classroom,
                numQuestions: numAiQuestions
            }, {
                signal: abortControllerRef.current.signal
            });

            if (response.data && response.data.quiz) {
                // Update newExam with generated questions
                const newQuestions = response.data.quiz.map(q => ({
                    questionText: q.question,
                    options: q.options,
                    correctAnswer: q.answer,
                    type: 'multiple-choice'
                }));

                setNewExam(prev => {
                    // Lọc bỏ các câu hỏi trống (chưa có nội dung) trước khi thêm câu hỏi từ AI
                    const existingQuestions = prev.questions.filter(q => q.questionText.trim() !== '');
                    return {
                        ...prev,
                        questions: [...existingQuestions, ...newQuestions]
                    };
                });
                toast.success('Đã tải câu hỏi sinh từ AI thành công!');
            } else {
                throw new Error("Không thể trích xuất câu hỏi từ AI.");
            }
        } catch (error) {
            if (error.name === 'AbortError' || (error.response && error.response.status === 0)) {
                toast.success("Đã hủy quá trình sinh đề.");
            } else {
                console.error(error);
                toast.error(error.response?.data?.message || error.message || "Quá trình ra đề gặp lỗi.");
            }
        } finally {
            setIsGenerating(false);
            abortControllerRef.current = null;
        }
    };

    const handleCancelAiGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsGenerating(false);
        }
    };
    useEffect(() => {
        const onConnect = () => console.log('MONITOR SOCKET CONNECTED:', socket.id);
        const onDisconnect = () => console.log('MONITOR SOCKET DISCONNECTED');

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        socket.on('student-violation', (data) => {
            console.log('LECTURER RECEIVED VIOLATION:', data);
            setMonitoringExams(prev => {
                const current = prev[data.examId] || [];
                // Update student if exists, otherwise prepend
                const existingIdx = current.findIndex(v => v.userId === data.userId);
                let newList;
                if (existingIdx !== -1) {
                    newList = [...current];
                    newList[existingIdx] = { ...data, timestamp: new Date() };
                } else {
                    newList = [data, ...current];
                }
                return { ...prev, [data.examId]: newList.slice(0, 50) };
            });
        });

        socket.on('initial-monitor-data', ({ examId, data }) => {
            console.log('Received initial monitor data:', data);
            setMonitoringExams(prev => ({ ...prev, [examId]: data }));
        });

        socket.on('student-violation-reset', ({ userId }) => {
            setMonitoringExams(prev => {
                const updated = { ...prev };
                for (let eId in updated) {
                    updated[eId] = updated[eId].filter(v => v.userId !== userId);
                }
                return updated;
            });
        });

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('student-violation');
            socket.off('initial-monitor-data');
            socket.off('student-violation-reset');
        };
    }, []);

    const handleJoinMonitor = (examId) => {
        setSelectedMonitorExam(examId);
        socket.emit('join-exam-monitor', { examId });
    };

    const handleResetViolation = (userId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử vi phạm của sinh viên này để thử nghiệm lại không?')) {
            socket.emit('reset-student-violation', { examId: selectedMonitorExam, userId });
            toast.success('Đã gửi yêu cầu reset vi phạm');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch Exams
            api.get('/exams')
                .then(res => {
                    if (res.data.success) setExams(res.data.exams);
                })
                .catch(err => console.error('Error fetching exams:', err.message));

            // Fetch Classrooms
            api.get('/classrooms')
                .then(res => {
                    if (res.data.success) setClassrooms(res.data.classrooms);
                })
                .catch(err => console.error('Error fetching classrooms:', err.message));
        } catch (err) {
            console.error('Data fetching error:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        try {
            if (newExam.startTime && newExam.endTime && new Date(newExam.startTime) >= new Date(newExam.endTime)) {
                return toast.error('Thời gian bắt đầu phải trước thời gian kết thúc');
            }

            const payload = { ...newExam };
            if (!payload.startTime) payload.startTime = null;
            if (!payload.endTime) payload.endTime = null;

            if (isEditing) {
                const res = await api.put(`/exams/${editingId}`, payload);
                if (res.data.success) {
                    setExams(exams.map(ex => ex._id === editingId ? res.data.exam : ex));
                    setShowCreateModal(false);
                    setIsEditing(false);
                    setEditingId(null);
                }
            } else {
                const res = await api.post('/exams', newExam);
                if (res.data.success) {
                    setExams([...exams, res.data.exam]);
                    setShowCreateModal(false);
                    toast.success('Đã lưu đề thi thành công!');
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save exam');
        }
    };

    const handleEditClick = (exam) => {
        setIsEditing(true);
        setEditingId(exam._id);
        setNewExam({
            title: exam.title,
            classroom: exam.classroom?._id || exam.classroom,
            duration: exam.duration,
            maxViolations: exam.maxViolations,
            startTime: exam.startTime ? new Date(exam.startTime).toISOString().slice(0, 16) : '',
            endTime: exam.endTime ? new Date(exam.endTime).toISOString().slice(0, 16) : '',
            questions: exam.questions.map(q => ({ ...q }))
        });
        setShowCreateModal(true);
    };

    const handleDeleteExam = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đề thi này không?')) return;
        try {
            const res = await api.delete(`/exams/${id}`);
            if (res.data.success) {
                setExams(exams.filter(ex => ex._id !== id));
                toast.success('Đã xóa đề thi.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete exam');
        }
    };

    const addQuestion = () => {
        setNewExam({
            ...newExam,
            questions: [...newExam.questions, { questionText: '', options: ['', '', '', ''], correctAnswer: '', type: 'multiple-choice' }]
        });
    };

    const removeQuestion = (index) => {
        if (newExam.questions.length === 1) {
            return toast.error('Đề thi phải có ít nhất 1 câu hỏi.');
        }
        const qs = newExam.questions.filter((_, i) => i !== index);
        setNewExam({ ...newExam, questions: qs });
    };

    const handleFetchResults = async (examId) => {
        if (!examId) return;
        setSelectedResultExam(examId);
        setResultsLoading(true);
        try {
            const res = await api.get(`/exams/${examId}/results`);
            if (res.data.success) {
                setSelectedExamResults(res.data.results);
            }
        } catch (err) {
            toast.error('Không thể tải kết quả bài thi');
        } finally {
            setResultsLoading(false);
        }
    };

    const handleDeleteResult = async (resultId) => {
        if (!window.confirm('Bạn có chắc chắn muốn XÓA kết quả này không? Thao tác này sẽ cho phép sinh viên thi lại từ đầu.')) return;
        try {
            const res = await api.delete(`/exams/${selectedResultExam}/results/${resultId}`);
            if (res.data.success) {
                setSelectedExamResults(selectedExamResults.filter(r => r._id !== resultId));
                toast.success('Đã xóa kết quả. Sinh viên hiện có thể thi lại.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi xóa kết quả');
        }
    };

    const handleExportCSV = () => {
        if (!selectedExamResults || selectedExamResults.length === 0) return;
        const headers = ["Tên Sinh Viên", "Email", "Điểm số", "Số lần Vi Phạm", "Trạng thái", "Ngày nộp"];
        const rows = selectedExamResults.map(res => [
            `"${res.student?.name || ''}"`,
            `"${res.student?.email || ''}"`,
            res.score || 0,
            res.totalViolations || 0,
            res.status === 'graded' ? "Đã duyệt" : "Chờ duyệt",
            `"${new Date(res.submittedAt).toLocaleString('vi-VN')}"`
        ]);
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `BangDiem_${selectedResultExam}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleApproveResult = async (resultId, currentScore) => {
        try {
            const res = await api.put(`/exams/results/${resultId}/grade`, { score: currentScore, status: 'graded' });
            if (res.data.success) {
                toast.success('Đã duyệt bài thi thành công!');
                setSelectedExamResults(prev => prev.map(r => r._id === resultId ? { ...r, status: 'graded' } : r));
            }
        } catch (err) {
            toast.error('Lỗi duyệt điểm');
        }
    };

    const handleReview = async (resultId) => {
        try {
            const res = await api.get(`/exams/results/${resultId}/details`);
            if (res.data.success) {
                setReviewData(res.data.result);
                setShowReview(true);
            }
        } catch (err) {
            toast.error('Không thể xem chi tiết bài làm');
        }
    };

    if (loading) return (
        <div className="vh-100 d-flex flex-column align-items-center justify-content-center bg-light text-dark">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <h5 className="fw-800">Đang tải dữ liệu thi cử...</h5>
        </div>
    );

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-4 me-3 text-primary shadow-sm border border-primary border-opacity-10">
                        <i className="bi bi-file-earmark-text fs-3"></i>
                    </div>
                    <div>
                        <h2 className="fw-800 mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>Quản lý Thi & Chấm bài</h2>
                        <p className="text-muted fw-500 mb-0">Tạo đề thi, theo dõi gian lận trực tiếp</p>
                    </div>
                </div>
            </div>

            <Tabs id="exam-management-tabs" activeKey={key} onSelect={(k) => setKey(k)} className="mb-4 custom-tabs-premium border-0">
                <Tab eventKey="overview" title={<span><i className="bi bi-bar-chart-fill me-2 text-info"></i>Tổng quan</span>}>
                    <Row>
                        <Col md={4} className="mb-4">
                            <Card className="bg-white border-0 shadow-sm rounded-4 h-100 text-center overflow-hidden hover-shadow transition-all">
                                <Card.Body className="p-5">
                                    <h1 className="display-3 fw-900 text-primary mb-3">{exams.length}</h1>
                                    <p className="text-secondary fw-700 text-uppercase mb-0" style={{ letterSpacing: '0.05em' }}>Đề thi đã tạo</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={8} className="mb-4 d-none d-md-block">
                            <Card className="bg-white border-0 shadow-sm rounded-4 h-100 overflow-hidden d-flex flex-column justify-content-center px-5">
                                <div className="d-flex align-items-center">
                                    <div className="bg-success bg-opacity-10 p-4 rounded-circle me-4 text-success">
                                        <i className="bi bi-shield-check fs-1"></i>
                                    </div>
                                    <div>
                                        <h4 className="fw-800 text-dark mb-2">Hệ thống Giám sát Chống gian lận</h4>
                                        <p className="text-secondary fw-500 mb-0">Theo dõi trực tiếp quá trình làm bài của sinh viên. Phát hiện chuyển tab, mở tab mới, sử dụng công cụ gian lận với độ chính xác cao.</p>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Tab>

                <Tab eventKey="exam-rooms" title={<span><i className="bi bi-journal-plus me-2 text-success"></i>Quản lý Đề thi</span>}>
                    <div className="d-flex justify-content-end mb-4">
                        <Button variant="primary" onClick={() => setShowCreateModal(true)} className="rounded-pill px-4 fw-bold shadow-sm" style={{ background: 'linear-gradient(135deg, var(--primary-color), #4db8ff)', border: 'none' }}>
                            <i className="bi bi-plus-lg me-2"></i>Tạo Đề thi Mới
                        </Button>
                    </div>
                    <Card className="bg-white border-0 shadow-sm rounded-4 overflow-hidden">
                        {exams.length === 0 ? (
                            <div className="text-center text-muted py-5">
                                <div className="bg-light rounded-circle d-inline-flex p-4 mb-3 shadow-sm border">
                                    <i className="bi bi-clipboard-x fs-1 text-secondary opacity-50"></i>
                                </div>
                                <h5 className="fw-800 text-dark">Chưa có đề thi nào được tạo.</h5>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover className="m-0 align-middle">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="ps-4 py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Tên kỳ thi</th>
                                            <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Lớp học</th>
                                            <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Thời gian</th>
                                            <th className="pe-4 py-3 border-light text-end text-secondary fw-700 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {exams.map(exam => (
                                            <tr key={exam._id} className="border-bottom border-light transition-fast hover-bg-light">
                                                <td className="ps-4 py-3 fw-800 text-dark">{exam.title}</td>
                                                <td className="py-3">
                                                    <Badge bg="primary" className="bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-600 border border-primary border-opacity-25">
                                                        {exam.classroom?.name}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 fw-600 text-secondary">{exam.duration} phút</td>
                                                <td className="pe-4 py-3 text-end">
                                                    <Button variant="outline-primary" size="sm" className="me-2 rounded-pill px-3 fw-bold" onClick={() => handleEditClick(exam)}><i className="bi bi-pencil-square me-1"></i> Sửa</Button>
                                                    <Button variant="outline-danger" size="sm" className="rounded-pill px-3 fw-bold" onClick={() => handleDeleteExam(exam._id)}><i className="bi bi-trash"></i> Xóa</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card>
                </Tab>

                <Tab eventKey="results" title={<span><i className="bi bi-card-checklist me-2 text-primary"></i>Kết quả & Chấm bài</span>}>
                    <div className="bg-white border-0 shadow-sm rounded-4 p-4 p-md-5">
                        <Row className="mb-5 align-items-end">
                            <Col md={4} className="mb-3 mb-md-0">
                                <Form.Label className="text-secondary fw-700 mb-2">Lọc theo lớp học:</Form.Label>
                                <Form.Select 
                                    className="bg-light text-dark border-light shadow-sm rounded-pill px-3 py-2 fw-600"
                                    value={selectedResultClassroom}
                                    onChange={(e) => {
                                        setSelectedResultClassroom(e.target.value);
                                        setSelectedResultExam(''); // Reset exam selection if classroom changes
                                        setSelectedExamResults([]);
                                    }}
                                >
                                    <option value="">Tất cả lớp học</option>
                                    {classrooms.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </Form.Select>
                            </Col>
                            <Col md={4}>
                                <Form.Label className="text-secondary fw-700 mb-2">Chọn kỳ thi để xem kết quả:</Form.Label>
                                <Form.Select 
                                    className="bg-light text-dark border-light shadow-sm rounded-pill px-3 py-2 fw-600"
                                    value={selectedResultExam}
                                    onChange={(e) => handleFetchResults(e.target.value)}
                                >
                                    <option value="">Chọn đề thi...</option>
                                    {exams
                                        .filter(e => !selectedResultClassroom || (e.classroom?._id || e.classroom) === selectedResultClassroom)
                                        .map(e => <option key={e._id} value={e._id}>{e.title}</option>)
                                    }
                                </Form.Select>
                            </Col>
                            <Col md={4} className="text-md-end mt-3 mt-md-0">
                                {selectedResultExam && selectedExamResults.length > 0 && (
                                    <Button variant="success" className="rounded-pill px-4 fw-bold shadow-sm" onClick={handleExportCSV}>
                                        <i className="bi bi-file-earmark-excel-fill me-2"></i> Xuất File Excel
                                    </Button>
                                )}
                            </Col>
                        </Row>

                        {resultsLoading ? (
                            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                        ) : !selectedResultExam ? (
                            <div className="text-center py-5 text-muted">
                                <div className="bg-light rounded-circle d-inline-flex p-4 mb-3 shadow-sm border">
                                    <i className="bi bi-file-earmark-ruled fs-1 text-secondary opacity-50"></i>
                                </div>
                                <h5 className="fw-800 text-dark">Hãy chọn một đề thi để xem danh sách điểm của học viên.</h5>
                            </div>
                        ) : (
                            <div className="table-responsive bg-white border border-light rounded-4 overflow-hidden">
                                <Table hover className="align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="ps-4 py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Sinh viên</th>
                                            <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Điểm số</th>
                                            <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Trạng thái</th>
                                            <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Vi phạm</th>
                                            <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Thời gian nộp</th>
                                            <th className="pe-4 py-3 border-light text-end text-secondary fw-700 text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedExamResults.length === 0 ? (
                                            <tr><td colSpan="5" className="text-center py-5 text-muted">Chưa có sinh viên nào nộp bài.</td></tr>
                                        ) : (
                                            selectedExamResults.map(res => (
                                                <tr key={res._id} className="border-bottom border-light hover-bg-light transition-fast">
                                                    <td className="ps-4 py-3">
                                                        <div className="fw-800 text-dark">{res.student?.name}</div>
                                                        <div className="text-muted small">{res.student?.email}</div>
                                                    </td>
                                                    <td>
                                                        <Badge bg={res.score >= 5 ? "success" : "danger"} className="px-3 py-2 rounded-pill shadow-sm border border-white">
                                                            {res.score} / 10
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        {res.status === 'graded' ? (
                                                            <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill">Đã duyệt</Badge>
                                                        ) : (
                                                            <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill">Chờ duyệt</Badge>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className={res.totalViolations > 0 ? "text-danger fw-bold" : "text-muted"}>
                                                            {res.totalViolations || 0} lần
                                                        </span>
                                                        {res.autoSubmitted && <Badge bg="danger" className="ms-2 small">Đình chỉ</Badge>}
                                                    </td>
                                                    <td className="text-muted fw-600 small">{new Date(res.submittedAt).toLocaleString('vi-VN')}</td>
                                                    <td className="pe-4 py-3 text-end d-flex gap-2 justify-content-end">
                                                        <Button 
                                                            variant="primary" 
                                                            size="sm" 
                                                            className="rounded-pill px-3 fw-bold"
                                                            onClick={() => handleReview(res._id)}
                                                        >
                                                            <i className="bi bi-eye me-1"></i> Xem bài
                                                        </Button>
                                                        {res.status !== 'graded' && (
                                                            <Button 
                                                                variant="success" 
                                                                size="sm" 
                                                                className="rounded-pill px-3 fw-bold"
                                                                onClick={() => handleApproveResult(res._id, res.score)}
                                                            >
                                                                <i className="bi bi-check-circle me-1"></i> Duyệt
                                                            </Button>
                                                        )}
                                                        <Button 
                                                            variant="outline-danger" 
                                                            size="sm" 
                                                            className="rounded-pill px-3 fw-bold"
                                                            onClick={() => handleDeleteResult(res._id)}
                                                            title="Cho phép sinh viên thi lại (Xóa kết quả này)"
                                                        >
                                                            <i className="bi bi-arrow-counterclockwise"></i> Cho thi lại
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </div>
                </Tab>

                <Tab eventKey="monitoring" title={<span><i className="bi bi-broadcast me-2 text-danger"></i>Giám sát Trực tiếp</span>}>
                    <div className="bg-white border-0 shadow-sm rounded-4 p-4 p-md-5">
                        <Row className="mb-5 align-items-end">
                            <Col md={5} className="mb-3 mb-md-0">
                                <Form.Label className="text-secondary fw-700 mb-2">Chọn kỳ thi để giám sát:</Form.Label>
                                <Form.Select 
                                    className="bg-light text-dark border-light shadow-sm rounded-pill px-3 py-2 fw-600"
                                    value={selectedMonitorExam}
                                    onChange={(e) => handleJoinMonitor(e.target.value)}
                                >
                                    <option value="">Chọn đề thi...</option>
                                    {exams.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
                                </Form.Select>
                            </Col>
                            <Col md={7} className="text-md-end">
                                {selectedMonitorExam && (
                                    <div className="d-flex align-items-center justify-content-md-end gap-2 flex-wrap">
                                        <Badge bg="danger" className="px-3 py-2 rounded-pill pulse-animation fs-6 shadow-sm">
                                            <i className="bi bi-broadcast me-2"></i> Đang giám sát trực tiếp...
                                        </Badge>
                                        <Badge bg={socket.connected ? "success" : "secondary"} className="px-3 py-2 rounded-pill bg-opacity-10 text-success border border-success border-opacity-25 shadow-sm fw-700">
                                            Socket: {socket.connected ? "Kết nối" : "Ngắt kết nối"}
                                        </Badge>
                                        <Button variant="outline-primary" size="sm" className="rounded-pill px-3 py-2 fw-bold" onClick={() => handleJoinMonitor(selectedMonitorExam)}>
                                            <i className="bi bi-arrow-clockwise me-1"></i> Làm mới
                                        </Button>
                                    </div>
                                )}
                            </Col>
                        </Row>

                        {!selectedMonitorExam ? (
                            <div className="text-center py-5 text-muted">
                                <div className="bg-light rounded-circle d-inline-flex p-4 mb-3 shadow-sm border">
                                    <i className="bi bi-webcam fs-1 text-secondary opacity-50"></i>
                                </div>
                                <h5 className="fw-800 text-dark">Vui lòng chọn một kỳ thi để bắt đầu giám sát học viên.</h5>
                            </div>
                        ) : (
                            <div className="table-responsive bg-white border border-light rounded-4 overflow-hidden">
                                <Table hover className="align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="ps-4 py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Thời gian</th>
                                            <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Sinh viên</th>
                                            <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Loại vi phạm</th>
                                            <th className="py-3 border-light text-center text-secondary fw-700 text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Tổng số lần</th>
                                            <th className="py-3 border-light text-secondary fw-700 text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Trạng thái</th>
                                            <th className="pe-4 py-3 border-light text-end text-secondary fw-700 text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(monitoringExams[selectedMonitorExam] || []).length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-5 text-success fw-700">
                                                    <i className="bi bi-shield-check fs-4 d-block mb-2"></i>
                                                    Chưa phát hiện vi phạm nào trong phiên này.
                                                </td>
                                            </tr>
                                        ) : (
                                            monitoringExams[selectedMonitorExam].map((v, i) => (
                                                <tr key={v.userId || i} className="animate__animated animate__fadeInDown border-bottom border-light hover-bg-light transition-fast">
                                                    <td className="ps-4 py-3 text-muted small fw-600">{new Date(v.timestamp).toLocaleTimeString()}</td>
                                                    <td>
                                                        <div className="fw-800 text-dark">{v.username}</div>
                                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{v.email}</div>
                                                    </td>
                                                    <td>
                                                        <Badge bg={v.isPostSubmission ? "danger" : "warning"} text={v.isPostSubmission ? "white" : "dark"} className="px-2 py-1 rounded-pill fw-600 shadow-sm border">
                                                            {v.type}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className={`fs-5 fw-900 ${v.totalViolations >= 3 ? 'text-danger' : 'text-primary'}`}>
                                                            {v.totalViolations}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {v.totalViolations >= 3 || v.status === 'Đã đình chỉ' ? 
                                                            <Badge bg="danger" className="px-3 py-2 rounded-pill shadow-sm border border-danger">ĐÃ ĐÌNH CHỈ</Badge> : 
                                                            <Badge bg="success" className="px-3 py-2 rounded-pill bg-opacity-10 text-success border border-success border-opacity-25 shadow-sm fw-700">ĐANG THI</Badge>
                                                        }
                                                    </td>
                                                    <td className="pe-4 py-3 text-end">
                                                        <Button 
                                                            variant="outline-secondary" 
                                                            size="sm" 
                                                            className="rounded-pill px-3 fw-bold"
                                                            onClick={() => handleResetViolation(v.userId)}
                                                            title="Xóa dữ liệu vi phạm của sinh viên này để test lại"
                                                        >
                                                            <i className="bi bi-arrow-counterclockwise"></i> Reset (Test)
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </div>
                </Tab>
            </Tabs>

            {/* Modal Tạo Đề Thi */}
            <Modal show={showCreateModal} onHide={() => { setShowCreateModal(false); setIsEditing(false); }} size="lg" centered contentClassName="bg-white text-dark shadow-lg rounded-4 border-0">
                <Modal.Header closeButton className="border-bottom bg-light bg-opacity-50 border-light px-4 py-3">
                    <Modal.Title className="fw-800 text-dark">{isEditing ? 'Chỉnh sửa Đề thi' : 'Tạo Đề Thi Mới'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreateExam}>
                    <Modal.Body className="p-4 custom-scrollbar" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-700 text-secondary">Tên kỳ thi</Form.Label>
                            <Form.Control
                                type="text" required className="bg-light text-dark border-light shadow-sm rounded-pill px-3 py-2"
                                value={newExam.title} onChange={e => setNewExam({ ...newExam, title: e.target.value })}
                                placeholder="Nhập tên kiểm tra giữa kỳ, cuối kỳ..."
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-700 text-secondary">Chọn Lớp học</Form.Label>
                            <Form.Select
                                required className="bg-light text-dark border-light shadow-sm rounded-pill px-3 py-2"
                                value={newExam.classroom} onChange={e => setNewExam({ ...newExam, classroom: e.target.value })}
                            >
                                <option value="">Chọn lớp...</option>
                                {classrooms.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </Form.Select>
                        </Form.Group>

                        {/* AI Generation Section */}
                        {!isEditing && (
                            <div className="mb-4 p-4 rounded-4 border border-primary border-dashed bg-primary bg-opacity-5">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-2 text-primary">
                                        <i className="bi bi-robot"></i>
                                    </div>
                                    <h6 className="fw-800 text-primary mb-0">Tự động ra đề bằng AI</h6>
                                </div>
                                <div className="d-flex gap-3 align-items-end mb-3">
                                    <Form.Group className="flex-grow-1">
                                        <Form.Label className="small fw-700 text-muted">Tải PDF bài giảng/tài liệu (AI sẽ dựa vào đây để ra đề):</Form.Label>
                                        <Form.Control 
                                            type="file" 
                                            accept=".pdf"
                                            className="bg-white border-light shadow-sm rounded-3 px-3 py-2"
                                            onChange={(e) => setSelectedFile(e.target.files[0])}
                                            disabled={isGenerating}
                                        />
                                    </Form.Group>
                                    <Form.Group style={{ width: '120px' }}>
                                        <Form.Label className="small fw-700 text-muted">Số câu:</Form.Label>
                                        <Form.Control 
                                            type="number" 
                                            min="1" max="50"
                                            value={numAiQuestions}
                                            onChange={(e) => setNumAiQuestions(parseInt(e.target.value))}
                                            className="bg-white border-light shadow-sm rounded-3 px-3 py-2"
                                            disabled={isGenerating}
                                        />
                                    </Form.Group>
                                </div>
                                <div className="d-flex gap-2">
                                    <Button 
                                        variant="primary" 
                                        size="sm" 
                                        className="rounded-pill px-4 fw-bold shadow-sm"
                                        onClick={handleAIGenerateExam}
                                        disabled={isGenerating || !selectedFile}
                                    >
                                        {isGenerating ? (
                                            <><Spinner animation="border" size="sm" className="me-2" /> Đang xử lý...</>
                                        ) : (
                                            <><i className="bi bi-magic me-2"></i> Phát sinh câu hỏi từ AI</>
                                        )}
                                    </Button>
                                    
                                    {isGenerating && (
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm" 
                                            className="rounded-pill px-4 fw-bold shadow-sm"
                                            onClick={handleCancelAiGeneration}
                                        >
                                            <i className="bi bi-x-circle me-2"></i> Hủy
                                        </Button>
                                    )}
                                </div>
                                {isGenerating && <div className="small text-muted mt-2"><i className="bi bi-info-circle me-1"></i> Quá trình này có thể mất 30-60 giây tùy độ dài tài liệu.</div>}
                            </div>
                        )}
                        <Row className="mb-4">
                            <Col md={6} className="mb-3 mb-md-0">
                                <Form.Group>
                                    <Form.Label className="fw-700 text-secondary">Bắt đầu thi (Không bắt buộc)</Form.Label>
                                    <Form.Control type="datetime-local" className="bg-light text-dark border-light shadow-sm rounded-pill px-3 py-2" value={newExam.startTime} onChange={e => setNewExam({ ...newExam, startTime: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-700 text-secondary">Kết thúc thi (Không bắt buộc)</Form.Label>
                                    <Form.Control type="datetime-local" className="bg-light text-dark border-light shadow-sm rounded-pill px-3 py-2" value={newExam.endTime} onChange={e => setNewExam({ ...newExam, endTime: e.target.value })} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-4">
                            <Col md={6} className="mb-3 mb-md-0">
                                <Form.Group>
                                    <Form.Label className="fw-700 text-secondary">Thời lượng (phút)</Form.Label>
                                    <Form.Control type="number" className="bg-light text-dark border-light shadow-sm rounded-pill px-3 py-2" value={newExam.duration} onChange={e => setNewExam({ ...newExam, duration: e.target.value })} min={1} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-700 text-secondary">Số vi phạm tối đa</Form.Label>
                                    <Form.Control type="number" className="bg-light text-dark border-light shadow-sm rounded-pill px-3 py-2" value={newExam.maxViolations} onChange={e => setNewExam({ ...newExam, maxViolations: e.target.value })} min={1} />
                                </Form.Group>
                            </Col>
                        </Row>

                        <hr className="border-light opacity-50 my-4" />
                        <h5 className="fw-800 text-dark mb-4">Danh sách Câu hỏi</h5>
                        {newExam.questions.map((q, idx) => (
                            <div key={idx} className="mb-4 p-4 bg-light rounded-4 border border-light shadow-sm position-relative">
                                <div className="position-absolute top-0 start-0 bg-primary bg-opacity-10 text-primary fw-800 px-3 py-1 rounded-bottom-end-custom" style={{ borderBottomRightRadius: '15px' }}>
                                    Câu {idx + 1}
                                </div>
                                <Button 
                                    variant="link" 
                                    className="position-absolute top-0 end-0 text-danger p-2 hover-opacity-100 opacity-50 transition-fast" 
                                    onClick={() => removeQuestion(idx)}
                                    title="Xóa câu hỏi này"
                                >
                                    <i className="bi bi-trash-fill fs-5"></i>
                                </Button>
                                <Form.Group className="mb-3 mt-3">
                                    <Form.Control
                                        type="text" required className="bg-white text-dark border-0 shadow-sm rounded-3 px-3 py-2 fw-600"
                                        placeholder="Nhập nội dung câu hỏi..."
                                        value={q.questionText} onChange={e => {
                                            const qs = [...newExam.questions];
                                            qs[idx].questionText = e.target.value;
                                            setNewExam({ ...newExam, questions: qs });
                                        }}
                                    />
                                </Form.Group>
                                <Row className="mb-3">
                                    {q.options.map((opt, oIdx) => (
                                        <Col md={6} key={oIdx}>
                                            <Form.Control
                                                size="sm" placeholder={`Đáp án ${String.fromCharCode(65 + oIdx)}`}
                                                className="bg-white text-dark border-light mb-3 shadow-inner rounded-3"
                                                value={opt} onChange={e => {
                                                    const qs = [...newExam.questions];
                                                    qs[idx].options[oIdx] = e.target.value;
                                                    setNewExam({ ...newExam, questions: qs });
                                                }}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                                <Form.Group>
                                    <Form.Label className="fw-700 text-success small mb-1"><i className="bi bi-check-circle-fill me-1"></i>Đáp án đúng</Form.Label>
                                    <Form.Control
                                        size="sm" placeholder="Nhập chính xác nội dung đáp án đúng..."
                                        className="bg-success bg-opacity-10 text-dark border-success border-opacity-25 rounded-3 fw-bold"
                                        value={q.correctAnswer} onChange={e => {
                                            const qs = [...newExam.questions];
                                            qs[idx].correctAnswer = e.target.value;
                                            setNewExam({ ...newExam, questions: qs });
                                        }}
                                    />
                                </Form.Group>
                            </div>
                        ))}
                        <div className="text-center mt-4">
                            <Button variant="outline-primary" className="rounded-pill px-4 fw-bold border-2 shadow-sm" onClick={addQuestion}>
                                <i className="bi bi-plus-circle-fill me-2"></i> Thêm câu hỏi
                            </Button>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="border-light bg-light bg-opacity-50 px-4 py-3">
                        <Button variant="light" className="fw-600 rounded-pill px-4" onClick={() => setShowCreateModal(false)}>Hủy</Button>
                        <Button variant="success" type="submit" className="fw-600 rounded-pill px-5 shadow-sm">Lưu Đề thi</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Chi tiết Bài thi Modal (Lecturer View) */}
            <Modal show={showReview} onHide={() => setShowReview(false)} size="lg" scrollable>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="fw-800 text-dark">
                        <i className="bi bi-file-earmark-check-fill text-success me-2"></i>
                        Bài làm: {reviewData?.student?.name || 'Học viên'} - {reviewData?.exam?.title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-light bg-opacity-50 p-4">
                    <div className="d-flex justify-content-between mb-4 bg-white p-3 rounded-4 shadow-sm border">
                        <div className="text-center px-4 border-end">
                            <span className="d-block text-muted small fw-600 mb-1">ĐIỂM SỐ</span>
                            <span className="fs-2 fw-800 text-success">{reviewData?.score}</span><span className="text-muted fw-600">/10</span>
                        </div>
                        <div className="text-center px-4 border-end">
                            <span className="d-block text-muted small fw-600 mb-1">CÂU ĐÚNG</span>
                            <span className="fs-4 fw-800 text-dark">{reviewData?.answers?.filter(a => a.isCorrect || (a.selectedOption && reviewData?.exam?.questions?.find(q => q._id === a.questionId)?.correctAnswer === a.selectedOption)).length || 0}</span>
                            <span className="text-muted fw-600">/{reviewData?.exam?.questions?.length || 0}</span>
                        </div>
                        <div className="text-center px-4">
                            <span className="d-block text-muted small fw-600 mb-1">LỖI VI PHẠM</span>
                            <span className={`fs-4 fw-800 ${reviewData?.totalViolations > 0 ? 'text-danger' : 'text-success'}`}>{reviewData?.totalViolations || 0}</span>
                        </div>
                    </div>

                    <h5 className="fw-800 mb-3 border-bottom pb-2">Chi tiết đáp án sinh viên chọn</h5>
                    
                    {reviewData?.exam?.questions?.map((q, idx) => {
                        const studentAnswer = reviewData.answers?.find(a => a.questionId === q._id);
                        const isStudentCorrect = studentAnswer?.isCorrect || studentAnswer?.selectedOption === q.correctAnswer;
                        
                        return (
                            <Card key={q._id} className={`mb-4 border-0 shadow-sm rounded-4 overflow-hidden ${isStudentCorrect ? 'border-start border-success border-4' : 'border-start border-danger border-4'}`}>
                                <Card.Header className="bg-white border-bottom border-light py-3 d-flex justify-content-between align-items-center">
                                    <div className="fw-bold">Câu hỏi {idx + 1}</div>
                                    {isStudentCorrect ? (
                                        <Badge bg="success" className="px-3 py-2 rounded-pill"><CheckCircle size={14} className="me-1 mb-1"/> Đúng</Badge>
                                    ) : (
                                        <Badge bg="danger" className="px-3 py-2 rounded-pill"><XCircle size={14} className="me-1 mb-1"/> Sai</Badge>
                                    )}
                                </Card.Header>
                                <Card.Body className="p-4">
                                    <h6 className="mb-4" dangerouslySetInnerHTML={{ __html: q.questionText }}></h6>
                                    <Row className="g-3">
                                        {q.options?.map((opt, oIdx) => {
                                            const isSelected = studentAnswer?.selectedOption === opt;
                                            const isCorrectOption = q.correctAnswer === opt;
                                            
                                            let variantClass = "bg-light text-dark border";
                                            if (isCorrectOption) variantClass = "bg-success bg-opacity-10 text-success border-success fw-bold p-rel";
                                            else if (isSelected && !isCorrectOption) variantClass = "bg-danger bg-opacity-10 text-danger border-danger fw-bold";
                                            
                                            return (
                                                <Col md={6} key={oIdx}>
                                                    <div className={`p-3 rounded-4 h-100 ${variantClass} position-relative`}>
                                                        <div className="d-flex align-items-center">
                                                            <div className="me-3 fw-bold opacity-75">{String.fromCharCode(65 + oIdx)}.</div>
                                                            <div dangerouslySetInnerHTML={{ __html: opt }}></div>
                                                        </div>
                                                        {isCorrectOption && isSelected && <i className="bi bi-check-lg position-absolute top-50 end-0 translate-middle-y me-3 fs-5 text-success"></i>}
                                                        {!isCorrectOption && isSelected && <i className="bi bi-x-lg position-absolute top-50 end-0 translate-middle-y me-3 fs-5 text-danger"></i>}
                                                        {isCorrectOption && !isSelected && <i className="bi bi-check-circle-fill position-absolute top-50 end-0 translate-middle-y me-3 text-success opacity-50"></i>}
                                                    </div>
                                                </Col>
                                            )
                                        })}
                                    </Row>
                                </Card.Body>
                            </Card>
                        )
                    })}
                </Modal.Body>
                <Modal.Footer className="bg-light">
                    {reviewData?.status !== 'graded' && (
                        <Button 
                            variant="success" 
                            className="rounded-pill px-4 fw-bold shadow-sm"
                            onClick={() => {
                                handleApproveResult(reviewData._id, reviewData.score);
                                setShowReview(false);
                            }}
                        >
                            <i className="bi bi-check-circle me-1"></i> Duyệt điểm ngay
                        </Button>
                    )}
                    <Button variant="secondary" className="rounded-pill px-4" onClick={() => setShowReview(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
