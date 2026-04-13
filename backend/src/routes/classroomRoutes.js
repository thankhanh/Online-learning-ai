const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroomController');
const { auth, authorize } = require('../middleware/authMiddleware');

// All routes are private
router.use(auth);

router.get('/', classroomController.getClassrooms);
router.get('/:id', classroomController.getClassroomById);

// Lecturer only routes
router.post('/', authorize('lecturer', 'admin'), classroomController.createClassroom);
router.put('/:id', authorize('lecturer', 'admin'), classroomController.updateClassroom);
router.delete('/:id', authorize('lecturer', 'admin'), classroomController.deleteClassroom);
router.put('/:id/schedule', authorize('lecturer', 'admin'), classroomController.updateSchedule);
router.delete('/:id/students/:studentId', authorize('lecturer', 'admin'), classroomController.removeStudentFromClass);

// Student only routes
router.post('/join', authorize('student'), classroomController.joinClassroom);
router.get('/:id/progress', authorize('student'), classroomController.getClassroomProgress);
router.post('/:id/materials/:materialId/view', authorize('student'), classroomController.markMaterialAsViewed);

module.exports = router;
