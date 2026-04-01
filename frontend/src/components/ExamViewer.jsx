import React, { useState, useEffect } from 'react';

const MOCK_EXAM = {
    title: "Mid-term Exam: Introduction to AI",
    duration: 15, // minutes
    questions: [
        { id: 1, text: "What does AI stand for?", options: ["Artificial Intelligence", "Apple Inc.", "Automatic Internet", "None of the above"], type: "multiple-choice" },
        { id: 2, text: "Explain the concept of Machine Learning in one sentence.", type: "essay" },
        { id: 3, text: "Which approach is used in Reinforcement Learning?", options: ["Supervised", "Unsupervised", "Reward-based", "Clustering"], type: "multiple-choice" }
    ]
};

const ExamViewer = () => {
    const [timeLeft, setTimeLeft] = useState(MOCK_EXAM.duration * 60);
    const [answers, setAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if (isSubmitted) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isSubmitted]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleOptionChange = (qId, option) => {
        setAnswers(prev => ({ ...prev, [qId]: option }));
    };

    const handleEssayChange = (qId, text) => {
        setAnswers(prev => ({ ...prev, [qId]: text }));
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
        alert("Exam Submitted! (Mock)");
    };

    return (
        <div className="container py-4">
            <header className="d-flex justify-content-between align-items-center mb-4 text-dark bg-white p-4 rounded-4 shadow-sm border border-light">
                <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3 text-primary">
                        <i className="bi bi-file-earmark-text-fill fs-3"></i>
                    </div>
                    <div>
                        <h2 className="h4 fw-900 mb-0">{MOCK_EXAM.title}</h2>
                        <p className="text-muted fw-600 mb-0 small">Please complete all questions before the time runs out.</p>
                    </div>
                </div>
                <div className={`badge px-4 py-3 rounded-pill fw-bold fs-6 shadow-sm border ${timeLeft < 300 ? 'bg-danger bg-opacity-10 text-danger border-danger border-opacity-25' : 'bg-primary bg-opacity-10 text-primary border-primary border-opacity-25'}`}>
                    <i className="bi bi-clock-history me-2"></i> Time Left: <span className="fw-900">{formatTime(timeLeft)}</span>
                </div>
            </header>

            <div className="d-flex flex-column gap-4">
                {MOCK_EXAM.questions.map((q, index) => (
                    <div key={q.id} className="card bg-white border-0 shadow-sm rounded-4 text-dark overflow-hidden position-relative">
                        <div className="position-absolute top-0 start-0 bg-primary bg-opacity-10 text-primary fw-800 px-3 py-1 rounded-bottom-end-custom" style={{ borderBottomRightRadius: '15px' }}>
                            Question {index + 1}
                        </div>
                        <div className="card-body p-4 p-md-5 mt-3">
                            <h4 className="card-title h5 mb-4 fw-800" style={{ lineHeight: '1.6' }}>{q.text}</h4>

                            {q.type === 'multiple-choice' && (
                                <div className="d-flex flex-column gap-3">
                                    {q.options.map(opt => (
                                        <div key={opt} className={`form-check p-3 rounded-3 border transition-fast ${answers[q.id] === opt ? 'bg-primary bg-opacity-10 border-primary' : 'bg-light border-light hover-bg-secondary hover-bg-opacity-10'}`} style={{ cursor: 'pointer' }} onClick={() => !isSubmitted && handleOptionChange(q.id, opt)}>
                                            <input
                                                className="form-check-input ms-1 shadow-none"
                                                type="radio"
                                                name={`q-${q.id}`}
                                                id={`q-${q.id}-${opt}`}
                                                value={opt}
                                                checked={answers[q.id] === opt}
                                                onChange={() => handleOptionChange(q.id, opt)}
                                                disabled={isSubmitted}
                                                style={{ marginTop: '0.3em' }}
                                            />
                                            <label className="form-check-label ms-3 w-100 fw-600" htmlFor={`q-${q.id}-${opt}`} style={{ cursor: 'pointer' }}>
                                                {opt}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {q.type === 'essay' && (
                                <textarea
                                    className="form-control bg-light text-dark border-light shadow-sm rounded-4 p-3 fw-500"
                                    value={answers[q.id] || ''}
                                    onChange={(e) => handleEssayChange(q.id, e.target.value)}
                                    disabled={isSubmitted}
                                    placeholder="Type your answer here..."
                                    rows={5}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-5 text-center">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitted}
                    className="btn btn-success btn-lg px-5 py-3 rounded-pill fw-bold shadow-lg"
                    style={{ background: isSubmitted ? '#e2e8f0' : 'linear-gradient(135deg, #10b981, #34d399)', border: 'none', color: isSubmitted ? '#64748b' : 'white' }}
                >
                    {isSubmitted ? <><i className="bi bi-check-circle-fill me-2"></i>Submitted</> : <><i className="bi bi-send-fill me-2"></i>Submit Exam</>}
                </button>
            </div>
        </div>
    );
};

export default ExamViewer;
