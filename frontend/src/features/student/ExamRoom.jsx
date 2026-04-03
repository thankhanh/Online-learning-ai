import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Modal, Form, Badge, ProgressBar } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import socket from '../../utils/socket';
import toast from 'react-hot-toast';

export default function ExamRoom() {
    const { id: examId } = useParams();
    const navigate = useNavigate();
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const [exam, setExam] = useState(null);
    const [started, setStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [answers, setAnswers] = useState({});
    const [violations, setViolations] = useState(0);
    const [maxViolations, setMaxViolations] = useState(3);
    const [showWarning, setShowWarning] = useState(false);
    const [showAutoSubmitModal, setShowAutoSubmitModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExam();
    }, [examId]);

    const fetchExam = async () => {
        try {
            const res = await api.get(`/exams/${examId}`);
            if (res.data.success) {
                setExam(res.data.exam);
                setTimeLeft(res.data.exam.duration * 60);
                setMaxViolations(res.data.exam.maxViolations || 3);
            }
        } catch (err) {
            toast.error('Không thể tải đề thi: ' + (err.response?.data?.message || err.message));
            navigate('/exams');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let timer;
        if (started && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (started && timeLeft === 0) {
            handleSubmit(true);
        }
        return () => clearInterval(timer);
    }, [started, timeLeft]);

    // Socket & Anti-cheat
    useEffect(() => {
        if (!started || !user || !examId) return;

        socket.emit('join-exam', { examId, userId: user.id || user._id });

        socket.on('violation-update', (data) => {
            setViolations(data.totalViolations);
            if (data.totalViolations >= data.maxViolations) {
                setShowAutoSubmitModal(true);
            }
        });

        socket.on('auto-submit-triggered', (data) => {
            setShowWarning(false);
            setShowAutoSubmitModal(true);
            api.post(`/exams/${examId}/submit`, {
                answers: Object.entries(answers).map(([qId, selectedOption]) => ({
                    questionId: qId, selectedOption
                })),
                isAuto: true
            }).catch(console.error);
        });

        const handleViolation = (type) => {
            socket.emit('violation', { type, examId, userId: user.id || user._id });
            setShowWarning(true);
        };

        const handleVisibilityChange = () => {
            if (document.hidden) handleViolation('tab-switch');
        };

        const handleBlur = () => handleViolation('window-blur');
        const handleContextMenu = (e) => { e.preventDefault(); handleViolation('right-click-block'); };
        const handleCopyPaste = (e) => { e.preventDefault(); handleViolation('copy-paste-block'); };
        const handleKeyDown = (e) => {
            if (e.keyCode === 123) { e.preventDefault(); handleViolation('f12-block'); }
            if (e.ctrlKey && (e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()) || e.key.toUpperCase() === 'U')) {
                e.preventDefault(); handleViolation('inspect-block');
            }
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('copy', handleCopyPaste);
        window.addEventListener('cut', handleCopyPaste);
        window.addEventListener('paste', handleCopyPaste);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('copy', handleCopyPaste);
            window.removeEventListener('cut', handleCopyPaste);
            window.removeEventListener('paste', handleCopyPaste);
            window.removeEventListener('keydown', handleKeyDown);
            socket.off('violation-update');
            socket.off('auto-submit-triggered');
        };
    }, [started, user, examId, answers]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleStartExam = () => {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(err => console.log(err));
        }
        setStarted(true);
    };

    const handleSubmit = async (isAuto = false) => {
        try {
            const submission = {
                answers: Object.entries(answers).map(([qId, selectedOption]) => ({
                    questionId: qId,
                    selectedOption
                }))
            };
            const res = await api.post(`/exams/${examId}/submit`, submission);
            if (res.data.success) {
                if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
                if (!isAuto) {
                    toast.success(res.data.message || 'Nộp bài thành công!');
                    navigate('/exams');
                }
            }
        } catch (err) {
            console.error('Submission error:', err);
            toast.error('Lỗi khi nộp bài: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return (
        <div className="vh-100 d-flex flex-column align-items-center justify-content-center bg-white text-dark">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <h5 className="fw-800">Đang chuẩn bị đề thi...</h5>
        </div>
    );

    if (!started) {
        return (
            <div className="vh-100 d-flex align-items-center justify-content-center bg-main">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ maxWidth: '550px' }} 
                    className="w-100 px-3"
                >
                    <Card className="border-0 shadow-premium rounded-4 overflow-hidden bg-white">
                        <div className="bg-primary p-4 text-center text-white" style={{ background: 'linear-gradient(135deg, var(--primary-color), #4db8ff)' }}>
                            <div className="bg-white bg-opacity-25 rounded-circle d-inline-flex p-3 mb-3">
                                <i className="bi bi-shield-lock-fill fs-2"></i>
                            </div>
                            <h2 className="fw-800 mb-1">{exam?.title}</h2>
                            <p className="mb-0 opacity-75 fw-500 text-white">Hệ thống thi trực tuyến chống gian lận AI</p>
                        </div>
                        <Card.Body className="p-4 p-md-5">
                            <div className="mb-4">
                                <h6 className="text-secondary fw-800 text-uppercase mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Quy định phòng thi:</h6>
                                <ul className="list-unstyled d-flex flex-column gap-3">
                                    <li className="d-flex align-items-start fw-500">
                                        <i className="bi bi-clock text-primary me-2 fs-5"></i>
                                        <span>Thời gian làm bài: <strong>{exam?.duration} phút</strong></span>
                                    </li>
                                    <li className="d-flex align-items-start fw-500">
                                        <i className="bi bi-fullscreen text-primary me-2 fs-5"></i>
                                        <span>Bắt buộc sử dụng <strong>Chế độ Toàn màn hình</strong> trong suốt quá trình thi.</span>
                                    </li>
                                    <li className="d-flex align-items-start fw-500">
                                        <i className="bi bi-eye-slash text-danger me-2 fs-5"></i>
                                        <span><strong>Không</strong> chuyển tab, thu nhỏ trình duyệt hay mở ứng dụng khác.</span>
                                    </li>
                                    <li className="d-flex align-items-start fw-500 text-danger bg-danger bg-opacity-10 p-2 rounded">
                                        <i className="bi bi-exclamation-octagon-fill me-2 fs-5"></i>
                                        <span>Vi phạm quá <strong>{maxViolations} lần</strong> sẽ bị hệ thống <strong>TỰ ĐỘNG THU BÀI</strong> ngay lập tức.</span>
                                    </li>
                                </ul>
                            </div>
                            <Button variant="primary" className="w-100 py-3 rounded-pill fw-bold shadow-md" style={{ background: 'linear-gradient(135deg, var(--primary-color), #4db8ff)', border: 'none', fontSize: '1.1rem' }} onClick={handleStartExam}>
                                Bắt đầu làm bài <i className="bi bi-arrow-right-short ms-1 fs-4"></i>
                            </Button>
                        </Card.Body>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="exam-room bg-main vh-100 d-flex flex-column overflow-hidden">
            <header className="bg-white border-bottom shadow-sm px-4 py-3 d-flex justify-content-between align-items-center sticky-top z-3">
                <div className="d-flex align-items-center">
                    <div className="bg-primary rounded-3 p-2 me-3 text-white shadow-sm" style={{ background: 'linear-gradient(135deg, var(--primary-color), #4db8ff)'}}>
                        <i className="bi bi-journal-check"></i>
                    </div>
                    <h5 className="m-0 fw-800 text-dark d-none d-md-block">{exam?.title}</h5>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center bg-light border px-4 py-2 rounded-pill shadow-sm">
                        <i className="bi bi-clock-history me-2 text-primary fs-5"></i>
                        <span className={`fw-800 font-monospace fs-5 ${timeLeft < 60 ? 'text-danger animate-pulse' : 'text-dark'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                    <Button variant="primary" className="rounded-pill px-4 fw-bold shadow-sm" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', border: 'none' }} onClick={() => handleSubmit(false)}>
                        Nộp bài
                    </Button>
                </div>
            </header>

            <div className="flex-grow-1 overflow-auto p-4 custom-scrollbar">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={9}>
                            <div className="mb-4 d-flex justify-content-between align-items-center">
                                <Badge bg="light" className="text-muted fw-600 border px-3 py-2 rounded-pill">
                                    <i className="bi bi-person me-1"></i> Thí sinh: {user?.name}
                                </Badge>
                                <Badge bg="danger" className="bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-2 rounded-pill fw-600">
                                    <i className="bi bi-exclamation-triangle-fill me-1"></i> Vi phạm: {violations}/{maxViolations}
                                </Badge>
                            </div>
                            
                            {exam?.questions.map((q, idx) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={q._id}
                                >
                                    <Card className="mb-4 shadow-sm border-0 rounded-4 overflow-hidden">
                                        <Card.Body className="p-4 p-md-5">
                                            <div className="d-flex align-items-start mb-4">
                                                <div className="bg-light rounded-circle p-2 me-3 fw-800 text-primary border" style={{ minWidth: '40px', textAlign: 'center' }}>{idx + 1}</div>
                                                <h5 className="fw-700 text-dark pt-1" style={{ lineHeight: '1.5' }}>{q.questionText}</h5>
                                            </div>
                                            <Form className="ps-0 ps-md-5">
                                                {q.options.map((opt, i) => (
                                                    <div key={i} className={`mb-3 p-3 rounded-4 border-2 transition-fast ${answers[q._id] === opt ? 'bg-primary bg-opacity-10 border-primary shadow-sm' : 'bg-light border-light hover-bg-light'}`}
                                                         onClick={() => setAnswers({ ...answers, [q._id]: opt })} style={{ cursor: 'pointer' }}>
                                                        <Form.Check
                                                            type="radio"
                                                            id={`q-${q._id}-opt-${i}`}
                                                            label={<span className={`fw-600 ms-2 ${answers[q._id] === opt ? 'text-primary' : 'text-dark'}`}>{opt}</span>}
                                                            name={`question-${q._id}`}
                                                            checked={answers[q._id] === opt}
                                                            onChange={() => setAnswers({ ...answers, [q._id]: opt })}
                                                            className="custom-radio"
                                                        />
                                                    </div>
                                                ))}
                                            </Form>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            ))}

                            <div className="text-center py-5">
                                <p className="text-muted fw-500 mb-4">Vui lòng kiểm tra lại tất cả các câu hỏi trước khi nộp bài.</p>
                                <Button variant="primary" size="lg" className="rounded-pill px-5 fw-bold shadow-md" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', border: 'none' }} onClick={() => handleSubmit(false)}>
                                    Hoàn thành và Nộp bài
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            <AnimatePresence>
                {showWarning && (
                    <Modal show={showWarning} onHide={() => setShowWarning(false)} centered backdrop="static" keyboard={false} size="sm" className="anti-cheat-modal">
                        <Modal.Body className="text-center p-5">
                            <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex p-4 mb-4 text-danger animate-pulse">
                                <i className="bi bi-exclamation-octagon fs-1"></i>
                            </div>
                            <h4 className="fw-800 text-danger mb-3">CẢNH BÁO VI PHẠM</h4>
                            <p className="fw-600 text-secondary mb-4">Phát hiện hành động rời khỏi màn hình bài thi!</p>
                            <div className="bg-light p-3 rounded-4 mb-4">
                                <small className="text-muted fw-bold d-block mb-1 text-uppercase">Số lần vi phạm</small>
                                <h3 className="fw-900 text-danger mb-0">{violations} / {maxViolations}</h3>
                            </div>
                            <Button variant="danger" className="w-100 py-3 rounded-pill fw-bold shadow-sm" onClick={() => setShowWarning(false)}>
                                Quay lại bài thi ngay
                            </Button>
                        </Modal.Body>
                    </Modal>
                )}
            </AnimatePresence>

            <Modal show={showAutoSubmitModal} onHide={() => {}} centered backdrop="static" keyboard={false}>
                <Modal.Body className="text-center p-5">
                    <div className="text-danger mb-4">
                        <i className="bi bi-shield-slash-fill fs-1"></i>
                    </div>
                    <h3 className="fw-900 text-danger mb-3">TỰ ĐỘNG THU BÀI</h3>
                    <h5 className="text-dark fw-700 mb-3">Bạn đã vi phạm quy chế thi quá {maxViolations} lần!</h5>
                    <p className="text-muted fw-500 mb-4">Hệ thống đã tự động ghi nhận kết quả và kết thúc phiên thi do phát hiện gian lận nghiêm trọng.</p>
                    <Button variant="danger" className="w-100 py-3 rounded-pill fw-bold shadow-md" onClick={() => navigate('/exams')}>
                        Quay lại Danh sách Đề thi
                    </Button>
                </Modal.Body>
            </Modal>
        </div>
    );
}
