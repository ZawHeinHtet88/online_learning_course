const express = require('express');
const router = express.Router();
const { getReviewsByCourse, createReview, deleteReview } = require('../controllers/review.controller');
const { protect } = require('../middleware/auth');

router.get('/course/:courseId', getReviewsByCourse);
router.post('/course/:courseId', protect, createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
