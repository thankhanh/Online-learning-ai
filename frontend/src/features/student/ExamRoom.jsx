import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Modal, Form } from 'react-bootstrap';
import { io } from 'socket.io-client';
import api from '../../utils/api';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

export default function ExamRoom() {
    const { id: examId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [exam, setExam] = useState(null);
    const [started, setStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [answers, setAnswers] = useState({});
    const [violations, setViolations] = useState(0);
    const [maxViolations, setMaxViolations] = useState(3);
    const [showWarning, setShowWarning] = useState(false);
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
            alert('Không thể tải đề thi: ' + (err.response?.data?.message || err.message));
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
            handleSubmit();
        }
        return () => clearInterval(timer);
    }, [started, timeLeft]);

    // Socket & Anti-cheat
    useEffect(() => {
        if (!started || !user || !examId) return;

        socket.emit('join-exam', { examId, userId: user.id || user._id });

        socket.on('violation-update', (data) => {
            setViolations(data.totalViolations);
        });

        socket.on('auto-submit-triggered', (data) => {
            alert(data.message);
            handleSubmit(true);
        });

        const handleViolation = (type) => {
            socket.emit('violation', { type, examId, userId: user.id || user._id });
            setShowWarning(true);
        };

        const handleVisibilityChange = () => {
            if (document.hidden) handleViolation('tab-switch');
        };

        const handleBlur = () => handleViolation('window-blur');

        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            socket.off('violation-update');
            socket.off('auto-submit-triggered');
        };
    }, [started, user, examId]);

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
                alert(`Nộp bài thành công! Điểm của bạn: ${res.data.score}/${res.data.maxScore}`);
                navigate('/exams');
            }
        } catch (err) {
            console.error('Submission error:', err);
            alert('Lỗi khi nộp bài: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <div className="vh-100 d-flex align-items-center justify-content-center bg-dark text-white">Đang tải đề thi...</div>;

    if (!started) {
        return (
            <div className="vh-100 d-flex align-items-center justify-content-center bg-dark text-white">
                <Card className="bg-secondary text-white border-0 shadow" style={{ maxWidth: '500px' }}>
                    <Card.Body className="text-center p-5">
                        <h2 className="mb-4">{exam?.title}</h2>
                        <ul className="text-start mb-4">
                            <li>⏱ Thời gian: {exam?.duration} phút</li>
                            <li>⚠️ Yêu cầu bật Chế độ Toàn màn hình.</li>
                            <li>⚠️ Không chuyển Tab hoặc mở ứng dụng khác.</li>
                            <li>❌ Vi phạm quá {maxViolations} lần sẽ bị TỰ ĐỘNG THU BÀI.</li>
                        </ul>
                        <Button variant="primary" size="lg" onClick={handleStartExam}>Bắt đầu làm bài</Button>
                    </Card.Body>
                </Card>
            </div>
        );
    }

    return (
        <div className="exam-room bg-light vh-100 d-flex flex-column">
            <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center shadow sticky-top">
                <h4 className="m-0">{exam?.title}</h4>
                <div className="d-flex align-items-center">
                    <div className="me-4 text-warning fw-bold bg-dark px-3 py-1 rounded">
                        <i className="bi bi-clock-history me-2"></i>{formatTime(timeLeft)}
                    </div>
                    <Button variant="outline-light" size="sm" onClick={() => handleSubmit(false)}>Nộp bài</Button>
                </div>
            </div>

            <div className="flex-grow-1 overflow-auto p-4">
                <Container>
                    {exam?.questions.map((q, idx) => (
                        <Card key={q._id} className="mb-4 shadow-sm border-0">
                            <Card.Body>
                                <Card.Title className="mb-3">Câu {idx + 1}: {q.questionText}</Card.Title>
                                <Form>
                                    {q.options.map((opt, i) => (
                                        <Form.Check
                                            key={i}
                                            type="radio"
                                            id={`q-${q._id}-opt-${i}`}
                                            label={opt}
                                            name={`question-${q._id}`}
                                            className="mb-2"
                                            checked={answers[q._id] === opt}
                                            onChange={() => setAnswers({ ...answers, [q._id]: opt })}
                                        />
                                    ))}
                                </Form>
                            </Card.Body>
                        </Card>
                    ))}
                </Container>
            </div>

            <Modal show={showWarning} onHide={() => setShowWarning(false)} centered backdrop="static" keyboard={false} size="sm">
                <Modal.Header className="bg-danger text-white border-0">
                    <Modal.Title className="fs-5">CẢNH BÁO VI PHẠM</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <p>Phát hiện rời khỏi màn hình bài thi!</p>
                    <h4 className="text-danger">{violations} / {maxViolations}</h4>
                </Modal.Body>
                <Modal.Footer className="justify-content-center border-0">
                    <Button variant="danger" onClick={() => setShowWarning(false)}>Quay lại bài thi</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
