const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Classroom = require('../models/Classroom');

/**
 * @route   GET /api/exams
 * @desc    Get all exams for the current user
 * @access  Private
 */
exports.getExams = async (req, res) => {
    try {
        let exams;
        if (req.user.role === 'lecturer') {
            // Find exams for classrooms owned by the lecturer
            const classrooms = await Classroom.find({ lecturer: req.user.id });
            const classroomIds = classrooms.map(c => c._id);
            exams = await Exam.find({ classroom: { $in: classroomIds } }).populate('classroom', 'name');
        } else {
            // Find exams for classrooms the student is enrolled in
            const classrooms = await Classroom.find({ students: req.user.id });
            const classroomIds = classrooms.map(c => c._id);
            exams = await Exam.find({ classroom: { $in: classroomIds } }).populate('classroom', 'name').select('-questions.correctAnswer');
        }

        res.json({ success: true, count: exams.length, exams });
    } catch (error) {
        console.error('Get All Exams Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @route   POST /api/exams
 * @desc    Create a new exam
 * @access  Private/Lecturer
 */
exports.createExam = async (req, res) => {
    try {
        const { title, classroom, duration, questions, maxViolations, startTime, endTime } = req.body;

        // Verify classroom exists and user is the lecturer
        const classObj = await Classroom.findById(classroom);
        if (!classObj) {
            return res.status(404).json({ success: false, message: 'Classroom not found' });
        }

        if (classObj.lecturer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only the lecturer can create exams' });
        }

        if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
            return res.status(400).json({ success: false, message: 'End time must be after start time' });
        }

        const exam = new Exam({
            title,
            classroom,
            duration,
            questions,
            maxViolations: maxViolations || 3,
            startTime,
            endTime,
            status: 'active' // Default to active for now
        });

        await exam.save();

        res.status(201).json({
            success: true,
            exam
        });
    } catch (error) {
        console.error('Create Exam Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @route   GET /api/exams/classroom/:classId
 * @desc    Get all exams for a classroom
 * @access  Private
 */
exports.getExamsByClassroom = async (req, res) => {
    try {
        const exams = await Exam.find({ classroom: req.params.classId }).select('-questions.correctAnswer');
        res.json({ success: true, exams });
    } catch (error) {
        console.error('Get Exams Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @route   GET /api/exams/:id
 * @desc    Get exam by ID
 * @access  Private
 */
exports.getExamById = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        // Hide correct answers if the user is a student and restrict access based on time
        const examData = exam.toObject();
        if (req.user.role === 'student') {
            const now = Date.now();
            if (exam.startTime && now < new Date(exam.startTime).getTime()) {
                return res.status(403).json({ success: false, message: 'Kỳ thi chưa bắt đầu. Vui lòng quay lại sau.' });
            }
            if (exam.endTime && now > new Date(exam.endTime).getTime()) {
                return res.status(403).json({ success: false, message: 'Kỳ thi đã kết thúc. Bạn không thể vào thi nữa.' });
            }

            examData.questions.forEach(q => delete q.correctAnswer);
        }

        res.json({ success: true, exam: examData });
    } catch (error) {
        console.error('Get Exam Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @route   POST /api/exams/:id/submit
 * @desc    Submit exam and auto-grade
 * @access  Private/Student
 */
exports.submitExam = async (req, res) => {
    try {
        const { answers } = req.body; // Array of { questionId, selectedOption }
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        // Validate time
        const now = Date.now();
        if (exam.startTime && now < new Date(exam.startTime).getTime()) {
            return res.status(403).json({ success: false, message: 'Kỳ thi chưa bắt đầu.' });
        }
        
        // Add a 5 minutes auto-submit grace period buffer
        if (exam.endTime && now > new Date(exam.endTime).getTime() + 5 * 60 * 1000) {
            return res.status(403).json({ success: false, message: 'Kỳ thi đã kết thúc. Quá hạn nộp bài.' });
        }

        // 0. Check if student already submitted
        const existingResult = await Result.findOne({ student: req.user.id, exam: req.params.id });
        if (existingResult) {
            return res.status(400).json({ success: false, message: 'Bạn đã nộp bài thi này rồi. Mỗi sinh viên chỉ được thi một lần.' });
        }

        // 1. Calculate Score
        let correctCount = 0;
        const totalQuestions = exam.questions.length;

        const gradedAnswers = exam.questions.map(question => {
            const studentAnswer = answers.find(a => a.questionId.toString() === question._id.toString());
            const isCorrect = studentAnswer && studentAnswer.selectedOption === question.correctAnswer;

            if (isCorrect) correctCount++;

            return {
                questionId: question._id,
                selectedOption: studentAnswer ? studentAnswer.selectedOption : null,
                isCorrect: !!isCorrect
            };
        });

        const score = (correctCount / totalQuestions) * 10; // Scale to 10

        // 2. Save Result (Default status is 'pending')
        const result = new Result({
            student: req.user.id,
            exam: exam._id,
            score: score.toFixed(2),
            answers: gradedAnswers,
            status: 'pending',
            submittedAt: Date.now()
        });

        await result.save();

        res.json({
            success: true,
            // score and correctCount not returned to client for 'pending' state
            resultId: result._id,
            message: 'Nộp bài thành công, chờ giảng viên chấm điểm.'
        });
    } catch (error) {
        console.error('Submit Exam Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @route   GET /api/exams/:id/results
 * @desc    Get results for an exam
 * @access  Private
 */
exports.getExamResults = async (req, res) => {
    try {
        let results;
        if (req.user.role === 'lecturer' || req.user.role === 'admin') {
            results = await Result.find({ exam: req.params.id }).populate('student', 'name email');
        } else {
            results = await Result.find({ exam: req.params.id, student: req.user.id });
        }

        res.json({ success: true, results });
    } catch (error) {
        console.error('Get Results Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @route   GET /api/exams/my-results
 * @desc    Get all results for the current student
 * @access  Private/Student
 */
exports.getMyResults = async (req, res) => {
    try {
        const results = await Result.find({ student: req.user.id })
            .populate({
                path: 'exam',
                select: 'title classroom duration',
                populate: { path: 'classroom', select: 'name' }
            })
            .sort('-createdAt');
        
        res.json({ success: true, count: results.length, results });
    } catch (error) {
        console.error('Get My Results Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @route   DELETE /api/exams/:examId/results/:resultId
 * @desc    Delete a student result (Reset Attempt)
 * @access  Private/Lecturer (Admin)
 */
exports.deleteResult = async (req, res) => {
    try {
        const result = await Result.findById(req.params.resultId);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Result not found' });
        }

        // Verify authorized: exam lecturer or admin
        const exam = await Exam.findById(req.params.examId);
        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        const classObj = await Classroom.findById(exam.classroom);
        if (classObj.lecturer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete results for this exam' });
        }

        await Result.findByIdAndDelete(req.params.resultId);

        res.json({ success: true, message: 'Đã xóa kết quả bài thi. Sinh viên hiện có thể thi bổ sung/lại.' });
    } catch (error) {
        console.error('Delete Result Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @route   GET /api/exams/results/:resultId/details
 * @desc    Get detailed populated result
 * @access  Private
 */
exports.getResultDetails = async (req, res) => {
    try {
        const result = await Result.findById(req.params.resultId).populate('exam');
        if (!result) {
            return res.status(404).json({ success: false, message: 'Result not found' });
        }

        if (result.student.toString() !== req.user.id && req.user.role !== 'lecturer' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to view this result' });
        }

        res.json({ success: true, result });
    } catch (error) {
        console.error('Get Result Details Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @route   PUT /api/exams/results/:resultId/grade
 * @desc    Approve/Grade a result
 * @access  Private/Lecturer (Admin)
 */
exports.gradeResult = async (req, res) => {
    try {
        const { score, status } = req.body;
        const result = await Result.findById(req.params.resultId).populate('exam');
        if (!result) {
            return res.status(404).json({ success: false, message: 'Result not found' });
        }

        // Verify authorized: exam lecturer or admin
        const classObj = await Classroom.findById(result.exam.classroom);
        if (classObj.lecturer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to grade this result' });
        }

        if (score !== undefined) result.score = score;
        if (status !== undefined) result.status = status;
        
        await result.save();

        res.json({ success: true, message: 'Cập nhật điểm thành công.', result });
    } catch (error) {
        console.error('Grade Result Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @route   PUT /api/exams/:id
 * @desc    Update an exam
 * @access  Private/Lecturer
 */
exports.updateExam = async (req, res) => {
    try {
        const { title, classroom, duration, maxViolations, questions, startTime, endTime } = req.body;
        let exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        // Check if lecturer owns the class
        const classObj = await Classroom.findById(exam.classroom);
        if (classObj.lecturer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
            return res.status(400).json({ success: false, message: 'End time must be after start time' });
        }

        let updatePayload = { title, classroom, duration, maxViolations, questions };
        // Handle clear timestamps or preserve
        if (req.body.hasOwnProperty('startTime')) updatePayload.startTime = startTime ? startTime : null;
        if (req.body.hasOwnProperty('endTime')) updatePayload.endTime = endTime ? endTime : null;

        exam = await Exam.findByIdAndUpdate(req.params.id, updatePayload, { new: true });

        res.json({ success: true, exam });
    } catch (error) {
        console.error('Update Exam Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @route   DELETE /api/exams/:id
 * @desc    Delete an exam
 * @access  Private/Lecturer
 */
exports.deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        const classObj = await Classroom.findById(exam.classroom);
        if (classObj.lecturer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await Exam.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Exam deleted successfully' });
    } catch (error) {
        console.error('Delete Exam Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
/**
 * @route   GET /api/exams/stats/me
 * @desc    Get overall statistics for current student (GPA)
 * @access  Private/Student
 */
exports.getStudentStats = async (req, res) => {
    try {
        const results = await Result.find({ student: req.user.id });
        
        if (results.length === 0) {
            return res.json({ 
                success: true, 
                stats: { gpa: 'N/A', examCount: 0 } 
            });
        }

        const totalScore = results.reduce((acc, curr) => acc + (curr.score || 0), 0);
        const gpa = (totalScore / results.length).toFixed(2);

        res.json({
            success: true,
            stats: {
                gpa,
                examCount: results.length
            }
        });
    } catch (error) {
        console.error('Get Student Stats Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @route   GET /api/exams/stats/lecturer
 * @desc    Get overall statistics for current lecturer
 * @access  Private/Lecturer (Admin)
 */
exports.getLecturerStats = async (req, res) => {
    try {
        const classrooms = await Classroom.find({ lecturer: req.user.id });
        const classroomIds = classrooms.map(c => c._id);
        const exams = await Exam.find({ classroom: { $in: classroomIds } });
        const examIds = exams.map(e => e._id);
        
        const pendingResultsCount = await Result.countDocuments({
            exam: { $in: examIds },
            status: 'pending'
        });

        res.json({ success: true, pendingGrading: pendingResultsCount });
    } catch (error) {
        console.error('Get Lecturer Stats Error:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

