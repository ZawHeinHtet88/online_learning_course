const express = require('express');
const router = express.Router();
const { enroll, getMyEnrollments, getEnrollment, updateProgress, getEnrollmentStats } = require('../controllers/enrollment.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', enroll);
router.get('/my', getMyEnrollments);
router.get('/stats', getEnrollmentStats);
router.get('/:id', getEnrollment);
router.put('/:id/progress', updateProgress);

module.exports = router;
