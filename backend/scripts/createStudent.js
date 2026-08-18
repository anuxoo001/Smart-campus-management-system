require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createStudent = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✓ Connected to MongoDB');

    const broken = await User.find({ $or: [{ name: { $exists: false } }, { name: '' }, { name: null }] });
    for (const user of broken) {
      user.name = user.email.split('@')[0] || 'Student';
      await user.save();
      console.log(`✓ Fixed missing name for: ${user.email}`);
    }

    const email = 'student@campus.edu';
    let user = await User.findOne({ email });
    if (user) {
      console.log(`✓ Student already exists: ${email}`);
    } else {
      user = await User.create({
        name: 'Demo Student',
        email,
        password: 'student123',
        phone: '9876543220',
        role: 'student',
        isEmailVerified: true,
        isActive: true,
      });
      console.log(`✓ Student created: ${email}`);
    }

    console.log('\nStudent OTP login:');
    console.log(`Email:    ${email}`);
    console.log(`Password: student123`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createStudent();