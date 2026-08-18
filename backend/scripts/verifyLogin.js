require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    const users = await User.find({ role: 'faculty' }).select('email role isEmailVerified isActive');
    console.log('Faculty users in this DB:');
    users.forEach((u) => console.log('-', u.email, '| verified:', u.isEmailVerified, '| active:', u.isActive));

    const u = await User.findOne({ email: 'rajesh.kumar@campus.edu' });
    if (!u) {
      console.log('rajesh.kumar@campus.edu NOT FOUND in this DB');
    } else {
      console.log('Password matches faculty123:', await u.comparePassword('faculty123'));
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();