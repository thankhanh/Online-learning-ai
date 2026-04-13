const User = require('../models/User');
const Classroom = require('../models/Classroom');
const Exam = require('../models/Exam');
const Result = require('../models/Result');

/**
 * @desc Get statistics for dashboard charts
 * @route GET /api/dashboard/stats
 * @access Private
 */
exports.getStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        let stats = {};

        if (role === 'student') {
            // 1. Exam Performance over time
            const results = await Result.find({ student: userId })
                .populate('exam', 'title')
                .sort({ createdAt: 1 });

            stats.examPerformance = results.map(r => ({
                name: r.exam?.title || 'Unknown',
                score: r.score,
                date: new Date(r.createdAt).toLocaleDateString('vi-VN')
            }));

            // 2. Classrooms joined
            const classrooms = await Classroom.find({ students: userId });
            stats.classroomsCount = classrooms.length;

            // 3. Overall average
            if (results.length > 0) {
                const totalScore = results.reduce((acc, curr) => acc + (curr.score || 0), 0);
                stats.averageScore = (totalScore / results.length).toFixed(2);
            } else {
                stats.averageScore = 0;
            }

            // 4. Violation stats
            stats.totalViolations = results.reduce((acc, curr) => acc + (curr.totalViolations || 0), 0);

        } else if (role === 'lecturer') {
            // 1. Student count across his classrooms
            const classrooms = await Classroom.find({ lecturer: userId });
            stats.classroomsCount = classrooms.length;
            
            const totalStudentsSet = new Set();
            classrooms.forEach(c => c.students.forEach(s => totalStudentsSet.add(s.toString())));
            stats.totalStudents = totalStudentsSet.size;

            // 2. Average scores per exam created by this lecturer
            const exams = await Exam.find({ lecturer: userId }).populate('classroom', 'name');
            stats.examsCount = exams.length;

            const examStats = [];
            for (const exam of exams) {
                const results = await Result.find({ exam: exam._id });
                if (results.length > 0) {
                    const avg = results.reduce((acc, curr) => acc + (curr.score || 0), 0) / results.length;
                    examStats.push({
                        name: exam.title,
                        avgScore: parseFloat(avg.toFixed(2)),
                        submissions: results.length,
                        classroomId: exam.classroom?._id,
                        classroomName: exam.classroom?.name
                    });
                } else {
                    examStats.push({
                        name: exam.title,
                        avgScore: 0,
                        submissions: 0,
                        classroomId: exam.classroom?._id,
                        classroomName: exam.classroom?.name
                    });
                }
            }
            stats.examPerformance = examStats;

            // 3. Recently created exams usage vs time (mock or real)
            stats.engagement = classrooms.map(c => ({
                name: c.name,
                students: c.students.length
            }));
        }

        res.json({
            success: true,
            stats
        });
    } catch (err) {
        console.error('Dashboard Stats Error:', err.message);
        res.status(500).json({ success: false, message: 'Server Error fetching dashboard stats' });
    }
};
