import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Alert, Form } from 'react-bootstrap';

export default function ExamRoom() {
    const [started, setStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
    const [warnings, setWarnings] = useState(0);
    const [showWarning, setShowWarning] = useState(false);

    // Mock Exam Content
    const examQuestions = [
        { id: 1, text: 'Câu 1: AI là viết tắt của từ gì?', options: ['Artificial Intelligence', 'Automatic Information', 'Advanced Interface', 'None of above'] },
        { id: 2, text: 'Câu 2: Năm nào là cột mốc ra đời của ngành AI?', options: ['1956', '1980', '1999', '2010'] },
        { id: 3, text: 'Câu 3: Deep Learning là tập con của Machine Learning?', options: ['Đúng', 'Sai'] },
    ];

    useEffect(() => {
        let timer;
        if (started && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [started, timeLeft]);

    // Anti-cheat: Detect focus loss
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && started) {
                setWarnings(prev => prev + 1);
                setShowWarning(true);
            }
        };

        const handleBlur = () => {
            if (started) {
                setWarnings(prev => prev + 1);
                setShowWarning(true);
            }
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
        };
    }, [started]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleStartExam = () => {
        // Request Full Screen (Mock or Real)
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.log("Error attempting to enable full-screen mode:", err);
            });
        }
        setStarted(true);
    };

    if (!started) {
        return (
            <div className="vh-100 d-flex align-items-center justify-content-center bg-dark text-white">
                <Card className="bg-secondary text-white border-0 shadow" style={{ maxWidth: '500px' }}>
                    <Card.Body className="text-center p-5">
                        <h2 className="mb-4">Sẵn sàng vào phòng thi?</h2>
                        <ul className="text-start mb-4">
                            <li>⚠️ Yêu cầu bật Chế độ Toàn màn hình.</li>
                            <li>⚠️ Không chuyển Tab hoặc mở ứng dụng khác.</li>
                            <li>❌ Vi phạm quá 3 lần sẽ bị HỦY BÀI THI.</li>
                        </ul>
                        <Button variant="primary" size="lg" onClick={handleStartExam}>
                            Bắt đầu làm bài
                        </Button>
                    </Card.Body>
                </Card>
            </div>
        );
    }

    return (
        <div className="exam-room bg-light vh-100 d-flex flex-column">
            {/* Sticky Header with Timer */}
            <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center shadow sticky-top">
                <h4 className="m-0">Kỳ thi Giữa kỳ: Trí tuệ nhân tạo</h4>
                <div className="d-flex align-items-center">
                    <div className="me-4 text-warning fw-bold bg-dark px-3 py-1 rounded">
                        <i className="bi bi-clock-history me-2"></i>
                        {formatTime(timeLeft)}
                    </div>
                    <Button variant="outline-light" size="sm">Nộp bài</Button>
                </div>
            </div>

            <div className="flex-grow-1 overflow-auto p-4">
                <Container>
                    <Row>
                        <Col md={12}>
                            {examQuestions.map((q, idx) => (
                                <Card key={q.id} className="mb-4 shadow-sm">
                                    <Card.Body>
                                        <Card.Title className="mb-3">{q.text}</Card.Title>
                                        <Form>
                                            {q.options.map((opt, i) => (
                                                <Form.Check
                                                    key={i}
                                                    type="radio"
                                                    id={`q-${q.id}-opt-${i}`}
                                                    label={opt}
                                                    name={`question-${q.id}`}
                                                    className="mb-2"
                                                />
                                            ))}
                                        </Form>
                                    </Card.Body>
                                </Card>
                            ))}
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Warning Overlay */}
            <Modal show={showWarning} onHide={() => setShowWarning(false)} centered backdrop="static" keyboard={false} size="sm">
                <Modal.Header className="bg-danger text-white">
                    <Modal.Title><i className="bi bi-exclamation-triangle-fill"></i> CẢNH BÁO VI PHẠM</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <p>Hệ thống phát hiện bạn vừa rời khỏi màn hình bài thi.</p>
                    <h4 className="text-danger">Số lần vi phạm: {warnings}/3</h4>
                    <p className="small text-muted">Nếu vi phạm quá 3 lần, bài thi sẽ tự động bị hủy.</p>
                </Modal.Body>
                <Modal.Footer className="justify-content-center">
                    <Button variant="danger" onClick={() => setShowWarning(false)}>Tôi đã hiểu & Quay lại</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
