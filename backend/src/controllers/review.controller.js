const Review = require('../models/Review');
const Course = require('../models/Course');

exports.getReviewsByCourse = async (req, res, next) => {
  try {
    const reviews = await Review.find({ course: req.params.courseId })
      .populate('student', 'name avatar')
      .sort('-createdAt');
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const existingReview = await Review.findOne({ student: req.user.id, course: req.params.courseId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this course' });
    }
    const review = await Review.create({ student: req.user.id, course: req.params.courseId, rating, comment });
    const reviews = await Review.find({ course: req.params.courseId });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await Course.findByIdAndUpdate(req.params.courseId, { rating: Math.round(avgRating * 10) / 10 });
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    if (review.student.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await review.deleteOne();
    const reviews = await Review.find({ course: review.course });
    const avgRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
    await Course.findByIdAndUpdate(review.course, { rating: Math.round(avgRating * 10) / 10 });
    res.json({ message: 'Review removed' });
  } catch (error) {
    next(error);
  }
};
