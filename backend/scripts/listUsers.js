require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    const users = await User.find().select('name email role isEmailVerified isActive').sort('role');
    console.log(`Total users in Atlas: ${users.length}`);
    users.forEach((u) => console.log(`- [${u.role}] ${u.email} | verified: ${u.isEmailVerified} | active: ${u.isActive}`));
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();