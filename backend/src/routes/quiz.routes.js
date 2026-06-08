const express = require('express');
const router = express.Router();
const { getQuizzesByCourse, getQuiz, createQuiz, submitQuiz, getQuizResults } = require('../controllers/quiz.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/course/:courseId', getQuizzesByCourse);
router.get('/:id', getQuiz);
router.post('/course/:courseId', protect, authorize('instructor', 'admin'), createQuiz);
router.post('/:id/submit', protect, submitQuiz);
router.get('/:id/results', protect, getQuizResults);

module.exports = router;
