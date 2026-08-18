const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentId: { type: String, required: true, unique: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    semester: { type: Number, required: true },
    batch: { type: String, required: true },
    cgpa: { type: Number, default: 0 },
    address: { type: String, default: '' },
    dob: { type: Date },
    resume: { type: String, default: '' },
    skills: [{ type: String }],
    projects: [{ title: String, description: String, link: String }],
    certification: [{ title: String, issuer: String }],
    achievements: [String],
    linkedIn: { type: String, default: '' },
    github: { type: String, default: '' },
    isPlaced: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
