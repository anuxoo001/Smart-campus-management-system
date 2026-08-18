const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');

const createTeacher = async () => {
  try {
    const name = process.env.TEACHER_NAME || 'Dr. Rajesh Kumar';
    const email = (process.env.TEACHER_EMAIL || 'rajesh.kumar@campus.edu').trim().toLowerCase();
    const password = process.env.TEACHER_PASSWORD || 'faculty123';
    const employeeId = process.env.TEACHER_EMPLOYEE_ID || 'FAC001';

    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-campus', {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✓ Connected to MongoDB');

    let user = await User.findOne({ email });
    if (user) {
      if (user.role !== 'faculty') {
        user.role = 'faculty';
      }
      user.password = password;
      user.isEmailVerified = true;
      user.isActive = true;
      await user.save();
      console.log(`✓ Existing user updated to faculty: ${email}`);
    } else {
      user = await User.create({
        name,
        email,
        password,
        phone: process.env.TEACHER_PHONE || '9876543201',
        role: 'faculty',
        isEmailVerified: true,
        isActive: true,
      });
      console.log(`✓ Faculty user created: ${email}`);
    }

    let department = await Department.findOne({});
    if (!department) {
      department = await Department.create({
        name: 'Computer Science',
        code: 'CS',
        description: 'Department of Computer Science and Engineering',
      });
      console.log('✓ Department created (CS)');
    }

    let faculty = await Faculty.findOne({ user: user._id });
    if (faculty) {
      console.log(`✓ Faculty profile already exists (${faculty.employeeId})`);
    } else {
      faculty = await Faculty.create({
        user: user._id,
        employeeId,
        department: department._id,
        designation: process.env.TEACHER_DESIGNATION || 'Professor',
        qualification: 'Ph.D. in Computer Science',
        experience: 12,
        officeHours: 'Mon-Fri 2PM-4PM',
      });
      console.log(`✓ Faculty profile created: ${employeeId}`);
    }

    console.log('\nLogin with:');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating teacher:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createTeacher();