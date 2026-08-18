require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Schedule = require('../models/Schedule');
const LearningMaterial = require('../models/LearningMaterial');
const Exam = require('../models/Exam');
const Notice = require('../models/Notice');
const Event = require('../models/Event');
const Company = require('../models/Company');
const Job = require('../models/Job');
const ClassForumPost = require('../models/ClassForumPost');
const Notification = require('../models/Notification');
const LeaveRequest = require('../models/LeaveRequest');
const Quiz = require('../models/Quiz');

const seedRealisticData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✓ Connected to MongoDB');

    const facultyUser = await User.findOne({ email: 'rajesh.kumar@campus.edu' });
    const faculty = await Faculty.findOne({ user: facultyUser?._id });
    if (!faculty) throw new Error('Faculty record not found. Run createTeacher.js first.');

    const studentUser = await User.findOne({ email: 'student@campus.edu' });
    const otherStudentEmails = ['monalisa@gmail.com', 'subham@gmail.com', 'anu1@gmail.com'];
    const studentUsers = [];
    for (const email of otherStudentEmails) {
      const u = await User.findOne({ email });
      if (u) studentUsers.push(u);
    }

    // --- Department & Course ---
    let dept = await Department.findOne({ code: 'CS' });
    if (!dept) {
      dept = await Department.create({ name: 'Computer Science', code: 'CS', hod: faculty._id, description: 'Department of Computer Science and Engineering' });
    }

    let course = await Course.findOne({ code: 'B.Tech-CS' });
    if (!course) {
      course = await Course.create({
        name: 'Bachelor of Technology in Computer Science',
        code: 'B.Tech-CS',
        department: dept._id,
        duration: 4,
        description: '4-year undergraduate program in Computer Science',
      });
    }
    console.log('✓ Department & Course ready');

    // --- Student records (fix/create) ---
    const studentProfiles = [];
    const seedStudent = async (user, studentId, semester, batch, cgpa, name) => {
      let s = await Student.findOne({ user: user._id });
      if (!s) s = new Student({ user: user._id });
      s.studentId = studentId;
      s.department = dept._id;
      s.course = course._id;
      s.semester = semester;
      s.batch = batch;
      s.cgpa = cgpa;
      s.address = s.address || 'New Delhi, India';
      s.skills = s.skills?.length ? s.skills : ['React', 'Node.js', 'MongoDB'];
      await s.save();
      if (!user.name || user.name === user.email.split('@')[0]) {
        user.name = name;
        await user.save();
      }
      return s;
    };

    if (studentUser) {
      const s = await seedStudent(studentUser, 'CS-18-204', 6, '2020', 8.5, 'Demo Student');
      studentProfiles.push(s);
      console.log('✓ Student profile ready: student@campus.edu');
    }
    const extraProfiles = [];
    const extraNames = [
      { email: 'monalisa@gmail.com', id: 'CS-18-205', name: 'Monalisa Verma' },
      { email: 'subham@gmail.com', id: 'CS-18-206', name: 'Subham Gupta' },
      { email: 'anu1@gmail.com', id: 'CS-18-207', name: 'Anu Sharma' },
    ];
    for (const e of extraNames) {
      const u = await User.findOne({ email: e.email });
      if (u) {
        const s = await seedStudent(u, e.id, 6, '2020', Math.round((7 + Math.random() * 1.5) * 10) / 10, e.name);
        extraProfiles.push(s);
      }
    }
    console.log(`✓ ${extraProfiles.length} extra student profiles ready`);

    // --- Subjects (assigned to this faculty) ---
    const subjects = [];
    const subjectData = [
      { name: 'Data Structures', code: 'CS201', semester: 3, credits: 4, description: 'Comprehensive study of data structures and algorithms' },
      { name: 'Web Development', code: 'CS401', semester: 5, credits: 3, description: 'Full-stack web development with the MERN stack' },
      { name: 'Operating Systems', code: 'CS301', semester: 4, credits: 4, description: 'Principles of operating systems and process management' },
      { name: 'Database Management Systems', code: 'CS302', semester: 4, credits: 4, description: 'Design and implementation of relational databases' },
    ];
    for (const d of subjectData) {
      let sub = await Subject.findOne({ code: d.code });
      if (!sub) {
        sub = await Subject.create({ ...d, department: dept._id, course: course._id, faculty: faculty._id });
      } else {
        sub.faculty = faculty._id;
        sub.department = dept._id;
        sub.course = course._id;
        await sub.save();
      }
      subjects.push(sub);
    }
    faculty.subjects = subjects.map((s) => s._id);
    await faculty.save();
    console.log(`✓ ${subjects.length} subjects ready`);

    // --- Attendance ---
    await Attendance.deleteMany({ student: { $in: studentProfiles.map((s) => s._id) } });
    const attendanceStatuses = ['present', 'present', 'present', 'absent', 'late'];
    let attCount = 0;
    for (const s of studentProfiles) {
      for (const sub of subjects) {
        const total = 20;
        let attended = 0;
        for (let i = 0; i < total; i++) {
          const status = attendanceStatuses[Math.floor(Math.random() * attendanceStatuses.length)];
          if (status !== 'absent') attended++;
          await Attendance.create({ student: s._id, subject: sub._id, faculty: faculty._id, date: new Date(Date.now() - (total - i) * 86400000), status, semester: s.semester });
          attCount++;
        }
      }
    }
    console.log(`✓ ${attCount} attendance records`);

    // --- Marks ---
    await Marks.deleteMany({ student: { $in: studentProfiles.map((s) => s._id) } });
    let markCount = 0;
    for (const s of studentProfiles) {
      for (const sub of subjects) {
        await Marks.create({ student: s._id, subject: sub._id, faculty: faculty._id, examType: 'internal', marks: 30 + Math.floor(Math.random() * 15), outOf: 50, semester: s.semester });
        await Marks.create({ student: s._id, subject: sub._id, faculty: faculty._id, examType: 'midterm', marks: 60 + Math.floor(Math.random() * 35), outOf: 100, semester: s.semester });
        await Marks.create({ student: s._id, subject: sub._id, faculty: faculty._id, examType: 'final', marks: 62 + Math.floor(Math.random() * 36), outOf: 100, semester: s.semester });
        markCount += 3;
      }
    }
    console.log(`✓ ${markCount} marks records`);

    // --- Assignments + Submissions ---
    await Assignment.deleteMany({ faculty: faculty._id });
    await Submission.deleteMany({});
    const now = Date.now();
    const assignmentData = [
      { title: 'Implement a Binary Search Tree', description: 'Write a complete BST implementation in C++ with insertion, deletion, and traversal. Include a driver program and test cases.', deadline: now + 3 * 86400000, priority: 'high', totalPoints: 100, instructions: 'Submit a single .cpp file along with a short README explaining your approach.' },
      { title: 'Responsive Web Page Layout', description: 'Build a responsive landing page for the campus portal using HTML, CSS, and React components.', deadline: now + 5 * 86400000, priority: 'medium', totalPoints: 50, instructions: 'Use flexbox/grid. The page must be mobile-friendly.' },
      { title: 'Process Scheduling Simulation', description: 'Simulate FCFS, SJF, and Round Robin scheduling algorithms and compare average waiting times.', deadline: now + 7 * 86400000, priority: 'medium', totalPoints: 80, instructions: 'Provide charts and a written comparison.' },
      { title: 'Database Normalization Report', description: 'Design a normalized schema (3NF) for a library management system with ERD and explanations.', deadline: now + 10 * 86400000, priority: 'low', totalPoints: 60, instructions: 'PDF or Word document, max 10 pages.' },
    ];
    const assignments = [];
    for (let i = 0; i < assignmentData.length; i++) {
      const a = await Assignment.create({
        title: assignmentData[i].title,
        description: assignmentData[i].description,
        subject: subjects[i % subjects.length]._id,
        faculty: faculty._id,
        deadline: new Date(assignmentData[i].deadline),
        priority: assignmentData[i].priority,
        totalPoints: assignmentData[i].totalPoints,
        instructions: assignmentData[i].instructions,
        status: 'published',
        assignedTo: studentProfiles.map((s) => s._id),
        postedDate: new Date(now - i * 86400000),
      });
      assignments.push(a);
      for (const s of studentProfiles) {
        await Submission.create({ assignment: a._id, student: s._id, fileUrl: `https://drive.google.com/student-${s.studentId}`, status: 'submitted', submittedAt: new Date(now - 2 * 86400000), marks: 0 });
      }
    }
    console.log(`✓ ${assignments.length} assignments + submissions`);

    // --- Schedules ---
    await Schedule.deleteMany({ faculty: faculty._id });
    const days = ['Monday', 'Wednesday', 'Friday'];
    const rooms = ['A101', 'Lab-1', 'B202', 'C303'];
    let schCount = 0;
    for (const sub of subjects) {
      const day = days[schCount % days.length];
      await Schedule.create({ faculty: faculty._id, subject: sub._id, class: `B.Tech CSE - Semester ${sub.semester}`, dayOfWeek: day, startTime: '09:00', endTime: '10:30', room: rooms[schCount % rooms.length], isCompleted: false });
      schCount++;
    }
    console.log(`✓ ${schCount} schedules`);

    // --- Learning Materials ---
    await LearningMaterial.deleteMany({ faculty: faculty._id });
    const materials = [
      { title: 'Data Structures Fundamentals', description: 'Complete guide covering arrays, linked lists, stacks, and queues', type: 'PDF', category: 'Chapter 1', fileUrl: 'https://drive.google.com/file/d/ds-fundamentals' },
      { title: 'Sorting Algorithms Lecture', description: 'Video lecture on quick sort, merge sort, and heap sort', type: 'Video', category: 'Chapter 2', fileUrl: 'https://drive.google.com/file/d/sorting-video' },
      { title: 'MERN Stack Roadmap', description: 'Curated learning path and resources for full-stack development', type: 'Link', category: 'Reference', fileUrl: 'https://roadmap.sh/full-stack' },
      { title: 'SQL Query Optimization Notes', description: 'Notes on indexing and writing efficient SQL queries', type: 'Document', category: 'Chapter 3', fileUrl: 'https://drive.google.com/file/d/sql-notes' },
    ];
    for (let i = 0; i < materials.length; i++) {
      await LearningMaterial.create({ faculty: faculty._id, subject: subjects[i % subjects.length]._id, title: materials[i].title, description: materials[i].description, type: materials[i].type, category: materials[i].category, fileUrl: materials[i].fileUrl, downloads: 10 + i * 7, visibility: 'public' });
    }
    console.log('✓ Learning materials');

    // --- Exams ---
    await Exam.deleteMany({ faculty: faculty._id });
    const examData = [
      { title: 'Unit Test 1 - Data Structures', examType: 'Unit Test', duration: 90, totalMarks: 50, room: 'Exam Hall A' },
      { title: 'Mid-Semester Exam - Web Development', examType: 'Midterm', duration: 120, totalMarks: 100, room: 'Exam Hall B' },
      { title: 'Quiz - Operating Systems', examType: 'Quiz', duration: 30, totalMarks: 20, room: 'B202' },
    ];
    for (let i = 0; i < examData.length; i++) {
      await Exam.create({ faculty: faculty._id, subject: subjects[i % subjects.length]._id, title: examData[i].title, examType: examData[i].examType, examDate: new Date(now + (5 + i * 7) * 86400000), startTime: '10:00', endTime: '11:30', duration: examData[i].duration, totalMarks: examData[i].totalMarks, room: examData[i].room, semester: 4, status: 'scheduled' });
    }
    console.log('✓ Exams');

    // --- Notices ---
    await Notice.deleteMany({});
    const noticeData = [
      { title: 'Mid-Semester Examination Schedule', description: 'Mid-semester exams are scheduled from the 15th to the 25th of this month. Check the exam tab for details.', category: 'Academic', author: facultyUser._id },
      { title: 'Campus Placement Drive', description: 'Major tech companies will visit campus next week for recruitment. Eligible students can apply via the placements tab.', category: 'Placement', author: facultyUser._id },
      { title: 'Library Timings Update', description: 'The main library will remain open until 10 PM on weekdays during the exam season.', category: 'Infrastructure', author: facultyUser._id },
    ];
    for (let i = 0; i < noticeData.length; i++) {
      await Notice.create({ title: noticeData[i].title, description: noticeData[i].description, category: noticeData[i].category, author: noticeData[i].author, postedDate: new Date(now - i * 86400000), targetAudience: 'all' });
    }
    console.log('✓ Notices');

    // --- Events ---
    await Event.deleteMany({});
    const eventData = [
      { name: 'Annual Tech Fest', description: 'Campus-wide technology festival with coding competitions and workshops.', date: now + 12 * 86400000, time: '10:00 AM', venue: 'Main Auditorium', organizer: 'Student Council' },
      { name: 'Industry Connect Session', description: 'Networking session with industry leaders and alumni.', date: now + 20 * 86400000, time: '02:00 PM', venue: 'Seminar Hall', organizer: 'Training & Placement Cell' },
      { name: 'Coding Hackathon', description: '24-hour team hackathon. Bring your ideas and build something amazing!', date: now + 28 * 86400000, time: '09:00 AM', venue: 'Coding Lab', organizer: 'Computer Society' },
    ];
    for (const e of eventData) {
      await Event.create({ name: e.name, description: e.description, date: new Date(e.date), time: e.time, venue: e.venue, organizer: e.organizer, createdBy: facultyUser._id });
    }
    console.log('✓ Events');

    // --- Companies & Jobs ---
    await Company.deleteMany({});
    await Job.deleteMany({});
    const companies = await Company.insertMany([
      { name: 'TechCorp India', website: 'https://techcorp.com', description: 'Leading IT solutions provider', location: 'Bangalore', industry: 'Information Technology' },
      { name: 'InnovateTech Solutions', website: 'https://innovatetech.com', description: 'Cutting-edge software development company', location: 'Pune', industry: 'Software Development' },
      { name: 'GlobalCorp', website: 'https://globalcorp.com', description: 'Management and IT consulting firm', location: 'Delhi', industry: 'Consulting' },
    ]);
    await Job.insertMany([
      { company: companies[0]._id, title: 'Junior Software Engineer', description: 'Develop and maintain web applications using the MERN stack.', location: 'Bangalore', salary: '6,00,000 - 8,00,000 p.a', requiredSkills: ['React', 'Node.js', 'MongoDB'], minCGPA: 6.5, eligibleDepartments: [dept._id], graduationYear: 2026, applicationDeadline: new Date(now + 30 * 86400000), type: 'job', status: 'open' },
      { company: companies[1]._id, title: 'Full Stack Developer Intern', description: 'Build scalable web applications with a focus on performance.', location: 'Pune', salary: '4,00,000 p.a', requiredSkills: ['JavaScript', 'Python', 'SQL'], minCGPA: 7.0, eligibleDepartments: [dept._id], graduationYear: 2026, applicationDeadline: new Date(now + 20 * 86400000), type: 'internship', status: 'open' },
      { company: companies[2]._id, title: 'Data Analyst', description: 'Analyze business data and create actionable insights.', location: 'Delhi', salary: '8,00,000 - 10,00,000 p.a', requiredSkills: ['SQL', 'Power BI', 'Python'], minCGPA: 6.0, eligibleDepartments: [dept._id], graduationYear: 2026, applicationDeadline: new Date(now + 25 * 86400000), type: 'job', status: 'open' },
    ]);
    console.log('✓ Companies & Jobs');

    // --- Forum Posts ---
    await ClassForumPost.deleteMany({});
    const forumData = [
      { title: 'How to optimize tree traversal?', content: 'I am struggling to understand the difference between DFS and BFS traversal. Can someone explain with examples?', category: 'Question', tags: ['tree', 'algorithms'], author: studentUser._id, isAnnouncement: false, isPinned: false },
      { title: 'Assignment 2 deadline extended', content: 'The submission deadline for the BST assignment has been extended to next Friday. Please update your schedules.', category: 'Announcement', tags: ['assignment', 'deadline'], author: facultyUser._id, isAnnouncement: true, isPinned: true },
      { title: 'Best resources for MERN', content: 'Sharing the resources I found most useful while learning the MERN stack. Feel free to add your own!', category: 'Resource', tags: ['mern', 'react'], author: facultyUser._id, isAnnouncement: false, isPinned: true },
      { title: 'Mock interview prep discussion', content: 'Who wants to do pair mock interviews for the upcoming placement drive? Let us coordinate here.', category: 'Discussion', tags: ['placement', 'interview'], author: studentUser._id, isAnnouncement: false, isPinned: false },
    ];
    for (const f of forumData) {
      await ClassForumPost.create({ subject: subjects[0]._id, title: f.title, content: f.content, category: f.category, tags: f.tags, author: f.author, isAnnouncement: f.isAnnouncement, isPinned: f.isPinned, replies: [], likes: [] });
    }
    console.log('✓ Forum posts');

    // --- Notifications ---
    const notifyUserIds = [];
    if (studentUser) notifyUserIds.push(studentUser._id);
    for (const u of studentUsers) notifyUserIds.push(u._id);
    await Notification.deleteMany({ user: { $in: notifyUserIds } });
    if (studentUser) {
      await Notification.insertMany([
        { user: studentUser._id, title: 'New assignment posted', message: 'Binary Search Tree assignment has been published. Deadline in 3 days.', type: 'assignment' },
        { user: studentUser._id, title: 'Attendance alert', message: 'Your attendance in Operating Systems is below 75%. Please attend upcoming classes.', type: 'attendance' },
        { user: studentUser._id, title: 'Placement update', message: 'TechCorp India is now accepting applications for Junior Software Engineer.', type: 'placement' },
      ]);
    }
    console.log('✓ Notifications');

    // --- Leave Requests ---
    await LeaveRequest.deleteMany({ student: { $in: studentProfiles.map((s) => s._id) } });
    for (const s of studentProfiles) {
      await LeaveRequest.create({ student: s._id, fromDate: new Date(now + 2 * 86400000), toDate: new Date(now + 4 * 86400000), reason: 'Family function out of town', status: 'pending' });
    }
    console.log('✓ Leave requests');

    // --- Quiz ---
    await Quiz.deleteMany({ faculty: faculty._id });
    await Quiz.create({
      title: 'Data Structures Quick Quiz',
      description: 'Test your understanding of core data structures.',
      subject: 'Data Structures',
      faculty: faculty._id,
      durationMinutes: 10,
      status: 'published',
      assignedTo: studentProfiles.map((s) => s._id),
      questions: [
        { question: 'What is the time complexity of binary search on a sorted array?', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], correctAnswer: 'O(log n)' },
        { question: 'Which data structure uses FIFO order?', options: ['Stack', 'Queue', 'Tree', 'Graph'], correctAnswer: 'Queue' },
        { question: 'A stack is a ______ data structure.', options: ['LIFO', 'FIFO', 'Random access', 'None'], correctAnswer: 'LIFO' },
      ],
    });
    console.log('✓ Quiz');

    console.log('\n✅ Realistic data seeded successfully!');
    console.log('Faculty:  rajesh.kumar@campus.edu / faculty123');
    console.log('Student:  student@campus.edu / student123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedRealisticData();