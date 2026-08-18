const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const createAdmin = async () => {
  try {
    const name = process.env.ADMIN_NAME || 'Campus Administrator';
    const email = (process.env.ADMIN_EMAIL || 'admin@campus.edu').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-campus', {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✓ Connected to MongoDB');

    let user = await User.findOne({ email });
    if (user) {
      user.role = 'admin';
      user.password = password;
      user.isEmailVerified = true;
      user.isActive = true;
      await user.save();
      console.log(`✓ Existing user promoted to admin: ${email}`);
    } else {
      user = await User.create({
        name,
        email,
        password,
        phone: process.env.ADMIN_PHONE || '9876543200',
        role: 'admin',
        isEmailVerified: true,
        isActive: true,
      });
      console.log(`✓ Admin user created: ${email}`);
    }

    console.log('\nAdmin login credentials:');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log('\n(You can set ADMIN_EMAIL / ADMIN_PASSWORD in backend/.env)');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdmin();