const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// All routes prefixed with /api/quiz
router.post('/generate', quizController.generateQuiz);

module.exports = router;
