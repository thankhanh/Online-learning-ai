const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { auth, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(auth);

// Exam meta routes
router.get('/', examController.getExams);
router.get('/stats/me', authorize('student'), examController.getStudentStats);
router.get('/stats/lecturer', authorize('lecturer', 'admin'), examController.getLecturerStats);
router.get('/my-results', examController.getMyResults);
router.get('/classroom/:classId', examController.getExamsByClassroom);
router.get('/:id', examController.getExamById);
router.get('/:id/results', examController.getExamResults);

// Lecturer only
router.post('/', authorize('lecturer', 'admin'), examController.createExam);
router.put('/:id', authorize('lecturer', 'admin'), examController.updateExam);
router.delete('/:id', authorize('lecturer', 'admin'), examController.deleteExam);

// Student only
router.post('/:id/submit', authorize('student'), examController.submitExam);

// Lecturer only: Manage Results (Reset Attempt, Grade)
router.delete('/:examId/results/:resultId', authorize('lecturer', 'admin'), examController.deleteResult);
router.put('/results/:resultId/grade', authorize('lecturer', 'admin'), examController.gradeResult);

// Student & Details
router.get('/results/:resultId/details', examController.getResultDetails);

module.exports = router;
