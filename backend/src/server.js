const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/enrollments', require('./routes/enrollment.routes'));
app.use('/api/lessons', require('./routes/lesson.routes'));
app.use('/api/quizzes', require('./routes/quiz.routes'));
app.use('/api/reviews', require('./routes/review.routes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

app.get('/api/seed/:secret', async (req, res) => {
  if (req.params.secret !== 'seed_now_2026') {
    return res.status(403).json({ error: 'Invalid secret' });
  }
  try {
    const User = require('./models/User');
    const Category = require('./models/Category');
    const Course = require('./models/Course');
    const Lesson = require('./models/Lesson');
    const Quiz = require('./models/Quiz');

    await User.deleteMany();
    await Category.deleteMany();
    await Course.deleteMany();
    await Lesson.deleteMany();
    await Quiz.deleteMany();

    const admin = await User.create({ name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'admin' });
    const instructor1 = await User.create({ name: 'John Instructor', email: 'john@example.com', password: 'password123', role: 'instructor', bio: 'Senior Software Engineer with 10+ years of experience' });
    const instructor2 = await User.create({ name: 'Jane Instructor', email: 'jane@example.com', password: 'password123', role: 'instructor', bio: 'Data Science Expert and ML practitioner' });
    await User.create({ name: 'Student User', email: 'student@example.com', password: 'password123', role: 'student' });

    const catData = [
      { name: 'Web Development', description: 'Learn to build modern web applications', icon: 'code' },
      { name: 'Mobile Development', description: 'Build mobile apps for iOS and Android', icon: 'smartphone' },
      { name: 'Data Science', description: 'Learn data analysis and machine learning', icon: 'bar-chart' },
      { name: 'UI/UX Design', description: 'Design beautiful user interfaces', icon: 'palette' },
      { name: 'DevOps', description: 'Learn CI/CD, cloud, and infrastructure', icon: 'cloud' },
    ];
    const categories = [];
    for (const c of catData) {
      categories.push(await Category.create(c));
    }

    const course1 = await Course.create({
      title: 'Complete Web Development Bootcamp',
      description: 'Master web development from HTML/CSS to React and Node.js. Build real-world projects and become a full-stack developer.',
      instructor: instructor1._id, category: categories[0]._id,
      price: 49.99, level: 'beginner', duration: 1200, isPublished: true,
      tags: ['javascript', 'react', 'nodejs', 'web development'], enrolledCount: 1520, rating: 4.7,
    });
    const course2 = await Course.create({
      title: 'React Native: Build Mobile Apps',
      description: 'Learn to build cross-platform mobile apps with React Native and Expo. Deploy to App Store and Google Play.',
      instructor: instructor1._id, category: categories[1]._id,
      price: 59.99, level: 'intermediate', duration: 900, isPublished: true,
      tags: ['react native', 'expo', 'mobile', 'ios', 'android'], enrolledCount: 890, rating: 4.5,
    });
    const course3 = await Course.create({
      title: 'Python for Data Science & ML',
      description: 'Master Python for data analysis, visualization, and machine learning with hands-on projects.',
      instructor: instructor2._id, category: categories[2]._id,
      price: 69.99, level: 'beginner', duration: 1500, isPublished: true,
      tags: ['python', 'data science', 'machine learning', 'pandas'], enrolledCount: 2340, rating: 4.8,
    });
    const course4 = await Course.create({
      title: 'UI/UX Design Masterclass',
      description: 'Learn user interface and experience design principles. Master Figma and create stunning designs.',
      instructor: instructor2._id, category: categories[3]._id,
      price: 39.99, level: 'beginner', duration: 600, isPublished: true,
      tags: ['design', 'figma', 'ui', 'ux'], enrolledCount: 670, rating: 4.6,
    });

    await Lesson.insertMany([
      { title: 'Introduction to Web Development', description: 'Overview of web development landscape', course: course1._id, videoUrl: 'https://www.youtube.com/watch?v=UB1O30fZ-Us', duration: 300, order: 1, isFree: true, content: 'Welcome to the course!' },
      { title: 'HTML Fundamentals', description: 'Learn HTML tags and structure', course: course1._id, videoUrl: 'https://www.youtube.com/watch?v=UB1O30fZ-Us', duration: 600, order: 2, isFree: true, content: 'HTML basics.' },
      { title: 'CSS Styling', description: 'Style your web pages with CSS', course: course1._id, videoUrl: 'https://www.youtube.com/watch?v=1PnV3N2VEck', duration: 900, order: 3, content: 'CSS properties.' },
      { title: 'JavaScript Basics', description: 'Programming with JavaScript', course: course1._id, videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk', duration: 1200, order: 4, content: 'JS fundamentals.' },
      { title: 'React Introduction', description: 'Build UIs with React', course: course1._id, videoUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0', duration: 1500, order: 5, content: 'React components.' },
      { title: 'React Native Setup', description: 'Setting up your development environment', course: course2._id, videoUrl: 'https://www.youtube.com/watch?v=0-S5aHZeJ0M', duration: 450, order: 1, isFree: true, content: 'RN installation.' },
      { title: 'Core Components', description: 'Built-in React Native components', course: course2._id, videoUrl: 'https://www.youtube.com/watch?v=0-S5aHZeJ0M', duration: 600, order: 2, content: 'View, Text, Image.' },
      { title: 'Navigation', description: 'React Navigation setup', course: course2._id, duration: 750, order: 3, content: 'Stack and Tab navigation.' },
      { title: 'Python Setup', description: 'Install Python and setup IDE', course: course3._id, videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw', duration: 300, order: 1, isFree: true, content: 'Python installation.' },
      { title: 'Python Basics', description: 'Variables, loops, and functions', course: course3._id, videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw', duration: 900, order: 2, content: 'Python fundamentals.' },
      { title: 'NumPy & Pandas', description: 'Data manipulation libraries', course: course3._id, duration: 1200, order: 3, content: 'Working with dataframes.' },
    ]);

    await Quiz.insertMany([
      {
        title: 'Web Dev Basics Quiz', description: 'Test your HTML and CSS knowledge', course: course1._id, passingScore: 70,
        questions: [
          { question: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink Text Mode Language'], correctAnswer: 0, explanation: 'HTML = Hyper Text Markup Language' },
          { question: 'Which CSS property changes text color?', options: ['font-color', 'text-color', 'color', 'foreground'], correctAnswer: 2, explanation: 'The color property changes text color' },
          { question: 'What is the correct HTML element for the largest heading?', options: ['<heading>', '<h6>', '<h1>', '<head>'], correctAnswer: 2, explanation: '<h1> is the largest heading tag' },
        ],
      },
      {
        title: 'Python Basics Quiz', description: 'Test your Python fundamentals', course: course3._id, passingScore: 60,
        questions: [
          { question: 'Which keyword defines a function in Python?', options: ['function', 'func', 'def', 'define'], correctAnswer: 2, explanation: 'Python uses def keyword' },
          { question: 'What is the output of print(2 ** 3)?', options: ['6', '8', '5', '23'], correctAnswer: 1, explanation: '** is the power operator' },
        ],
      },
    ]);

    res.json({ message: 'Database seeded successfully!', accounts: { admin: 'admin@example.com', instructor1: 'john@example.com', instructor2: 'jane@example.com', student: 'student@example.com', password: 'password123' } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});