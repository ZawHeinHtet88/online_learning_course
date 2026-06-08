const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Course = require('../src/models/Course');
const Lesson = require('../src/models/Lesson');
const Quiz = require('../src/models/Quiz');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');

    await User.deleteMany();
    await Category.deleteMany();
    await Course.deleteMany();
    await Lesson.deleteMany();
    await Quiz.deleteMany();

    const admin = await User.create({ name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'admin' });
    const instructor1 = await User.create({ name: 'John Instructor', email: 'john@example.com', password: 'password123', role: 'instructor', bio: 'Senior Software Engineer with 10+ years of experience' });
    const instructor2 = await User.create({ name: 'Jane Instructor', email: 'jane@example.com', password: 'password123', role: 'instructor', bio: 'Data Science Expert and ML practitioner' });
    const student = await User.create({ name: 'Student User', email: 'student@example.com', password: 'password123', role: 'student' });

    const categoryData = [
      { name: 'Web Development', description: 'Learn to build modern web applications', icon: 'code' },
      { name: 'Mobile Development', description: 'Build mobile apps for iOS and Android', icon: 'smartphone' },
      { name: 'Data Science', description: 'Learn data analysis and machine learning', icon: 'bar-chart' },
      { name: 'UI/UX Design', description: 'Design beautiful user interfaces', icon: 'palette' },
      { name: 'DevOps', description: 'Learn CI/CD, cloud, and infrastructure', icon: 'cloud' },
    ];
    const categories = [];
    for (const cat of categoryData) {
      categories.push(await Category.create(cat));
    }

    const course1 = await Course.create({
      title: 'Complete Web Development Bootcamp',
      description: 'Master web development from HTML/CSS to React and Node.js. Build real-world projects and become a full-stack developer.',
      instructor: instructor1._id,
      category: categories[0]._id,
      price: 49.99,
      level: 'beginner',
      duration: 1200,
      isPublished: true,
      tags: ['javascript', 'react', 'nodejs', 'web development'],
      enrolledCount: 1520,
      rating: 4.7,
    });

    const course2 = await Course.create({
      title: 'React Native: Build Mobile Apps',
      description: 'Learn to build cross-platform mobile apps with React Native and Expo. Deploy to App Store and Google Play.',
      instructor: instructor1._id,
      category: categories[1]._id,
      price: 59.99,
      level: 'intermediate',
      duration: 900,
      isPublished: true,
      tags: ['react native', 'expo', 'mobile', 'ios', 'android'],
      enrolledCount: 890,
      rating: 4.5,
    });

    const course3 = await Course.create({
      title: 'Python for Data Science & ML',
      description: 'Master Python for data analysis, visualization, and machine learning with hands-on projects.',
      instructor: instructor2._id,
      category: categories[2]._id,
      price: 69.99,
      level: 'beginner',
      duration: 1500,
      isPublished: true,
      tags: ['python', 'data science', 'machine learning', 'pandas'],
      enrolledCount: 2340,
      rating: 4.8,
    });

    const course4 = await Course.create({
      title: 'UI/UX Design Masterclass',
      description: 'Learn user interface and experience design principles. Master Figma and create stunning designs.',
      instructor: instructor2._id,
      category: categories[3]._id,
      price: 39.99,
      level: 'beginner',
      duration: 600,
      isPublished: true,
      tags: ['design', 'figma', 'ui', 'ux'],
      enrolledCount: 670,
      rating: 4.6,
    });

    await Lesson.create({ title: 'Introduction to Web Development', description: 'Overview of web development landscape', course: course1._id, videoUrl: 'https://www.youtube.com/watch?v=UB1O30fZ-Us', duration: 300, order: 1, isFree: true, content: 'Welcome to the course! In this lesson we explore what web development is and the technologies involved.' });
    await Lesson.create({ title: 'HTML Fundamentals', description: 'Learn HTML tags and structure', course: course1._id, videoUrl: 'https://www.youtube.com/watch?v=UB1O30fZ-Us', duration: 600, order: 2, isFree: true, content: 'HTML basics - tags, elements, attributes, and document structure.' });
    await Lesson.create({ title: 'CSS Styling', description: 'Style your web pages with CSS', course: course1._id, videoUrl: 'https://www.youtube.com/watch?v=1PnV3N2VEck', duration: 900, order: 3, content: 'CSS properties, selectors, box model, flexbox and grid layouts.' });
    await Lesson.create({ title: 'JavaScript Basics', description: 'Programming with JavaScript', course: course1._id, videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk', duration: 1200, order: 4, content: 'Variables, functions, loops, conditionals, and DOM manipulation.' });
    await Lesson.create({ title: 'React Introduction', description: 'Build UIs with React', course: course1._id, videoUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0', duration: 1500, order: 5, content: 'Components, JSX, props, state, and hooks in React.' });

    await Lesson.create({ title: 'React Native Setup', description: 'Setting up your development environment', course: course2._id, videoUrl: 'https://www.youtube.com/watch?v=0-S5aHZeJ0M', duration: 450, order: 1, isFree: true, content: 'Installation guide for React Native with Expo CLI.' });
    await Lesson.create({ title: 'Core Components', description: 'Built-in React Native components', course: course2._id, videoUrl: 'https://www.youtube.com/watch?v=0-S5aHZeJ0M', duration: 600, order: 2, content: 'View, Text, Image, ScrollView, TextInput and more.' });
    await Lesson.create({ title: 'Navigation', description: 'React Navigation setup', course: course2._id, duration: 750, order: 3, content: 'Stack and Tab navigation with React Navigation.' });

    await Lesson.create({ title: 'Python Setup', description: 'Install Python and setup IDE', course: course3._id, videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw', duration: 300, order: 1, isFree: true, content: 'Getting started with Python installation and VS Code setup.' });
    await Lesson.create({ title: 'Python Basics', description: 'Variables, loops, and functions', course: course3._id, videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw', duration: 900, order: 2, content: 'Python fundamentals - variables, data types, control flow.' });
    await Lesson.create({ title: 'NumPy & Pandas', description: 'Data manipulation libraries', course: course3._id, duration: 1200, order: 3, content: 'Working with arrays, dataframes, and data manipulation.' });

    await Quiz.create({
      title: 'Web Dev Basics Quiz',
      description: 'Test your HTML and CSS knowledge',
      course: course1._id,
      questions: [
        { question: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink Text Mode Language'], correctAnswer: 0, explanation: 'HTML = Hyper Text Markup Language' },
        { question: 'Which CSS property changes text color?', options: ['font-color', 'text-color', 'color', 'foreground'], correctAnswer: 2, explanation: 'The color property changes text color' },
        { question: 'What is the correct HTML element for the largest heading?', options: ['<heading>', '<h6>', '<h1>', '<head>'], correctAnswer: 2, explanation: '<h1> is the largest heading tag' },
      ],
      passingScore: 70,
    });

    await Quiz.create({
      title: 'Python Basics Quiz',
      description: 'Test your Python fundamentals',
      course: course3._id,
      questions: [
        { question: 'Which keyword is used to define a function in Python?', options: ['function', 'func', 'def', 'define'], correctAnswer: 2, explanation: 'Python uses def keyword' },
        { question: 'What is the output of print(2 ** 3)?', options: ['6', '8', '5', '23'], correctAnswer: 1, explanation: '** is the power operator' },
      ],
      passingScore: 60,
    });

    console.log('Seed data created successfully!');
    console.log('---');
    console.log('Admin: admin@example.com / password123');
    console.log('Instructor: john@example.com / password123');
    console.log('Instructor: jane@example.com / password123');
    console.log('Student: student@example.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
