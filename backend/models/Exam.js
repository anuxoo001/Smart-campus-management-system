const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    examDate: { type: Date, required: true },
    startTime: { type: String, required: true }, // HH:MM format
    endTime: { type: String, required: true },
    duration: { type: Number, required: true }, // in minutes
    totalMarks: { type: Number, required: true },
    room: { type: String, default: '' },
    semester: { type: Number, required: true },
    examType: { type: String, enum: ['Midterm', 'Final', 'Unit Test', 'Quiz'], default: 'Unit Test' },
    status: { type: String, enum: ['scheduled', 'ongoing', 'completed'], default: 'scheduled' },
    syllabus: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exam', examSchema);
