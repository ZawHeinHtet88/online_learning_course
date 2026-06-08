const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

exports.enroll = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const existingEnrollment = await Enrollment.findOne({ student: req.user.id, course: courseId });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }
    const enrollment = await Enrollment.create({ student: req.user.id, course: courseId });
    await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });
    res.status(201).json(enrollment);
  } catch (error) {
    next(error);
  }
};

exports.getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate({ path: 'course', populate: [{ path: 'instructor', select: 'name avatar' }, { path: 'category', select: 'name' }] })
      .sort('-enrolledAt');
    res.json(enrollments);
  } catch (error) {
    next(error);
  }
};

exports.getEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate({ path: 'course', populate: [{ path: 'instructor', select: 'name avatar' }, { path: 'lessons' }, { path: 'category', select: 'name' }] });
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    res.json(enrollment);
  } catch (error) {
    next(error);
  }
};

exports.updateProgress = async (req, res, next) => {
  try {
    const { lessonId } = req.body;
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }
    const course = await Course.findById(enrollment.course);
    const totalLessons = course.lessons ? course.lessons.length : 0;
    if (totalLessons > 0) {
      enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);
    }
    if (enrollment.progress === 100) {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
    }
    await enrollment.save();
    res.json(enrollment);
  } catch (error) {
    next(error);
  }
};

exports.getEnrollmentStats = async (req, res, next) => {
  try {
    const stats = await Enrollment.aggregate([
      { $match: { student: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const totalEnrolled = await Enrollment.countDocuments({ student: req.user._id });
    const totalCompleted = await Enrollment.countDocuments({ student: req.user._id, status: 'completed' });
    const avgProgress = await Enrollment.aggregate([
      { $match: { student: req.user._id } },
      { $group: { _id: null, avg: { $avg: '$progress' } } },
    ]);
    res.json({
      totalEnrolled,
      totalCompleted,
      avgProgress: avgProgress.length > 0 ? Math.round(avgProgress[0].avg) : 0,
      byStatus: stats,
    });
  } catch (error) {
    next(error);
  }
};
