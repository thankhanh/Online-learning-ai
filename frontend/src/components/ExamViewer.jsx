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
        <div className="exam-viewer">
            <header className="exam-header">
                <h2>{MOCK_EXAM.title}</h2>
                <div className={`timer ${timeLeft < 60 ? 'warning' : ''}`}>
                    Time Left: {formatTime(timeLeft)}
                </div>
            </header>

            <div className="exam-questions">
                {MOCK_EXAM.questions.map((q, index) => (
                    <div key={q.id} className="question-card">
                        <h4>Question {index + 1}: {q.text}</h4>

                        {q.type === 'multiple-choice' && (
                            <div className="options">
                                {q.options.map(opt => (
                                    <label key={opt} className="option-label">
                                        <input
                                            type="radio"
                                            name={`q-${q.id}`}
                                            value={opt}
                                            checked={answers[q.id] === opt}
                                            onChange={() => handleOptionChange(q.id, opt)}
                                            disabled={isSubmitted}
                                        />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        )}

                        {q.type === 'essay' && (
                            <textarea
                                className="essay-input"
                                value={answers[q.id] || ''}
                                onChange={(e) => handleEssayChange(q.id, e.target.value)}
                                disabled={isSubmitted}
                                placeholder="Type your answer here..."
                                rows={4}
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="exam-actions">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitted}
                    className="submit-btn"
                >
                    {isSubmitted ? 'Submitted' : 'Submit Exam'}
                </button>
            </div>
        </div>
    );
};

export default ExamViewer;
