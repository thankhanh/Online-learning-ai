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
            <header className="d-flex justify-content-between align-items-center mb-4 text-white">
                <h2 className="h3 fw-bold">{MOCK_EXAM.title}</h2>
                <div className={`badge fs-5 ${timeLeft < 60 ? 'bg-danger' : 'bg-primary'}`}>
                    Time Left: {formatTime(timeLeft)}
                </div>
            </header>

            <div className="d-flex flex-column gap-4">
                {MOCK_EXAM.questions.map((q, index) => (
                    <div key={q.id} className="card bg-dark border-secondary text-white">
                        <div className="card-body">
                            <h4 className="card-title h5 mb-3">Question {index + 1}: {q.text}</h4>

                            {q.type === 'multiple-choice' && (
                                <div className="d-flex flex-column gap-2">
                                    {q.options.map(opt => (
                                        <div key={opt} className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name={`q-${q.id}`}
                                                id={`q-${q.id}-${opt}`}
                                                value={opt}
                                                checked={answers[q.id] === opt}
                                                onChange={() => handleOptionChange(q.id, opt)}
                                                disabled={isSubmitted}
                                            />
                                            <label className="form-check-label" htmlFor={`q-${q.id}-${opt}`}>
                                                {opt}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {q.type === 'essay' && (
                                <textarea
                                    className="form-control bg-dark border-secondary text-white"
                                    value={answers[q.id] || ''}
                                    onChange={(e) => handleEssayChange(q.id, e.target.value)}
                                    disabled={isSubmitted}
                                    placeholder="Type your answer here..."
                                    rows={4}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitted}
                    className="btn btn-success btn-lg w-100"
                >
                    {isSubmitted ? 'Submitted' : 'Submit Exam'}
                </button>
            </div>
        </div>
    );
};

export default ExamViewer;
