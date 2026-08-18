const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Notice = require('../models/Notice');
const Event = require('../models/Event');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Schedule = require('../models/Schedule');
const LearningMaterial = require('../models/LearningMaterial');
const Exam = require('../models/Exam');
const ClassForumPost = require('../models/ClassForumPost');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-campus');
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Faculty.deleteMany({}),
      Department.deleteMany({}),
      Course.deleteMany({}),
      Subject.deleteMany({}),
      Attendance.deleteMany({}),
      Marks.deleteMany({}),
      Notice.deleteMany({}),
      Event.deleteMany({}),
      Company.deleteMany({}),
      Job.deleteMany({}),
      Schedule.deleteMany({}),
      LearningMaterial.deleteMany({}),
      Exam.deleteMany({}),
      ClassForumPost.deleteMany({}),
    ]);
    console.log('✓ Cleared existing data');

    // 1. Create Departments
    const departments = await Department.insertMany([
      {
        name: 'Computer Science',
        code: 'CS',
        description: 'Department of Computer Science and Engineering',
      },
      {
        name: 'Electronics',
        code: 'EC',
        description: 'Department of Electronics and Communication',
      },
      {
        name: 'Mechanical Engineering',
        code: 'ME',
        description: 'Department of Mechanical Engineering',
      },
      {
        name: 'Electrical Engineering',
        code: 'EE',
        description: 'Department of Electrical Engineering',
      },
    ]);
    console.log('✓ Created 4 departments');

    // 2. Create Courses
    const courses = await Course.insertMany([
      {
        name: 'Bachelor of Technology in Computer Science',
        code: 'B.Tech-CS',
        department: departments[0]._id,
        duration: 4,
        description: '4-year undergraduate program in Computer Science',
      },
      {
        name: 'Bachelor of Technology in Electronics',
        code: 'B.Tech-EC',
        department: departments[1]._id,
        duration: 4,
        description: '4-year undergraduate program in Electronics',
      },
      {
        name: 'Bachelor of Technology in Mechanical',
        code: 'B.Tech-ME',
        department: departments[2]._id,
        duration: 4,
        description: '4-year undergraduate program in Mechanical Engineering',
      },
    ]);
    console.log('✓ Created 3 courses');

    // 3. Create Admin User
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@campus.edu',
      password: 'admin123',
      phone: '9876543210',
      role: 'admin',
      isEmailVerified: true,
    });
    console.log('✓ Created admin user');

    // 4. Create Faculty Users and Faculty Records
    const facultyUserData = [
      {
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@campus.edu',
        password: 'faculty123',
        phone: '9876543201',
        role: 'faculty',
        isEmailVerified: true,
      },
      {
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@campus.edu',
        password: 'faculty123',
        phone: '9876543202',
        role: 'faculty',
        isEmailVerified: true,
      },
      {
        name: 'Prof. Amit Patel',
        email: 'amit.patel@campus.edu',
        password: 'faculty123',
        phone: '9876543203',
        role: 'faculty',
        isEmailVerified: true,
      },
      {
        name: 'Dr. Neha Singh',
        email: 'neha.singh@campus.edu',
        password: 'faculty123',
        phone: '9876543204',
        role: 'faculty',
        isEmailVerified: true,
      },
    ];

    const facultyUsers = [];
    for (const userData of facultyUserData) {
      const user = await User.create(userData);
      facultyUsers.push(user);
    }
    console.log('✓ Created 4 faculty users');

    const facultyRecords = await Faculty.insertMany([
      {
        user: facultyUsers[0]._id,
        employeeId: 'FAC001',
        department: departments[0]._id,
        designation: 'Professor',
        qualification: 'Ph.D. in Computer Science',
        experience: 12,
        officeHours: 'Mon-Fri 2PM-4PM',
      },
      {
        user: facultyUsers[1]._id,
        employeeId: 'FAC002',
        department: departments[0]._id,
        designation: 'Associate Professor',
        qualification: 'M.Tech in Computer Science',
        experience: 8,
        officeHours: 'Tue-Thu 1PM-3PM',
      },
      {
        user: facultyUsers[2]._id,
        employeeId: 'FAC003',
        department: departments[1]._id,
        designation: 'Associate Professor',
        qualification: 'Ph.D. in Electronics',
        experience: 10,
        officeHours: 'Mon-Wed 3PM-5PM',
      },
      {
        user: facultyUsers[3]._id,
        employeeId: 'FAC004',
        department: departments[2]._id,
        designation: 'Assistant Professor',
        qualification: 'M.Tech in Mechanical Engineering',
        experience: 5,
        officeHours: 'Wed-Fri 2PM-4PM',
      },
    ]);
    console.log('✓ Created 4 faculty records');

    // Update department with HOD
    await Department.findByIdAndUpdate(departments[0]._id, {
      hod: facultyRecords[0]._id,
    });

    // 5. Create Subjects
    const subjects = await Subject.insertMany([
      {
        name: 'Data Structures',
        code: 'CS201',
        department: departments[0]._id,
        course: courses[0]._id,
        semester: 3,
        credits: 4,
        faculty: facultyRecords[0]._id,
        description: 'Comprehensive study of data structures and algorithms',
      },
      {
        name: 'Database Management Systems',
        code: 'CS301',
        department: departments[0]._id,
        course: courses[0]._id,
        semester: 4,
        credits: 4,
        faculty: facultyRecords[1]._id,
        description: 'Design and implementation of database systems',
      },
      {
        name: 'Web Development',
        code: 'CS401',
        department: departments[0]._id,
        course: courses[0]._id,
        semester: 5,
        credits: 3,
        faculty: facultyRecords[0]._id,
        description: 'Full-stack web development with MERN stack',
      },
      {
        name: 'Digital Electronics',
        code: 'EC201',
        department: departments[1]._id,
        course: courses[1]._id,
        semester: 3,
        credits: 4,
        faculty: facultyRecords[2]._id,
        description: 'Digital circuits and logic design',
      },
      {
        name: 'Thermodynamics',
        code: 'ME301',
        department: departments[2]._id,
        course: courses[2]._id,
        semester: 4,
        credits: 4,
        faculty: facultyRecords[3]._id,
        description: 'Principles of thermodynamics and heat transfer',
      },
    ]);
    console.log('✓ Created 5 subjects');

    // 6. Create Student Users and Student Records
    const studentUserData = [
      {
        name: 'Aisha Verma',
        email: 'anuxoo001@gmail.com',
        password: 'student123',
        phone: '9876543220',
        role: 'student',
        isEmailVerified: true,
      },
      {
        name: 'Rohan Gupta',
        email: 'rohan.gupta@campus.edu',
        password: 'student123',
        phone: '9876543221',
        role: 'student',
        isEmailVerified: true,
      },
      {
        name: 'Priya Sharma',
        email: 'priya.student@campus.edu',
        password: 'student123',
        phone: '9876543222',
        role: 'student',
        isEmailVerified: true,
      },
      {
        name: 'Arjun Singh',
        email: 'arjun.singh@campus.edu',
        password: 'student123',
        phone: '9876543223',
        role: 'student',
        isEmailVerified: true,
      },
      {
        name: 'Sneha Das',
        email: 'sneha.das@campus.edu',
        password: 'student123',
        phone: '9876543224',
        role: 'student',
        isEmailVerified: true,
      },
    ];

    const studentUsers = [];
    for (const userData of studentUserData) {
      const user = await User.create(userData);
      studentUsers.push(user);
    }
    console.log('✓ Created 5 student users');

    const students = await Student.insertMany([
      {
        user: studentUsers[0]._id,
        studentId: 'CS-18-204',
        department: departments[0]._id,
        course: courses[0]._id,
        semester: 6,
        batch: '2020',
        cgpa: 8.5,
        address: 'New Delhi, India',
        skills: ['React', 'Node.js', 'MongoDB', 'UI/UX'],
        projects: [
          {
            title: 'Smart Campus Platform',
            description: 'MERN stack campus management system',
            link: 'https://github.com/aisha/smart-campus',
          },
        ],
        achievements: ['Best Project Award 2023', 'Dean List Semester 5'],
        linkedIn: 'linkedin.com/in/aisha-verma',
        github: 'github.com/aisha-verma',
      },
      {
        user: studentUsers[1]._id,
        studentId: 'CS-18-205',
        department: departments[0]._id,
        course: courses[0]._id,
        semester: 6,
        batch: '2020',
        cgpa: 7.8,
        address: 'Mumbai, India',
        skills: ['Python', 'Machine Learning', 'TensorFlow'],
        projects: [
          {
            title: 'Sentiment Analysis Tool',
            description: 'NLP-based sentiment analysis',
            link: 'https://github.com/rohan/sentiment-analysis',
          },
        ],
        achievements: ['Hackathon Winner 2023'],
      },
      {
        user: studentUsers[2]._id,
        studentId: 'CS-18-206',
        department: departments[0]._id,
        course: courses[0]._id,
        semester: 6,
        batch: '2020',
        cgpa: 8.2,
        address: 'Bangalore, India',
        skills: ['Java', 'Spring Boot', 'Docker'],
        isPlaced: true,
      },
      {
        user: studentUsers[3]._id,
        studentId: 'EC-18-301',
        department: departments[1]._id,
        course: courses[1]._id,
        semester: 6,
        batch: '2020',
        cgpa: 7.5,
        address: 'Pune, India',
        skills: ['VHDL', 'Circuit Design', 'FPGA'],
      },
      {
        user: studentUsers[4]._id,
        studentId: 'ME-18-401',
        department: departments[2]._id,
        course: courses[2]._id,
        semester: 5,
        batch: '2021',
        cgpa: 8.0,
        address: 'Chennai, India',
        skills: ['CAD', 'MATLAB', 'Simulation'],
      },
    ]);
    console.log('✓ Created 5 student records');

    // 7. Create Attendance Records
    const attendanceRecords = [];
    for (let i = 0; i < students.length; i++) {
      for (let j = 0; j < subjects.slice(0, 3).length; j++) {
        attendanceRecords.push({
          student: students[i]._id,
          subject: subjects[j]._id,
          faculty: facultyRecords[j]._id,
          semester: students[i].semester,
          date: new Date(),
          status: ['present', 'absent', 'late'][Math.floor(Math.random() * 3)],
        });
      }
    }
    await Attendance.insertMany(attendanceRecords);
    console.log(`✓ Created ${attendanceRecords.length} attendance records`);

    // 8. Create Marks
    const marksRecords = [];
    const examTypes = ['internal', 'midterm', 'final', 'assignment'];
    for (let i = 0; i < students.length; i++) {
      for (let j = 0; j < subjects.slice(0, 3).length; j++) {
        for (const examType of examTypes.slice(0, 2)) { // Create 2 exam types per student-subject combo
          marksRecords.push({
            student: students[i]._id,
            subject: subjects[j]._id,
            faculty: facultyRecords[j]._id,
            examType,
            marks: Math.floor(Math.random() * 70) + 20,
            outOf: 100,
            semester: students[i].semester,
          });
        }
      }
    }
    await Marks.insertMany(marksRecords);
    console.log(`✓ Created ${marksRecords.length} marks records`);

    // 9. Create Notices
    const notices = await Notice.insertMany([
      {
        title: 'Mid-Semester Examination Schedule',
        description: 'Mid-semester exams scheduled from 15th to 25th November',
        category: 'Academic',
        author: adminUser._id,
        postedDate: new Date(),
      },
      {
        title: 'Campus Recruitment Drive',
        description: 'Major tech companies recruiting for internships and full-time roles',
        category: 'Placement',
        author: adminUser._id,
        postedDate: new Date(Date.now() - 86400000),
      },
      {
        title: 'Library Maintenance',
        description: 'Main library will be closed for maintenance on weekends',
        category: 'Infrastructure',
        author: adminUser._id,
        postedDate: new Date(Date.now() - 172800000),
      },
    ]);
    console.log('✓ Created 3 notices');

    // 10. Create Events
    const events = await Event.insertMany([
      {
        name: 'Annual Techfest 2024',
        description: 'Campus-wide technology festival with competitions and workshops',
        date: new Date(Date.now() + 30 * 86400000),
        time: '10:00 AM',
        venue: 'Main Auditorium',
        organizer: 'Dr. Rajesh Kumar',
        createdBy: adminUser._id,
      },
      {
        name: 'Sports Day',
        description: 'Inter-department sports competition',
        date: new Date(Date.now() + 45 * 86400000),
        time: '09:00 AM',
        venue: 'Sports Ground',
        organizer: 'Admin',
        createdBy: adminUser._id,
      },
      {
        name: 'Freshers Party',
        description: 'Welcome party for first-year students',
        date: new Date(Date.now() + 15 * 86400000),
        time: '07:00 PM',
        venue: 'Main Hall',
        organizer: 'Student Council',
        createdBy: adminUser._id,
      },
    ]);
    console.log('✓ Created 3 events');

    // 11. Create Companies
    const companies = await Company.insertMany([
      {
        name: 'TechCorp India',
        industry: 'Information Technology',
        website: 'https://techcorp.com',
        location: 'Bangalore',
        description: 'Leading IT solutions provider',
      },
      {
        name: 'InnovateTech Solutions',
        industry: 'Software Development',
        website: 'https://innovatetech.com',
        location: 'Pune',
        description: 'Cutting-edge software development company',
      },
      {
        name: 'GlobalCorp',
        industry: 'Consulting',
        website: 'https://globalcorp.com',
        location: 'Delhi',
        description: 'Management and IT consulting firm',
      },
    ]);
    console.log('✓ Created 3 companies');

    // 12. Create Jobs
    const jobs = await Job.insertMany([
      {
        title: 'Junior Software Engineer',
        company: companies[0]._id,
        description: 'Develop and maintain web applications using MERN stack',
        location: 'Bangalore',
        salary: '6,00,000 - 8,00,000 p.a',
        requiredSkills: ['React', 'Node.js', 'MongoDB'],
        minCGPA: 6.5,
        eligibleDepartments: [departments[0]._id],
        graduationYear: 2026,
        applicationDeadline: new Date(Date.now() + 60 * 86400000),
        type: 'job',
      },
      {
        title: 'Full Stack Developer',
        company: companies[1]._id,
        description: 'Build scalable web applications',
        location: 'Pune',
        salary: '7,00,000 - 9,00,000 p.a',
        requiredSkills: ['JavaScript', 'Python', 'Database Design'],
        minCGPA: 7.0,
        eligibleDepartments: [departments[0]._id],
        graduationYear: 2026,
        applicationDeadline: new Date(Date.now() + 45 * 86400000),
        type: 'job',
      },
      {
        title: 'Data Analyst Intern',
        company: companies[2]._id,
        description: 'Analyze business data and create insights',
        location: 'Delhi',
        salary: '2,50,000 p.a',
        requiredSkills: ['Python', 'SQL', 'Data Analysis'],
        minCGPA: 6.0,
        eligibleDepartments: [departments[0]._id],
        graduationYear: 2026,
        applicationDeadline: new Date(Date.now() + 30 * 86400000),
        type: 'internship',
      },
    ]);
    console.log('✓ Created 3 job postings');

    // 13. Create Class Schedules
    const schedules = await Schedule.insertMany([
      {
        faculty: facultyRecords[0]._id,
        subject: subjects[0]._id,
        class: 'B.Tech CSE - Semester 3',
        dayOfWeek: 'Monday',
        startTime: '09:00',
        endTime: '10:30',
        room: 'A101',
        isCompleted: false,
      },
      {
        faculty: facultyRecords[0]._id,
        subject: subjects[0]._id,
        class: 'B.Tech CSE - Semester 3',
        dayOfWeek: 'Wednesday',
        startTime: '10:45',
        endTime: '12:15',
        room: 'A101',
        isCompleted: false,
      },
      {
        faculty: facultyRecords[0]._id,
        subject: subjects[0]._id,
        class: 'B.Tech CSE - Semester 3',
        dayOfWeek: 'Friday',
        startTime: '02:00',
        endTime: '03:30',
        room: 'Lab-1',
        isCompleted: false,
      },
      {
        faculty: facultyRecords[1]._id,
        subject: subjects[1]._id,
        class: 'B.Tech CSE - Semester 4',
        dayOfWeek: 'Tuesday',
        startTime: '09:00',
        endTime: '10:30',
        room: 'B202',
        isCompleted: false,
      },
      {
        faculty: facultyRecords[1]._id,
        subject: subjects[1]._id,
        class: 'B.Tech CSE - Semester 4',
        dayOfWeek: 'Thursday',
        startTime: '10:45',
        endTime: '12:15',
        room: 'B202',
        isCompleted: false,
      },
      {
        faculty: facultyRecords[2]._id,
        subject: subjects[3]._id,
        class: 'B.Tech EC - Semester 3',
        dayOfWeek: 'Monday',
        startTime: '02:00',
        endTime: '03:30',
        room: 'C303',
        isCompleted: false,
      },
    ]);
    console.log('✓ Created 6 class schedules');

    // 14. Create Learning Materials
    const materials = await LearningMaterial.insertMany([
      {
        title: 'Data Structures Fundamentals',
        description: 'Complete guide to data structures including arrays, linked lists, and trees',
        type: 'PDF',
        category: 'Chapter 1',
        fileUrl: 'https://example.com/ds-fundamentals.pdf',
        faculty: facultyRecords[0]._id,
        subject: subjects[0]._id,
        downloads: 45,
        visibility: 'public',
      },
      {
        title: 'Algorithms in Action',
        description: 'Video lectures on sorting and searching algorithms',
        type: 'Video',
        category: 'Chapter 2',
        fileUrl: 'https://example.com/algorithms-video',
        faculty: facultyRecords[0]._id,
        subject: subjects[0]._id,
        downloads: 32,
        visibility: 'public',
      },
      {
        title: 'Database Design Principles',
        description: 'Comprehensive guide to database design and normalization',
        type: 'Document',
        category: 'Chapter 1',
        fileUrl: 'https://example.com/db-design.docx',
        faculty: facultyRecords[1]._id,
        subject: subjects[1]._id,
        downloads: 28,
        visibility: 'public',
      },
      {
        title: 'SQL Query Optimization',
        description: 'Learn to write efficient SQL queries',
        type: 'Document',
        category: 'Chapter 2',
        fileUrl: 'https://example.com/sql-optimization.pdf',
        faculty: facultyRecords[1]._id,
        subject: subjects[1]._id,
        downloads: 19,
        visibility: 'public',
      },
      {
        title: 'Web Development Stack Overview',
        description: 'Introduction to MERN stack development',
        type: 'Link',
        category: 'Introduction',
        fileUrl: 'https://mern-tutorial.example.com',
        faculty: facultyRecords[0]._id,
        subject: subjects[2]._id,
        downloads: 67,
        visibility: 'public',
      },
    ]);
    console.log('✓ Created 5 learning materials');

    // 15. Create Exams
    const exams = await Exam.insertMany([
      {
        faculty: facultyRecords[0]._id,
        subject: subjects[0]._id,
        title: 'Unit Test 1 - Data Structures',
        examDate: new Date(Date.now() + 14 * 86400000),
        startTime: '10:00',
        endTime: '11:30',
        duration: 90,
        totalMarks: 50,
        examType: 'Unit Test',
        semester: 3,
        room: 'Exam Hall A',
        status: 'scheduled',
      },
      {
        faculty: facultyRecords[0]._id,
        subject: subjects[0]._id,
        title: 'Mid-Semester Exam - Data Structures',
        examDate: new Date(Date.now() + 30 * 86400000),
        startTime: '09:00',
        endTime: '11:00',
        duration: 120,
        totalMarks: 100,
        examType: 'Midterm',
        semester: 3,
        room: 'Exam Hall A',
        status: 'scheduled',
      },
      {
        faculty: facultyRecords[1]._id,
        subject: subjects[1]._id,
        title: 'Quiz 1 - Database Systems',
        examDate: new Date(Date.now() + 7 * 86400000),
        startTime: '02:00',
        endTime: '02:30',
        duration: 30,
        totalMarks: 20,
        examType: 'Quiz',
        semester: 4,
        room: 'B202',
        status: 'scheduled',
      },
      {
        faculty: facultyRecords[0]._id,
        subject: subjects[2]._id,
        title: 'Web Development Project Evaluation',
        examDate: new Date(Date.now() + 21 * 86400000),
        startTime: '10:00',
        endTime: '01:00',
        duration: 180,
        totalMarks: 100,
        examType: 'Final',
        semester: 5,
        room: 'Lab-2',
        status: 'scheduled',
      },
    ]);
    console.log('✓ Created 4 exams');

    // 16. Create Forum Posts
    const forumPosts = await ClassForumPost.insertMany([
      {
        subject: subjects[0]._id,
        title: 'How to optimize tree traversal?',
        content: 'I am having trouble understanding the different tree traversal algorithms. Can someone explain DFS and BFS with examples?',
        author: students[0].user,
        category: 'Question',
        isAnnouncement: false,
        isPinned: false,
        tags: ['tree', 'traversal', 'algorithms'],
        replies: [
          {
            author: facultyRecords[0]._id,
            content: 'Great question! DFS explores one branch completely before backtracking. BFS explores level by level. Let me share some resources.',
            createdAt: new Date(Date.now() - 86400000),
          },
        ],
        likes: [students[1].user, students[2].user],
      },
      {
        subject: subjects[0]._id,
        title: 'Assignment 2 Submission Deadline Extended',
        content: 'Due to unforeseen circumstances, the submission deadline for Assignment 2 has been extended to next Friday. Please update your schedules accordingly.',
        author: facultyRecords[0]._id,
        category: 'Announcement',
        isAnnouncement: true,
        isPinned: true,
        tags: ['assignment', 'deadline'],
        replies: [],
        likes: [students[0].user, students[1].user, students[2].user],
      },
      {
        subject: subjects[1]._id,
        title: 'Database Design Best Practices Discussion',
        content: 'Let\'s discuss the best practices for designing scalable databases. What approaches have worked for your projects?',
        author: students[1].user,
        category: 'Discussion',
        isAnnouncement: false,
        isPinned: false,
        tags: ['database', 'design', 'best-practices'],
        replies: [
          {
            author: students[2].user,
            content: 'Normalization is key! I always start by identifying entities and their relationships.',
            createdAt: new Date(Date.now() - 172800000),
          },
          {
            author: facultyRecords[1]._id,
            content: 'Good points! Also consider indexing and query optimization for production systems.',
            createdAt: new Date(Date.now() - 86400000),
          },
        ],
        likes: [students[0].user, facultyRecords[1]._id],
      },
      {
        subject: subjects[2]._id,
        title: 'MERN Stack Resources',
        content: 'Sharing useful resources for learning MERN stack development.',
        author: facultyRecords[0]._id,
        category: 'Resource',
        isAnnouncement: false,
        isPinned: true,
        tags: ['mern', 'react', 'node', 'resources'],
        replies: [],
        likes: [students[0].user, students[1].user, students[2].user, students[3].user],
      },
    ]);
    console.log('✓ Created 4 forum posts');

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nSample Login Credentials:');
    console.log('Admin: admin@campus.edu / admin123');
    console.log('Faculty: rajesh.kumar@campus.edu / faculty123');
    console.log('Student: student@campus.edu / student123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();
