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
        const { title, classroom, duration, questions, maxViolations, startTime } = req.body;

        // Verify classroom exists and user is the lecturer
        const classObj = await Classroom.findById(classroom);
        if (!classObj) {
            return res.status(404).json({ success: false, message: 'Classroom not found' });
        }

        if (classObj.lecturer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only the lecturer can create exams' });
        }

        const exam = new Exam({
            title,
            classroom,
            duration,
            questions,
            maxViolations: maxViolations || 3,
            startTime,
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

        // Hide correct answers if the user is a student
        const examData = exam.toObject();
        if (req.user.role === 'student') {
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

        // 2. Save Result
        const result = new Result({
            student: req.user.id,
            exam: exam._id,
            score: score.toFixed(2),
            answers: gradedAnswers,
            submittedAt: Date.now()
        });

        await result.save();

        res.json({
            success: true,
            score: score.toFixed(2),
            correctCount,
            totalQuestions,
            resultId: result._id
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
 * @route   PUT /api/exams/:id
 * @desc    Update an exam
 * @access  Private/Lecturer
 */
exports.updateExam = async (req, res) => {
    try {
        const { title, classroom, duration, maxViolations, questions } = req.body;
        let exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        // Check if lecturer owns the class
        const classObj = await Classroom.findById(exam.classroom);
        if (classObj.lecturer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        exam = await Exam.findByIdAndUpdate(req.params.id, {
            title, classroom, duration, maxViolations, questions
        }, { new: true });

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
