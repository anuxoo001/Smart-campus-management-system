const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
    examType: { type: String, enum: ['internal', 'midterm', 'final', 'assignment'], default: 'internal' },
    marks: { type: Number, required: true, min: 0, max: 100 },
    outOf: { type: Number, default: 100 },
    semester: { type: Number, required: true },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Marks', marksSchema);
