import React, { useState } from 'react';
import axios from 'axios';

const QuizBox = ({ classroomId }) => {
    const [quiz, setQuiz] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userAnswers, setUserAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [error, setError] = useState('');

    const generateQuiz = async () => {
        setIsLoading(true);
        setError('');
        setQuiz([]);
        setUserAnswers({});
        setIsSubmitted(false);
        setScore(0);

        try {
            const response = await axios.post('http://localhost:5000/api/quiz/generate', {
                classroomId
            });

            if (response.data && response.data.quiz) {
                setQuiz(response.data.quiz);
            } else {
                throw new Error("Không lấy được dữ liệu Quiz từ Server.");
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || "Đã xảy ra lỗi khi tạo bài thi.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptionSelect = (qIndex, option) => {
        if (!isSubmitted) {
            setUserAnswers(prev => ({
                ...prev,
                [qIndex]: option
            }));
        }
    };

    const calculateScore = () => {
        let currentScore = 0;
        quiz.forEach((q, index) => {
            if (userAnswers[index] === q.answer) {
                currentScore += 1;
            }
        });
        setScore(currentScore);
        setIsSubmitted(true);
    };

    return (
        <div className="card shadow-sm mt-4">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Quiz AI (Luyện Tập)</h5>
                <button 
                    className="btn btn-light btn-sm" 
                    onClick={generateQuiz} 
                    disabled={isLoading}
                >
                    {isLoading ? 'Đang tạo đề (Vui lòng đợi 15-30s)...' : 'Tạo 10 câu trắc nghiệm mới'}
                </button>
            </div>

            <div className="card-body">
                {error && <div className="alert alert-danger">{error}</div>}
                
                {isLoading && (
                    <div className="text-center py-5">
                        <div className="spinner-border text-success" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">AI đang đọc lại các tài liệu và suy nghĩ câu hỏi cho bạn. Xin vui lòng chờ chốc lát...</p>
                    </div>
                )}

                {!isLoading && quiz.length > 0 && (
                    <div className="quiz-container">
                        {quiz.map((q, index) => (
                            <div key={index} className="mb-4 p-3 border rounded bg-light">
                                <h6 className="fw-bold">Câu {index + 1}: {q.question}</h6>
                                <div className="d-flex flex-column gap-2 mt-3">
                                    {q.options.map((opt, optIndex) => {
                                        const isSelected = userAnswers[index] === opt;
                                        let btnClass = "btn text-start ";
                                        
                                        if (!isSubmitted) {
                                            btnClass += isSelected ? "btn-primary" : "btn-outline-secondary";
                                        } else {
                                            // Sau khi nộp bài: Tô màu đáp án đúng và sai
                                            const isCorrectAnswer = opt === q.answer;
                                            
                                            if (isCorrectAnswer) {
                                                btnClass += "btn-success text-white fw-bold"; // Đáp án của AI
                                            } else if (isSelected && !isCorrectAnswer) {
                                                btnClass += "btn-danger text-white text-decoration-line-through"; // User chọn sai
                                            } else {
                                                btnClass += "btn-outline-secondary opacity-50"; // Bỏ qua
                                            }
                                        }

                                        return (
                                            <button 
                                                key={optIndex} 
                                                className={btnClass}
                                                onClick={() => handleOptionSelect(index, opt)}
                                                disabled={isSubmitted}
                                            >
                                                {opt}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}

                        {!isSubmitted ? (
                            <div className="text-center mt-4">
                                <button className="btn btn-lg btn-success px-5" onClick={calculateScore}>
                                    Nộp Bài
                                </button>
                            </div>
                        ) : (
                            <div className="alert alert-info text-center mt-4">
                                <h4>Kết Quả Của Bạn: <span className="text-success fw-bold">{score}/{quiz.length}</span></h4>
                            </div>
                        )}
                    </div>
                )}
                
                {!isLoading && quiz.length === 0 && !error && (
                    <div className="text-center text-muted py-5">
                        <i>Hãy ấn nút "Tạo 10 câu trắc nghiệm mới" ở góc phải bên trên để hệ thống AI sinh ra bài luyện tập cho bạn dựa trên tài liệu đã đóng góp của lớp học này.</i>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizBox;
