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
const Schedule = require('../models/Schedule');
const Notice = require('../models/Notice');
const Event = require('../models/Event');
const Exam = require('../models/Exam');
const LearningMaterial = require('../models/LearningMaterial');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    const tables = {
      Users: User, Students: Student, Faculty: Faculty, Departments: Department,
      Courses: Course, Subjects: Subject, Attendance: Attendance, Marks: Marks,
      Assignments: Assignment, Schedules: Schedule, Notices: Notice, Events: Event,
      Exams: Exam, Materials: LearningMaterial,
    };
    for (const [name, model] of Object.entries(tables)) {
      console.log(`${name}: ${await model.countDocuments()}`);
    }
    const subjects = await Subject.find().populate('faculty');
    console.log('\nSubjects:');
    subjects.forEach((s) => console.log(`- ${s.code} ${s.name} sem${s.semester} faculty=${s.faculty?.employeeId || 'none'}`));
    const students = await Student.find().populate('user', 'name email').populate('course', 'code').populate('department', 'code');
    console.log('\nStudents:');
    students.forEach((s) => console.log(`- ${s.studentId} ${s.user?.name} course=${s.course?.code} sem${s.semester}`));
    const facs = await Faculty.find().populate('user', 'name email').populate('department', 'code');
    console.log('\nFaculty:');
    facs.forEach((f) => console.log(`- ${f.employeeId} ${f.user?.name} dept=${f.department?.code}`));
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();