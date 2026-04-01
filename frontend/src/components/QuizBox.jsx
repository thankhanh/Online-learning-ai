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
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden mt-4">
            <div className="card-header bg-white border-bottom border-light px-4 py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div className="d-flex align-items-center">
                    <div className="bg-success bg-opacity-10 p-2 rounded-3 me-3 text-success">
                        <i className="bi bi-lightbulb-fill fs-4"></i>
                    </div>
                    <div>
                        <h5 className="mb-0 fw-800 text-dark">Luyện Tập Cùng AI</h5>
                        <p className="text-muted small fw-500 mb-0">Hệ thống tạo tự động dựa trên tài liệu lớp học</p>
                    </div>
                </div>
                <button 
                    className="btn btn-success rounded-pill px-4 py-2 fw-bold shadow-sm text-nowrap" 
                    onClick={generateQuiz} 
                    disabled={isLoading}
                    style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', border: 'none' }}
                >
                    {isLoading ? (
                        <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Đang tạo đề...</>
                    ) : (
                        <><i className="bi bi-magic me-2"></i>Tạo 10 câu hỏi mới</>
                    )}
                </button>
            </div>

            <div className="card-body p-4 p-md-5 bg-light bg-opacity-50">
                {error && <div className="alert alert-danger shadow-sm border-0 rounded-4"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</div>}
                
                {isLoading && (
                    <div className="text-center py-5">
                        <div className="spinner-grow text-success mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <h5 className="fw-700 text-dark">AI đang xử lý tài liệu...</h5>
                        <p className="mt-2 text-muted fw-500">Xin vui lòng chờ khoảng 15-30 giây để hệ thống sinh tập câu hỏi.</p>
                    </div>
                )}

                {!isLoading && quiz.length > 0 && (
                    <div className="quiz-container custom-scrollbar" style={{ maxHeight: '650px', overflowY: 'auto', paddingRight: '10px' }}>
                        {quiz.map((q, index) => (
                            <div key={index} className="mb-4 p-4 p-md-5 border border-light rounded-4 bg-white shadow-sm position-relative">
                                <div className="position-absolute top-0 start-0 bg-success bg-opacity-10 text-success fw-800 px-4 py-2 rounded-bottom-end-custom" style={{ borderBottomRightRadius: '20px' }}>
                                    Câu {index + 1}
                                </div>
                                <h5 className="fw-800 mt-4 mb-4 text-dark" style={{ lineHeight: '1.6' }}>{q.question}</h5>
                                <div className="d-flex flex-column gap-3 mt-4">
                                    {q.options.map((opt, optIndex) => {
                                        const isSelected = userAnswers[index] === opt;
                                        let btnClass = "btn text-start w-100 rounded-pill py-3 px-4 fw-600 transition-fast ";
                                        
                                        if (!isSubmitted) {
                                            if (isSelected) {
                                                btnClass += "btn-primary shadow-sm border-0";
                                            } else {
                                                btnClass += "btn-light bg-white border border-secondary border-opacity-25 text-dark hover-bg-light";
                                            }
                                        } else {
                                            const isCorrectAnswer = opt === q.answer;
                                            
                                            if (isCorrectAnswer) {
                                                btnClass += "btn-success text-white shadow-sm border-0"; 
                                            } else if (isSelected && !isCorrectAnswer) {
                                                btnClass += "btn-danger text-white text-decoration-line-through opacity-75 border-0"; 
                                            } else {
                                                btnClass += "btn-light bg-white border border-light text-muted opacity-50"; 
                                            }
                                        }

                                        return (
                                            <button 
                                                key={optIndex} 
                                                className={btnClass}
                                                onClick={() => handleOptionSelect(index, opt)}
                                                disabled={isSubmitted}
                                            >
                                                <div className="d-flex align-items-center">
                                                    <span className={`d-inline-flex justify-content-center align-items-center rounded-circle me-3 fw-bold shadow-sm ${!isSubmitted && isSelected ? 'bg-white text-primary' : (isSubmitted && opt === q.answer ? 'bg-white text-success' : 'bg-light text-secondary border')} `} style={{ width: '30px', height: '30px', fontSize: '0.9rem' }}>
                                                        {String.fromCharCode(65 + optIndex)}
                                                    </span>
                                                    <span>{opt}</span>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}

                        {!isSubmitted ? (
                            <div className="text-center mt-5 mb-3">
                                <button className="btn btn-success rounded-pill px-5 py-3 fw-bold shadow-lg" onClick={calculateScore} style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', border: 'none', fontSize: '1.1rem' }}>
                                    <i className="bi bi-check2-circle me-2"></i>Nộp Bài Chấm Điểm
                                </button>
                            </div>
                        ) : (
                            <div className="text-center mt-5 mb-3">
                                <div className="d-inline-block bg-white p-4 rounded-4 shadow-sm border border-light">
                                    <h5 className="text-muted fw-700 mb-3 text-uppercase" style={{ letterSpacing: '0.05em' }}>Kết Quả Luyện Tập</h5>
                                    <h1 className="display-4 fw-900 text-success mb-0">{score}<span className="text-muted fs-3">/{quiz.length}</span></h1>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {!isLoading && quiz.length === 0 && !error && (
                    <div className="text-center text-muted py-5">
                        <div className="bg-white rounded-circle d-inline-flex p-4 mb-4 shadow-sm border border-light">
                            <i className="bi bi-magic display-4 text-success opacity-50"></i>
                        </div>
                        <h5 className="fw-800 text-dark">Bắt đầu quá trình luyện tập</h5>
                        <p className="fw-500 max-w-500 mx-auto">Nhấn nút <strong>"Tạo 10 câu hỏi mới"</strong> ở góc trên bên phải để hệ thống AI tạo bài trắc nghiệm dựa trên kho tài liệu của lớp học này.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizBox;
