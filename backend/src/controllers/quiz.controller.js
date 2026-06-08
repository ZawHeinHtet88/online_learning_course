const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const Course = require('../models/Course');

exports.getQuizzesByCourse = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId }).select('-questions.correctAnswer');
    res.json(quizzes);
  } catch (error) {
    next(error);
  }
};

exports.getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course', 'title');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (error) {
    next(error);
  }
};

exports.createQuiz = async (req, res, next) => {
  try {
    req.body.course = req.params.courseId;
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const quiz = await Quiz.create(req.body);
    res.status(201).json(quiz);
  } catch (error) {
    next(error);
  }
};

exports.submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    let correctCount = 0;
    const resultAnswers = answers.map((answer, index) => {
      const isCorrect = answer.selectedAnswer === quiz.questions[index].correctAnswer;
      if (isCorrect) correctCount++;
      return { questionIndex: index, selectedAnswer: answer.selectedAnswer, isCorrect };
    });
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;
    const quizResult = await QuizResult.create({
      student: req.user.id,
      quiz: req.params.id,
      answers: resultAnswers,
      score,
      passed,
    });
    res.json(quizResult);
  } catch (error) {
    next(error);
  }
};

exports.getQuizResults = async (req, res, next) => {
  try {
    const results = await QuizResult.find({ student: req.user.id, quiz: req.params.id }).sort('-completedAt');
    res.json(results);
  } catch (error) {
    next(error);
  }
};
