require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    const users = await User.find().select('name email role isActive');
    console.log('USERS:');
    users.forEach((u) => console.log(`- ${u.role} | ${u.email} | ${u.name}`));
    const students = await Student.find();
    console.log('\nSTUDENT RECORDS:');
    students.forEach((s) => console.log(`- _id=${s._id} user=${s.user} studentId=${s.studentId} dept=${s.department} course=${s.course} sem=${s.semester}`));
    const faculty = await Faculty.find();
    console.log('\nFACULTY RECORDS:');
    faculty.forEach((f) => console.log(`- _id=${f._id} user=${f.user} empId=${f.employeeId} dept=${f.department}`));
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();