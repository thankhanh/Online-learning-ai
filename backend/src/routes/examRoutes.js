const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { auth, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(auth);

// Exam meta routes
router.get('/', examController.getExams);
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

module.exports = router;
