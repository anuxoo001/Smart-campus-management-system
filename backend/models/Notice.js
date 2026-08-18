const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: 'General' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    attachment: { type: String, default: '' },
    targetAudience: { type: String, enum: ['all', 'student', 'faculty', 'admin'], default: 'all' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notice', noticeSchema);
