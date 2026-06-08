const express = require('express');
const router = express.Router();
const { getLessonsByCourse, getLesson, createLesson, updateLesson, deleteLesson } = require('../controllers/lesson.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/course/:courseId', getLessonsByCourse);
router.get('/:id', getLesson);
router.post('/course/:courseId', protect, authorize('instructor', 'admin'), createLesson);
router.put('/:id', protect, authorize('instructor', 'admin'), updateLesson);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteLesson);

module.exports = router;
